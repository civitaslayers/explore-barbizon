import type { GetServerSideProps } from "next";
import {
  getPublishedSlugs,
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
// ---------------------------------------------------------------------------

const BASE_URL = "https://explorebarbizon.com";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/map", priority: "0.9", changefreq: "weekly" },
  { path: "/places", priority: "0.8", changefreq: "weekly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/plan-your-visit", priority: "0.6", changefreq: "monthly" },
];

type UrlEntry = { path: string; priority: string; changefreq: string };

function localeUrl(path: string, locale: "fr" | "en"): string {
  return locale === "fr" ? `${BASE_URL}${path}` : `${BASE_URL}/en${path}`;
}

function renderUrl({ path, priority, changefreq }: UrlEntry): string {
  const frUrl = localeUrl(path, "fr");
  const enUrl = localeUrl(path, "en");
  return `  <url>
    <loc>${frUrl}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${frUrl}"/>
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
    const locationSlugs = await getPublishedSlugs();
    for (const slug of locationSlugs) {
      entries.push({
        path: `/places/${slug}`,
        priority: "0.7",
        changefreq: "monthly",
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
