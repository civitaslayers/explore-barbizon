import type { GetServerSideProps, NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import { AtlasListView } from "@/components/command-center/AtlasListView";
import { AtlasMapView } from "@/components/command-center/AtlasMapView";
import { LocationPreviewCard } from "@/components/command-center/LocationPreviewCard";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { computeCompleteness } from "@/lib/completeness";
import { GROUP_COLORS, getCategoryGroup } from "@/lib/categoryGroups";
import type { AtlasLocation } from "@/lib/atlasTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NextPageWithLayout<P> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AtlasIndexProps = { locations: AtlasLocation[] };

type ViewMode = "map" | "list";

// ---------------------------------------------------------------------------
// getServerSideProps — supabaseAdmin is referenced ONLY inside this function.
// One query: locations + category join + media + location_functions rollup.
// Read-only; the only write in Phase 1 is the pre-existing coordinate PATCH
// inside AtlasMapView (unchanged from pins.tsx).
// ---------------------------------------------------------------------------

type AtlasLocationRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  // full_description / narrative are fetched here to feed the completeness
  // "body" input (lib/completeness.ts) but are deliberately NOT included in
  // the serialized AtlasLocation prop shipped to the client — see the
  // implementer's decision note for why this diverges from a literal read of
  // the plan's select string.
  full_description: string | null;
  narrative: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  is_published: boolean | null;
  show_on_map: boolean | null;
  show_in_editorial: boolean | null;
  is_featured: boolean | null;
  is_premium: boolean | null;
  category_id: string | null;
  opening_hours: Record<string, string> | null;
  website: string | null;
  phone: string | null;
  allow_proximity_override: boolean | null;
  updated_at: string | null;
  categories: { name: string; layer: string } | null;
  media: { url: string; display_order: number | null }[] | null;
  location_functions:
    | {
        website: string | null;
        phone: string | null;
        opening_hours: Record<string, string> | null;
      }[]
    | null;
};

function nonEmpty(value: string | null | undefined): boolean {
  return value != null && value.trim().length > 0;
}

function hasAnyHours(value: Record<string, string> | null | undefined): boolean {
  if (!value) return false;
  return Object.values(value).some((v) => typeof v === "string" && v.trim().length > 0);
}

export const getServerSideProps: GetServerSideProps<AtlasIndexProps> = async () => {
  const { data, error } = await supabaseAdmin
    .from("locations")
    .select(
      "id, name, slug, short_description, full_description, narrative, address, " +
        "latitude, longitude, is_published, show_on_map, show_in_editorial, " +
        "is_featured, is_premium, category_id, opening_hours, website, phone, " +
        "allow_proximity_override, updated_at, " +
        "categories(name, layer), " +
        "media(url, display_order), " +
        "location_functions(website, phone, opening_hours)"
    )
    .overrideTypes<AtlasLocationRow[]>();

  if (error) throw new Error(error.message);

  const locations: AtlasLocation[] = (data ?? []).map((row) => {
    const categoryName = row.categories?.name ?? "Point of Interest";
    const categoryLayer = row.categories?.layer ?? null;
    const group = getCategoryGroup(categoryName, categoryLayer);
    const color = GROUP_COLORS[group];

    const media = row.media ?? [];
    const sortedMedia = [...media].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    const photoUrl = sortedMedia[0]?.url ?? null;
    const mediaCount = media.length;

    const functions = row.location_functions ?? [];
    const functionWebsite = functions.some((fn) => nonEmpty(fn.website));
    const functionPhone = functions.some((fn) => nonEmpty(fn.phone));
    const functionHours = functions.some((fn) => hasAnyHours(fn.opening_hours));

    const completeness = computeCompleteness(
      {
        category_id: row.category_id,
        short_description: row.short_description,
        full_description: row.full_description,
        narrative: row.narrative,
        address: row.address,
        opening_hours: row.opening_hours,
        website: row.website,
        phone: row.phone,
      },
      { group, mediaCount, functionWebsite, functionPhone, functionHours }
    );

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      shortDescription: row.short_description,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      isPublished: row.is_published ?? false,
      showOnMap: row.show_on_map ?? false,
      showInEditorial: row.show_in_editorial ?? false,
      isFeatured: row.is_featured ?? false,
      isPremium: row.is_premium ?? false,
      allowProximityOverride: row.allow_proximity_override ?? false,
      categoryName,
      layer: categoryLayer ?? "—",
      group,
      color,
      photoUrl,
      mediaCount,
      updatedAt: row.updated_at,
      completeness,
      // Phase 2 card quick-edit (§2.1) — the row already selects these three
      // columns for the completeness rollup above; serialize them to the
      // client prop so LocationPreviewCard can inline-edit them.
      phone: row.phone,
      website: row.website,
      openingHours: row.opening_hours,
    };
  });

  return { props: { locations } };
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const AtlasIndexPage: NextPageWithLayout<AtlasIndexProps> = ({ locations }) => {
  const router = useRouter();
  const view: ViewMode = router.query.view === "list" ? "list" : "map";
  const sel = typeof router.query.sel === "string" ? router.query.sel : null;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [centerRequest, setCenterRequest] = useState(0);

  // view + sel live in the URL (shallow-routed) — the shared state model
  // locked in docs/ccc-v3-fiche-plan.md Section 1.1/1.2. No client store.
  const setQuery = useCallback(
    (next: { view?: ViewMode; sel?: string | null }) => {
      const nextView = next.view ?? view;
      const nextSel = next.sel !== undefined ? next.sel : sel;
      const query: Record<string, string> = {};
      if (nextView !== "map") query.view = nextView;
      if (nextSel) query.sel = nextSel;
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    },
    [router, view, sel]
  );

  const handleSelect = useCallback(
    (id: string | null) => setQuery({ sel: id }),
    [setQuery]
  );
  const handleViewChange = useCallback(
    (next: ViewMode) => setQuery({ view: next }),
    [setQuery]
  );
  const handleCenter = useCallback(() => setCenterRequest((n) => n + 1), []);

  const selectedLocation = useMemo(
    () => (sel ? locations.find((l) => l.id === sel) ?? null : null),
    [locations, sel]
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Persistent live-write banner — copied verbatim from pins.tsx; this
          surface still drags-to-move (a write), so it stays even though
          Phase 1 is otherwise read-only. */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-center gap-2 bg-umber px-4 py-2 text-cream shadow-sm">
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-cream" />
        <p className="text-[11px] font-medium uppercase tracking-[0.22em]">
          Écriture directe en production
          <span className="ml-2 font-normal normal-case tracking-normal text-cream/70">
            · writes live data — no sandbox
          </span>
        </p>
      </div>

      {/* Map / List switch */}
      <div className="absolute right-4 top-14 z-20 flex gap-1 rounded-full bg-cream/90 p-1 shadow-ambient">
        <button
          type="button"
          onClick={() => handleViewChange("map")}
          className={`chip transition-opacity duration-200 ease-soft ${
            view === "map" ? "opacity-100" : "opacity-45 hover:opacity-70"
          }`}
        >
          Carte
        </button>
        <button
          type="button"
          onClick={() => handleViewChange("list")}
          className={`chip transition-opacity duration-200 ease-soft ${
            view === "list" ? "opacity-100" : "opacity-45 hover:opacity-70"
          }`}
        >
          Liste
        </button>
      </div>

      {view === "map" ? (
        <AtlasMapView
          locations={locations}
          selectedId={sel}
          onSelect={handleSelect}
          hoveredId={hoveredId}
          centerRequest={centerRequest}
        />
      ) : (
        <div className="h-full w-full overflow-auto px-6 pb-16 pt-24">
          <AtlasListView
            locations={locations}
            selectedId={sel}
            onSelect={handleSelect}
            onHoverRow={setHoveredId}
          />
        </div>
      )}

      {selectedLocation ? (
        <LocationPreviewCard
          // Keyed by id so the card's Phase 2 quick-edit field state (address/
          // phone/website/opening_hours) resets cleanly when the selection
          // changes to a different location, rather than carrying over stale
          // local state from the previously-selected card.
          key={selectedLocation.id}
          location={selectedLocation}
          view={view}
          onClose={() => handleSelect(null)}
          onCenter={view === "map" ? handleCenter : undefined}
        />
      ) : null}
    </div>
  );
};

AtlasIndexPage.getLayout = (page: ReactElement) => (
  <CommandCenterLayout>{page}</CommandCenterLayout>
);

export default AtlasIndexPage;
