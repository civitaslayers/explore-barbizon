import type { GetServerSideProps } from "next";
import { getPublishedSlugs } from "@/lib/supabase";

const BASE_URL = "https://explorebarbizon.com";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/map", priority: "0.9", changefreq: "weekly" },
  { path: "/places", priority: "0.8", changefreq: "weekly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/plan-your-visit", priority: "0.6", changefreq: "monthly" },
];

function buildSitemap(urls: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_ROUTES.map(
  ({ path, priority, changefreq }) => `  <url>
    <loc>${BASE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
).join("\n")}
${urls.map(
  (slug) => `  <url>
    <loc>${BASE_URL}/places/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
).join("\n")}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let slugs: string[] = [];

  try {
    slugs = await getPublishedSlugs();
  } catch {
    // Supabase unavailable — serve static routes only
  }

  const sitemap = buildSitemap(slugs);

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
