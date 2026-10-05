import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";
import type { Place, PlaceCategory } from "@/lib/types";
import { hasPublishedTranslation, type LocalizableRow, type TranslationEntry } from "@/lib/getLocalized";

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase client. Null when env vars are not configured.
 * All helper functions below check for null and throw on failure.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

// ---------------------------------------------------------------------------
// DB types (snake_case, matching the live locations schema exactly)
// ---------------------------------------------------------------------------

export type DbLocation = {
  id: string;
  town_id: string | null;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  narrative: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  opening_hours: Record<string, string> | null;
  is_published: boolean | null;
  is_premium: boolean | null;
  is_featured: boolean | null;
  qr_code_url: string | null;
  show_on_map: boolean | null;
  show_in_editorial: boolean | null;
  created_at: string | null;
  curation_order: number | null;
  updated_at: string | null;
  route_slug?: string | null;
  media?: { url: string; display_order: number }[] | null;
};

/**
 * Shape returned by getPublishedLocations — trimmed to exactly what
 * pages/places/index.tsx renders, plus the two translations->en JSON paths
 * needed for the EN short_description fallback (see brain/decisions.md,
 * 2026-10-04 _meta stamp decision; lib/getLocalized.ts for the read-path
 * contract). Deliberately its own row type, not shared with any other
 * adapter — this is the only call site, so its row shape stays scoped to
 * this one query.
 */
type PlacesListRow = {
  slug: string;
  name: string;
  short_description: string | null;
  latitude: number;
  longitude: number;
  en_short_description: string | null;
  en_status: string | null;
  categories: { name: string } | null;
  media?: { url: string; display_order: number }[] | null;
};

/**
 * Adapter: PlacesListRow → Place, for the /places list page only. Populates
 * `short_description` + `translations` so the page can call
 * lib/getLocalized.ts's getLocalized() instead of unconditionally rendering
 * the French base column on /en/places.
 */
function toLocalizedPlace(row: PlacesListRow): Place {
  return {
    slug: row.slug,
    name: row.name,
    // address no longer fetched — pages/places/index.tsx never renders
    // place.location.
    location: "Barbizon",
    shortDescription: row.short_description?.trim() ?? "",
    short_description: row.short_description?.trim() ?? "",
    description: "",
    history: null,
    heroImage: (row.media ?? []).sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null,
    category: (row.categories?.name ?? "Studio") as PlaceCategory,
    latitude: row.latitude,
    longitude: row.longitude,
    route_slug: null,
    // getStaticProps serializes this to JSON — undefined is not a valid
    // JSON value, so missing values use null here, not undefined. (Cast
    // past TranslationEntry's `status?: string` — that type's `undefined`
    // is for the in-memory read path in lib/getLocalized.ts, which is
    // untouched here; null is equally "not published" to its `=== "published"`
    // check.)
    translations: {
      en: {
        short_description: row.en_short_description ?? null,
        _meta: { status: row.en_status ?? null },
      },
    } as unknown as Record<string, TranslationEntry>,
  };
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Fetch all published locations (all categories). Used for the map.
 * Throws if Supabase is not configured or the query fails.
 */
type LocationCardRow = {
  slug: string;
  name: string;
  short_description: string | null;
  categories: { name: string; layer: string } | null;
  media: { url: string; display_order: number }[] | null;
};

export type LocationCard = {
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
  heroImage: string | null;
};

function toLocationCard(row: LocationCardRow): LocationCard {
  return {
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    category: row.categories?.name ?? "Point of Interest",
    heroImage:
      (row.media ?? []).sort((a, b) => a.display_order - b.display_order)[0]
        ?.url ?? null,
  };
}

/**
 * Lightweight location list for card grids and link lists (no internal fields).
 */
export async function getLocationCards(): Promise<LocationCard[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("locations")
    .select(
      "slug, name, short_description, categories!inner(name, layer), media(url, display_order)"
    )
    .eq("is_published", true)
    .neq("categories.layer", "Practical")
    .order("name");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("No published locations");
  return (data as LocationCardRow[]).map(toLocationCard);
}

export async function getPublishedLocations(): Promise<Place[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("locations")
    .select(
      "slug, name, short_description, latitude, longitude, en_short_description:translations->en->>short_description, en_status:translations->en->_meta->>status, categories!inner(name, layer), media(url, display_order)"
    )
    .eq("is_published", true)
    .neq("categories.layer", "Practical")
    .order("name");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("No published locations");
  return (data as unknown as PlacesListRow[]).map(toLocalizedPlace);
}

/**
 * Row shape for getMapPins — selected columns plus the two translations->en
 * JSON paths (same PostgREST aliases as getPublishedLocations above) needed
 * for the EN short_description fallback on /en/map.
 */
type MapPinRow = {
  slug: string;
  name: string;
  short_description: string | null;
  latitude: number;
  longitude: number;
  route_slug: string | null;
  en_short_description: string | null;
  en_status: string | null;
  categories: { name: string; layer: string } | null;
};

export type MapPin = {
  slug: string;
  name: string;
  shortDescription: string;
  latitude: number;
  longitude: number;
  category: string;
  allCategories: string[];
  placeSlug: string | null;
  routeSlug: string | null;
  // Raw read-path inputs for lib/getLocalized.ts. snake_case alias because
  // getLocalized's base-column fallback reads row[field] by exact field name
  // (same reason Place carries short_description — lib/types.ts). Present
  // only between getMapPins() and getStaticProps; never shipped in page data.
  short_description?: string;
  translations?: Record<string, TranslationEntry> | null;
};

export async function getMapPins(): Promise<MapPin[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data: locsData, error: locsError } = await supabase
    .from("locations")
    .select(
      "slug, name, short_description, latitude, longitude, route_slug, en_short_description:translations->en->>short_description, en_status:translations->en->_meta->>status, categories!inner(name, layer)"
    )
    .eq("is_published", true);

  if (locsError) throw new Error(locsError.message);

  return ((locsData ?? []) as unknown as MapPinRow[]).map((row) => ({
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    short_description: row.short_description ?? "",
    latitude: row.latitude,
    longitude: row.longitude,
    category: row.categories?.name ?? "Point of Interest",
    allCategories: [row.categories?.name ?? "Point of Interest"],
    placeSlug: row.slug,
    routeSlug: row.route_slug ?? null,
    translations: {
      en: {
        short_description: row.en_short_description ?? null,
        _meta: { status: row.en_status ?? null },
      },
    } as unknown as Record<string, TranslationEntry>,
  }));
}

export type Route = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  distance_meters: number | null;
  duration_minutes: number | null;
  difficulty: string | null;
  geojson: GeoJSON.LineString;
  start_lat: number;
  start_lng: number;
  color: string | null;
};

export async function getPublishedRoutes(): Promise<Route[]> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("routes")
    .select("id, name, slug, description, distance_meters, duration_minutes, difficulty, geojson, start_lat, start_lng, color")
    .eq("is_published", true)
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Route[];
}

/**
 * Fetch all published location slugs.
 * Used by getStaticPaths to pre-render known slugs at build time.
 * Throws if Supabase is not configured or the query fails.
 */
export async function getPublishedSlugs(): Promise<string[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("locations")
    .select("slug")
    .eq("is_published", true);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: { slug: string }) => row.slug);
}

/** Published location slugs for place pages and pre-rendering. */
export async function getPublishedLocationSlugs(): Promise<string[]> {
  return getPublishedSlugs();
}

export type SitemapLocationEntry = { slug: string; hasEnglish: boolean };

/**
 * Published location slugs + per-record hreflang-alternate eligibility, for
 * pages/sitemap.xml.tsx. Gated on the exact same predicate the render path
 * (getLocalized) and SeoHead use — `hasPublishedTranslation` — never on mere
 * translations-key presence. See brain/decisions.md, 2026-08-13 and
 * 2026-10-04. Uses the anon client: published locations are anon-readable,
 * same as the rest of this file.
 */
export async function getPublishedLocationSitemapEntries(): Promise<
  SitemapLocationEntry[]
> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("locations")
    .select("slug, translations")
    .eq("is_published", true);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const typedRow = row as unknown as LocalizableRow & { slug: string };
    return {
      slug: typedRow.slug,
      hasEnglish: hasPublishedTranslation(typedRow, "en"),
    };
  });
}

/**
 * Published story slugs — for the sitemap (docs/i18n-seo-implementation-plan.md,
 * Task 4d). Mirrors getPublishedSlugs; throws if Supabase is not configured or
 * the query fails (the sitemap wraps the call in try/catch and degrades to
 * static routes only).
 */
export async function getPublishedStorySlugs(): Promise<string[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("stories")
    .select("slug")
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row: { slug: string }) => row.slug);
}

/**
 * Published route slugs. `routes` has no public detail page today (the map
 * is the only consumer) — kept for callers that may want them, but the
 * sitemap does not list `/routes/{slug}` URLs since no such page exists
 * (see Task 4d "never emit a URL that 404s").
 */
export async function getPublishedRouteSlugs(): Promise<string[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("routes")
    .select("slug")
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row: { slug: string }) => row.slug);
}

// ---------------------------------------------------------------------------
// Locations (unified building / site pages)
// ---------------------------------------------------------------------------

export type LocationFunction = {
  id: string;
  label: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  opening_hours: Record<string, string> | null;
  display_order: number;
  is_primary: boolean;
  category: {
    name: string;
    slug: string;
    layer: string;
    color: string | null;
  } | null;
};

export type LocationFull = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  latitude: number;
  longitude: number;
  short_description: string | null;
  narrative: string | null;
  is_published: boolean;
  // Parent-level venue hours (locations.opening_hours) — distinct from
  // per-function hours (location_functions.opening_hours, see
  // LocationFunction below). Previously selected but never surfaced to the
  // UI; this is the first public consumer (Phase 2, ccc-v3-fiche-plan §3.4).
  opening_hours: Record<string, unknown> | null;
  functions: LocationFunction[];
  heroImage: string | null;
  // The location's own primary category (locations.category_id) — distinct
  // from each location_function's category. Needed by lib/seo.ts to derive
  // the JSON-LD @type via getCategoryGroup for the (majority) case of
  // locations with no location_functions rows, where the previous JSON-LD
  // type derivation (functions-only) silently fell through to the default.
  category: { name: string; slug: string; layer: string; color: string | null } | null;
  // Read-only i18n contract (docs/schema-reference.md, "translations" JSONB).
  // fr is always the base columns above; getLocalized() reads this for en.
  translations?: Record<
    string,
    { _meta?: { status?: string }; [field: string]: unknown }
  > | null;
};

export async function getLocationFull(
  slug: string
): Promise<LocationFull | null> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("locations")
    .select(
      `
      id, name, slug, address, latitude, longitude,
      short_description, narrative, is_published, opening_hours, translations,
      categories ( name, slug, layer, color ),
      location_functions (
        id, label, description, website, phone, opening_hours,
        display_order, is_primary,
        categories ( name, slug, layer, color )
      ),
      media ( url, display_order )
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const row = data as any;
  const heroImage =
    (row.media ?? [])
      .sort(
        (a: any, b: any) =>
          (a.display_order ?? 0) - (b.display_order ?? 0)
      )[0]?.url ?? null;
  const functions: LocationFunction[] = (row.location_functions ?? [])
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((lf: any) => ({
      id: lf.id,
      label: lf.label,
      description: lf.description,
      website: lf.website,
      phone: lf.phone,
      opening_hours: lf.opening_hours,
      display_order: lf.display_order,
      is_primary: lf.is_primary,
      category: lf.categories ?? null,
    }));
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    short_description: row.short_description,
    narrative: row.narrative,
    is_published: row.is_published,
    opening_hours: row.opening_hours ?? null,
    functions,
    heroImage,
    category: row.categories ?? null,
    translations: row.translations ?? null,
  };
}

// ---------------------------------------------------------------------------
// Tour types
// ---------------------------------------------------------------------------

export type DbTour = {
  id: string;
  town_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number | null;
  distance_meters: number | null;
  cover_image_url: string | null;
};

export type DbTourStop = {
  id: string;
  tour_id: string;
  location_id: string;
  stop_order: number;
  stop_narrative: string | null;
  locations: {
    name: string;
    slug: string;
    short_description: string | null;
    latitude: number;
    longitude: number;
  } | null;
};

export type TourWithStops = DbTour & { stops: DbTourStop[] };

/**
 * Fetch all tours for Barbizon with their stops, ordered by stop_order.
 */
export async function getPublishedTours(): Promise<TourWithStops[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const townRes = await supabase
    .from("towns")
    .select("id")
    .eq("slug", "barbizon")
    .single();
  if (townRes.error || !townRes.data) throw new Error("Barbizon town not found");

  const { data, error } = await supabase
    .from("tours")
    .select(
      `
      id, town_id, name, slug, description, duration_minutes, distance_meters, cover_image_url,
      tour_stops (
        id, tour_id, location_id, stop_order, stop_narrative,
        locations ( name, slug, short_description, latitude, longitude )
      )
    `
    )
    .eq("town_id", townRes.data.id)
    .eq("is_published", true)
    .order("name");

  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("No tours found");

  return (data as (DbTour & { tour_stops?: DbTourStop[] })[]).map((row) => {
    const { tour_stops, ...rest } = row;
    return {
      ...rest,
      stops: [...(tour_stops ?? [])].sort(
        (a, b) => a.stop_order - b.stop_order
      ),
    };
  });
}

/**
 * Fetch a single tour by slug with its stops.
 */
export async function getTourBySlugFromSupabase(
  slug: string
): Promise<TourWithStops | null> {
  if (!supabase) throw new Error("Supabase not configured");

  const townRes = await supabase
    .from("towns")
    .select("id")
    .eq("slug", "barbizon")
    .single();
  if (townRes.error || !townRes.data) return null;

  const { data, error } = await supabase
    .from("tours")
    .select(
      `
      id, town_id, name, slug, description, duration_minutes, distance_meters, cover_image_url,
      tour_stops (
        id, tour_id, location_id, stop_order, stop_narrative,
        locations ( name, slug, short_description, latitude, longitude )
      )
    `
    )
    .eq("slug", slug)
    .eq("town_id", townRes.data.id)
    .eq("is_published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  const row = data as DbTour & { tour_stops?: DbTourStop[] };
  const { tour_stops, ...rest } = row;
  return {
    ...rest,
    stops: [...(tour_stops ?? [])].sort(
      (a, b) => a.stop_order - b.stop_order
    ),
  };
}

/**
 * Fetch tour slugs whose `is_published` flag is true — for the sitemap
 * (docs/i18n-seo-implementation-plan.md, Task 4d: "every published entity").
 *
 * NOT the same as `getPublishedTourSlugs` below, despite the similar name:
 * that function is used by `pages/tours/[slug].tsx`'s `getStaticPaths` and,
 * as of the tour `is_published` gate fix, ALSO filters to `is_published =
 * true` — so the two functions are now aligned in what they return, just
 * with different call sites (sitemap vs. static paths).
 */
export async function getPublishedTourSlugsForSitemap(): Promise<string[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("tours")
    .select("slug")
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  return (data ?? []).map((t: { slug: string }) => t.slug);
}

/**
 * Fetch all tour slugs for getStaticPaths.
 */
export async function getPublishedTourSlugs(): Promise<string[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const townRes = await supabase
    .from("towns")
    .select("id")
    .eq("slug", "barbizon")
    .single();
  if (townRes.error || !townRes.data) return [];

  const { data, error } = await supabase
    .from("tours")
    .select("slug")
    .eq("town_id", townRes.data.id)
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  return (data ?? []).map((t: { slug: string }) => t.slug);
}

/**
 * Fetch a simplified route path for a tour by its slug.
 * Returns every 20th coordinate from the GeoJSON LineString to keep the URL short.
 * Returns null if no matching route exists.
 */
export async function getRouteByTourSlug(
  tourSlug: string
): Promise<[number, number][] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("routes")
    .select("geojson")
    .eq("slug", tourSlug)
    .single();

  if (error || !data?.geojson) return null;

  const line = data.geojson as unknown as GeoJSON.LineString;
  const coords: [number, number][] = (line.coordinates ?? []) as [
    number,
    number,
  ][];
  return coords.filter((_: unknown, i: number) => i % 20 === 0);
}
