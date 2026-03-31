"use client";

import { useMemo, useState, type ReactNode } from "react";

type TimelineTag = "art" | "forest" | "village" | "legacy";

type TimelineEvent = {
  date: string;
  tag: TimelineTag;
  headline: string;
  detail: ReactNode;
};

const events: TimelineEvent[] = [
  {
    date: "1810s",
    tag: "forest",
    headline: "Fontainebleau forest mapped and opened for walkers.",
    detail:
      "Royal hunting ground for centuries, the Fontainebleau forest gradually opened to civilian visitors. Its sandstone formations, ancient oaks, and shifting light attracted early Romantic painters seeking an alternative to classical Italian landscape."
  },
  {
    date: "1822",
    tag: "art",
    headline: "First painters arrive from Paris, drawn by the light.",
    detail:
      "Camille Corot and contemporaries made early excursions to paint in the Fontainebleau region. The village of Barbizon, with its simple inn and proximity to the forest edge, proved a practical base. The practice of painting directly outdoors — en plein air — began in earnest."
  },
  {
    date: "1830s",
    tag: "village",
    headline: "Père Ganne opens his inn to painters on credit.",
    detail: (
      <>
        François Ganne, a Barbizon grocer, began accepting paintings as payment
        for room and board. The Auberge Ganne became the social centre of what
        would become the Barbizon School — a loose community of artists sharing
        meals, arguments, and sketches on the inn's walls.{" "}
        <a
          href="/stories/inn-paintings-dinner"
          className="underline underline-offset-4 hover:text-ink transition-colors"
        >
          Read the essay →
        </a>
      </>
    )
  },
  {
    date: "1848",
    tag: "art",
    headline: "Théodore Rousseau settles permanently in Barbizon.",
    detail:
      "After years of Salon rejection, Théodore Rousseau moved to Barbizon full time. His precise, tender studies of specific trees and clearings helped define the school's approach: the landscape as subject in itself, not backdrop."
  },
  {
    date: "1849",
    tag: "art",
    headline: "Jean-François Millet arrives with his family, stays 26 years.",
    detail: (
      <>
        Millet arrived after the cholera epidemic in Paris. His house on the
        Grande Rue became his studio for the rest of his life. Here he produced
        The Gleaners, The Angelus, and The Sower.{" "}
        <a
          href="/stories/rooms-of-light"
          className="underline underline-offset-4 hover:text-ink transition-colors"
        >
          Read the essay →
        </a>
      </>
    )
  },
  {
    date: "1853",
    tag: "forest",
    headline: "Denecourt carves the first marked paths through the forest.",
    detail: (
      <>
        Claude-François Denecourt, the &apos;hermit of Fontainebleau,&apos;
        hand-carved hundreds of kilometres of marked trails. His guidebooks
        mapped the forest for visitors and artists alike. Many of today&apos;s
        walking routes still follow his original paths.{" "}
        <a
          href="/stories/paths-to-the-forest"
          className="underline underline-offset-4 hover:text-ink transition-colors"
        >
          Read the essay →
        </a>
      </>
    )
  },
  {
    date: "1867",
    tag: "art",
    headline: "Barbizon painters receive recognition at the Paris Exposition.",
    detail:
      "After decades of mixed Salon reception, the Barbizon School was officially celebrated at the Exposition Universelle. International collectors began acquiring the work in large quantities."
  },
  {
    date: "1875",
    tag: "art",
    headline: "Death of Millet. Barbizon becomes a site of pilgrimage.",
    detail:
      "With Millet's death and Rousseau's a few years earlier, the founding generation passed. Yet interest in Barbizon intensified — a new kind of cultural tourism took root."
  },
  {
    date: "1879",
    tag: "forest",
    headline: "Fontainebleau becomes France's first protected natural reserve.",
    detail:
      "Following a campaign by Rousseau, Millet, and other painters, the French state designated protected zones within Fontainebleau. It is among Europe's earliest formal conservation decisions."
  },
  {
    date: "1890s",
    tag: "village",
    headline: "The Grande Rue fills with studios, galleries, and visitors.",
    detail:
      "Barbizon transformed from a working peasant village into a destination. Studios multiplied, postcards circulated, and guidebooks described the walk from the inn to Millet's house."
  },
  {
    date: "1945",
    tag: "legacy",
    headline: "Post-war recognition of Barbizon's influence on Impressionism.",
    detail:
      "Historians drew the direct line: Monet, Pissarro, and Renoir worked in the shadow of what Rousseau, Millet, and Corot established at Barbizon. The practice of painting light outdoors — Barbizon planted that seed."
  },
  {
    date: "1980s",
    tag: "legacy",
    headline: "Auberge Ganne restored and reopened as the Musée des Peintres.",
    detail:
      "The inn where painters once paid in sketches was carefully restored. The painted walls — still visible beneath layers of time — were preserved behind glass."
  },
  {
    date: "Today",
    tag: "legacy",
    headline: "The village endures — same scale, same street, same forest edge.",
    detail:
      "Barbizon remains a single street between open farmland and ancient forest. The proportions that drew painters here — the light, the threshold quality, the closeness of the wild — are largely intact."
  }
];

type FilterKey = "all" | TimelineTag;

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "art", label: "Art & painters" },
  { key: "forest", label: "Forest & nature" },
  { key: "village", label: "Village life" },
  { key: "legacy", label: "Legacy" }
];

function tagPillClasses(tag: TimelineTag): string {
  switch (tag) {
    case "art":
      return "bg-moss/10 text-moss";
    case "forest":
      return "bg-moss/20 text-moss";
    case "village":
      return "bg-umber/15 text-umber";
    case "legacy":
      return "bg-ink/[0.08] text-ink/60";
  }
}

function eventKey(e: TimelineEvent): string {
  return `${e.date}\u0000${e.headline}`;
}

export default function HistoryTimeline() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.tag === filter);
  }, [filter]);

  return (
    <div className="relative">
      <div
        className="mb-8 flex flex-wrap gap-2"
        role="toolbar"
        aria-label="Filter timeline"
      >
        {filters.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={
                active
                  ? "rounded-full bg-ink px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-cream"
                  : "rounded-full border border-ink/20 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink/60 transition-colors hover:text-ink"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div
          className="absolute left-[90px] top-0 bottom-0 w-px bg-ink/10"
          aria-hidden
        />

        <ul className="relative m-0 list-none p-0">
          {filtered.map((event) => {
            const key = eventKey(event);
            const isOpen = openKey === key;
            return (
              <li key={key} className="m-0 p-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenKey((prev) => (prev === key ? null : key))
                  }
                  className="group flex w-full cursor-pointer border-0 bg-transparent p-0 text-left"
                >
                  <div className="w-[90px] shrink-0 pt-0.5 text-right">
                    <span className="text-[13px] font-medium tabular-nums text-ink/60">
                      {event.date}
                    </span>
                  </div>
                  <div className="relative flex w-5 shrink-0 justify-center pt-1.5">
                    <span
                      className={`z-[1] h-2 w-2 shrink-0 rounded-full border border-ink transition-colors duration-200 ${
                        isOpen ? "bg-ink" : "bg-cream group-hover:bg-ink/20"
                      }`}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1 pb-10 pl-1 pr-0 md:pl-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] ${tagPillClasses(event.tag)}`}
                    >
                      {event.tag}
                    </span>
                    <p className="mt-2 font-serif text-base text-ink">
                      {event.headline}
                    </p>
                    <div
                      className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
                        isOpen ? "max-h-[28rem]" : "max-h-0"
                      }`}
                    >
                      <div className="mt-3 text-sm leading-relaxed text-ink/70">
                        {event.detail}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
