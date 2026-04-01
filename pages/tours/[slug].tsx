import Head from "next/head";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import {
  getTourBySlugFromSupabase,
  getPublishedTourSlugs,
  type TourWithStops,
} from "@/lib/supabase";
import { getAllTours, getTourBySlug, getPlacesForTour } from "@/data/tours";

// Static fallback shape — matches what the page needs
type StaticStop = {
  stop_order: number;
  stop_narrative: string | null;
  locations: {
    name: string;
    slug: string;
    short_description: string | null;
  } | null;
};

type TourPageProps =
  | { source: "supabase"; tour: TourWithStops }
  | {
      source: "static";
      tour: {
        name: string;
        slug: string;
        description: string;
        duration_minutes: number;
        distance_meters: number | null;
      };
      stops: StaticStop[];
    };

function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatDistance(meters: number | null): string {
  if (!meters) return "";
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${meters} m`;
}

const TourPage: NextPage<TourPageProps> = (props) => {
  const tour = props.tour;
  const stops = props.source === "supabase" ? props.tour.stops : props.stops;

  return (
    <>
      <Head>
        <title>{tour.name} — Explore Barbizon</title>
      </Head>
      <article className="space-y-10">
        <header className="editorial-measure space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            WALKING TOUR
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            {tour.name}
          </h1>
          {tour.description && (
            <p className="text-sm leading-relaxed text-ink/80 md:text-base">
              {tour.description}
            </p>
          )}
          <div className="flex gap-4 text-xs text-ink/60">
            {formatDuration(tour.duration_minutes) && (
              <span>{formatDuration(tour.duration_minutes)}</span>
            )}
            {formatDistance(tour.distance_meters) && (
              <span>{formatDistance(tour.distance_meters)}</span>
            )}
          </div>
        </header>

        {stops.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-sm uppercase tracking-[0.2em] text-ink/70">
              PLACES ALONG THE ROUTE
            </h2>
            <ol className="space-y-6 text-sm text-ink/80">
              {stops.map((stop, index) => (
                <li key={stop.stop_order} className="flex gap-3">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-ink/40 pt-0.5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-1">
                    {stop.locations ? (
                      <Link
                        href={`/places/${stop.locations.slug}`}
                        className="font-serif text-sm text-ink hover:underline underline-offset-4"
                      >
                        {stop.locations.name}
                      </Link>
                    ) : null}
                    {stop.locations?.short_description && (
                      <p className="text-xs text-ink/60">
                        {stop.locations.short_description}
                      </p>
                    )}
                    {stop.stop_narrative && (
                      <p className="text-xs leading-relaxed text-ink/75 mt-1">
                        {stop.stop_narrative}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

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
  try {
    const slugs = await getPublishedTourSlugs();
    return {
      paths: slugs.map((slug) => ({ params: { slug } })),
      fallback: "blocking",
    };
  } catch {
    const tours = getAllTours();
    return {
      paths: tours.map((t) => ({ params: { slug: t.slug } })),
      fallback: false,
    };
  }
};

export const getStaticProps: GetStaticProps<TourPageProps> = async ({
  params,
}) => {
  const slug = params?.slug;
  if (typeof slug !== "string") return { notFound: true };

  try {
    const tour = await getTourBySlugFromSupabase(slug);
    if (!tour) return { notFound: true };
    return { props: { source: "supabase", tour }, revalidate: 60 };
  } catch {
    const staticTour = getTourBySlug(slug);
    if (!staticTour) return { notFound: true };
    const places = getPlacesForTour(staticTour);
    const stops: StaticStop[] = places.map((p, i) => ({
      stop_order: i + 1,
      stop_narrative: null,
      locations: {
        name: p.name,
        slug: p.slug,
        short_description: p.shortDescription ?? null,
      },
    }));
    return {
      props: {
        source: "static",
        tour: {
          name: staticTour.title,
          slug: staticTour.slug,
          description: staticTour.summary,
          duration_minutes: staticTour.durationHours * 60,
          distance_meters: null,
        },
        stops,
      },
      revalidate: 60,
    };
  }
};

export default TourPage;
