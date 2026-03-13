import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { getAllPlaces, type Place } from "@/data/places";

type PlacesIndexProps = {
  places: Place[];
};

const PlacesIndexPage: NextPage<PlacesIndexProps> = ({ places }) => {
  return (
    <>
      <Head>
        <title>Places — Explore Barbizon</title>
      </Head>

      <section className="space-y-10">
        <header className="editorial-measure space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            PLACES TO TRACE
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            Studios, paths, and small museums along the forest edge.
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base">
            A small, evolving index of places in and around Barbizon. Each is
            less a destination than a vantage point: a room, a path, a clearing
            from which to look.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {places.map((place) => (
            <Link
              key={place.slug}
              href={`/places/${place.slug}`}
              className="group flex flex-col border border-ink/10 bg-cream/60 px-4 py-5 transition hover:border-ink/25"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
                {place.category}
              </span>
              <span className="mt-1 font-serif text-base text-ink">
                {place.name}
              </span>
              <span className="mt-2 text-xs leading-relaxed text-ink/75">
                {place.shortDescription}
              </span>
              <span className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink/45">
                View place →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<PlacesIndexProps> = async () => {
  const places = getAllPlaces();
  return {
    props: {
      places
    }
  };
};

export default PlacesIndexPage;

