#!/usr/bin/env node
// scripts/upload-media.mjs
//
// Ingests a staging folder of local photos into Cloudflare R2 + writes
// `media` rows for the matching `locations` slug. See brain/decisions.md
// (2026-07-17) for the design decisions this script encodes:
//   - two variants uploaded (1600w, 800w), only the 1600 URL is written to
//     `media.url` (media has one url column, no variant column)
//   - display_order is parsed from the filename, anchored on the known slug
//   - no upsert — `media` has no unique index, so idempotency is app-level
//     (SELECT existing rows, match on exact url, UPDATE/INSERT/NO-OP, never
//     DELETE, never touch `caption`)
//
// Usage:
//   node scripts/upload-media.mjs                       (dry-run, default)
//   node scripts/upload-media.mjs --dry-run
//   node scripts/upload-media.mjs --execute              (mutates R2 + DB)
//   node scripts/upload-media.mjs --dir=media-staging
//
// Env (dotenv from .env.local — see .env.example):
//   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID,
//   CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET,
//   NEXT_PUBLIC_MEDIA_BASE_URL
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY
//   — dual-name tolerance mirrors lib/supabaseAdmin.ts)
//
// Exit codes: 0 all resolved zero conflicts; 1 completed but >=1 folder
// skipped or >=1 image failed; 2 fatal before any work (missing env, missing
// staging dir, conflicting flags).

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import sharp from "sharp";
import { readdirSync } from "fs";
import { extname, join } from "path";
import { fileURLToPath } from "url";

loadEnv({ path: ".env.local" });

const IMAGE_EXT_RE = /\.(jpe?g|png|webp)$/i;
const VARIANT_WIDTHS = [1600, 800];

// ---------------------------------------------------------------------------
// Pure helpers — exported, no I/O, no credentials required. Covered by
// scripts/upload-media.test.mjs.
// ---------------------------------------------------------------------------

/**
 * Parse a `media.display_order` value from a filename basename (no
 * extension), anchored on the location's known slug — NOT a trailing-digit
 * regex. `{slug}` exactly -> 0. `{slug}-1` / `{slug}-01` -> 1, etc.
 *
 * Landmine this guards against: media-staging/maison-45/maison-45.jpg — the
 * slug itself ends in digits, so a naive `-(\d+)$` regex would assign
 * display_order 45 instead of 0. Matching `basename === slug` first avoids
 * that entirely.
 */
export function parseDisplayOrder(basename, slug) {
  if (basename === slug) return 0;

  const prefix = `${slug}-`;
  if (basename.startsWith(prefix)) {
    const rest = basename.slice(prefix.length);
    if (/^\d+$/.test(rest)) {
      return parseInt(rest, 10);
    }
  }

  throw new Error(
    `Cannot parse display_order from "${basename}" against slug "${slug}" ` +
      `(expected "${slug}" or "${slug}-<digits>")`
  );
}

/**
 * Parse display_order for every basename in a folder and reject duplicates
 * (e.g. "x-1.jpg" and "x-01.jpg" both resolving to 1 would make the hero
 * image nondeterministic). Throws on the first unrecognized name or
 * duplicate — the caller skips the whole folder on either.
 */
export function computeFolderOrders(slug, basenames) {
  const orders = new Map();
  const byOrder = new Map();

  for (const basename of basenames) {
    const order = parseDisplayOrder(basename, slug);
    orders.set(basename, order);
    if (!byOrder.has(order)) byOrder.set(order, []);
    byOrder.get(order).push(basename);
  }

  for (const [order, names] of byOrder) {
    if (names.length > 1) {
      throw new Error(
        `Duplicate display_order ${order} within folder "${slug}": ${names.join(", ")}`
      );
    }
  }

  return orders;
}

/** R2 object key for a rendered variant. `prefix` has no leading/trailing slash. */
export function r2KeyFor(prefix, basename, width) {
  return `${prefix}/${basename}-${width}.webp`;
}

/** Public URL for an R2 key, given the (possibly trailing-slash) media base URL. */
export function urlFor(baseUrl, key) {
  return `${baseUrl.replace(/\/+$/, "")}/${key}`;
}

function stripExt(filename) {
  const ext = extname(filename);
  return filename.slice(0, filename.length - ext.length);
}

// ---------------------------------------------------------------------------
// Small string-distance helper for unknown-slug near-match suggestions.
// Not exported/tested — advisory output only, never used to write.
// ---------------------------------------------------------------------------

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[rows - 1][cols - 1];
}

function findNearMatches(target, candidates, limit = 5) {
  const targetHead = target.split("-").slice(0, 2).join("-");
  return candidates
    .map((c) => ({
      c,
      d: levenshtein(target, c),
      sharesPrefix: c.startsWith(targetHead) || target.startsWith(c.split("-").slice(0, 2).join("-")),
    }))
    .filter(({ d, sharesPrefix }) => d <= 4 || sharesPrefix)
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.c);
}

// ---------------------------------------------------------------------------
// CLI + env
// ---------------------------------------------------------------------------

class UsageError extends Error {}

function parseArgs(argv) {
  const dryRunFlag = argv.includes("--dry-run");
  const executeFlag = argv.includes("--execute");
  if (dryRunFlag && executeFlag) {
    throw new UsageError("--dry-run and --execute are mutually exclusive");
  }
  const dirArg = argv.find((a) => a.startsWith("--dir="));
  const dir = dirArg ? dirArg.slice("--dir=".length) : "media-staging";
  const mode = executeFlag ? "execute" : "dry-run";
  return { mode, dir };
}

function resolveEnv() {
  const missing = [];
  const need = (name) => {
    if (!process.env[name]) missing.push(name);
  };

  need("CLOUDFLARE_ACCOUNT_ID");
  need("CLOUDFLARE_R2_ACCESS_KEY_ID");
  need("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
  need("CLOUDFLARE_R2_BUCKET");
  need("NEXT_PUBLIC_MEDIA_BASE_URL");
  need("NEXT_PUBLIC_SUPABASE_URL");

  // Mirrors lib/supabaseAdmin.ts exactly, including dual-name tolerance.
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseSecretKey) {
    missing.push("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");
  }

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucket: process.env.CLOUDFLARE_R2_BUCKET,
    mediaBaseUrl: process.env.NEXT_PUBLIC_MEDIA_BASE_URL.replace(/\/+$/, ""),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseSecretKey,
  };
}

// ---------------------------------------------------------------------------
// Filesystem
// ---------------------------------------------------------------------------

function listStagingFolders(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    throw new Error(`Staging directory not found: ${dir}`);
  }
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function listImageFiles(folderPath) {
  const entries = readdirSync(folderPath, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => !name.startsWith("."))
    .filter((name) => IMAGE_EXT_RE.test(name))
    .sort();
}

// ---------------------------------------------------------------------------
// Image pipeline
// ---------------------------------------------------------------------------

async function renderVariant(srcPath, width) {
  // .autoOrient() MUST precede .resize(): sharp strips EXIF (including the
  // Orientation tag) by default without applying it first. Skipping this
  // would ship portrait iPhone photos sideways. Do NOT call withMetadata()
  // afterwards — despite the name, it RE-ADDS EXIF/GPS and defeats the
  // privacy requirement; sharp's no-metadata default IS the requirement.
  const buffer = await sharp(srcPath)
    .autoOrient()
    // withoutEnlargement: true means the numeric suffix (-1600/-800) is a
    // nominal label, not a guaranteed pixel width — a smaller source photo
    // is never upscaled to fabricate pixels that were never captured.
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const meta = await sharp(buffer).metadata();
  return { buffer, width: meta.width, height: meta.height, bytes: buffer.length };
}

async function uploadToR2(client, bucket, key, buffer) {
  // No CacheControl set — matches scripts/upload-to-r2.mjs. Overwriting an
  // existing key does not purge the Cloudflare CDN cache (reported in the
  // dry-run/execute summary, not solved here).
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: "image/webp",
    })
  );
}

// ---------------------------------------------------------------------------
// Per-folder processing
// ---------------------------------------------------------------------------

async function processLocationFolder({ slug, locationId, folderPath, config, mode, r2Client, supabase }) {
  const files = listImageFiles(folderPath);
  if (files.length === 0) {
    return { slug, locationId, status: "empty", images: [] };
  }

  const baseNames = files.map(stripExt);
  let orders;
  try {
    orders = computeFolderOrders(slug, baseNames);
  } catch (err) {
    return { slug, locationId, status: "parse-error", error: err.message, images: [] };
  }

  const prefix = `locations/${slug}`;
  const planned = files.map((file) => {
    const basename = stripExt(file);
    const order = orders.get(basename);
    const key1600 = r2KeyFor(prefix, basename, 1600);
    const key800 = r2KeyFor(prefix, basename, 800);
    return {
      file,
      basename,
      order,
      srcPath: join(folderPath, file),
      key1600,
      key800,
      url1600: urlFor(config.mediaBaseUrl, key1600),
      url800: urlFor(config.mediaBaseUrl, key800),
    };
  });

  const { data: existingRows, error: readError } = await supabase
    .from("media")
    .select("id, url, display_order")
    .eq("location_id", locationId);
  if (readError) {
    return {
      slug,
      locationId,
      status: "parse-error",
      error: `DB read failed: ${readError.message}`,
      images: [],
    };
  }
  const existing = existingRows ?? [];
  const plannedUrlSet = new Set(planned.map((p) => p.url1600));
  const foreign = existing.filter((r) => !plannedUrlSet.has(r.url));
  if (foreign.length > 0) {
    // Never delete, never stack a legacy row + a new row at colliding
    // display_orders — surface the conflict and skip the whole folder.
    return { slug, locationId, status: "conflict", foreign, planned, images: [] };
  }
  const existingByUrl = new Map(existing.map((r) => [r.url, r]));

  const images = [];
  for (const p of planned) {
    const existingRow = existingByUrl.get(p.url1600);
    const dbAction = !existingRow
      ? "INSERT"
      : existingRow.display_order !== p.order
        ? "UPDATE"
        : "NO-OP";

    const image = { ...p, dbAction, rowId: existingRow?.id ?? null };

    try {
      // Sharp runs in both dry-run and execute mode — it catches corrupt
      // source files before any mutation and produces the dry-run report's
      // dims/bytes figures.
      image.variant1600 = await renderVariant(p.srcPath, 1600);
      image.variant800 = await renderVariant(p.srcPath, 800);

      if (mode === "execute") {
        // Ordering invariant: upload 1600 -> upload 800 -> THEN write the
        // DB row, so the row never points at a missing object.
        await uploadToR2(r2Client, config.bucket, p.key1600, image.variant1600.buffer);
        await uploadToR2(r2Client, config.bucket, p.key800, image.variant800.buffer);

        if (dbAction === "INSERT") {
          const { error: insertError } = await supabase.from("media").insert({
            location_id: locationId,
            url: p.url1600,
            type: "image",
            display_order: p.order,
          });
          if (insertError) throw new Error(`DB insert failed: ${insertError.message}`);
        } else if (dbAction === "UPDATE") {
          const { error: updateError } = await supabase
            .from("media")
            .update({ display_order: p.order })
            .eq("id", existingRow.id);
          if (updateError) throw new Error(`DB update failed: ${updateError.message}`);
        }
        // NO-OP: identical display_order already persisted, no write.
        // caption is never referenced above — an existing editorial caption
        // is never touched by this script.
      }
    } catch (err) {
      // Per-image try/catch: one bad file must not strand the other images
      // in the folder.
      image.failed = true;
      image.error = err.message;
    }

    images.push(image);
  }

  let verify = null;
  if (mode === "execute") {
    const { count, error: countError } = await supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("location_id", locationId);
    if (!countError) {
      verify = { expected: planned.length, actual: count };
    }
  }

  return { slug, locationId, status: "ok", images, verify };
}

async function processSiteAssetFolder({ prefix, folderPath, config, mode, r2Client }) {
  // Structural separation from processLocationFolder: this function never
  // receives a location_id and never touches the Supabase client — "writes
  // no rows" is enforced by construction, not by an `if`.
  const files = listImageFiles(folderPath);
  const images = [];

  for (const file of files) {
    const basename = stripExt(file);
    const key1600 = r2KeyFor(prefix, basename, 1600);
    const key800 = r2KeyFor(prefix, basename, 800);
    const image = {
      file,
      basename,
      srcPath: join(folderPath, file),
      key1600,
      key800,
      url1600: urlFor(config.mediaBaseUrl, key1600),
      url800: urlFor(config.mediaBaseUrl, key800),
    };

    try {
      image.variant1600 = await renderVariant(image.srcPath, 1600);
      image.variant800 = await renderVariant(image.srcPath, 800);

      if (mode === "execute") {
        await uploadToR2(r2Client, config.bucket, key1600, image.variant1600.buffer);
        await uploadToR2(r2Client, config.bucket, key800, image.variant800.buffer);
      }
    } catch (err) {
      image.failed = true;
      image.error = err.message;
    }

    images.push(image);
  }

  return { prefix, images };
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function printConfigSummary(config, mode, dir) {
  console.log("Resolved config:");
  console.log(`  mode: ${mode}`);
  console.log(`  staging dir: ${dir}`);
  // Secrets: present/absent only, never values.
  console.log("  CLOUDFLARE_ACCOUNT_ID: present");
  console.log("  CLOUDFLARE_R2_ACCESS_KEY_ID: present");
  console.log("  CLOUDFLARE_R2_SECRET_ACCESS_KEY: present");
  console.log("  CLOUDFLARE_R2_BUCKET: present");
  console.log("  SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY: present");
  // NEXT_PUBLIC_* vars are public by convention (shipped to the browser) —
  // printing them is not a secret exposure.
  console.log(`  NEXT_PUBLIC_MEDIA_BASE_URL: ${config.mediaBaseUrl}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${config.supabaseUrl}`);
}

function printImageLine(img) {
  console.log(`  ${img.file}`);
  if ("order" in img) console.log(`    display_order: ${img.order}`);
  if ("dbAction" in img) console.log(`    action: ${img.dbAction}`);
  if (img.failed) {
    console.log(`    FAILED: ${img.error}`);
    return;
  }
  console.log(`    1600w -> ${img.key1600}`);
  console.log(`      url: ${img.url1600}`);
  console.log(
    `      ${img.variant1600.width}x${img.variant1600.height}, ${img.variant1600.bytes} bytes`
  );
  console.log(`    800w  -> ${img.key800}`);
  console.log(`      url: ${img.url800}`);
  console.log(
    `      ${img.variant800.width}x${img.variant800.height}, ${img.variant800.bytes} bytes`
  );
}

function printLocationFolderResult(result) {
  console.log(`\n[${result.slug}] location_id=${result.locationId}`);

  if (result.status === "parse-error") {
    console.log(`  ERROR: ${result.error}`);
    return;
  }
  if (result.status === "empty") {
    console.log("  (no image files found)");
    return;
  }
  if (result.status === "conflict") {
    console.log(
      "  FOREIGN-CONFLICT — existing media rows do not match any planned URL, folder skipped:"
    );
    for (const row of result.foreign) {
      console.log(`    id=${row.id} url=${row.url} display_order=${row.display_order}`);
    }
    console.log("  Planned uploads for this folder (NOT written):");
    for (const p of result.planned) {
      console.log(`    ${p.file} -> display_order ${p.order} -> ${p.url1600}`);
    }
    return;
  }

  for (const img of result.images) {
    printImageLine(img);
  }
  if (result.verify) {
    const flag = result.verify.expected === result.verify.actual ? "OK" : "MISMATCH";
    console.log(
      `  verify: expected=${result.verify.expected} actual=${result.verify.actual} [${flag}]`
    );
  }
}

function printSiteAssetFolderResult(folderName, result) {
  console.log(`\n[${folderName}] (no DB rows)`);
  if (result.images.length === 0) {
    console.log("  (no image files found)");
    return;
  }
  for (const img of result.images) {
    printImageLine(img);
  }
}

function printSummary(summary, mode) {
  console.log("\nSummary:");
  console.log(`  folders OK: ${summary.foldersOk}`);
  console.log(`  conflicts: ${summary.conflicts}`);
  console.log(`  parse errors: ${summary.parseErrors}`);
  console.log(`  unknown slugs: ${summary.unknownSlugs}`);
  console.log(`  images failed: ${summary.imagesFailed}`);
  console.log(`  objects to upload (1600w + 800w): ${summary.objectsToUpload}`);
  console.log(`  rows to insert: ${summary.rowsToInsert}`);
  console.log(`  rows to update: ${summary.rowsToUpdate}`);
  console.log(
    "  Note: overwriting an existing R2 object does not purge the Cloudflare CDN cache."
  );
  if (mode === "dry-run") {
    console.log("\nDRY RUN — nothing uploaded, nothing written");
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  const argv = process.argv.slice(2);

  let mode, dir;
  try {
    ({ mode, dir } = parseArgs(argv));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }

  let config;
  try {
    config = resolveEnv();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }

  let folderNames;
  try {
    folderNames = listStagingFolders(dir);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }

  printConfigSummary(config, mode, dir);

  const supabase = createClient(config.supabaseUrl, config.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let r2Client = null;
  if (mode === "execute") {
    r2Client = new S3Client({
      region: "auto",
      // .eu copied verbatim from scripts/upload-to-r2.mjs.
      endpoint: `https://${config.accountId}.eu.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  const { data: locations, error: locError } = await supabase.from("locations").select("id, slug");
  if (locError) {
    console.error(`Error: could not fetch locations: ${locError.message}`);
    process.exit(2);
  }
  const slugMap = new Map((locations ?? []).map((l) => [l.slug, l.id]));
  const allSlugs = [...slugMap.keys()];

  const generalFolders = folderNames.filter((n) => n.startsWith("_"));
  const locationFolders = folderNames.filter((n) => !n.startsWith("_"));

  const summary = {
    foldersOk: 0,
    conflicts: 0,
    parseErrors: 0,
    unknownSlugs: 0,
    imagesFailed: 0,
    objectsToUpload: 0,
    rowsToInsert: 0,
    rowsToUpdate: 0,
  };
  let hadIssue = false;

  console.log(`\nLocation folders (${locationFolders.length}):`);
  for (const slug of locationFolders) {
    const locationId = slugMap.get(slug);
    if (!locationId) {
      const near = findNearMatches(slug, allSlugs);
      console.log(`\n[UNKNOWN SLUG] ${slug}`);
      console.log(
        `  No matching locations.slug. Near matches: ${near.length ? near.join(", ") : "(none found)"}`
      );
      summary.unknownSlugs += 1;
      hadIssue = true;
      continue;
    }

    const folderPath = join(dir, slug);
    const result = await processLocationFolder({
      slug,
      locationId,
      folderPath,
      config,
      mode,
      r2Client,
      supabase,
    });
    printLocationFolderResult(result);

    if (result.status === "conflict") {
      summary.conflicts += 1;
      hadIssue = true;
      continue;
    }
    if (result.status === "parse-error") {
      summary.parseErrors += 1;
      hadIssue = true;
      continue;
    }
    if (result.status === "empty") {
      continue;
    }

    summary.foldersOk += 1;
    for (const img of result.images) {
      if (img.failed) {
        summary.imagesFailed += 1;
        hadIssue = true;
        continue;
      }
      summary.objectsToUpload += VARIANT_WIDTHS.length;
      if (img.dbAction === "INSERT") summary.rowsToInsert += 1;
      if (img.dbAction === "UPDATE") summary.rowsToUpdate += 1;
    }
  }

  console.log(`\nSite-asset folders (${generalFolders.length}) — no DB rows:`);
  for (const name of generalFolders) {
    const prefix = name.slice(1);
    const folderPath = join(dir, name);
    const result = await processSiteAssetFolder({ prefix, folderPath, config, mode, r2Client });
    printSiteAssetFolderResult(name, result);

    for (const img of result.images) {
      if (img.failed) {
        summary.imagesFailed += 1;
        hadIssue = true;
        continue;
      }
      summary.objectsToUpload += VARIANT_WIDTHS.length;
    }
  }

  printSummary(summary, mode);

  process.exit(hadIssue ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
