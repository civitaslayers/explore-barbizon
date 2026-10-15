#!/usr/bin/env node
// scripts/compute-parking-distances.mjs
//
// Fills `location_parking_distances` (task 7233da57): walking time and
// distance from every published location to every published car park, via
// the Mapbox Matrix API (profile mapbox/walking). See
// migrations/create_location_parking_distances.sql for the table.
//
//   - car parks   = published locations whose category slug is `parking`,
//                   category resolved by slug scoped to the Barbizon town
//                   (never a hardcoded UUID)
//   - origins     = every other published location with coordinates
//   - one Matrix request per batch: at most 25 coordinates per request, so
//                   origins are batched against the full set of car parks
//   - a pair Mapbox cannot route (null cell) is SKIPPED and listed — there
//                   is never a straight-line fallback
//
// Usage:
//   node scripts/compute-parking-distances.mjs            (dry-run, default)
//   node scripts/compute-parking-distances.mjs --dry-run
//   node scripts/compute-parking-distances.mjs --execute  (upserts via service role)
//
// Dry run writes exports/parking-distances-<date>.sql (idempotent upserts on
// the (location_id, parking_location_id) unique key, both sides resolved by
// slug) and prints a summary. --execute upserts through the service-role
// client and refuses to run if the table does not exist; it is Luigi's
// action, not the loop's.
//
// Env (dotenv from .env.local — see .env.example):
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY
//   — dual-name tolerance mirrors lib/supabaseAdmin.ts)
//   MAPBOX_SECRET_TOKEN (falls back to NEXT_PUBLIC_MAPBOX_TOKEN)
//
// Exit codes: 0 completed, zero skipped pairs; 1 completed but >=1 pair
// skipped (unroutable) or a batch failed; 2 fatal before any work (missing
// env, conflicting flags, missing table on --execute, Mapbox/DB read error).

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

loadEnv({ path: ".env.local" });

export const MATRIX_MAX_COORDS = 25;
export const MATRIX_PROFILE = "mapbox/walking";
export const METHOD = "mapbox_walking";
const TOWN_SLUG = "barbizon";
const PARKING_CATEGORY_SLUG = "parking";
const UPSERT_CHUNK = 200;

// ---------------------------------------------------------------------------
// Pure helpers — exported, no I/O, no credentials required. Covered by
// scripts/compute-parking-distances.test.mjs.
// ---------------------------------------------------------------------------

/**
 * Split `origins` into consecutive batches of at most `size` so that
 * `batch.length + parks.length <= MATRIX_MAX_COORDS`. Throws when `size`
 * leaves no room for a single origin (too many car parks for one request).
 */
export function batchOrigins(origins, size) {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(
      `Cannot batch origins: ${size} coordinate slot(s) left per request after the car parks ` +
        `(Mapbox Matrix allows ${MATRIX_MAX_COORDS} coordinates per request)`
    );
  }
  const batches = [];
  for (let i = 0; i < origins.length; i += size) {
    batches.push(origins.slice(i, i + size));
  }
  return batches;
}

function coordPair(p) {
  return `${p.longitude},${p.latitude}`;
}

function indexList(from, to) {
  const out = [];
  for (let i = from; i < to; i++) out.push(i);
  return out.join(";");
}

/**
 * Matrix API URL for one batch: sources = the origins, destinations = the
 * car parks, both annotations requested. Coordinates are `lng,lat`.
 */
export function buildMatrixUrl(batch, parks, token) {
  const total = batch.length + parks.length;
  if (total > MATRIX_MAX_COORDS) {
    throw new Error(`Matrix request would carry ${total} coordinates (max ${MATRIX_MAX_COORDS})`);
  }
  if (batch.length === 0 || parks.length === 0) {
    throw new Error("Matrix request needs at least one origin and one car park");
  }
  const coords = [...batch, ...parks].map(coordPair).join(";");
  const params = new URLSearchParams({
    sources: indexList(0, batch.length),
    destinations: indexList(batch.length, total),
    annotations: "duration,distance",
    access_token: token,
  });
  return `https://api.mapbox.com/directions-matrix/v1/${MATRIX_PROFILE}/${coords}?${params.toString()}`;
}

function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Turn one Matrix response into upsert rows. `durations[i][j]` /
 * `distances[i][j]` map origin i to car park j. A null (or non-numeric)
 * cell in either matrix means Mapbox could not route the pair: it goes to
 * `skipped`, never to `rows`. Throws on a non-Ok response or a matrix whose
 * shape does not match the request.
 */
export function parseMatrix(json, batch, parks) {
  if (!json || typeof json !== "object") throw new Error("Matrix response is not an object");
  if (json.code !== "Ok") {
    throw new Error(`Matrix response code ${json.code ?? "(none)"}: ${json.message ?? ""}`.trim());
  }
  const { durations, distances } = json;
  if (!Array.isArray(durations) || !Array.isArray(distances)) {
    throw new Error("Matrix response lacks durations/distances arrays");
  }
  if (durations.length !== batch.length || distances.length !== batch.length) {
    throw new Error(
      `Matrix rows ${durations.length}/${distances.length} do not match ${batch.length} origins`
    );
  }

  const rows = [];
  const skipped = [];
  for (let i = 0; i < batch.length; i++) {
    const origin = batch[i];
    const dRow = durations[i];
    const mRow = distances[i];
    if (!Array.isArray(dRow) || !Array.isArray(mRow) || dRow.length !== parks.length || mRow.length !== parks.length) {
      throw new Error(`Matrix row ${i} does not match ${parks.length} car parks`);
    }
    for (let j = 0; j < parks.length; j++) {
      const park = parks[j];
      const seconds = dRow[j];
      const meters = mRow[j];
      if (!isFiniteNumber(seconds) || !isFiniteNumber(meters) || seconds < 0 || meters < 0) {
        skipped.push({
          location_id: origin.id,
          location_slug: origin.slug,
          parking_location_id: park.id,
          parking_slug: park.slug,
        });
        continue;
      }
      rows.push({
        location_id: origin.id,
        location_slug: origin.slug,
        location_name: origin.name,
        parking_location_id: park.id,
        parking_slug: park.slug,
        parking_name: park.name,
        walking_seconds: Math.round(seconds),
        distance_meters: Math.round(meters),
        method: METHOD,
      });
    }
  }
  return { rows, skipped };
}

/** SQL string literal: single quotes doubled, wrapped in quotes. */
export function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function commentSafe(value) {
  // Comments must stay on one line; strip anything that could end them early.
  return String(value ?? "").replace(/[\r\n]+/g, " ");
}

/**
 * Idempotent upsert SQL for the dry-run export. Both sides are resolved by
 * slug through a join on `locations` (no hardcoded UUIDs in the file), and
 * the conflict target is the table's unique key. Returns a header-only
 * comment when there are no rows.
 */
export function toUpsertSql(rows, { generatedAt = new Date() } = {}) {
  const header = [
    `-- location_parking_distances upserts, generated ${generatedAt.toISOString()}`,
    `-- by scripts/compute-parking-distances.mjs (Mapbox Matrix, ${MATRIX_PROFILE}).`,
    `-- ${rows.length} row(s). Pairs Mapbox could not route are absent, not estimated.`,
  ];
  if (rows.length === 0) {
    return `${header.join("\n")}\n-- nothing to upsert\n`;
  }
  const values = rows.map((r) => {
    const comment = `  -- ${commentSafe(r.location_name)} -> ${commentSafe(r.parking_name)}`;
    const tuple =
      `  (${sqlString(r.location_slug)}, ${sqlString(r.parking_slug)}, ` +
      `${Number(r.walking_seconds)}, ${Number(r.distance_meters)}, ${sqlString(r.method ?? METHOD)})`;
    return `${comment}\n${tuple}`;
  });
  return [
    ...header,
    "insert into public.location_parking_distances",
    "  (location_id, parking_location_id, walking_seconds, distance_meters, method, computed_at)",
    "select l.id, p.id, v.walking_seconds, v.distance_meters, v.method, now()",
    "from (values",
    values.join(",\n"),
    ") as v(location_slug, parking_slug, walking_seconds, distance_meters, method)",
    "join public.locations l on l.slug = v.location_slug",
    "join public.locations p on p.slug = v.parking_slug",
    "on conflict (location_id, parking_location_id) do update set",
    "  walking_seconds = excluded.walking_seconds,",
    "  distance_meters = excluded.distance_meters,",
    "  method = excluded.method,",
    "  computed_at = excluded.computed_at;",
    "",
  ].join("\n");
}

/** `exports/parking-distances-<YYYY-MM-DD>.sql` relative path. */
export function exportPath(date = new Date()) {
  return join("exports", `parking-distances-${date.toISOString().slice(0, 10)}.sql`);
}

// ---------------------------------------------------------------------------
// CLI + env
// ---------------------------------------------------------------------------

export class UsageError extends Error {}

export function parseArgs(argv) {
  const dryRunFlag = argv.includes("--dry-run");
  const executeFlag = argv.includes("--execute");
  if (dryRunFlag && executeFlag) {
    throw new UsageError("--dry-run and --execute are mutually exclusive");
  }
  return { mode: executeFlag ? "execute" : "dry-run" };
}

function resolveEnv() {
  const missing = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");

  // Mirrors lib/supabaseAdmin.ts exactly, including dual-name tolerance.
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseSecretKey) missing.push("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");

  const mapboxToken = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!mapboxToken) missing.push("MAPBOX_SECRET_TOKEN", "NEXT_PUBLIC_MAPBOX_TOKEN");

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseSecretKey,
    mapboxToken,
    mapboxTokenSource: process.env.MAPBOX_SECRET_TOKEN ? "MAPBOX_SECRET_TOKEN" : "NEXT_PUBLIC_MAPBOX_TOKEN",
  };
}

// ---------------------------------------------------------------------------
// Mapbox
// ---------------------------------------------------------------------------

/**
 * One Matrix call for one batch. `fetchImpl` is injected so tests never
 * reach Mapbox (same pattern as lib/walkingRoute.ts fetchWalkingRoute).
 */
export async function fetchMatrix(batch, parks, token, fetchImpl = globalThis.fetch) {
  const url = buildMatrixUrl(batch, parks, token);
  const res = await fetchImpl(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Mapbox Matrix HTTP ${res.status}`);
  }
  const json = await res.json();
  return parseMatrix(json, batch, parks);
}

/**
 * Run every batch sequentially and merge the results. A batch that throws
 * is recorded in `failed` (its pairs are neither rows nor skipped) and the
 * run continues with the next batch.
 */
export async function computeAll(origins, parks, token, fetchImpl = globalThis.fetch) {
  const batches = batchOrigins(origins, MATRIX_MAX_COORDS - parks.length);
  const rows = [];
  const skipped = [];
  const failed = [];
  for (const batch of batches) {
    try {
      const result = await fetchMatrix(batch, parks, token, fetchImpl);
      rows.push(...result.rows);
      skipped.push(...result.skipped);
    } catch (err) {
      failed.push({ origins: batch.map((o) => o.slug), error: err.message });
    }
  }
  return { rows, skipped, failed, requests: batches.length };
}

// ---------------------------------------------------------------------------
// Supabase reads / writes
// ---------------------------------------------------------------------------

async function loadLocations(supabase) {
  const { data: town, error: townError } = await supabase
    .from("towns")
    .select("id")
    .eq("slug", TOWN_SLUG)
    .single();
  if (townError || !town) {
    throw new Error(`Could not resolve town "${TOWN_SLUG}": ${townError?.message ?? "no row"}`);
  }

  // Category slug lookups are scoped by town_id (slugs are not globally unique).
  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", PARKING_CATEGORY_SLUG)
    .eq("town_id", town.id)
    .single();
  if (catError || !category) {
    throw new Error(
      `Could not resolve category "${PARKING_CATEGORY_SLUG}" in town "${TOWN_SLUG}": ${catError?.message ?? "no row"}`
    );
  }

  const { data: locations, error: locError } = await supabase
    .from("locations")
    .select("id, slug, name, latitude, longitude, category_id")
    .eq("town_id", town.id)
    .eq("is_published", true);
  if (locError) throw new Error(`Could not fetch locations: ${locError.message}`);

  const withCoords = (locations ?? []).filter(
    (l) => isFiniteNumber(l.latitude) && isFiniteNumber(l.longitude)
  );
  const parks = withCoords.filter((l) => l.category_id === category.id);
  const origins = withCoords.filter((l) => l.category_id !== category.id);
  return { parks, origins, skippedNoCoords: (locations ?? []).length - withCoords.length };
}

async function assertTableExists(supabase) {
  const { error } = await supabase
    .from("location_parking_distances")
    .select("id", { count: "exact", head: true });
  if (error) {
    throw new Error(
      `Table location_parking_distances is not readable (${error.message}). ` +
        "Apply migrations/create_location_parking_distances.sql first."
    );
  }
}

async function upsertRows(supabase, rows) {
  let written = 0;
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK).map((r) => ({
      location_id: r.location_id,
      parking_location_id: r.parking_location_id,
      walking_seconds: r.walking_seconds,
      distance_meters: r.distance_meters,
      method: r.method,
      computed_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("location_parking_distances")
      .upsert(chunk, { onConflict: "location_id,parking_location_id" });
    if (error) throw new Error(`Upsert failed at row ${i}: ${error.message}`);
    written += chunk.length;
  }
  return written;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function printSummary({ mode, parks, origins, skippedNoCoords, result, outPath, written }) {
  console.log("\nSummary:");
  console.log(`  mode: ${mode}`);
  console.log(`  car parks: ${parks.length} (${parks.map((p) => p.slug).join(", ") || "none"})`);
  console.log(`  origins: ${origins.length} (published, with coordinates)`);
  console.log(`  published locations without coordinates: ${skippedNoCoords}`);
  console.log(`  Matrix requests: ${result.requests}`);
  console.log(`  pairs routed: ${result.rows.length}`);
  console.log(`  pairs skipped (unroutable, no straight-line fallback): ${result.skipped.length}`);
  for (const s of result.skipped) {
    console.log(`    ${s.location_slug} -> ${s.parking_slug}`);
  }
  console.log(`  batches failed: ${result.failed.length}`);
  for (const f of result.failed) {
    console.log(`    [${f.origins.join(", ")}] ${f.error}`);
  }
  if (mode === "dry-run") {
    console.log(`  SQL written to: ${outPath}`);
    console.log("\nDRY RUN — nothing written to the database");
  } else {
    console.log(`  rows upserted: ${written}`);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  let mode;
  try {
    ({ mode } = parseArgs(process.argv.slice(2)));
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

  console.log("Resolved config:");
  console.log(`  mode: ${mode}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${config.supabaseUrl}`);
  console.log("  SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY: present");
  console.log(`  Mapbox token: present (${config.mapboxTokenSource})`);

  const supabase = createClient(config.supabaseUrl, config.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (mode === "execute") {
    try {
      await assertTableExists(supabase);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(2);
    }
  }

  let parks, origins, skippedNoCoords;
  try {
    ({ parks, origins, skippedNoCoords } = await loadLocations(supabase));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
  if (parks.length === 0) {
    console.error(`Error: no published car park (category slug "${PARKING_CATEGORY_SLUG}") found`);
    process.exit(2);
  }
  if (origins.length === 0) {
    console.error("Error: no published origin locations with coordinates");
    process.exit(2);
  }

  let result;
  try {
    result = await computeAll(origins, parks, config.mapboxToken);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }

  let outPath = null;
  let written = 0;
  if (mode === "dry-run") {
    outPath = exportPath();
    mkdirSync("exports", { recursive: true });
    writeFileSync(outPath, toUpsertSql(result.rows), "utf8");
  } else {
    try {
      written = await upsertRows(supabase, result.rows);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(2);
    }
  }

  printSummary({ mode, parks, origins, skippedNoCoords, result, outPath, written });
  process.exit(result.skipped.length > 0 || result.failed.length > 0 ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
