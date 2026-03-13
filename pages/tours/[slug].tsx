import Head from "next/head";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import {
  getAllTours,
  getTourBySlug,
  getPlacesForTour,
  type Tour
} from "@/data/tours";
import type { Place } from "@/data/places";

type TourPageProps = {
  tour: Tour;
  places: Place[];
};

const TourPage: NextPage<TourPageProps> = ({ tour, places }) => {
  return (
    <>
      <Head>
        <title>{tour.title} — Explore Barbizon</title>
      </Head>
      <article className="space-y-10">
        <header className="editorial-measure space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            WALKING TOUR
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            {tour.title}
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base">
            {tour.summary}
          </p>
          <p className="text-xs text-ink/60">
            Approximate duration: {tour.durationHours}–{tour.durationHours + 1}{" "}
            hours at an unhurried pace.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-ink/70">
            PLACES ALONG THE ROUTE
          </h2>
          <ol className="space-y-3 text-sm text-ink/80">
            {places.map((place, index) => (
              <li key={place.slug} className="flex gap-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-ink/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <Link
                    href={`/places/${place.slug}`}
                    className="font-serif text-sm text-ink hover:underline"
                  >
                    {place.name}
                  </Link>
                  <p className="text-xs text-ink/70">{place.shortDescription}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="text-xs text-ink/60">
          <Link
            href="/plan-your-visit"
            className="underline-offset-4 hover:underline"
          >
            ← Back to Plan Your Visit
          </Link>
        </div>
      </article>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const tours = getAllTours();
  const paths = tours.map((tour) => ({
    params: { slug: tour.slug }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<TourPageProps> = async ({
  params
}) => {
  const slug = params?.slug;
  if (typeof slug !== "string") {
    return { notFound: true };
  }

  const tour = getTourBySlug(slug);

  if (!tour) {
    return { notFound: true };
  }

  const places = getPlacesForTour(tour);

  return {
    props: {
      tour,
      places
    }
  };
};

export default TourPage;

