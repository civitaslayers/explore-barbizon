import Head from "next/head";
import Image from "next/image";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { getAllPlaces, type Place } from "@/data/places";
import {
  getLocationBySlug,
  getPublishedLocations,
  getPublishedSlugs
} from "@/lib/supabase";
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
  const pageTitle = `${place.name} — Visit Barbizon`;
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
      <article className="space-y-14 md:space-y-20 lg:space-y-24 xl:space-y-28">
        <p className="text-xs text-ink/50">
          <Link href="/places" className="no-underline hover:text-ink">
            ← Places
          </Link>
        </p>

        {/* Hero: atlas plate, calm framing */}
        <header className="overflow-hidden rounded-2xl border border-ink/10 bg-ink shadow-card md:rounded-[1.75rem]">
          <div className="relative h-[17rem] sm:h-72 md:h-[22rem] lg:h-[26rem] xl:h-[30rem]">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-[0.78]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30">
              <div className="fade-in-hero relative z-10 flex h-full flex-col justify-end p-6 md:p-9 lg:p-11 xl:p-14">
                <div className="max-w-3xl space-y-4 text-cream xl:max-w-[40rem]">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-cream/15 pb-4">
                    <p className="eyebrow text-cream/60">{place.category}</p>
                    <span className="hidden text-cream/25 sm:inline" aria-hidden>
                      ·
                    </span>
                    <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-cream/65">
                      {place.location}
                    </p>
                  </div>
                  <h1
                    className="heading-xl text-cream"
                    style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
                  >
                    {place.name}
                  </h1>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
          </div>
        </header>

        <section className="grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,19.5rem)] md:items-start md:gap-12 lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] xl:gap-20">
          <div className="space-y-14 md:space-y-16 lg:space-y-20">
            <section className="editorial-measure space-y-8">
              <p className="font-serif text-[1.35rem] leading-[1.38] tracking-tight text-ink md:text-[1.5rem] md:leading-[1.36] lg:text-[1.65rem]">
                {place.shortDescription}
              </p>

              <div className="space-y-4">
                <p className="eyebrow">Description</p>
                <div className="space-y-5 text-sm leading-[1.72] text-ink/88 md:text-base md:leading-[1.75] xl:text-[1.0625rem] xl:leading-[1.72]">
                  <p>{place.description}</p>
                </div>
              </div>
            </section>

            <section className="editorial-measure space-y-5 border-t border-ink/10 pt-12 md:pt-14 lg:pt-16">
              <p className="eyebrow">Historical context</p>
              <blockquote className="border-l-[3px] border-ink/15 pl-5 md:pl-7">
                <p className="text-sm leading-[1.72] text-ink/78 md:text-base md:leading-[1.75] xl:text-[1.0625rem] xl:leading-[1.72]">
                  {place.history ??
                    "This location is part of the wider field of Barbizon, where artists, walkers, and residents have long negotiated the boundary between village and forest. In time, this section will gather archival notes, excerpts from letters, and early guidebook descriptions that fix this place in a particular light."}
                </p>
              </blockquote>
              {place.history && <p className="mt-4 text-[11px] text-ink/40">Historical research: <a href="https://www.grappilles.fr" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink/60">grappilles.fr</a> — Barbizon Histoire et Patrimoine</p>}
            </section>
          </div>

          <aside className="space-y-8 md:pt-1">
            <div className="space-y-5 border-t border-ink/10 pt-6 md:border-t-0 md:pt-0">
              <p className="eyebrow">Orientation</p>
              <dl className="grid gap-5 text-xs leading-relaxed">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
                    Category
                  </dt>
                  <dd className="mt-1.5 font-serif text-sm text-ink/90">
                    {place.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
                    Location
                  </dt>
                  <dd className="mt-1.5 text-ink/80">{place.location}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/40">
                    Coordinates
                  </dt>
                  <dd className="mt-1.5 font-mono text-[11px] text-ink/75 tabular-nums">
                    {place.latitude.toFixed(3)}, {place.longitude.toFixed(3)}
                  </dd>
                </div>
              </dl>
              <p className="text-[11px] leading-relaxed text-ink/50">
                One index point in the Barbizon atlas—selected for clarity on
                the ground and in the archive.
              </p>
            </div>

            <section className="space-y-4 border-t border-ink/10 pt-8">
              <p className="eyebrow">On the map</p>
              <div className="relative h-40 overflow-hidden rounded-xl bg-ink/[0.03] ring-1 ring-ink/8 md:h-48 xl:h-52">
                {hasMapbox ? (
                  <Image
                    src={staticMapUrl(
                      place.longitude,
                      place.latitude,
                      640,
                      420,
                      15
                    )}
                    alt={`Map showing location of ${place.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_#f5f1e8,_#e8e2d6)] text-[11px] text-ink/55">
                    Map preview unavailable
                  </div>
                )}
              </div>
              <p className="text-xs text-ink/60">
                <Link href="/map" className="underline-offset-4 hover:underline">
                  Open the full map
                </Link>
              </p>
            </section>
          </aside>
        </section>

        {/* Related + nearby (discovery) */}
        {(relatedPlaces.length > 0 || nearbyPlaces.length > 0) && (
          <div className="space-y-16 border-t border-ink/10 pt-14 md:space-y-20 md:pt-16 lg:space-y-24 lg:pt-20 xl:pt-24">
            {relatedPlaces.length > 0 && (
              <section className="space-y-8 md:space-y-10">
                <header className="editorial-measure max-w-2xl space-y-3">
                  <p className="eyebrow">Related places</p>
                  <h2 className="heading-lg text-ink/95">
                    Additional locations in the{" "}
                    <span className="text-ink">{place.category}</span> group.
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
              <section className="space-y-8 md:space-y-10">
                <header className="editorial-measure max-w-2xl space-y-3">
                  <p className="eyebrow">Nearby</p>
                  <h2 className="heading-lg text-ink/95">
                    Within reach on foot—village lanes and forest edge.
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
    const place = await getLocationBySlug(slug);
    if (!place) return { notFound: true };

    const allPlaces = await getPublishedLocations();

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

