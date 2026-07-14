import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { SeoHead } from "@/components/SeoHead";
import {
  getTourBySlugFromSupabase,
  getPublishedTourSlugs,
  getRouteByTourSlug,
  type TourWithStops,
} from "@/lib/supabase";
import { hasMapbox } from "@/lib/mapbox";
import nextI18NextConfig from "@/next-i18next.config";

type TourPageProps = {
  tour: TourWithStops;
  routeCoords: [number, number][] | null;
} & SSRConfig;

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

const TourPage: NextPage<TourPageProps> = ({ tour, routeCoords }) => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const stops = tour.stops;

  return (
    <>
      <SeoHead
        title={`${tour.name} — Explore Barbizon`}
        description={tour.description ?? `${tour.name} — a walking tour of Barbizon.`}
        path={`/tours/${tour.slug}`}
        locale={locale}
      />
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
  const slugs = await getPublishedTourSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<TourPageProps> = async ({
  params,
  locale,
}) => {
  const slug = params?.slug;
  if (typeof slug !== "string") return { notFound: true };

  const tour = await getTourBySlugFromSupabase(slug);
  if (!tour) return { notFound: true };
  const routeCoords = await getRouteByTourSlug(slug).catch(() => null);
  const translations = await serverSideTranslations(locale ?? "fr", ["common"], nextI18NextConfig);
  return {
    props: {
      tour,
      routeCoords: routeCoords ?? null,
      ...translations,
    },
    revalidate: 60,
  };
};

export default TourPage;
