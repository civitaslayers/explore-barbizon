// ---------------------------------------------------------------------------
// lib/atlasMap.ts
//
// Pure, behaviour-free helpers shared between AtlasMapView (multi-marker,
// stacks, search/filter) and FichePositionMap (single-marker mini-map).
// docs/ccc-v3-phase2-implementation-plan.md item 8 / §3.8:
//
//   "Do NOT edit AtlasMapView.tsx in Phase 2. It shipped with 10/10 verified
//    parity; touching it risks regressing the map editor right as pins.tsx
//    (its diff reference) is being deleted. [...] the hard rule is: do not
//    fork the imperative single-marker vs multi-marker drag lifecycle across
//    two files by copy-paste — share the pure helpers via lib/atlasMap.ts."
//
// These are intentionally IDENTICAL copies of the pure functions already
// living in components/command-center/AtlasMapView.tsx (haversineMeters,
// parseProximityError, patchLocation) plus the map-init constants — not a
// refactor, not an import from AtlasMapView (which stays untouched this
// phase). Any future de-dup of AtlasMapView's own copies is deferred to
// Phase 3, per the plan.
// ---------------------------------------------------------------------------

import { DEFAULT_LIGHT_PRESET } from "@/lib/mapLight";

export const ATLAS_MAP_STYLE = "mapbox://styles/mapbox/standard";
export { DEFAULT_LIGHT_PRESET };

export const ATLAS_MAP_BASEMAP_CONFIG = {
  lightPreset: DEFAULT_LIGHT_PRESET,
  show3dObjects: true,
  showPointOfInterestLabels: false,
  showTransitLabels: false,
} as const;

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NEIGHBOR_PATTERN = /existing pin "([^"]+)" \(slug: ([^)]+)\)/;

export function parseProximityError(message: string): {
  name: string;
  slug: string | null;
} {
  const match = NEIGHBOR_PATTERN.exec(message);
  return { name: match?.[1] ?? "another pin", slug: match?.[2] ?? null };
}

export type PatchLocationResponse = {
  ok: boolean;
  status: number;
  data: {
    before?: { lat: number; lng: number };
    after?: { lat: number; lng: number };
    error?: string;
    proximity?: boolean;
    committed?: boolean;
  };
};

export async function patchLocation(
  id: string,
  body: Record<string, unknown>
): Promise<PatchLocationResponse> {
  const res = await fetch(`/api/locations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // Never assume the body is JSON — a framework-level 404/500 returns an HTML
  // error page; calling res.json() on it throws. Read as text and parse
  // defensively so a non-JSON reply still surfaces a readable error
  // (fail-loudly rule, mirrored from AtlasMapView.tsx).
  const raw = await res.text();
  let data: PatchLocationResponse["data"];
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {
      error: `Non-JSON response from server (HTTP ${res.status}): ${raw
        .slice(0, 200)
        .replace(/\s+/g, " ")
        .trim()}`,
    };
  }
  return { ok: res.ok, status: res.status, data };
}
