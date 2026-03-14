import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { getAllPlaces, type Place } from "@/data/places";
import { getPublishedLocations } from "@/lib/supabase";
import { GROUP_NAMES, type GroupName } from "@/components/MapGL";

const MapGL = dynamic(() => import("@/components/MapGL"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_#f5f1e8,_#d4cec0)]">
      <p className="text-xs uppercase tracking-[0.2em] text-ink/40">Loading map…</p>
    </div>
  ),
});

const GROUP_META: Record<GroupName, { description: string; dot: string }> = {
  "Art & History": {
    description: "Studios, galleries, heritage sites",
    dot: "bg-umber",
  },
  "Eat & Stay": {
    description: "Restaurants, cafés, hotels, shops",
    dot: "bg-moss",
  },
  "Forest & Nature": {
    description: "Trails, viewpoints, climbing areas",
    dot: "bg-[#4A5E3A]",
  },
  "Practical": {
    description: "Parking, transport, services",
    dot: "bg-ink/30",
  },
};

type MapPageProps = {
  locations: Place[];
};

const MapPage: NextPage<MapPageProps> = ({ locations }) => {
  const [activeGroups, setActiveGroups] = useState<GroupName[]>([
    "Art & History",
    "Eat & Stay",
    "Forest & Nature",
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleGroup = (group: GroupName) => {
    setActiveGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    const q = searchQuery.toLowerCase();
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        (l.shortDescription ?? "").toLowerCase().includes(q)
    );
  }, [locations, searchQuery]);

  return (
    <>
      <Head>
        <title>Explore Map — Explore Barbizon</title>
      </Head>

      <div className="space-y-4">
        <header className="editorial-measure space-y-2">
          <p className="eyebrow">CARTOGRAPHY</p>
          <h1 className="heading-lg">
            A working map of studios, paths, and quiet coordinates.
          </h1>
        </header>

        {/* Map container */}
        <div
          className="overflow-hidden rounded-3xl border border-ink/10 shadow-card"
          style={{ height: "calc(100svh - 13rem)" }}
        >
          <div className="flex h-full flex-col md:flex-row">
            {/* Left panel */}
            <aside className="flex flex-col gap-5 overflow-y-auto border-b border-ink/10 bg-cream/98 p-5 md:w-72 md:flex-shrink-0 md:border-b-0 md:border-r md:p-6 lg:w-80">
              {/* Search */}
              <div>
                <p className="eyebrow mb-2.5">SEARCH</p>
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
                <p className="eyebrow mb-2.5">LAYERS</p>
                <div className="flex flex-col gap-1.5">
                  {GROUP_NAMES.map((group) => {
                    const active = activeGroups.includes(group);
                    const { description, dot } = GROUP_META[group];
                    return (
                      <button
                        key={group}
                        onClick={() => toggleGroup(group)}
                        className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-250 ease-soft ${
                          active
                            ? "border-ink/15 bg-ink/[0.03]"
                            : "border-transparent opacity-40 hover:opacity-60"
                        }`}
                      >
                        <span
                          className={`mt-[3px] h-2 w-2 flex-shrink-0 rounded-full ${dot}`}
                        />
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink">
                            {group}
                          </p>
                          <p className="mt-0.5 text-[11px] text-ink/45">
                            {description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Count */}
              <p className="mt-auto text-[11px] text-ink/40">
                {filteredLocations.length}{" "}
                {filteredLocations.length === 1 ? "location" : "locations"}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </aside>

            {/* Map */}
            <div className="relative min-h-[50vh] flex-1 md:min-h-0">
              <MapGL
                locations={filteredLocations}
                activeGroups={activeGroups}
              />
            </div>
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
