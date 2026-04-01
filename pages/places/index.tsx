import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useState, useMemo } from "react";
import { getAllPlaces, type Place } from "@/data/places";
import { getPublishedLocations, supabase } from "@/lib/supabase";
import { staticMapUrl, hasMapbox } from "@/lib/mapbox";

type CuratedRow = {
  slug: string;
  name: string;
  short_description: string | null;
  is_premium: boolean | null;
  curation_order: number | null;
  categories: { name: string; layer: string; slug: string } | null;
  media: { url: string; display_order: number | null }[] | null;
};

type CuratedPlace = {
  slug: string;
  name: string;
  shortDescription: string;
  heroImage: string | null;
  isPremium: boolean;
};

type PlacesIndexProps = {
  places: Place[];
  whereToEat: CuratedPlace[];
  whereToStay: CuratedPlace[];
};

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
    heroImage: urls[0]?.url ?? null,
    isPremium: row.is_premium === true,
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
      "slug, name, short_description, is_premium, curation_order, categories!inner(name, layer, slug), media(url, display_order)"
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
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-ink/50">
        {eyebrow}
      </p>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 scrollbar-none snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {items.map((place) => (
          <Link
            key={place.slug}
            href={`/places/${place.slug}`}
            className="flex w-[72vw] max-w-[20rem] flex-shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-outline-variant/40 bg-surface transition-colors hover:border-ink/25 md:w-auto md:max-w-none"
          >
            <div className="relative aspect-[16/10] bg-ink/8">
              {place.heroImage ? (
                <img
                  src={place.heroImage}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
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
              {place.shortDescription ? (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink/65">
                  {place.shortDescription}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const PlacesIndexPage: NextPage<PlacesIndexProps> = ({
  places,
  whereToEat,
  whereToStay,
}) => {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(places.map((p) => p.category))).sort();
    return ["All", ...cats];
  }, [places]);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? places
        : places.filter((p) => p.category === activeCategory),
    [places, activeCategory]
  );

  return (
    <>
      <Head>
        <title>Places — Visit Barbizon</title>
      </Head>

      <section className="space-y-10 xl:space-y-12">
        <header className="space-y-5">
          <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-ink/50">
            Archive Directory
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
          <CuratedSection eyebrow="Where to eat" items={whereToEat} />
          <CuratedSection eyebrow="Where to stay" items={whereToStay} />
        </div>

        {/* Category filters */}
        <div className="-mx-4 flex gap-0 overflow-x-auto border-b border-outline-variant/30 pb-1 scrollbar-none px-4 md:mx-0 md:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`-mb-px flex-shrink-0 border-b-2 px-4 pb-3 font-sans text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${activeCategory === cat
                ? "border-ink font-medium text-ink"
                : "border-transparent text-ink/40 hover:text-ink/70"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
          {filtered.map((place) => (
            <Link
              key={place.slug}
              href={`/places/${place.slug}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-ink/10"
            >
              {hasMapbox ? (
                <img
                  src={staticMapUrl(place.longitude, place.latitude)}
                  alt={`Map location of ${place.name}`}
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 ease-soft group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-ink/8" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="chip mb-2 inline-block">
                  {place.category}
                </span>
                <h3 className="font-serif text-lg italic leading-tight text-cream">
                  {place.name}
                </h3>
                {place.shortDescription && (
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-cream/70">
                    {place.shortDescription}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<PlacesIndexProps> = async () => {
  try {
    const places = await getPublishedLocations();
    let whereToEat: CuratedPlace[] = [];
    let whereToStay: CuratedPlace[] = [];
    if (supabase) {
      try {
        const curated = await getFeaturedEatStayCurated();
        whereToEat = curated.whereToEat;
        whereToStay = curated.whereToStay;
      } catch {
        // Curated sections stay empty if query fails (e.g. column not deployed yet).
      }
    }
    return {
      props: { places, whereToEat, whereToStay },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        places: getAllPlaces(),
        whereToEat: [],
        whereToStay: [],
      },
      revalidate: 60,
    };
  }
};

export default PlacesIndexPage;
