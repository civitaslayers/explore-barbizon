import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { getAllPlaces, type Place } from "@/data/places";
import { getPublishedLocations } from "@/lib/supabase";
import {
  GROUP_NAMES,
  GROUP_DOT_TAILWIND,
  GROUP_META,
  getCategoryGroup,
  type GroupName,
} from "@/lib/categoryGroups";

const MapGL = dynamic(() => import("@/components/MapGL"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_#f5f1e8,_#d4cec0)]">
      <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
        Loading map…
      </p>
    </div>
  ),
});

type MapPageProps = { locations: Place[] };

const MapPage: NextPage<MapPageProps> = ({ locations }) => {
  const [activeGroups, setActiveGroups] = useState<GroupName[]>([
    "Art & History",
    "Eat & Stay",
    "Forest & Nature",
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleGroup = (group: GroupName) =>
    setActiveGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );

  const visibleLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return locations.filter((l) => {
      const inGroup = activeGroups.includes(getCategoryGroup(l.category));
      if (!inGroup) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        (l.shortDescription ?? "").toLowerCase().includes(q)
      );
    });
  }, [locations, activeGroups, searchQuery]);

  return (
    <>
      <Head>
        <title>Explore Map — Visit Barbizon</title>
      </Head>

      {/* Map container — fills the viewport below the nav */}
      <div
        className="overflow-hidden rounded-3xl border border-ink/10 shadow-card"
        style={{ height: "calc(100dvh - 7.5rem)" }}
      >
        <div className="flex h-full flex-col md:flex-row">
          {/* Left panel */}
          <aside className="flex flex-col gap-5 overflow-y-auto border-b border-ink/10 bg-cream/98 p-5 md:w-72 md:flex-shrink-0 md:border-b-0 md:border-r md:p-6 lg:w-80">
            <div>
              <p className="eyebrow mb-1">EXPLORE BARBIZON</p>
              <p className="text-xs leading-relaxed text-ink/55">
                A quiet atlas of studios, paths, and village coordinates.
              </p>
            </div>

            {/* Search */}
            <div>
              <p className="eyebrow mb-2">SEARCH</p>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Place, trail, studio…"
                className="w-full rounded-full border border-ink/15 bg-cream/60 px-4 py-2.5 text-xs text-ink placeholder:text-ink/35 focus:border-ink/35 focus:bg-cream focus:outline-none"
              />
            </div>

            {/* Layer toggles */}
            <div>
              <p className="eyebrow mb-2">LAYERS</p>
              <div className="flex flex-col gap-1.5">
                {GROUP_NAMES.map((group) => {
                  const active = activeGroups.includes(group);
                  return (
                    <button
                      key={group}
                      onClick={() => toggleGroup(group)}
                      className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-250 ease-soft ${
                        active
                          ? "border-ink/15 bg-ink/[0.03]"
                          : "border-transparent opacity-35 hover:opacity-55"
                      }`}
                    >
                      <span
                        className={`mt-[3px] h-2 w-2 flex-shrink-0 rounded-full ${GROUP_DOT_TAILWIND[group]}`}
                      />
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink">
                          {group}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink/45">
                          {GROUP_META[group]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-auto text-[11px] text-ink/35">
              {visibleLocations.length}{" "}
              {visibleLocations.length === 1 ? "location" : "locations"}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </aside>

          {/* Map */}
          <div className="relative min-h-[50vh] flex-1 md:min-h-0">
            <MapGL locations={visibleLocations} />
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<MapPageProps> = async () => {
  try {
    const locations = await getPublishedLocations();
    return { props: { locations }, revalidate: 60 };
  } catch {
    return { props: { locations: getAllPlaces() }, revalidate: 60 };
  }
};

export default MapPage;
