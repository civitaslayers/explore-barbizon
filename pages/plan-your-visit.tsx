import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { getAllPlaces, type Place } from "@/data/places";
import { getAllTours, type Tour } from "@/data/tours";

type PlanPageProps = {
  places: Place[];
  tours: Tour[];
};

const PlanYourVisitPage: NextPage<PlanPageProps> = ({ places, tours }) => {
  return (
    <>
      <Head>
        <title>Plan Your Visit — Explore Barbizon</title>
      </Head>

      <section className="space-y-10">
        <header className="editorial-measure space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            PLAN YOUR VISIT
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            A quiet framework for a day in Barbizon.
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base">
            Start with a map, choose a few places, and follow one of the slow
            walking routes. This page will eventually gather practical details;
            for now, it sketches a structure for your time.
          </p>
        </header>

        <section className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3 border border-ink/10 bg-cream/70 p-5">
            <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-ink/80">
              1. Orient yourself
            </h2>
            <p className="text-xs leading-relaxed text-ink/75">
              Begin with the{" "}
              <Link
                href="/map"
                className="underline-offset-4 hover:underline"
              >
                Explore Map
              </Link>{" "}
              to get a sense of how the village meets the forest.
            </p>
          </div>

          <div className="space-y-3 border border-ink/10 bg-cream/70 p-5">
            <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-ink/80">
              2. Choose a few places
            </h2>
            <p className="text-xs leading-relaxed text-ink/75">
              Select two or three places rather than many. For example:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-ink/80">
              {places.slice(0, 3).map((place) => (
                <li key={place.slug}>
                  <Link
                    href={`/places/${place.slug}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {place.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 border border-ink/10 bg-cream/70 p-5">
            <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-ink/80">
              3. Walk a route
            </h2>
            <p className="text-xs leading-relaxed text-ink/75">
              Follow one of the slow tours as a loose framework:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-ink/80">
              {tours.map((tour) => (
                <li key={tour.slug}>
                  <Link
                    href={`/tours/${tour.slug}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {tour.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<PlanPageProps> = async () => {
  const places = getAllPlaces();
  const tours = getAllTours();

  return {
    props: {
      places,
      tours
    }
  };
};

export default PlanYourVisitPage;

