// ---------------------------------------------------------------------------
// lib/myDay.ts
//
// Pure helpers for the "My day" planner layer (task 3c5b17b5). No React, no
// browser APIs, no `@/` imports — runs under `node --test` (lib/myDay.test.ts).
// All distances are straight-line (haversine) from stored coordinates only.
// ---------------------------------------------------------------------------

export const MY_DAY_STORAGE_KEY = "eb.myDay.v1";
export const MY_DAY_QUERY_PARAM = "day";
export const MY_DAY_MAX_STOPS = 10;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Keep valid, unique slugs (first occurrence wins), capped at MAX_STOPS. */
export function sanitizeSlugs(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const item of input) {
    if (typeof item !== "string" || !SLUG_RE.test(item)) continue;
    if (out.includes(item)) continue;
    out.push(item);
    if (out.length >= MY_DAY_MAX_STOPS) break;
  }
  return out;
}

/** Parse the `?day=` query value (comma or %2C separated). */
export function parseDayParam(raw: string | string[] | undefined): string[] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || value === "") return [];
  return sanitizeSlugs(value.split(/,|%2C/i));
}

export function buildDayParam(slugs: string[]): string {
  return slugs.join(",");
}

export type LatLng = { latitude: number; longitude: number };

const EARTH_RADIUS_M = 6371008.8;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) *
      Math.cos(b.latitude * rad) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distance of each leg; length = stops.length - 1 (0 when < 2 stops). */
export function legDistancesMeters(stops: LatLng[]): number[] {
  const legs: number[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    legs.push(haversineMeters(stops[i], stops[i + 1]));
  }
  return legs;
}

export function totalMeters(stops: LatLng[]): number {
  return legDistancesMeters(stops).reduce((sum, d) => sum + d, 0);
}

/** Nearest-neighbour order, first stop fixed. Suggestion only. */
export function suggestOrder<T extends LatLng>(stops: T[]): T[] {
  if (stops.length < 3) return stops.slice();
  const remaining = stops.slice(1);
  const ordered: T[] = [stops[0]];
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineMeters(last, remaining[i]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    ordered.push(remaining.splice(best, 1)[0]);
  }
  return ordered;
}

export type PopupDayToggleState = "hidden" | "in-day" | "full" | "add";

// State of the "Add to my day" button in a map pin popup. While a shared day
// is displayed the button is hidden: it would otherwise edit the visitor's
// stored day, which is not on screen. Saving a shared day goes through the
// panel's explicit save/replace action only.
export function popupDayToggleState(
  slug: string,
  ownSlugs: readonly string[],
  ownFull: boolean,
  viewingShared: boolean
): PopupDayToggleState {
  if (viewingShared) return "hidden";
  if (ownSlugs.includes(slug)) return "in-day";
  return ownFull ? "full" : "add";
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= arr.length ||
    to >= arr.length
  ) {
    return arr.slice();
  }
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

const NBSP = " ";

/** "350 m" under 1 km (rounded to 10 m), else "1,2 km"; NBSP before the unit. */
export function formatDistance(meters: number, locale: string): string {
  if (meters < 1000) {
    const rounded = Math.round(meters / 10) * 10;
    if (rounded < 1000) return `${rounded}${NBSP}m`;
  }
  const km = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(meters / 1000);
  return `${km}${NBSP}km`;
}
