import type { GetServerSideProps } from "next";
import { degrade } from "@/lib/fetchPolicy";
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
// getLocalized/SeoHead (`hasPublishedTranslation`). Stories (title/body) and
// tours (name/description) are gated the same way (task b3accf5d).
//
// Failure policy: lib/fetchPolicy.ts — each block retries once, then
// degrades with a logged error.
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
  // Each block degrades independently (logged): an XML with fewer entries
  // beats a 500 for crawlers. A degraded sitemap gets a short cache so the
  // next crawl sees the full one.
  let degraded = false;

  const locationEntries = await degrade(
    "sitemap getPublishedLocationSitemapEntries",
    () => getPublishedLocationSitemapEntries(),
    null
  );
  if (locationEntries) {
    for (const { slug, hasEnglish } of locationEntries) {
      entries.push({
        path: `/places/${slug}`,
        priority: "0.7",
        changefreq: "monthly",
        hasAlternates: hasEnglish,
      });
    }
  } else {
    degraded = true;
  }

  const storyEntries = await degrade("sitemap getPublishedStorySlugs", () => getPublishedStorySlugs(), null);
  if (storyEntries) {
    for (const { slug, hasEnglish } of storyEntries) {
      entries.push({
        path: `/stories/${slug}`,
        priority: "0.6",
        changefreq: "monthly",
        hasAlternates: hasEnglish,
      });
    }
  } else {
    degraded = true;
  }

  const tourEntries = await degrade("sitemap getPublishedTourSlugsForSitemap", () => getPublishedTourSlugsForSitemap(), null);
  if (tourEntries) {
    for (const { slug, hasEnglish } of tourEntries) {
      entries.push({
        path: `/tours/${slug}`,
        priority: "0.6",
        changefreq: "monthly",
        hasAlternates: hasEnglish,
      });
    }
  } else {
    degraded = true;
  }

  const sitemap = buildSitemap(entries);

  res.setHeader("Content-Type", "application/xml");
  res.setHeader(
    "Cache-Control",
    degraded
      ? "public, s-maxage=60, stale-while-revalidate=60"
      : "public, s-maxage=3600, stale-while-revalidate=600"
  );
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
