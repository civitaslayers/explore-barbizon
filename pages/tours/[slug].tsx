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
        <title>{tour.title} — Visit Barbizon</title>
      </Head>

      <article>
        {/* ── BACK LINK ───────────────────────────────────── */}
        <p className="mb-10 font-sans text-[10px] uppercase tracking-[0.25em] text-ink/40">
          <Link
            href="/map"
            className="no-underline hover:text-ink transition-colors duration-200"
          >
            ← Trail Routes
          </Link>
        </p>

        {/* ── HEADER ──────────────────────────────────────── */}
        <section className="mb-16 md:flex md:items-end md:gap-16">
          <div className="md:w-2/3 space-y-5">
            <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-ink/50">
              Trail Guide · Barbizon
            </p>
            <h1 className="font-serif italic text-[3rem] md:text-[4.5rem] lg:text-[5.5rem] tracking-tight leading-[0.95] text-ink">
              {tour.title}
            </h1>
            <p className="text-base leading-relaxed text-on-surface-variant max-w-xl">
              {tour.summary}
            </p>
          </div>

          {/* Stats aside */}
          <div className="mt-10 md:mt-0 md:w-1/3 flex items-center gap-6 border-l border-outline-variant/30 pl-6">
            <div>
              <span className="block font-serif italic text-2xl text-moss">
                {tour.durationHours}–{tour.durationHours + 1}h
              </span>
              <span className="block font-sans text-[10px] tracking-widest uppercase text-ink/50 mt-0.5">
                Estimated time
              </span>
            </div>
            <div className="h-8 w-px bg-outline-variant/30" />
            <div>
              <span className="block font-serif italic text-2xl text-moss">
                {places.length} stops
              </span>
              <span className="block font-sans text-[10px] tracking-widest uppercase text-ink/50 mt-0.5">
                Along the route
              </span>
            </div>
          </div>
        </section>

        {/* ── ROUTE MAP PLACEHOLDER ───────────────────────── */}
        <section className="mb-24">
          <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-surface-container-low flex items-center justify-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink/30">
              Route map · Coming soon
            </p>
            {/* Glassmorphic label */}
            <div className="absolute bottom-5 left-5 bg-surface-variant/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
              <p className="font-sans text-[10px] tracking-widest uppercase text-on-surface-variant">
                Digital Cartography
              </p>
            </div>
          </div>
        </section>

        {/* ── STOP NARRATIVE GRID ─────────────────────────── */}
        <div className="relative">
          {/* Vertical timeline line — desktop only */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant/20 -translate-x-1/2" />

          <div className="space-y-24 md:space-y-32">
            {places.map((place, index) => {
              const isEven = index % 2 === 0;
              const stopNumber = String(index + 1).padStart(2, "0");
              const heroImg =
                place.heroImage ?? "/images/places/place-default.jpg";

              return (
                <div
                  key={place.slug}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start"
                >
                  {/* Content block — alternates left/right */}
                  <div
                    className={`md:col-span-5 space-y-6 ${
                      isEven ? "md:col-start-1 md:text-right" : "md:col-start-8"
                    }`}
                  >
                    {/* Stop number + title */}
                    <div
                      className={`flex items-center gap-4 ${
                        isEven ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <span className="w-11 h-11 rounded-full ink-gradient text-cream flex items-center justify-center font-serif italic text-lg shadow-ambient flex-shrink-0">
                        {stopNumber}
                      </span>
                      <h2 className="font-serif italic text-2xl md:text-3xl text-ink leading-tight">
                        {place.name}
                      </h2>
                    </div>

                    {/* Image */}
                    <Link
                      href={`/places/${place.slug}`}
                      className={`block relative overflow-hidden rounded-2xl group ${
                        isEven ? "aspect-video" : "aspect-square"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-ink/20 transition-transform duration-700 ease-soft group-hover:scale-105"
                        style={{ backgroundImage: `url(${heroImg})` }}
                      />
                      <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500" />
                    </Link>

                    {/* Description */}
                    <p className="font-sans text-sm leading-relaxed text-on-surface-variant">
                      {place.shortDescription}
                    </p>

                    {/* Category chip + place link */}
                    <div
                      className={`flex items-center gap-3 ${
                        isEven ? "md:justify-end" : ""
                      }`}
                    >
                      <span className="chip">{place.category}</span>
                      <Link
                        href={`/places/${place.slug}`}
                        className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/40 no-underline hover:text-ink transition-colors duration-200"
                      >
                        View place →
                      </Link>
                    </div>
                  </div>

                  {/* Spacer for timeline gap — desktop only */}
                  <div className="hidden md:block md:col-span-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ARCHIVAL QUOTE ──────────────────────────────── */}
        <section className="mt-32 pt-20 border-t border-outline-variant/20 flex flex-col items-center text-center">
          <div className="text-moss mb-8 opacity-40">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
              <path d="M14 8C9.6 8 6 11.6 6 16v8c0 4.4 3.6 8 8 8h2l-4 8h6l5-8.9V16c0-4.4-3.6-8-8-8h-1zm20 0c-4.4 0-8 3.6-8 8v8c0 4.4 3.6 8 8 8h2l-4 8h6l5-8.9V16c0-4.4-3.6-8-8-8h-1z" />
            </svg>
          </div>
          <blockquote className="font-serif italic text-2xl md:text-3xl lg:text-4xl text-ink max-w-3xl leading-snug mb-8">
            {
              '"The forest does not belong to those who own it, but to those who know how to look at it."'
            }
          </blockquote>
          <cite className="font-sans tracking-widest text-[10px] uppercase text-ink/40">
            — Théodore Rousseau, Barbizon, c. 1850
          </cite>
        </section>
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

