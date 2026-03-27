import { createClient } from "@supabase/supabase-js";
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
    ? createClient(supabaseUrl, supabaseAnonKey)
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
  updated_at: string | null;
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
    heroImage: null,
    // category comes from the joined categories.name — cast to PlaceCategory
    category: (row.categories?.name ?? "Studio") as PlaceCategory,
    latitude: row.latitude,
    longitude: row.longitude,
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

  // Step 1: get all non-practical category IDs
  const { data: cats } = await supabase
    .from("categories")
    .select("id")
    .neq("layer", "Practical");

  const allowedIds = (cats ?? []).map((c: { id: string }) => c.id);

  // Step 2: fetch locations filtered to those categories
  const { data, error } = await supabase
    .from("locations")
    .select("*, categories(name)")
    .eq("is_published", true)
    .in("category_id", allowedIds)
    .order("name");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("No published locations");
  return (data as LocationRow[]).map(toPlace);
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
};

export async function getPublishedRoutes(): Promise<Route[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("routes")
    .select("id, name, slug, description, distance_meters, duration_minutes, difficulty, geojson, start_lat, start_lng")
    .eq("is_published", true)
    .order("name");
  if (error) return [];
  return (data ?? []) as Route[];
}

/**
 * Fetch published locations for the editorial places listing.
 * Excludes utility categories (Parking, Bus Stop, etc.) via categories.show_in_editorial.
 * Requires: `alter table categories add column show_in_editorial boolean not null default true`
 * Throws if Supabase is not configured or the query fails.
 */
export async function getEditorialLocations(): Promise<Place[]> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("locations")
    .select("*, categories!inner(name, show_in_editorial)")
    .eq("is_published", true)
    .eq("show_in_editorial", true)
    .eq("categories.show_in_editorial", true)
    .order("name");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("No editorial locations");

  return (data as LocationRow[]).map(toPlace);
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
    .select("*, categories(name)")
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
