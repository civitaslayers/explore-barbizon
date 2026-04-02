import Head from "next/head";
import type { NextPage } from "next";
import HistoryTimeline from "@/components/HistoryTimeline";

const ARTISTS = [
  {
    name: "Jean-François Millet",
    dates: "1814–1875",
    note: "Settled in Barbizon in 1849. Stayed until his death."
  },
  {
    name: "Théodore Rousseau",
    dates: "1812–1867",
    note: "Moved permanently in 1848. De facto leader of the school."
  },
  {
    name: "Camille Corot",
    dates: "1796–1875",
    note: "Made early excursions from Paris in the 1820s."
  },
  {
    name: "Charles-François Daubigny",
    dates: "1817–1878",
    note: "Known for his river landscapes near the forest."
  }
] as const;

const HistoryPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>History — Visit Barbizon</title>
      </Head>

      <div className="section-stack">
        <header className="space-y-4 editorial-measure">
          <p className="eyebrow">BARBIZON THROUGH TIME</p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            A village, a forest, and two centuries of looking.
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base">
            Alongside contemporary photographs and maps, Visit Barbizon draws on
            historical postcards, guidebooks, and archival images. The village
            has been looked at and described for over a century. This page
            gathers some of those ways of seeing — and traces the events that
            shaped what there is to see.
          </p>
        </header>

        <section className="space-y-6">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">TIMELINE</p>
            <h2 className="heading-lg">Key moments, 1810–today.</h2>
          </header>
          <HistoryTimeline />
        </section>

        <section className="space-y-6">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">POSTCARDS &amp; PHOTOGRAPHS</p>
            <h2 className="heading-lg">How the village looked at itself.</h2>
          </header>
          <div className="rounded border border-ink/10 p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-ink/40">
              COMING SOON
            </p>
            <p className="mt-2 text-sm text-ink/60">
              Historical postcards, early guidebook illustrations, and archival
              photographs will appear here.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">THE PAINTERS</p>
            <h2 className="heading-lg">The people who came to look.</h2>
          </header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ARTISTS.map((artist) => (
              <div
                key={artist.name}
                className="space-y-1 border border-ink/10 p-5"
              >
                <p className="font-serif text-base text-ink">{artist.name}</p>
                <p className="text-xs text-ink/50">{artist.dates}</p>
                <p className="text-sm text-ink/70">{artist.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">SOURCES &amp; PROVENANCE</p>
            <h2 className="heading-lg">Where this comes from.</h2>
          </header>
          <div className="editorial-measure space-y-4 text-sm leading-relaxed text-ink/80 md:text-base">
            <p>
              Historical content on this platform is researched against
              institutional primary sources: Base Mérimée / POP, the Archives
              de Seine-et-Marne, Gallica / BnF, and the Musée des Peintres de
              Barbizon. Local archival research (grappilles.fr)
              informs many narratives and is credited as a valued research
              contribution.
            </p>
            <p>
              Factual integrity is a core principle of this project. Dates,
              names, and locations are only published when confirmed against at
              least one institutional source. Geographic attributions for
              historical works are marked with an explicit confidence level.
            </p>
            <p>
              <a
                href="https://www.grappilles.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink/60 underline-offset-4 hover:underline"
              >
                Visit grappilles.fr →
              </a>
            </p>
            <p>
              Local village knowledge is further informed by{" "}
              <a
                href="https://barbizonvillagedespeintres.wordpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink/60 underline-offset-4 hover:underline"
              >
                Barbizon, le Guide →
              </a>
              , a blog by Jean-Michel Mahenc, former president of the Barbizon
              Tourism Office, covering village life, restaurants, boutiques and
              trails. Like grappilles.fr, it is treated as Tier 3 research —
              orientation and leads only; anything we publish is checked against
              institutional sources above.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default HistoryPage;
