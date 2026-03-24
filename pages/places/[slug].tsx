import Head from "next/head";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { getAllPlaces, type Place } from "@/data/places";
import { getPublishedLocations, getPublishedSlugs } from "@/lib/supabase";
import { staticMapUrl, hasMapbox } from "@/lib/mapbox";

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c =
    sinLat * sinLat +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

/** Mapbox Static when available; otherwise hero image (absolute URL if NEXT_PUBLIC_SITE_URL is set). */
function openGraphImageUrl(
  place: Place,
  heroImage: string,
  mapboxAvailable: boolean,
  siteBase: string
): string {
  if (mapboxAvailable) {
    return staticMapUrl(place.longitude, place.latitude, 1200, 630, 15);
  }
  if (heroImage.startsWith("http")) return heroImage;
  return siteBase ? `${siteBase}${heroImage.startsWith("/") ? heroImage : `/${heroImage}`}` : heroImage;
}

type PlacePageProps = {
  place: Place;
  relatedPlaces: Place[];
  nearbyPlaces: Place[];
};

const PlacePage: NextPage<PlacePageProps> = ({
  place,
  relatedPlaces,
  nearbyPlaces
}) => {
  const heroImage =
    place.heroImage ?? "/images/places/place-default.jpg";

  const siteBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const pageTitle = `${place.name} — Explore Barbizon`;
  const metaDescription = place.shortDescription;
  const ogImageUrl = openGraphImageUrl(place, heroImage, hasMapbox, siteBase);
  const ogUrl = siteBase ? `${siteBase}/places/${place.slug}` : "";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:type" content="website" />
        {ogUrl ? <meta property="og:url" content={ogUrl} /> : null}
      </Head>
      <article className="space-y-12 md:space-y-16 xl:space-y-20">
        {/* Hero image and title */}
        <section className="overflow-hidden rounded-3xl bg-ink shadow-[0_24px_48px_-12px_rgba(17,17,17,0.18)] ring-1 ring-ink/10">
          <div className="relative h-64 md:h-80 lg:h-96 xl:h-[26rem]">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.82] mix-blend-multiply"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/55 to-ink/25" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
            <div className="fade-in-hero relative z-10 flex h-full items-end p-6 md:p-9 lg:p-10 xl:p-12">
              <div className="max-w-xl space-y-3 text-cream md:max-w-2xl xl:max-w-3xl">
                <p className="eyebrow text-cream/70">
                  {place.category}
                </p>
                <h1 className="heading-xl text-cream">
                  {place.name}
                </h1>
                <p className="text-[11px] uppercase tracking-[0.22em] text-cream/75">
                  {place.location}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About + Map layout */}
        <section className="grid gap-12 md:grid-cols-[minmax(0,2.3fr)_minmax(0,2fr)] md:items-start md:gap-10 xl:gap-16">
          {/* About this place & Historical context */}
          <div className="space-y-12 md:space-y-14">
            <section className="editorial-measure space-y-5">
              <p className="eyebrow">ABOUT THIS PLACE</p>
              <h2 className="heading-lg">{place.shortDescription}</h2>
              <div className="space-y-4 text-sm leading-relaxed text-ink/85 md:text-base md:leading-relaxed xl:text-[1.0625rem] xl:leading-[1.65]">
                <p>{place.description}</p>
              </div>
            </section>

            <section className="editorial-measure space-y-4 border-t border-ink/10 pt-10 md:pt-12">
              <p className="eyebrow">HISTORICAL CONTEXT</p>
              <div className="space-y-4 text-sm leading-relaxed text-ink/80 md:text-base xl:text-[1.0625rem] xl:leading-[1.65]">
                <p>
                  {place.history ??
                    "This location is part of the wider field of Barbizon, where artists, walkers, and residents have long negotiated the boundary between village and forest. In time, this section will gather archival notes, excerpts from letters, and early guidebook descriptions that fix this place in a particular light."}
                </p>
              </div>
            </section>
          </div>

          {/* Map preview and meta */}
          <aside className="space-y-6">
            <section className="card space-y-4 p-5 md:p-6">
              <p className="eyebrow">MAP PREVIEW</p>
              <div className="relative h-44 overflow-hidden rounded-2xl bg-ink/[0.04] ring-1 ring-ink/10 md:h-52 xl:h-56">
                {hasMapbox ? (
                  <img
                    src={staticMapUrl(place.longitude, place.latitude, 600, 400, 15)}
                    alt={`Map showing location of ${place.name}`}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-ink/25 bg-[radial-gradient(circle_at_top,_#f5f1e8,_#d6d0c3)] text-[11px] text-ink/60">
                    Map unavailable
                  </div>
                )}
              </div>
              <div className="space-y-1 text-xs text-ink/70">
                <div>
                  Coordinates:{" "}
                  <span className="font-mono">
                    {place.latitude.toFixed(3)}, {place.longitude.toFixed(3)}
                  </span>
                </div>
                <div>
                  View on{" "}
                  <Link
                    href="/map"
                    className="underline-offset-4 hover:underline"
                  >
                    Explore Map
                  </Link>
                  .
                </div>
              </div>
            </section>

            <section className="space-y-2 text-xs text-ink/70">
              <p>Category: {place.category}</p>
              <p>Positioned within the Explore Barbizon atlas as one of a small number of carefully selected coordinates.</p>
            </section>
          </aside>
        </section>

        {/* Related + nearby (discovery) */}
        {(relatedPlaces.length > 0 || nearbyPlaces.length > 0) && (
          <div className="space-y-14 border-t border-ink/10 pt-12 md:space-y-16 md:pt-16 xl:space-y-20 xl:pt-20">
            {relatedPlaces.length > 0 && (
              <section className="space-y-7 md:space-y-8">
                <header className="editorial-measure space-y-2">
                  <p className="eyebrow">RELATED PLACES</p>
                  <h2 className="heading-lg">
                    Other {place.category.toLowerCase()}s in the atlas.
                  </h2>
                </header>
                <div className="grid gap-5 sm:gap-6 md:grid-cols-3 xl:gap-8">
                  {relatedPlaces.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/places/${related.slug}`}
                      className="card card-hover flex flex-col justify-between p-5 md:p-6"
                    >
                      <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50">
                        {related.category}
                      </p>
                      <h3 className="mt-1 font-serif text-base text-ink">
                        {related.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-ink/75 md:text-[13px]">
                        {related.shortDescription}
                      </p>
                      <span className="mt-4 text-[11px] uppercase tracking-[0.2em] text-ink/45">
                        View place →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {nearbyPlaces.length > 0 && (
              <section className="space-y-7 md:space-y-8">
                <header className="editorial-measure space-y-2">
                  <p className="eyebrow">NEARBY LOCATIONS</p>
                  <h2 className="heading-lg">
                    Places within walking distance in the village and forest.
                  </h2>
                </header>
                <div className="grid gap-5 text-sm text-ink/80 sm:gap-6 md:grid-cols-3 xl:gap-8">
                  {nearbyPlaces.map((nearby) => (
                    <Link
                      key={nearby.slug}
                      href={`/places/${nearby.slug}`}
                      className="group card card-hover space-y-1.5 p-5 md:p-6"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
                          {nearby.category}
                        </p>
                        <p className="text-[11px] text-ink/35">
                          {Math.round(haversineKm(place, nearby) * 1000)}&thinsp;m
                        </p>
                      </div>
                      <p className="font-serif text-sm text-ink group-hover:underline group-hover:underline-offset-4">
                        {nearby.name}
                      </p>
                      <p className="text-xs leading-relaxed text-ink/70">
                        {nearby.shortDescription}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="text-xs text-ink/60">
          <Link href="/places" className="underline-offset-4 hover:underline">
            ← Back to all places
          </Link>
        </div>
      </article>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const slugs = await getPublishedSlugs();
    const paths = slugs.map((slug) => ({ params: { slug } }));
    // blocking: new Supabase slugs get generated on first request
    return { paths, fallback: "blocking" };
  } catch {
    // Supabase unavailable — pre-render only the known static slugs
    const paths = getAllPlaces().map((p) => ({ params: { slug: p.slug } }));
    return { paths, fallback: false };
  }
};

export const getStaticProps: GetStaticProps<PlacePageProps> = async ({
  params
}) => {
  const slug = params?.slug;
  if (typeof slug !== "string") {
    return { notFound: true };
  }

  try {
    // Fetch all published locations once; derive related + nearby from the set
    const allPlaces = await getPublishedLocations();
    const place = allPlaces.find((p) => p.slug === slug);

    if (!place) return { notFound: true };

    const relatedPlaces = allPlaces
      .filter((p) => p.slug !== slug && p.category === place.category)
      .slice(0, 3);

    const nearbyPlaces = allPlaces
      .filter((p) => p.slug !== slug && p.category !== place.category)
      .sort((a, b) => haversineKm(place, a) - haversineKm(place, b))
      .slice(0, 3);

    return { props: { place, relatedPlaces, nearbyPlaces }, revalidate: 60 };
  } catch {
    // Supabase unavailable — fall back to static data
    const allPlaces = getAllPlaces();
    const place = allPlaces.find((p) => p.slug === slug);

    if (!place) return { notFound: true };

    const relatedPlaces = allPlaces
      .filter((p) => p.slug !== slug && p.category === place.category)
      .slice(0, 3);

    const nearbyPlaces = allPlaces
      .filter((p) => p.slug !== slug && p.category !== place.category)
      .sort((a, b) => haversineKm(place, a) - haversineKm(place, b))
      .slice(0, 3);

    return { props: { place, relatedPlaces, nearbyPlaces }, revalidate: 60 };
  }
};

export default PlacePage;

