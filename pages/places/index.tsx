import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation, type SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useState, useMemo } from "react";
import AddToDayButton from "@/components/AddToDayButton";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { SeoHead } from "@/components/SeoHead";
import { categoryLabel } from "@/lib/categoryLabel";
import { degrade, withRetry } from "@/lib/fetchPolicy";
import { heroImage800w } from "@/lib/media";
import { getPublishedLocations, supabase } from "@/lib/supabase";
import type { Place } from "@/lib/types";
import { getLocalized, type TranslationEntry } from "@/lib/getLocalized";
import { staticMapUrl, hasMapbox } from "@/lib/mapbox";
import nextI18NextConfig from "@/next-i18next.config";

type CuratedRow = {
  slug: string;
  name: string;
  short_description: string | null;
  is_premium: boolean | null;
  curation_order: number | null;
  en_short_description: string | null;
  en_status: string | null;
  categories: { name: string; layer: string; slug: string } | null;
  media: { url: string; display_order: number | null }[] | null;
};

type CuratedPlace = {
  slug: string;
  name: string;
  shortDescription: string;
  short_description: string;
  heroImage: string | null;
  isPremium: boolean;
  translations?: Record<string, TranslationEntry> | null;
};

type PlacesIndexProps = {
  places: Place[];
  whereToEat: CuratedPlace[];
  whereToStay: CuratedPlace[];
  curatedUnavailable: boolean;
} & SSRConfig;

// Internal sentinel for the "show every category" filter state — distinct
// from its visible label (t("places.filterAll")), which is locale-dependent.
const ALL_FILTER = "__all__";

const EAT_STAY_SHOP_LAYER = "Eat, Stay & Shop";

const FOOD_CATEGORY_SLUGS = new Set([
  "restaurant",
  "boucherie",
  "boulangerie",
  "fromagerie",
  "epicerie",
  "traiteur",
  "salon-de-the",
]);

const FOOD_CATEGORY_NAMES = new Set([
  "Restaurant",
  "Boucherie",
  "Boulangerie",
  "Fromagerie",
  "Epicerie",
  "Traiteur",
  "Salon de the",
]);

function isFoodCategory(name: string, slug: string): boolean {
  if (FOOD_CATEGORY_SLUGS.has(slug.toLowerCase())) return true;
  return FOOD_CATEGORY_NAMES.has(name);
}

function isStayCategory(name: string, slug: string): boolean {
  return name === "Hotel" || slug.toLowerCase() === "hotel";
}

function rowToCurated(row: CuratedRow): CuratedPlace {
  const urls = [...(row.media ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  return {
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description?.trim() ?? "",
    short_description: row.short_description?.trim() ?? "",
    heroImage: urls[0]?.url ?? null,
    isPremium: row.is_premium === true,
    // getStaticProps serializes this to JSON — undefined is not a valid
    // JSON value, so missing values use null here, not undefined. (Cast
    // past TranslationEntry's `status?: string` — null is equally "not
    // published" to getLocalized's `=== "published"` check.)
    translations: {
      en: {
        short_description: row.en_short_description ?? null,
        _meta: { status: row.en_status ?? null },
      },
    } as unknown as Record<string, TranslationEntry>,
  };
}

function sortFeaturedRows(rows: CuratedRow[]): CuratedRow[] {
  return [...rows].sort((a, b) => {
    const ao = a.curation_order;
    const bo = b.curation_order;
    if (ao != null && bo != null && ao !== bo) return ao - bo;
    if (ao != null && bo == null) return -1;
    if (ao == null && bo != null) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

async function getFeaturedEatStayCurated(): Promise<{
  whereToEat: CuratedPlace[];
  whereToStay: CuratedPlace[];
}> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("locations")
    .select(
      "slug, name, short_description, is_premium, curation_order, en_short_description:translations->en->>short_description, en_status:translations->en->_meta->>status, categories!inner(name, layer, slug), media(url, display_order)"
    )
    .eq("is_published", true)
    .eq("is_featured", true)
    .eq("categories.layer", EAT_STAY_SHOP_LAYER)
    .order("curation_order", { ascending: true, nullsFirst: false })
    .order("name");

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as CuratedRow[];
  const ordered = sortFeaturedRows(rows);

  const eatRows = ordered.filter((r) => {
    const c = r.categories;
    if (!c) return false;
    return isFoodCategory(c.name, c.slug);
  });
  const stayRows = ordered.filter((r) => {
    const c = r.categories;
    if (!c) return false;
    return isStayCategory(c.name, c.slug);
  });

  return {
    whereToEat: eatRows.map(rowToCurated),
    whereToStay: stayRows.map(rowToCurated),
  };
}

function CuratedSection({
  eyebrow,
  items,
}: {
  eyebrow: string;
  items: CuratedPlace[];
}) {
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-ink/60">
        {eyebrow}
      </p>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 scrollbar-none snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {items.map((place) => (
          <div
            key={place.slug}
            className="relative flex w-[72vw] max-w-[20rem] flex-shrink-0 snap-start md:w-auto md:max-w-none"
          >
          <Link
            href={`/places/${place.slug}`}
            className="flex w-full flex-col overflow-hidden rounded-xl border border-outline-variant/40 bg-surface transition-colors hover:border-ink/25"
          >
            <div className="relative aspect-[16/10]">
              {place.heroImage ? (
                /* 21rem = the widest this card ever renders: (70rem max-w-content − 4rem
                   md:px-8 − 3rem of md:gap-6) / 3 columns. Mobile is narrower
                   (min(72vw, 20rem)), so one conservative value never under-states, and
                   with only 800w/1600w candidates it picks 800w at DPR 1–2 on every
                   viewport. */
                <img
                  src={heroImage800w(place.heroImage)}
                  srcSet={`${heroImage800w(place.heroImage)} 800w, ${place.heroImage} 1600w`}
                  sizes="21rem"
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <ImagePlaceholder name={place.name} className="h-full w-full" />
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-base italic leading-snug text-ink">
                  {place.name}
                </h3>
                {place.isPremium ? (
                  <span
                    className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink/35"
                    aria-hidden
                  />
                ) : null}
              </div>
              {getLocalized(place, router.locale ?? "fr", "short_description") ? (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink/65">
                  {getLocalized(place, router.locale ?? "fr", "short_description")}
                </p>
              ) : null}
            </div>
          </Link>
          <AddToDayButton
            variant="icon"
            slug={place.slug}
            name={place.name}
            className="absolute right-3 top-3 z-10"
          />
          </div>
        ))}
      </div>
    </div>
  );
}

const PlacesIndexPage: NextPage<PlacesIndexProps> = ({
  places,
  whereToEat,
  whereToStay,
  curatedUnavailable,
}) => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const { t } = useTranslation("common");
  const [activeCategory, setActiveCategory] = useState(ALL_FILTER);

  const categoryOptions = useMemo(() => {
    const byCategory = new Map<string, string>();
    for (const p of places) {
      if (!byCategory.has(p.category)) {
        byCategory.set(p.category, categoryLabel(p.categorySlug, p.category, t));
      }
    }
    const options = Array.from(byCategory.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, locale));
    return [{ value: ALL_FILTER, label: t("places.filterAll") }, ...options];
  }, [places, t, locale]);

  const filtered = useMemo(
    () =>
      activeCategory === ALL_FILTER
        ? places
        : places.filter((p) => p.category === activeCategory),
    [places, activeCategory]
  );

  return (
    <>
      <SeoHead
        title={t("places.metaTitle")}
        description={t("places.metaDescription")}
        path="/places"
        locale={locale}
      />

      <section className="space-y-10 xl:space-y-12">
        <header className="space-y-5">
          <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-ink/60">
            {t("places.eyebrow")}
          </p>
          <h1 className="font-serif text-4xl italic leading-[1.05] tracking-tight text-ink md:text-5xl">
            Places of Barbizon
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant md:text-base">
            Discover the historic ateliers, quiet inns, and forest clearings that
            defined the Pre-Impressionist era. Each location is a chapter in the
            narrative of nature&apos;s awakening.
          </p>
        </header>

        <div className="space-y-10">
          <CuratedSection eyebrow={t("places.whereToEat")} items={whereToEat} />
          <CuratedSection eyebrow={t("places.whereToStay")} items={whereToStay} />
          {curatedUnavailable && whereToEat.length === 0 && whereToStay.length === 0 ? (
            <p className="text-xs text-ink/60">{t("places.curatedUnavailable")}</p>
          ) : null}
        </div>

        {/* Category filters */}
        <div className="-mx-4 flex gap-0 overflow-x-auto border-b border-outline-variant/30 pb-1 scrollbar-none px-4 md:mx-0 md:px-0">
          {categoryOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveCategory(value)}
              className={`-mb-px flex-shrink-0 border-b-2 px-4 pb-3 font-sans text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${activeCategory === value
                ? "border-ink font-medium text-ink"
                : "border-transparent text-ink/60 hover:text-ink/70"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
          {filtered.map((place) => (
            <div key={place.slug} className="relative">
            <Link
              href={`/places/${place.slug}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-ink/10"
            >
              {hasMapbox ? (
                <img
                  src={staticMapUrl(place.longitude, place.latitude)}
                  alt={t("a11y.mapOf", { name: place.name })}
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 ease-soft group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-ink/8" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="chip mb-2 inline-block">
                  {categoryLabel(place.categorySlug, place.category, t)}
                </span>
                <h3 className="font-serif text-lg italic leading-tight text-cream">
                  {place.name}
                </h3>
                {getLocalized(place, locale, "short_description") && (
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-cream/70">
                    {getLocalized(place, locale, "short_description")}
                  </p>
                )}
              </div>
            </Link>
            <AddToDayButton
              variant="icon"
              slug={place.slug}
              name={place.name}
              className="absolute right-3 top-3 z-10"
            />
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<PlacesIndexProps> = async ({
  locale,
}) => {
  const places = await withRetry("places getPublishedLocations", () => getPublishedLocations());
  // Curated sections stay empty if the query fails — flagged so the page can
  // surface a note instead of silently looking like nothing is curated.
  const curated = await degrade("places getFeaturedEatStayCurated", () => getFeaturedEatStayCurated(), null);
  const whereToEat: CuratedPlace[] = curated?.whereToEat ?? [];
  const whereToStay: CuratedPlace[] = curated?.whereToStay ?? [];
  const curatedUnavailable = curated === null;
  const translations = await serverSideTranslations(locale ?? "fr", ["common"], nextI18NextConfig);
  return {
    props: { places, whereToEat, whereToStay, curatedUnavailable, ...translations },
    revalidate: 60,
  };
};

export default PlacesIndexPage;
