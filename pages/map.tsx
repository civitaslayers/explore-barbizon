import Head from "next/head";
import type { NextPage } from "next";

const categories = [
  "Art & History",
  "Places to Eat",
  "Forest & Nature",
  "Practical Information"
] as const;

const MapPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Explore Map — Explore Barbizon</title>
      </Head>

      <section className="space-y-8 md:space-y-10">
        <header className="editorial-measure space-y-3">
          <p className="eyebrow">CARTOGRAPHY IN PROGRESS</p>
          <h1 className="heading-lg">
            A working map of studios, paths, and quiet coordinates.
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base">
            This page will host the Mapbox map for Explore Barbizon. For now,
            it sketches the layout: a left panel to tune what you see, and a
            full‑width map to wander slowly.
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl border border-ink/10 bg-cream/85 shadow-card">
          <div className="grid h-[520px] gap-px md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:h-[560px] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
            {/* Left side panel */}
            <aside className="flex flex-col gap-6 bg-cream/98 p-5 md:p-6 lg:p-7">
              <div className="space-y-3">
                <p className="eyebrow">SEARCH THE ATLAS</p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a place, trail, or studio"
                    className="w-full rounded-full border border-ink/15 bg-cream/60 px-4 py-2.5 text-xs text-ink placeholder:text-ink/40 shadow-inner-sm focus:border-ink/40 focus:bg-cream focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="eyebrow">FILTER BY CATEGORY</p>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className="rounded-full border border-ink/15 bg-transparent px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-ink/70 transition-all duration-250 ease-soft hover:border-ink/60 hover:bg-ink/4"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto space-y-2 text-[11px] leading-relaxed text-ink/60">
                <p>
                  Pins and layers will be added here with Mapbox, showing
                  studios, paths, and small places to pause rather than a dense
                  field of markers.
                </p>
                <p>
                  The map is designed for unhurried looking: fewer icons, more
                  attention to how the village meets the forest.
                </p>
              </div>
            </aside>

            {/* Map placeholder */}
            <div className="relative h-full bg-[radial-gradient(circle_at_top,_#f5f1e8,_#d4cec0)]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(17,17,17,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
              <div className="absolute inset-6 flex items-center justify-center rounded-3xl border border-dashed border-ink/20 bg-cream/45 px-8 text-center text-xs leading-relaxed text-ink/60 md:inset-8 md:text-sm">
                Mapbox-powered interactive map will sit here. Zoom and pan to
                move between studios, paths, village corners, and forest
                entrances.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MapPage;

