import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";
import type { Place, PlaceCategory } from "@/data/places";

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase client. Null when env vars are not configured.
 * All helper functions below check for null and throw — callers are expected
 * to catch and fall back to static data from data/places.ts.
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

/** Shape returned by the joined query (locations + categories.name). */
type LocationRow = DbLocation & {
  categories: { name: string } | null;
};

// ---------------------------------------------------------------------------
// Adapter: LocationRow → Place
// Maps DB snake_case fields to the app-level Place type.
// ---------------------------------------------------------------------------

function toPlace(row: LocationRow): Place {
  return {
    slug: row.slug,
    name: row.name,
    // address is the closest DB field to the display "location" string
    location: row.address ?? "Barbizon",
    shortDescription: row.short_description ?? "",
    description: row.full_description ?? "",
    // narrative maps to the history/context field on the place page
    history: row.narrative ?? null,
    // heroImage comes from the media table (not yet wired); pages handle null
    heroImage: (row.media ?? []).sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null,
    // category comes from the joined categories.name — cast to PlaceCategory
    category: (row.categories?.name ?? "Studio") as PlaceCategory,
    latitude: row.latitude,
    longitude: row.longitude,
    route_slug: row.route_slug ?? null,
  };
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Fetch all published locations (all categories). Used for the map.
 * Throws if Supabase is not configured or the query fails.
 */
export async function getPublishedLocations(): Promise<Place[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("locations")
    .select("*, categories!inner(name, layer), media(url, display_order)")
    .eq("is_published", true)
    .neq("categories.layer", "Practical")
    .order("name");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("No published locations");
  return (data as LocationRow[]).map(toPlace);
}

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
};

export async function getMapPins(): Promise<MapPin[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data: locsData, error: locsError } = await supabase
    .from("locations")
    .select("slug, name, short_description, latitude, longitude, route_slug, categories!inner(name, layer)")
    .eq("is_published", true)
    .neq("categories.layer", "Practical");

  if (locsError) throw new Error(locsError.message);

  return ((locsData ?? []) as any[]).map((row) => ({
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    latitude: row.latitude,
    longitude: row.longitude,
    category: (row.categories as any)?.name ?? "Point of Interest",
    allCategories: [(row.categories as any)?.name ?? "Point of Interest"],
    placeSlug: null,
    routeSlug: row.route_slug ?? null,
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
 * Fetch a single published location by slug, joined with category name.
 * Returns null if not found.
 * Throws if Supabase is not configured or the query fails.
 */
export async function getLocationBySlug(slug: string): Promise<Place | null> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("locations")
    .select("*, categories(name), media(url, display_order)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    // PGRST116 = no rows found — not a query error, just no match
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data ? toPlace(data as LocationRow) : null;
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
  functions: LocationFunction[];
  heroImage: string | null;
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
      short_description, narrative, is_published,
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
    functions,
    heroImage,
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
    .eq("town_id", townRes.data.id);

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
