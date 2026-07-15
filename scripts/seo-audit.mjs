#!/usr/bin/env node
// scripts/seo-audit.mjs
//
// Pre-deploy SEO check (docs/i18n-seo-implementation-plan.md, Task 5a).
// Read-only: Supabase via the ANON key (published rows are readable under
// RLS — least-privilege), plus HTTP fetches against a running/deployed app.
//
// Per published entity, per available locale (fr root, /en/…):
//   - <title> present, 30-60 chars
//   - <meta name="description"> present, 110-160 chars
//   - hreflang pair completeness (fr + en + x-default -> fr URL)
//   - JSON-LD present, valid JSON, has an @type
//   - sitemap inclusion (fetched once)
// Opening-hours JSON-LD is a WARNING, never a failure, when hours exist but
// don't parse into schema.org form (lib/openingHours.ts, by design).
//
// Usage: node scripts/seo-audit.mjs
// Env:
//   SEO_AUDIT_BASE_URL          default http://localhost:3000
//   SEO_AUDIT_SAMPLE_SIZE       per-entity-type sample size, default 5
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY  (required)

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const BASE_URL = (process.env.SEO_AUDIT_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const SAMPLE_SIZE = Number(process.env.SEO_AUDIT_SAMPLE_SIZE ?? "5");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (read-only anon key required)."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Result bookkeeping
// ---------------------------------------------------------------------------

let failures = 0;
let warnings = 0;
let checks = 0;
const report = [];

function fail(scope, message) {
  failures += 1;
  report.push({ level: "FAIL", scope, message });
}

function warn(scope, message) {
  warnings += 1;
  report.push({ level: "WARN", scope, message });
}

function pass(scope, message) {
  report.push({ level: "PASS", scope, message });
}

// ---------------------------------------------------------------------------
// Entity enumeration (published only, sampled)
// ---------------------------------------------------------------------------

async function sampleSlugs(table, extraSelect = "") {
  const { data, error } = await supabase
    .from(table)
    .select(`slug${extraSelect}`)
    .eq("is_published", true)
    .limit(SAMPLE_SIZE);
  if (error) {
    warn(table, `Could not query ${table}: ${error.message}`);
    return [];
  }
  return data ?? [];
}

async function enumerateEntities() {
  const locations = (
    await sampleSlugs("locations", ", opening_hours")
  ).map((row) => ({
    type: "locations",
    slug: row.slug,
    path: `/places/${row.slug}`,
    hasOpeningHours: Boolean(
      row.opening_hours && Object.keys(row.opening_hours).length > 0
    ),
  }));

  const stories = (await sampleSlugs("stories")).map((row) => ({
    type: "stories",
    slug: row.slug,
    path: `/stories/${row.slug}`,
    hasOpeningHours: false,
  }));

  const tours = (await sampleSlugs("tours")).map((row) => ({
    type: "tours",
    slug: row.slug,
    path: `/tours/${row.slug}`,
    hasOpeningHours: false,
  }));

  return [...locations, ...stories, ...tours];
}

// ---------------------------------------------------------------------------
// Lightweight HTML extraction (no new deps — regex over predictable Next
// server-rendered <Head> output).
// ---------------------------------------------------------------------------

function extractTitle(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m ? m[1].trim() : null;
}

function extractMetaContent(html, name) {
  const re = new RegExp(
    `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const m = re.exec(html);
  if (m) return m[1];
  // attribute order can be reversed (content before name)
  const re2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`,
    "i"
  );
  const m2 = re2.exec(html);
  return m2 ? m2[1] : null;
}

function extractHreflangLinks(html) {
  const links = {};
  const re = /<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["']/gi;
  const reReversed = /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*hreflang=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) links[m[1]] = m[2];
  while ((m = reReversed.exec(html))) links[m[2]] = m[1];
  return links;
}

function extractJsonLd(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i;
  const m = re.exec(html);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return undefined; // present but invalid JSON
  }
}

async function fetchHtml(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

// ---------------------------------------------------------------------------
// Per-page checks
// ---------------------------------------------------------------------------

function checkTitle(scope, html) {
  checks += 1;
  const title = extractTitle(html);
  if (!title) {
    fail(scope, "Missing <title>");
    return;
  }
  if (title.length < 30 || title.length > 60) {
    fail(scope, `<title> length ${title.length} outside 30-60 (“${title}”)`);
    return;
  }
  pass(scope, `<title> OK (${title.length} chars)`);
}

function checkDescription(scope, html) {
  checks += 1;
  const description = extractMetaContent(html, "description");
  if (!description) {
    fail(scope, "Missing <meta name=\"description\">");
    return;
  }
  if (description.length < 110 || description.length > 160) {
    fail(
      scope,
      `description length ${description.length} outside 110-160`
    );
    return;
  }
  pass(scope, `description OK (${description.length} chars)`);
}

function checkHreflang(scope, html, path) {
  checks += 1;
  const links = extractHreflangLinks(html);
  const hasFr = Boolean(links.fr);
  const hasEn = Boolean(links.en);
  const hasXDefault = Boolean(links["x-default"]);
  if (!hasFr || !hasEn || !hasXDefault) {
    fail(
      scope,
      `Incomplete hreflang set (fr=${hasFr}, en=${hasEn}, x-default=${hasXDefault})`
    );
    return;
  }
  if (links["x-default"] !== links.fr) {
    fail(scope, "x-default does not point to the French URL");
    return;
  }
  pass(scope, "hreflang fr/en/x-default OK");
}

// Tours have no defined schema.org type in
// docs/i18n-seo-implementation-plan.md Task 4b (only locations ->
// TouristAttraction/LocalBusiness/Place and stories -> Article are scoped).
// Checking JSON-LD there would fail on a documented gap, not a real bug.
const JSON_LD_ENTITY_TYPES = new Set(["locations", "stories"]);

function checkJsonLd(scope, html, entity) {
  checks += 1;
  const jsonLd = extractJsonLd(html);
  if (jsonLd === null) {
    fail(scope, "Missing JSON-LD <script type=\"application/ld+json\">");
    return;
  }
  if (jsonLd === undefined) {
    fail(scope, "JSON-LD present but not valid JSON");
    return;
  }
  if (!jsonLd["@type"]) {
    fail(scope, "JSON-LD missing @type");
    return;
  }
  pass(scope, `JSON-LD OK (@type=${jsonLd["@type"]})`);

  if (entity.hasOpeningHours && entity.type === "locations") {
    if (!jsonLd.openingHoursSpecification) {
      warn(
        scope,
        "Location has opening_hours but no openingHoursSpecification emitted (expected when hours don't parse to canonical HH:MM ranges — see lib/openingHours.ts)"
      );
    }
  }
}

function checkSitemapInclusion(scope, path, sitemapXml) {
  checks += 1;
  const frUrl = `https://explorebarbizon.com${path}`;
  if (!sitemapXml.includes(frUrl)) {
    fail(scope, `${frUrl} not found in /sitemap.xml`);
    return;
  }
  pass(scope, "Present in /sitemap.xml");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`SEO audit — base URL: ${BASE_URL}\n`);

  const entities = await enumerateEntities();
  if (entities.length === 0) {
    console.warn("No published entities found to audit (or Supabase unreachable).");
  }

  let sitemapXml = "";
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    sitemapXml = await res.text();
  } catch (err) {
    fail("sitemap", `Could not fetch /sitemap.xml: ${err.message}`);
  }

  for (const entity of entities) {
    for (const locale of ["fr", "en"]) {
      const localePath = locale === "fr" ? entity.path : `/en${entity.path}`;
      const scope = `${entity.type}:${entity.slug} [${locale}]`;
      let html;
      try {
        html = await fetchHtml(localePath);
      } catch (err) {
        checks += 1;
        fail(scope, `Could not fetch page: ${err.message}`);
        continue;
      }
      checkTitle(scope, html);
      checkDescription(scope, html);
      checkHreflang(scope, html, localePath);
      if (JSON_LD_ENTITY_TYPES.has(entity.type)) {
        checkJsonLd(scope, html, entity);
      }
      if (sitemapXml && locale === "fr") {
        checkSitemapInclusion(scope, entity.path, sitemapXml);
      }
    }
  }

  console.log("── Report ──────────────────────────────────────────────");
  for (const { level, scope, message } of report) {
    console.log(`[${level}] ${scope} — ${message}`);
  }
  console.log("─────────────────────────────────────────────────────────");
  console.log(
    `Checks: ${checks} | Pass: ${report.filter((r) => r.level === "PASS").length} | Fail: ${failures} | Warn: ${warnings}`
  );

  if (failures > 0) {
    console.error(`\nSEO audit FAILED with ${failures} failing check(s).`);
    process.exit(1);
  }

  console.log("\nSEO audit passed (warnings do not fail the build).");
  process.exit(0);
}

main().catch((err) => {
  console.error("seo-audit crashed:", err);
  process.exit(1);
});
