import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useState, useMemo } from "react";
import { getAllPlaces, type Place } from "@/data/places";
import { getPublishedLocations } from "@/lib/supabase";
import { staticMapUrl, hasMapbox } from "@/lib/mapbox";

type PlacesIndexProps = {
  places: Place[];
};

const PlacesIndexPage: NextPage<PlacesIndexProps> = ({ places }) => {
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
    return { props: { places }, revalidate: 60 };
  } catch {
    return { props: { places: getAllPlaces() }, revalidate: 60 };
  }
};

export default PlacesIndexPage;
