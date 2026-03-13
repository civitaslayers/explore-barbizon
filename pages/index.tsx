import Head from "next/head";
import Link from "next/link";
import { type NextPage } from "next";

const featuredPlaces = [
  {
    name: "Maison Millet",
    description: "The former home of Jean‑François Millet, now a quiet landmark on the village street.",
    image: "/images/maison-millet.jpg"
  },
  {
    name: "Auberge Ganne",
    description: "An inn turned museum, where walls once held sketches and evening conversations.",
    image: "/images/auberge-ganne.jpg"
  },
  {
    name: "Grande Rue",
    description: "The main street as a long, slow axis between stone houses and forest air.",
    image: "/images/grande-rue.jpg"
  },
  {
    name: "Forest Entrance",
    description: "Where village paving gives way to sand paths, rock, and filtered light.",
    image: "/images/forest-entrance.jpg"
  }
];

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Explore Barbizon — Cultural Cartography</title>
      </Head>

      <div className="section-stack">
        {/* 1. HERO SECTION */}
        <section className="relative -mx-4 flex min-h-[78vh] items-center overflow-hidden rounded-[2.25rem] bg-ink px-4 py-14 md:-mx-8 md:px-10 md:py-20">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-barbizon.jpg"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-85 mix-blend-multiply"
          >
            <source src="/videos/hero-barbizon.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/60 to-ink/25" />

          <div className="fade-in-hero relative z-10 max-w-xl space-y-7 text-cream md:max-w-2xl">
            <p className="eyebrow text-cream/70">
              VILLAGE AT THE EDGE OF FONTAINEBLEAU
            </p>
            <h1 className="heading-xl text-cream">
              Explore Barbizon
            </h1>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/map"
                className="btn btn-primary"
              >
                Explore the Map
              </Link>
              <Link
                href="/places"
                className="btn btn-secondary border-cream/70 text-cream/90 hover:bg-cream/10"
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
              EXPLORE THE VILLAGE
            </p>
            <h2 className="heading-lg">
              Three ways to begin.
            </h2>
          </header>
          <div className="grid gap-5 md:grid-cols-3 md:gap-7">
            <Link
              href="/map"
              className="group card card-hover flex flex-col justify-between p-7 md:p-8"
            >
              <div className="space-y-4">
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
              FEATURED PLACES
            </p>
            <h2 className="heading-lg">
              First coordinates to pin.
            </h2>
          </header>

          <div className="grid gap-6 md:grid-cols-4">
            {featuredPlaces.map((place) => (
              <article
                key={place.name}
                className="group card card-hover flex flex-col overflow-hidden"
              >
                <div
                  className="h-32 bg-ink/40 bg-cover bg-center transition-transform duration-500 ease-soft sm:h-40 group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url(${place.image})` }}
                />
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <h3 className="font-serif text-sm text-ink md:text-base">
                    {place.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink/75 md:text-[13px]">
                    {place.description}
                  </p>
                </div>
              </article>
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
              Alongside contemporary photographs and maps, Explore Barbizon will
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

export default HomePage;

