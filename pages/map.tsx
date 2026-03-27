import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { getAllPlaces, type Place } from "@/data/places";
import { getPublishedLocations, getPublishedRoutes, type Route } from "@/lib/supabase";
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

type MapPageProps = { locations: Place[]; routes: Route[] };

const MapPage: NextPage<MapPageProps> = ({ locations, routes }) => {
  const [activeGroups, setActiveGroups] = useState<GroupName[]>([
    "Art & History",
    "Eat & Stay",
    "Forest & Nature",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

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
        <div className="relative h-full w-full">
          {/* Map — always full width/height */}
          <div className="absolute inset-0">
            <MapGL locations={visibleLocations} routes={routes} />
          </div>

          {/* Floating controls — top left */}
          <div className="absolute left-4 top-4 z-40 flex flex-col gap-2">
            {/* Toggle button */}
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-ink/15 bg-cream/95 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-ink shadow-sm backdrop-blur-sm transition-all hover:bg-cream"
            >
              <span>{sidebarOpen ? "✕" : "☰"}</span>
              <span>{sidebarOpen ? "Close" : "Layers & Search"}</span>
            </button>

            {/* Location count badge */}
            <div className="rounded-full border border-ink/10 bg-cream/90 px-4 py-2 text-[11px] text-ink/50 shadow-sm backdrop-blur-sm">
              {visibleLocations.length}{" "}
              {visibleLocations.length === 1 ? "location" : "locations"}
              {searchQuery && ` · "${searchQuery}"`}
            </div>
          </div>

          {/* Sidebar drawer — desktop */}
          {sidebarOpen && (
            <>
              {/* Backdrop — click to close */}
              <div
                className="absolute inset-0 z-20"
                onClick={() => setSidebarOpen(false)}
                aria-hidden
              />

              {/* Panel */}
              <aside className="absolute bottom-0 left-0 top-0 z-30 flex w-80 flex-col gap-5 overflow-y-auto border-r border-ink/10 bg-cream/98 p-6 shadow-xl backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <p className="eyebrow">VISIT BARBIZON</p>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="text-[11px] uppercase tracking-[0.2em] text-ink/40 hover:text-ink"
                  >
                    ✕
                  </button>
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
                          type="button"
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
            </>
          )}

          {/* Mobile bottom sheet — shown when sidebar open on small screens */}
          {/* (The aside above handles this via absolute positioning on all sizes) */}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<MapPageProps> = async () => {
  try {
    const [locations, routes] = await Promise.all([
      getPublishedLocations(),
      getPublishedRoutes(),
    ]);
    return { props: { locations, routes }, revalidate: 60 };
  } catch {
    return { props: { locations: getAllPlaces(), routes: [] }, revalidate: 60 };
  }
};

export default MapPage;
