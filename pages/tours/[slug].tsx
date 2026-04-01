import Head from "next/head";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import {
  getTourBySlugFromSupabase,
  getPublishedTourSlugs,
  getRouteByTourSlug,
  type TourWithStops,
} from "@/lib/supabase";
import { hasMapbox } from "@/lib/mapbox";
import { getAllTours, getTourBySlug, getPlacesForTour } from "@/data/tours";

// Static fallback shape — matches what the page needs
type StaticStop = {
  stop_order: number;
  stop_narrative: string | null;
  locations: {
    name: string;
    slug: string;
    short_description: string | null;
    latitude?: number;
    longitude?: number;
  } | null;
};

type TourPageProps =
  | {
      source: "supabase";
      tour: TourWithStops;
      routeCoords: [number, number][] | null;
    }
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
      routeCoords: null;
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
      <div className="-mt-12 md:-mt-20">
        <header className="overflow-hidden rounded-2xl border border-ink/10 bg-ink shadow-card md:rounded-[1.75rem]">
          <div className="relative h-[14rem] sm:h-56 md:h-[18rem] lg:h-[22rem]">
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
            <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-9 lg:p-11">
              <div className="max-w-3xl space-y-3 text-cream">
                <p className="text-[11px] uppercase tracking-[0.25em] text-cream/60">
                  Walking Tour
                </p>
                <h1 className="font-serif text-3xl leading-tight tracking-tight text-cream md:text-4xl">
                  {tour.name}
                </h1>
                <div className="flex gap-4 text-xs text-cream/55 border-t border-cream/15 pt-3">
                  {formatDuration(tour.duration_minutes) && (
                    <span>{formatDuration(tour.duration_minutes)}</span>
                  )}
                  {formatDistance(tour.distance_meters) && (
                    <span>{formatDistance(tour.distance_meters)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <p className="mt-6 mb-2 text-xs text-ink/50">
        <Link href="/plan-your-visit" className="no-underline hover:text-ink">
          ← Plan Your Visit
        </Link>
      </p>

      <article>
        {tour.description && (
          <div className="editorial-measure mt-10 md:mt-14">
            <p className="font-serif text-[1.35rem] leading-[1.38] tracking-tight text-ink md:text-[1.5rem]">
              {tour.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-[1fr_minmax(0,14rem)] gap-6 md:gap-8 mt-8 md:mt-10 items-start">
          <div>
            {hasMapbox &&
              (() => {
                const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
                if (!token) return null;

                const routeCoords =
                  props.source === "supabase" ? props.routeCoords : null;

                if (routeCoords && routeCoords.length >= 2) {
                  const geojson = JSON.stringify({
                    type: "Feature",
                    properties: {
                      stroke: "#8A5A3B",
                      "stroke-width": 3,
                      "stroke-opacity": 0.9,
                    },
                    geometry: {
                      type: "LineString",
                      coordinates: routeCoords,
                    },
                  });
                  const encoded = encodeURIComponent(geojson);
                  const overlay = `geojson(${encoded})`;
                  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${overlay}/auto/600x600@2x?padding=60,60,60,60&access_token=${token}`;

                  return (
                    <Link
                      href={`/map?trail=${tour.slug}`}
                      className="block group"
                    >
                      <div className="overflow-hidden rounded-2xl border border-ink/10 shadow-card">
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={mapUrl}
                            alt={`Trail map for ${tour.name}`}
                            className="w-full h-full object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <span className="text-[10px] uppercase tracking-[0.22em] text-cream/80 bg-ink/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                              View on map →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                }

                const stopCoords = stops
                  .map((s) =>
                    s.locations?.longitude != null &&
                    s.locations?.latitude != null
                      ? ([s.locations.longitude, s.locations.latitude] as [
                          number,
                          number,
                        ])
                      : null
                  )
                  .filter((c): c is [number, number] => c !== null);

                if (stopCoords.length < 2) return null;

                const pins = stopCoords
                  .map((c) => `pin-s+8A5A3B(${c[0]},${c[1]})`)
                  .join(",");
                const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${pins}/auto/600x600@2x?padding=60,60,60,60&access_token=${token}`;

                return (
                  <Link
                    href={`/map?trail=${tour.slug}`}
                    className="block group"
                  >
                    <div className="overflow-hidden rounded-2xl border border-ink/10 shadow-card">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={mapUrl}
                          alt={`Trail map for ${tour.name}`}
                          className="w-full h-full object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <span className="text-[10px] uppercase tracking-[0.22em] text-cream/80 bg-ink/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            View on map →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })()}
          </div>

          <aside className="space-y-5 border-t border-ink/10 pt-6 md:border-t-0 md:pt-0">
            <p className="eyebrow">Orientation</p>
            <dl className="grid gap-5 text-xs leading-relaxed">
              {formatDuration(tour.duration_minutes) && (
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
                    Duration
                  </dt>
                  <dd className="mt-1.5 font-serif text-sm text-ink/90">
                    {formatDuration(tour.duration_minutes)}
                  </dd>
                </div>
              )}
              {formatDistance(tour.distance_meters) && (
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
                    Distance
                  </dt>
                  <dd className="mt-1.5 font-serif text-sm text-ink/90">
                    {formatDistance(tour.distance_meters)}
                  </dd>
                </div>
              )}
              {stops.length > 0 && (
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
                    Stops
                  </dt>
                  <dd className="mt-1.5 font-serif text-sm text-ink/90">
                    {stops.length}
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </div>

        {stops.length > 0 && (
          <section className="mt-12 md:mt-16 border-t border-ink/10 pt-10">
            <p className="eyebrow mb-6">Places along the route</p>
            <ol className="space-y-8">
              {stops.map((stop, index) => (
                <li key={stop.stop_order} className="flex gap-5">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-ink/30 pt-1 w-6 shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-1.5 min-w-0">
                    {stop.locations ? (
                      <Link
                        href={`/places/${stop.locations.slug}`}
                        className="font-serif text-base text-ink hover:underline underline-offset-4"
                      >
                        {stop.locations.name}
                      </Link>
                    ) : null}
                    {stop.locations?.short_description && (
                      <p className="text-xs uppercase tracking-[0.15em] text-ink/45">
                        {stop.locations.short_description}
                      </p>
                    )}
                    {stop.stop_narrative && (
                      <p className="text-sm leading-[1.72] text-ink/75 mt-2">
                        {stop.stop_narrative}
                      </p>
                    )}
                    {stop.locations ? (
                      <Link
                        href={`/map?trail=${tour.slug}&location=${stop.locations.slug}`}
                        className="mt-2 inline-block text-[11px] uppercase tracking-[0.18em] text-ink/40 hover:text-ink transition-colors"
                      >
                        View on map →
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
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
    const routeCoords = await getRouteByTourSlug(slug).catch(() => null);
    return {
      props: {
        source: "supabase",
        tour,
        routeCoords: routeCoords ?? null,
      },
      revalidate: 60,
    };
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
        routeCoords: null,
      },
      revalidate: 60,
    };
  }
};

export default TourPage;
