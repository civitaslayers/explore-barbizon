import Head from "next/head";

// ---------------------------------------------------------------------------
// components/SeoHead.tsx
//
// Shared <Head> block for public pages: locale-aware title/description,
// hreflang fr/en + x-default, canonical URL, Open Graph, optional JSON-LD.
// See docs/i18n-seo-implementation-plan.md, Task 4a.
//
// `path` is the locale-agnostic path (no /en prefix), e.g.
// "/places/maison-millet". Slugs are identical across locales
// (brain/decisions.md, 2026-07-13) so no slug-mapping is needed here.
// ---------------------------------------------------------------------------

export const SITE_BASE_URL = "https://explorebarbizon.com";
export const SITE_NAME = "Visit Barbizon";

export type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export type SeoHeadProps = {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string;
  /** og:type — "article" for stories/place detail pages, "website" for indexes. */
  type?: "website" | "article";
  jsonLd?: JsonLd;
};

function localizedUrl(path: string, locale: string): string {
  const prefix = locale === "fr" ? "" : `/${locale}`;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_BASE_URL}${prefix}${normalizedPath}`;
}

function ogLocale(locale: string): string {
  if (locale === "en") return "en_US";
  if (locale === "fr") return "fr_FR";
  return locale;
}

export function SeoHead({
  title,
  description,
  path,
  locale,
  image,
  type = "website",
  jsonLd,
}: SeoHeadProps) {
  const canonical = localizedUrl(path, locale);
  const frUrl = localizedUrl(path, "fr");
  const enUrl = localizedUrl(path, "en");

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="fr" href={frUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      {/* x-default → the French URL (brain/decisions.md, 2026-07-13). */}
      <link rel="alternate" hrefLang="x-default" href={frUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={ogLocale(locale)} />
      {image ? <meta property="og:image" content={image} /> : null}

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </Head>
  );
}

export default SeoHead;
