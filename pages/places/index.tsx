import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useState, useMemo } from "react";
import { getAllPlaces, type Place } from "@/data/places";
import { getEditorialLocations } from "@/lib/supabase";
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
        <title>Places — Explore Barbizon</title>
      </Head>

      <section className="space-y-10 xl:space-y-12">
        <header className="editorial-measure space-y-4">
          <p className="eyebrow">PLACES TO TRACE</p>
          <h1 className="font-serif text-3xl leading-tight tracking-tight text-ink md:text-4xl xl:text-[2.5rem]">
            Studios, paths, and small museums along the forest edge.
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base xl:text-[1.0625rem] xl:leading-[1.65]">
            A small, evolving index of places in and around Barbizon. Each is
            less a destination than a vantage point: a room, a path, a clearing
            from which to look.
          </p>
        </header>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-250 ease-soft ${
                activeCategory === cat
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/20 text-ink/60 hover:border-ink/50 hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-xs text-ink/40">
          {filtered.length} {filtered.length === 1 ? "place" : "places"}
          {activeCategory !== "All" && ` · ${activeCategory}`}
        </p>

        <div className="grid gap-6 md:grid-cols-3 xl:gap-8">
          {filtered.map((place) => (
            <Link
              key={place.slug}
              href={`/places/${place.slug}`}
              className="card card-hover group flex flex-col overflow-hidden"
            >
              {/* Map thumbnail */}
              <div className="relative h-40 overflow-hidden">
                {hasMapbox ? (
                  <img
                    src={staticMapUrl(place.longitude, place.latitude)}
                    alt={`Map location of ${place.name}`}
                    className="h-full w-full object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full bg-ink/8" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <p className="eyebrow">{place.category}</p>
                <h3 className="mt-1 font-serif text-base text-ink">
                  {place.name}
                </h3>
                {place.shortDescription && (
                  <p className="mt-2 text-xs leading-relaxed text-ink/70 md:text-[13px]">
                    {place.shortDescription}
                  </p>
                )}
                <span className="mt-auto pt-4 text-[11px] uppercase tracking-[0.2em] text-ink/40">
                  View place →
                </span>
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
    const places = await getEditorialLocations();
    return { props: { places }, revalidate: 60 };
  } catch {
    return { props: { places: getAllPlaces() }, revalidate: 60 };
  }
};

export default PlacesIndexPage;
