import type { GetServerSideProps } from "next";
import {
  getPublishedLocationSitemapEntries,
  getPublishedStorySlugs,
  getPublishedTourSlugsForSitemap,
} from "@/lib/supabase";

// ---------------------------------------------------------------------------
// pages/sitemap.xml.tsx
//
// Every published public URL, both locales, with xhtml:link alternates
// (identical slugs across locales — brain/decisions.md, 2026-07-13).
// See docs/i18n-seo-implementation-plan.md, Task 4d.
//
// `routes` is intentionally excluded: it has no public detail page today
// (the map is the only consumer of routes.geojson) — never list a URL that
// 404s. CCC/dashboard are admin surfaces, excluded per the plan.
//
// Per-record hreflang gating (brain/decisions.md, 2026-08-13 and
// 2026-10-04): locations only emit xhtml:link alternates when
// `getPublishedLocationSitemapEntries` (lib/supabase.ts) reports a genuinely
// published English translation, via the same predicate as
// getLocalized/SeoHead (`hasPublishedTranslation`). Stories and tours are
// out of scope for this task (same `translations` contract, queued
// follow-up for stories; tours have no `translations` column at all) and
// keep `hasAlternates: true` unconditionally.
// ---------------------------------------------------------------------------

const BASE_URL = "https://explorebarbizon.com";

const STATIC_ROUTES: UrlEntry[] = [
  { path: "/", priority: "1.0", changefreq: "weekly", hasAlternates: true },
  { path: "/map", priority: "0.9", changefreq: "weekly", hasAlternates: true },
  { path: "/places", priority: "0.8", changefreq: "weekly", hasAlternates: true },
  { path: "/about", priority: "0.5", changefreq: "monthly", hasAlternates: true },
  { path: "/plan-your-visit", priority: "0.6", changefreq: "monthly", hasAlternates: true },
  { path: "/history", priority: "0.6", changefreq: "monthly", hasAlternates: true },
  { path: "/stories", priority: "0.8", changefreq: "weekly", hasAlternates: true },
];

type UrlEntry = {
  path: string;
  priority: string;
  changefreq: string;
  hasAlternates: boolean;
};

function localeUrl(path: string, locale: "fr" | "en"): string {
  return locale === "fr" ? `${BASE_URL}${path}` : `${BASE_URL}/en${path}`;
}

function renderUrl({ path, priority, changefreq, hasAlternates }: UrlEntry): string {
  const frUrl = localeUrl(path, "fr");
  const enUrl = localeUrl(path, "en");
  const alternates = hasAlternates
    ? `
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${frUrl}"/>`
    : "";
  return `  <url>
    <loc>${frUrl}</loc>${alternates}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function buildSitemap(entries: UrlEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(renderUrl).join("\n")}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const entries: UrlEntry[] = [...STATIC_ROUTES];

  try {
    const locationEntries = await getPublishedLocationSitemapEntries();
    for (const { slug, hasEnglish } of locationEntries) {
      entries.push({
        path: `/places/${slug}`,
        priority: "0.7",
        changefreq: "monthly",
        hasAlternates: hasEnglish,
      });
    }
  } catch {
    // Supabase unavailable — degrade to static routes only.
  }

  try {
    const storySlugs = await getPublishedStorySlugs();
    for (const slug of storySlugs) {
      entries.push({
        path: `/stories/${slug}`,
        priority: "0.6",
        changefreq: "monthly",
        // Out of scope for this task — see header comment.
        hasAlternates: true,
      });
    }
  } catch {
    // Supabase unavailable, or stories table not reachable — skip.
  }

  try {
    const tourSlugs = await getPublishedTourSlugsForSitemap();
    for (const slug of tourSlugs) {
      entries.push({
        path: `/tours/${slug}`,
        priority: "0.6",
        changefreq: "monthly",
        // Out of scope for this task — tours have no translations column.
        hasAlternates: true,
      });
    }
  } catch {
    // Supabase unavailable — skip.
  }

  const sitemap = buildSitemap(entries);

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
