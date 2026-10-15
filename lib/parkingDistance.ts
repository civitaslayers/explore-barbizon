// ---------------------------------------------------------------------------
// lib/parkingDistance.ts
//
// Reader for `location_parking_distances` (task 7233da57): walking time and
// distance from a location to each car park, computed by
// scripts/compute-parking-distances.mjs (Mapbox Matrix, walking profile).
// Pure helpers plus one degrade-wrapped read. No React, no Next, no `@/`
// imports — testable with `node --test lib/parkingDistance.test.ts`.
//
// The table is pending apply (migrations/create_location_parking_distances
// .sql). fetchNearestParking returns null on ANY error, including a missing
// table, so a page can render the "minutes from the car park" fact
// conditionally and never a placeholder.
// ---------------------------------------------------------------------------

import type { SupabaseClient } from "@supabase/supabase-js";
import { degrade, type FetchPolicyOptions } from "./fetchPolicy.ts";

export type ParkingDistanceRow = {
  parking_location_id: string;
  walking_seconds: number;
  distance_meters: number;
};

export type NearestParking = ParkingDistanceRow & {
  /** ceil(walking_seconds / 60) — what a visitor is shown. */
  walking_minutes: number;
};

/** Visitor-facing rounding: always up, never 0 for a non-zero walk. */
export function minutesFromSeconds(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.ceil(seconds / 60);
}

function isValidRow(row: unknown): row is ParkingDistanceRow {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.parking_location_id === "string" &&
    typeof r.walking_seconds === "number" &&
    Number.isFinite(r.walking_seconds) &&
    r.walking_seconds >= 0 &&
    typeof r.distance_meters === "number" &&
    Number.isFinite(r.distance_meters) &&
    r.distance_meters >= 0
  );
}

/**
 * Closest car park by walking_seconds; ties broken by distance_meters, then
 * by parking_location_id for determinism. Invalid rows are ignored. Null
 * when there is nothing usable.
 */
export function nearestParking(rows: readonly unknown[]): NearestParking | null {
  let best: ParkingDistanceRow | null = null;
  for (const row of rows) {
    if (!isValidRow(row)) continue;
    if (
      best === null ||
      row.walking_seconds < best.walking_seconds ||
      (row.walking_seconds === best.walking_seconds &&
        (row.distance_meters < best.distance_meters ||
          (row.distance_meters === best.distance_meters &&
            row.parking_location_id < best.parking_location_id)))
    ) {
      best = row;
    }
  }
  if (!best) return null;
  return {
    parking_location_id: best.parking_location_id,
    walking_seconds: best.walking_seconds,
    distance_meters: best.distance_meters,
    walking_minutes: minutesFromSeconds(best.walking_seconds),
  };
}

/**
 * The slice of the supabase-js client this module needs. Typed off the
 * untyped `SupabaseClient` (not `SupabaseClient<Database>`) because the
 * table is pending apply and absent from lib/supabase.types.ts; the real
 * `supabase` export from lib/supabase.ts is assignable as-is. Tests pass a
 * fake chain cast through `unknown`.
 */
export type ParkingDistanceClient = Pick<SupabaseClient, "from">;

/** Shape of the terminal `.eq()` result the fake client must produce. */
export type ParkingDistanceQueryResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};

async function queryParkingRows(
  supabase: ParkingDistanceClient,
  locationId: string
): Promise<unknown[]> {
  const { data, error }: ParkingDistanceQueryResult = await supabase
    .from("location_parking_distances")
    .select("parking_location_id, walking_seconds, distance_meters")
    .eq("location_id", locationId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Nearest car park for a location, or null on any failure (transport error,
 * missing table, no rows). Same degrade pattern as the other secondary
 * reads: one retry, then log and fall back.
 */
export async function fetchNearestParking(
  supabase: ParkingDistanceClient | null,
  locationId: string,
  opts: FetchPolicyOptions = {}
): Promise<NearestParking | null> {
  if (!supabase) return null;
  return degrade(
    `parkingDistance fetchNearestParking:${locationId}`,
    async () => nearestParking(await queryParkingRows(supabase, locationId)),
    null,
    opts
  );
}
