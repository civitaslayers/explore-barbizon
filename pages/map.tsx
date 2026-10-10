import type { GetStaticProps, NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTranslation, type SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import MyDayPanel, { type DayStop } from "@/components/MyDayPanel";
import { SeoHead } from "@/components/SeoHead";
import { buildCategoryLabels } from "@/lib/categoryLabel";
import { withRetry } from "@/lib/fetchPolicy";
import { MY_DAY_MAX_STOPS, MY_DAY_QUERY_PARAM, parseDayParam } from "@/lib/myDay";
import { useMyDay } from "@/lib/useMyDay";
import { useWalkingRoute } from "@/lib/useWalkingRoute";
import type { Place, PlaceCategory } from "@/lib/types";
import { getMapPins, getPublishedRoutes, type MapPin, type Route, type RouteRow } from "@/lib/supabase";
import {
  GROUP_NAMES,
  GROUP_DOT_TAILWIND,
  getCategoryGroup,
  type GroupName,
} from "@/lib/categoryGroups";
import { getLocalized } from "@/lib/getLocalized";
import nextI18NextConfig from "@/next-i18next.config";

// Display-only i18n keys for the four fixed layer groups (lib/categoryGroups.ts
// group names stay as data identifiers used for filtering — untouched — this
// map is purely for rendering the localized label/description).
const GROUP_I18N_KEY: Record<GroupName, string> = {
  "Art & History": "artHistory",
  "Eat & Stay": "eatStay",
  "Forest & Nature": "forestNature",
  Practical: "practical",
};

// A standalone component because `dynamic({ loading })` runs at module scope,
// outside any component render — it cannot call useTranslation directly.
function MapLoading() {
  const { t } = useTranslation("common");
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_#f5f1e8,_#d4cec0)]">
      <p className="text-xs uppercase tracking-[0.2em] text-ink/60">
        {t("map.loading")}
      </p>
    </div>
  );
}

const MapGL = dynamic(() => import("@/components/MapGL"), {
  ssr: false,
  loading: () => <MapLoading />,
});

type MapPageProps = { pins: MapPin[]; routes: Route[] } & SSRConfig;

function mapPinToMapGLPlace(
  pin: MapPin
): Place & { placeSlug: string | null; allCategories: string[] } {
  return {
    slug: pin.slug,
    name: pin.name,
    location: "Barbizon",
    shortDescription: pin.shortDescription,
    description: "",
    history: null,
    heroImage: null,
    category: pin.category as PlaceCategory,
    categorySlug: pin.categorySlug,
    latitude: pin.latitude,
    longitude: pin.longitude,
    route_slug: pin.routeSlug ?? null,
    placeSlug: pin.placeSlug,
    allCategories: pin.allCategories,
  };
}

/**
 * Resolve each pin's locale-aware short description where the locale is
 * already known (getStaticProps runs once per locale), and drop the raw
 * translation inputs so /map's page data never ships both languages.
 * Predicate is the shared getLocalized() helper — same one as /places and
 * the hreflang gate, never re-implemented.
 */
function localizeMapPin(pin: MapPin, locale: string): MapPin {
  return {
    slug: pin.slug,
    name: getLocalized(pin, locale, "name") || pin.name,
    shortDescription: getLocalized(pin, locale, "short_description"),
    latitude: pin.latitude,
    longitude: pin.longitude,
    category: pin.category,
    categorySlug: pin.categorySlug,
    allCategories: pin.allCategories,
    placeSlug: pin.placeSlug,
    routeSlug: pin.routeSlug,
  };
}

/**
 * Same for routes: resolve name/description for the known locale and drop
 * the raw `translations` column, so the trail popups (components/MapGL.tsx →
 * lib/popupHtml.ts) receive resolved strings and /map's page data never
 * ships both languages. Same getLocalized() predicate as the pins.
 */
function localizeRoute(route: RouteRow, locale: string): Route {
  return {
    id: route.id,
    name: getLocalized(route, locale, "name") || route.name,
    slug: route.slug,
    description: getLocalized(route, locale, "description") || null,
    distance_meters: route.distance_meters,
    duration_minutes: route.duration_minutes,
    difficulty: route.difficulty,
    geojson: route.geojson,
    start_lat: route.start_lat,
    start_lng: route.start_lng,
    color: route.color,
  };
}

const MapPage: NextPage<MapPageProps> = ({ pins, routes }) => {
  const { t } = useTranslation("common");
  const locations = useMemo(() => pins.map(mapPinToMapGLPlace), [pins]);
  const categoryLabels = useMemo(() => buildCategoryLabels(pins, t), [pins, t]);
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const focusSlug =
    typeof router.query.location === "string"
      ? router.query.location
      : undefined;

  const [activeGroups, setActiveGroups] = useState<GroupName[]>([
    "Art & History",
    "Eat & Stay",
    "Forest & Nature",
    "Practical",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
  // Overlays an opened map popup must be panned clear of (MapGL keepPopupClear).
  const controlsRef = useRef<HTMLDivElement>(null);
  const dayChipRef = useRef<HTMLButtonElement>(null);
  const getOverlayElements = useCallback(
    () => [controlsRef.current, dayChipRef.current],
    []
  );
  const [fitDayToken, setFitDayToken] = useState(0);
  const [sharedAutoOpened, setSharedAutoOpened] = useState(false);
  const [prevFocusSlug, setPrevFocusSlug] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  if (router.isReady && focusSlug !== prevFocusSlug) {
    setPrevFocusSlug(focusSlug);
    if (focusSlug) {
      const target = locations.find((l) => l.slug === focusSlug);
      if (target) {
        const groups = (target.allCategories ?? [target.category])
          .map((cat) => getCategoryGroup(cat))
          .filter((g, i, arr) => arr.indexOf(g) === i);
        setActiveGroups((prev) => {
          const missing = groups.filter((g) => !prev.includes(g));
          return missing.length ? [...prev, ...missing] : prev;
        });
      }
    }
  }

  // ── My day ────────────────────────────────────────────────────────────
  // Resolved against ALL published pins (the layer/search filter never hides
  // day stops). A ?day= list that differs from the stored one is a read-only
  // "shared" view and never writes storage on its own.
  const myDay = useMyDay();
  const dayParamRaw = router.isReady ? router.query[MY_DAY_QUERY_PARAM] : undefined;
  const sharedKey = parseDayParam(dayParamRaw).join(",");
  const sharedSlugs = useMemo(
    () => (sharedKey ? sharedKey.split(",") : []),
    [sharedKey]
  );
  const ownKey = myDay.slugs.join(",");
  const shared = sharedSlugs.length > 0 && sharedKey !== ownKey;
  const activeSlugs = shared ? sharedSlugs : myDay.slugs;
  const dayStops = useMemo<DayStop[]>(() => {
    const bySlug = new Map(locations.map((l) => [l.slug, l]));
    const out: DayStop[] = [];
    for (const slug of activeSlugs) {
      const l = bySlug.get(slug);
      if (l) {
        out.push({
          slug,
          name: l.name,
          latitude: l.latitude,
          longitude: l.longitude,
        });
      }
    }
    return out;
  }, [locations, activeSlugs]);
  const unavailableCount = activeSlugs.length - dayStops.length;
  // Walking route for the active (own or shared) ordered stops. Lives here,
  // not in the panel, so opening/closing the panel never triggers a request.
  const walking = useWalkingRoute(dayStops);

  const openDay = () => {
    setDayOpen(true);
    setSidebarOpen(false);
    setFitDayToken((n) => n + 1);
  };
  const closeDay = useCallback(() => setDayOpen(false), []);

  // A shared day opens the panel once and fits the camera to it.
  if (shared && !sharedAutoOpened) {
    setSharedAutoOpened(true);
    openDay();
  }

  const clearDayParam = () => {
    const { [MY_DAY_QUERY_PARAM]: _omit, ...rest } = router.query;
    void _omit;
    router.replace({ pathname: "/map", query: rest }, undefined, { shallow: true });
  };

  const reorderOwn = (ordered: string[]) =>
    myDay.replaceAll([...ordered, ...myDay.slugs.filter((s) => !ordered.includes(s))]);

  const saveShared = () => {
    myDay.replaceAll(dayStops.map((s) => s.slug));
    clearDayParam();
  };

  const toggleGroup = (group: GroupName) =>
    setActiveGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );

  const visibleLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return locations.filter((l) => {
      const inGroup = (l.allCategories ?? [l.category]).some((cat) =>
        activeGroups.includes(getCategoryGroup(cat as string))
      );
      if (!inGroup) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        (l.shortDescription ?? "").toLowerCase().includes(q)
      );
    });
  }, [locations, activeGroups, searchQuery]);

  // Computed here (a normal component render, where hooks work) and passed
  // down to MapGL, which reads it via a ref inside its imperative Mapbox
  // popup-building code — see the Props comment in components/MapGL.tsx.
  const mapLabels = useMemo(
    () => ({
      trailEyebrow: t("map.trailEyebrow"),
      loop: t("map.loop"),
      difficultyEasy: t("map.difficulty.easy"),
      difficultyModerate: t("map.difficulty.moderate"),
      difficultyHard: t("map.difficulty.hard"),
      viewPlace: t("actions.viewPlace"),
      addToDay: t("myDay.add"),
      inDay: t("myDay.added"),
      dayFull: t("myDay.full", { max: MY_DAY_MAX_STOPS }),
    }),
    [t]
  );

  return (
    <>
      <SeoHead
        title={t("map.title")}
        description={t("map.description")}
        path="/map"
        locale={locale}
      />

      {/* Page heading — visually hidden: the map fills the viewport below the
          nav, so a visible title would cost map height. Gives /map its single
          h1 (heading landmark + SEO) like every other public page. */}
      <h1 className="sr-only">{t("map.heading")}</h1>

      {/* Map container — fills the viewport below the nav. `isolate` keeps
          every map overlay's z-index inside this box, so the sticky site
          header (z-40) and mobile bottom nav (z-50) always paint above them.
          Mobile is 3rem shorter so the map, its attribution and the day chip
          end above the fixed bottom nav. */}
      <div className="isolate h-[calc(100dvh-10.5rem)] overflow-hidden rounded-3xl border border-ink/10 shadow-card md:h-[calc(100dvh-7.5rem)]">
        <div className="relative h-full w-full">
          {/* Map — always full width/height */}
          <div className="absolute inset-0">
            <MapGL
              locations={visibleLocations}
              allLocations={locations}
              routes={routes}
              focusSlug={focusSlug}
              labels={mapLabels}
              categoryLabels={categoryLabels}
              locale={locale}
              dayStops={dayStops}
              dayRoute={walking.route?.geometry ?? null}
              daySlugs={myDay.slugs}
              dayFull={myDay.isFull}
              dayShared={shared}
              onToggleDay={myDay.toggle}
              fitDayToken={fitDayToken}
              getOverlayElements={getOverlayElements}
            />
          </div>

          {/* Floating controls — top left */}
          <div
            ref={controlsRef}
            data-map-overlay="controls"
            className="absolute left-4 top-4 z-40 flex flex-col gap-2"
          >
            {/* Toggle button */}
            <button
              type="button"
              onClick={() => {
                if (!sidebarOpen) setDayOpen(false);
                setSidebarOpen((v) => !v);
              }}
              className="flex items-center gap-2 rounded-full border border-ink/15 bg-cream/95 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-ink shadow-sm backdrop-blur-sm transition-all hover:bg-cream"
            >
              <span>{sidebarOpen ? "✕" : "☰"}</span>
              <span>{sidebarOpen ? t("map.close") : t("map.layersAndSearch")}</span>
            </button>

            {/* Location count badge */}
            <div className="rounded-full border border-ink/10 bg-cream/90 px-4 py-2 text-[11px] text-ink/60 shadow-sm backdrop-blur-sm">
              {visibleLocations.length}{" "}
              {visibleLocations.length === 1
                ? t("map.locationsCountSingular")
                : t("map.locationsCountPlural")}
              {searchQuery && ` · "${searchQuery}"`}
            </div>
          </div>

          {/* My day chip — bottom right, where the panel opens. Lifted clear of
              the Mapbox attribution (bottom-right, must stay visible). */}
          {!dayOpen && (
            <button
              ref={dayChipRef}
              type="button"
              data-map-overlay="day-chip"
              onClick={openDay}
              aria-expanded={false}
              className="chip absolute bottom-12 right-4 z-30 inline-flex h-[34px] items-center shadow-sm md:bottom-10"
            >
              {dayStops.length > 0
                ? t("myDay.chipCount", { count: dayStops.length })
                : t("myDay.chip")}
            </button>
          )}

          {dayOpen && (
            <MyDayPanel
              stops={dayStops}
              route={walking.route}
              shared={shared}
              unavailableCount={unavailableCount}
              storedCount={myDay.slugs.length}
              persisted={myDay.persisted}
              locale={locale}
              onClose={closeDay}
              onReorder={reorderOwn}
              onRemove={myDay.remove}
              onClear={myDay.clear}
              onSaveShared={saveShared}
              onBackToMine={clearDayParam}
            />
          )}

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
                    aria-label={t("map.close")}
                    className="text-[11px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink"
                  >
                    ✕
                  </button>
                </div>

                {/* Search */}
                <div>
                  <p className="eyebrow mb-2">{t("map.search").toUpperCase()}</p>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("map.searchPlaceholder")}
                    className="w-full rounded-full border border-ink/15 bg-cream/60 px-4 py-2.5 text-xs text-ink placeholder:text-ink/60 focus:border-ink/35 focus:bg-cream focus:outline-none"
                  />
                </div>

                {/* Layer toggles */}
                <div>
                  <p className="eyebrow mb-2">{t("map.layers").toUpperCase()}</p>
                  <div className="flex flex-col gap-1.5">
                    {GROUP_NAMES.map((group) => {
                      const active = activeGroups.includes(group);
                      const i18nKey = GROUP_I18N_KEY[group];
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
                              {t(`layers.${i18nKey}`)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-ink/60">
                              {t(`layers.${i18nKey}Meta`)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-auto text-[11px] text-ink/60">
                  {visibleLocations.length}{" "}
                  {visibleLocations.length === 1
                    ? t("map.locationsCountSingular")
                    : t("map.locationsCountPlural")}
                  {searchQuery && ` ${t("map.matching", { query: searchQuery })}`}
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

export const getStaticProps: GetStaticProps<MapPageProps> = async ({
  locale,
}) => {
  const [rawPins, rawRoutes, translations] = await Promise.all([
    withRetry("map getMapPins", () => getMapPins()),
    withRetry("map getPublishedRoutes", () => getPublishedRoutes()),
    serverSideTranslations(locale ?? "fr", ["common"], nextI18NextConfig),
  ]);
  const pins = rawPins.map((pin) => localizeMapPin(pin, locale ?? "fr"));
  const routes = rawRoutes.map((r) => localizeRoute(r, locale ?? "fr"));
  return { props: { pins, routes, ...translations }, revalidate: 60 };
};

export default MapPage;
