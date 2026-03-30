import Head from "next/head";
import Link from "next/link";
import type { GetStaticProps, NextPage } from "next";
import { getAllPlaces, type Place } from "@/data/places";
import { getPublishedLocations } from "@/lib/supabase";

/** Prefer these slugs when present in published data (matches legacy static atlas). */
const PREFERRED_FEATURED_SLUGS = [
  "maison-millet",
  "auberge-ganne",
  "grande-rue",
  "forest-entrance"
] as const;

type FeaturedPlaceCard = {
  slug: string;
  name: string;
  description: string;
  image: string;
  category: string;
};

function heroImageForSlug(slug: string): string {
  const p = getAllPlaces().find((x) => x.slug === slug);
  return p?.heroImage ?? "/images/places/place-default.jpg";
}

function buildFeaturedPlaces(places: Place[]): FeaturedPlaceCard[] {
  const bySlug = new Map(places.map((p) => [p.slug, p]));
  const picked: Place[] = [];
  for (const slug of PREFERRED_FEATURED_SLUGS) {
    const p = bySlug.get(slug);
    if (p) picked.push(p);
  }
  for (const p of places) {
    if (picked.length >= 4) break;
    if (!picked.some((x) => x.slug === p.slug)) picked.push(p);
  }
  return picked.slice(0, 4).map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.shortDescription,
    image: heroImageForSlug(p.slug),
    category: p.category
  }));
}

type HomePageProps = {
  featuredPlaces: FeaturedPlaceCard[];
};

const HomePage: NextPage<HomePageProps> = ({ featuredPlaces }) => {
  return (
    <>
      <Head>
        <title>Visit Barbizon — Cultural Cartography</title>
      </Head>

      <div className="section-stack">
        {/* 1. HERO SECTION */}
        <section className="relative -mx-4 -mt-12 flex min-h-screen flex-col justify-end overflow-hidden bg-ink md:-mx-8 md:-mt-20">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/places/place-default.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          >
            <source src="/videos/hero-barbizon.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent" />

          <div className="fade-in-hero relative z-10 max-w-3xl space-y-6 p-8 md:p-14 lg:p-20">
            <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-cream/60">
              A Cultural Atlas
            </p>

            <h1 className="font-serif text-[3.2rem] italic leading-[0.95] tracking-tight text-cream md:text-[5rem] lg:text-[6rem]">
              Barbizon:
              <br />
              The Artists&apos;
              <br />
              Village
            </h1>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/map" className="btn btn-primary text-[10px]">
                Explore the Map
              </Link>
              <Link
                href="/places"
                className="btn btn-secondary border-cream/40 text-[10px] text-cream hover:border-cream/70 hover:bg-cream/10"
              >
                Discover the Village
              </Link>
            </div>
          </div>
        </section>

        {/* 2. WHY BARBIZON */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
          <div className="space-y-3">
            <p className="eyebrow">
              WHY BARBIZON
            </p>
            <h2 className="heading-xl">
              Where art history meets the forest.
            </h2>
          </div>
          <div className="editorial-measure space-y-4 text-sm leading-relaxed text-ink/80 md:text-base">
            <p>
              In the nineteenth century, painters left Paris and settled in this
              small village at the edge of the Fontainebleau forest. Working
              outdoors, they studied weather, light, and ordinary rural life,
              laying groundwork for modern landscape painting.
            </p>
            <p>
              Today Barbizon is still a place of thresholds: between studio and
              path, stone and sand, village street and forest clearing. Explore
              Barbizon traces these overlaps rather than listing attractions.
            </p>
          </div>
        </section>

        {/* 3. EXPLORE THE VILLAGE */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">
              CHOOSE YOUR PATH
            </p>
            <h2 className="heading-lg">
              Three ways into Barbizon.
            </h2>
          </header>
          <div className="grid gap-5 md:grid-cols-3 md:gap-7">
            <Link
              href="/map"
              className="group card card-hover flex flex-col justify-between p-7 md:p-8"
            >
              <div className="space-y-4">
                <span className="chip mb-3 inline-block">
                  Curated Tours
                </span>
                <h3 className="font-serif text-base text-ink md:text-lg">
                  Explore the Map
                </h3>
                <p className="text-sm leading-relaxed text-ink/75 md:text-[15px]">
                  See how studios, paths, and clearings relate to one another on
                  a layered map of the village and forest edge.
                </p>
              </div>
              <span className="mt-5 text-[11px] uppercase tracking-[0.2em] text-ink/50">
                Open map →
              </span>
            </Link>

            <Link
              href="/plan-your-visit"
              className="group card card-hover flex flex-col justify-between p-7 md:p-8"
            >
              <div className="space-y-4">
                <h3 className="font-serif text-base text-ink md:text-lg">
                  Follow a Trail
                </h3>
                <p className="text-sm leading-relaxed text-ink/75 md:text-[15px]">
                  Use gentle walking routes that connect village streets to the
                  first rock outcrops and forest paths.
                </p>
              </div>
              <span className="mt-5 text-[11px] uppercase tracking-[0.2em] text-ink/50">
                View routes →
              </span>
            </Link>

            <Link
              href="/stories"
              className="group card card-hover flex flex-col justify-between p-7 md:p-8"
            >
              <div className="space-y-4">
                <span className="chip mb-3 inline-block">
                  Village Stories
                </span>
                <h3 className="font-serif text-base text-ink md:text-lg">
                  Read the Stories
                </h3>
                <p className="text-sm leading-relaxed text-ink/75 md:text-[15px]">
                  Short essays on how artists, walkers, and residents have
                  looked at Barbizon over time.
                </p>
              </div>
              <span className="mt-5 text-[11px] uppercase tracking-[0.2em] text-ink/50">
                Open stories →
              </span>
            </Link>
          </div>
        </section>

        {/* 4. FEATURED PLACES */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">
              FEATURED ENCLAVES
            </p>
            <h2 className="heading-lg">
              Places that define the village.
            </h2>
          </header>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featuredPlaces.map((place) => (
              <Link
                key={place.slug}
                href={`/places/${place.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl"
              >
                <div
                  className="absolute inset-0 bg-ink/40 bg-cover bg-center transition-transform duration-700 ease-soft group-hover:scale-105"
                  style={{ backgroundImage: `url(${place.image})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-surface-variant/60 p-5 backdrop-blur-sm">
                  <p className="mb-1 font-sans text-[9px] uppercase tracking-[0.25em] text-cream/60">
                    {place.category}
                  </p>
                  <h3 className="font-serif text-base italic leading-tight text-cream">
                    {place.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-cream/70">
                    {place.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. MAP PREVIEW */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">
              MAP PREVIEW
            </p>
            <h2 className="heading-lg">
              A quiet cartography in progress.
            </h2>
          </header>
          <Link href="/map" className="btn btn-secondary text-[11px]">
            Open the Interactive Map
          </Link>
        </section>

        {/* 6. BARBIZON THROUGH TIME */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">
              BARBIZON THROUGH TIME
            </p>
            <h2 className="heading-lg">
              Postcards, archives, and quiet documents.
            </h2>
          </header>
          <div className="editorial-measure space-y-4 text-sm leading-relaxed text-ink/80 md:text-base">
            <p>
              Alongside contemporary photographs and maps, Visit Barbizon will
              draw on historical postcards, guidebooks, and archival images. The
              village has been looked at and described for over a century; this
              project gathers some of those ways of seeing.
            </p>
          </div>
        </section>

        {/* 7. VISITOR INFO */}
        <section className="space-y-8">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">
              VISITOR INFO
            </p>
            <h2 className="heading-lg">
              Practical notes for a calm visit.
            </h2>
          </header>
          <div className="grid gap-6 text-sm text-ink/80 md:grid-cols-3">
            <div className="card space-y-3 p-6">
              <h3 className="font-serif text-[13px] uppercase tracking-[0.18em] text-ink/70">
                Where to park
              </h3>
              <p className="leading-relaxed">
                Public parking sits just off the Grande Rue and near the forest
                entrance. From there, most of the village is reachable on foot
                within a few minutes.
              </p>
            </div>
            <div className="card space-y-3 p-6">
              <h3 className="font-serif text-[13px] uppercase tracking-[0.18em] text-ink/70">
                Where to start
              </h3>
              <p className="leading-relaxed">
                Begin with a slow walk along the Grande Rue, then visit one
                small museum or studio before turning toward the forest paths.
              </p>
            </div>
            <div className="card space-y-3 p-6">
              <h3 className="font-serif text-[13px] uppercase tracking-[0.18em] text-ink/70">
                Best time to visit
              </h3>
              <p className="leading-relaxed">
                Early mornings and late afternoons offer softer light and
                quieter paths, especially outside high summer weekends.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  try {
    const places = await getPublishedLocations();
    return {
      props: { featuredPlaces: buildFeaturedPlaces(places) },
      revalidate: 60
    };
  } catch {
    const places = getAllPlaces();
    return {
      props: { featuredPlaces: buildFeaturedPlaces(places) },
      revalidate: 60
    };
  }
};

export default HomePage;

