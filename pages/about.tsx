import Head from "next/head";
import type { NextPage } from "next";

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About — Explore Barbizon</title>
      </Head>
      <section className="space-y-8">
        <header className="editorial-measure space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            ABOUT THIS PROJECT
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            A quiet atlas for a small village.
          </h1>
        </header>

        <div className="editorial-measure space-y-4 text-sm leading-relaxed text-ink/80 md:text-base">
          <p>
            Explore Barbizon is a slow, editorial guide to a village on the edge
            of the Fontainebleau forest. It treats Barbizon less as a list of
            attractions and more as a field of relationships: studios and paths,
            weather and stone, rooms and routes.
          </p>
          <p>
            The project is built as a cultural cartography rather than a
            checklist. Places are selected for the ways they frame light and
            movement; stories trace how artists and visitors have read this
            landscape over time.
          </p>
          <p>
            Explore Barbizon is powered by Civitas Layers, a platform for
            layered, place‑based narratives.
          </p>
        </div>
      </section>
    </>
  );
};

export default AboutPage;

