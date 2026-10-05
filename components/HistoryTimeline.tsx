"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next/pages";

type TimelineTag = "art" | "forest" | "village" | "legacy";

type EssayLink = {
  href: string;
  labelKey: string;
  // "pages" entries resolve via the pages.json event object itself (the
  // label text already carries a trailing "→", unlike the shared
  // common.json "actions.readEssay" label, which the renderer suffixes
  // with " →" below). Default (omitted) is "common".
  labelSource?: "pages";
};

type TimelineEvent = {
  dateKey: string;
  tag: TimelineTag;
  headlineKey: string;
  detailKey: string;
  essayLinks: EssayLink[];
};

// Display copy (date/headline/detail) lives in pages.json
// (`history.timeline.events.<id>.*`) — this list only carries the stable
// ids, tags, and essay-link targets. `tag` values are code identifiers;
// their display labels come from common.json (`timeline.tags.*`,
// `timeline.filters.*`), untouched by this list.
const events: TimelineEvent[] = [
  {
    dateKey: "corot1822",
    tag: "art",
    headlineKey: "corot1822",
    detailKey: "corot1822",
    essayLinks: [
      { href: "/stories/how-the-forest-became-a-picture", labelKey: "actions.readEssay" }
    ]
  },
  {
    dateKey: "aubergeGanne",
    tag: "village",
    headlineKey: "aubergeGanne",
    detailKey: "aubergeGanne",
    essayLinks: [
      { href: "/stories/inn-paintings-dinner", labelKey: "actions.readEssay" }
    ]
  },
  {
    dateKey: "denecourt1842",
    tag: "forest",
    headlineKey: "denecourt1842",
    detailKey: "denecourt1842",
    essayLinks: [
      { href: "/stories/paths-to-the-forest", labelKey: "actions.readEssay" }
    ]
  },
  {
    dateKey: "rousseau1847",
    tag: "art",
    headlineKey: "rousseau1847",
    detailKey: "rousseau1847",
    essayLinks: []
  },
  {
    dateKey: "millet1849",
    tag: "art",
    headlineKey: "millet1849",
    detailKey: "millet1849",
    essayLinks: [
      { href: "/stories/rooms-of-light", labelKey: "actions.readEssay" },
      { href: "/stories/the-gleaners", labelKey: "secondEssayLabel", labelSource: "pages" }
    ]
  },
  {
    dateKey: "reserve1861",
    tag: "forest",
    headlineKey: "reserve1861",
    detailKey: "reserve1861",
    essayLinks: [
      { href: "/stories/paths-to-the-forest", labelKey: "actions.readEssay" }
    ]
  },
  {
    dateKey: "rousseauDeath",
    tag: "art",
    headlineKey: "rousseauDeath",
    detailKey: "rousseauDeath",
    essayLinks: []
  },
  {
    dateKey: "milletDeath",
    tag: "art",
    headlineKey: "milletDeath",
    detailKey: "milletDeath",
    essayLinks: []
  },
  {
    dateKey: "commune1903",
    tag: "village",
    headlineKey: "commune1903",
    detailKey: "commune1903",
    essayLinks: []
  },
  {
    dateKey: "musee1995",
    tag: "legacy",
    headlineKey: "musee1995",
    detailKey: "musee1995",
    essayLinks: []
  },
  {
    dateKey: "today",
    tag: "legacy",
    headlineKey: "today",
    detailKey: "today",
    essayLinks: []
  }
];

type FilterKey = "all" | TimelineTag;

// Display labels now live in common.json (`timeline.filters.*`) — this list
// only carries the data identifiers used for filtering, untouched.
const filterKeys: FilterKey[] = ["all", "art", "forest", "village", "legacy"];

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

export default function HistoryTimeline() {
  const { t: tCommon } = useTranslation("common");
  const { t: tPages } = useTranslation("pages");
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
        aria-label={tCommon("a11y.filterTimeline")}
      >
        {filterKeys.map((key) => {
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
              {tCommon(`timeline.filters.${key}`)}
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
            const key = event.dateKey;
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
                      {tPages(`history.timeline.events.${event.dateKey}.date`)}
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
                      {tCommon(`timeline.tags.${event.tag}`)}
                    </span>
                    <p className="mt-2 font-serif text-base text-ink">
                      {tPages(`history.timeline.events.${event.headlineKey}.headline`)}
                    </p>
                    <div
                      className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
                        isOpen ? "max-h-[28rem]" : "max-h-0"
                      }`}
                    >
                      <div className="mt-3 text-sm leading-relaxed text-ink/70">
                        <p>
                          {tPages(`history.timeline.events.${event.detailKey}.detail`)}
                        </p>
                        {event.essayLinks.length > 0 ? (
                          <p className="mt-2">
                            {event.essayLinks.map((link, index) => (
                              <Fragment key={link.href}>
                                {index > 0 ? " " : null}
                                <Link
                                  href={link.href}
                                  className="underline underline-offset-4 hover:text-ink transition-colors"
                                >
                                  {link.labelSource === "pages"
                                    ? tPages(
                                        `history.timeline.events.${event.headlineKey}.${link.labelKey}`
                                      )
                                    : `${tCommon(link.labelKey)} →`}
                                </Link>
                              </Fragment>
                            ))}
                          </p>
                        ) : null}
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
