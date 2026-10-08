import Head from "next/head";
import { serializeJsonLd } from "@/lib/jsonLd";

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
//
// Per-record hreflang gating (brain/decisions.md, 2026-08-13 and
// 2026-10-04): `hasEnglishVersion` defaults to `true` so the ~9 i18n-JSON-
// catalogue pages (home, map, about, history, plan-your-visit, places
// index, stories index, stories/[slug], tours/[slug], 404) keep their
// current fr/en/x-default output unchanged. Only DB-record-backed pages
// (currently pages/places/[slug].tsx) pass the computed boolean — gated on
// the exact same predicate `getLocalized` uses to render
// (`lib/getLocalized.ts`'s `hasPublishedTranslation`), never on mere
// translations-key presence.
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
  /**
   * Does this record have a genuinely published English translation?
   * Defaults to `true` — load-bearing for every i18n-JSON-catalogue call
   * site (not DB-record-backed), which must keep emitting fr/en/x-default
   * alternates unchanged. Record-backed pages pass this explicitly, computed
   * via `hasPublishedTranslation` (lib/getLocalized.ts). See
   * brain/decisions.md, 2026-08-13 and 2026-10-04.
   */
  hasEnglishVersion?: boolean;
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
  hasEnglishVersion = true,
}: SeoHeadProps) {
  const canonical = localizedUrl(path, locale);
  const frUrl = localizedUrl(path, "fr");
  const enUrl = localizedUrl(path, "en");

  // French is the default locale (brain/decisions.md, 2026-07-13 — x-default
  // → the French URL). noindex,follow applies only on the non-default
  // locale when there is no published alternate to advertise — the French
  // page itself always stays indexable.
  const isNonDefaultLocale = locale !== "fr";
  const suppressAlternates = isNonDefaultLocale && !hasEnglishVersion;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      <link rel="canonical" href={canonical} />
      {hasEnglishVersion ? (
        <>
          <link rel="alternate" hrefLang="fr" href={frUrl} />
          <link rel="alternate" hrefLang="en" href={enUrl} />
          {/* x-default → the French URL (brain/decisions.md, 2026-07-13). */}
          <link rel="alternate" hrefLang="x-default" href={frUrl} />
        </>
      ) : null}
      {suppressAlternates ? (
        <meta name="robots" content="noindex,follow" />
      ) : null}

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
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      ) : null}
    </Head>
  );
}

export default SeoHead;
