// ---------------------------------------------------------------------------
// lib/walkingRoute.ts
//
// Pure helpers for "My day" v0.1 walking routes via the Mapbox Directions API
// (task 0f159817). ZERO imports — no React, no browser globals at module
// scope, no `@/` paths — so it runs under `node --test`
// (lib/walkingRoute.test.ts). The only browser/React file is
// lib/useWalkingRoute.ts, which composes these pieces.
//
// Privacy contract: the request path carries coordinates only; the query is
// five fixed parameters plus the public token. Nothing else leaves the
// browser. Walking time comes exclusively from the Directions `duration`.
// ---------------------------------------------------------------------------

/** Must equal MY_DAY_MAX_STOPS (lib/myDay.ts) — parity-tested, not imported. */
export const WALKING_ROUTE_MAX_STOPS = 10;
export const WALKING_ROUTE_DEBOUNCE_MS = 400;
export const WALKING_ROUTE_TIMEOUT_MS = 8000;
export const DIRECTIONS_ENDPOINT =
  "https://api.mapbox.com/directions/v5/mapbox/walking/";

export type LngLat = [number, number];
export type RouteLineString = { type: "LineString"; coordinates: LngLat[] };
export type WalkingLeg = { distanceMeters: number; durationSeconds: number };
export type WalkingRoute = {
  legs: WalkingLeg[];
  totalMeters: number;
  totalSeconds: number;
  geometry: RouteLineString;
};
export type WalkingRouteFailure =
  | "too-few-stops"
  | "too-many-stops"
  | "no-token"
  | "offline"
  | "network"
  | "timeout"
  | "aborted"
  | "http"
  | "no-route"
  | "malformed";
export type WalkingRouteResult =
  | { ok: true; route: WalkingRoute }
  | { ok: false; reason: WalkingRouteFailure; status?: number };

export function formatLngLat(c: LngLat): string {
  return `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
}

/** Cache / dedupe key of an ordered coordinate list; "" when < 2 coords. */
export function routeKey(coords: readonly LngLat[]): string {
  if (coords.length < 2) return "";
  return coords.map(formatLngLat).join(";");
}

/** Enforced BEFORE any request is built or sent. Count checks come first. */
export function walkingRoutePrecheck(
  count: number,
  token: string | undefined
): WalkingRouteFailure | null {
  if (count < 2) return "too-few-stops";
  if (count > WALKING_ROUTE_MAX_STOPS) return "too-many-stops";
  if (!token) return "no-token";
  return null;
}

export function buildDirectionsUrl(
  coords: readonly LngLat[],
  token: string
): string {
  const pre = walkingRoutePrecheck(coords.length, token);
  if (pre) throw new RangeError(`buildDirectionsUrl: ${pre}`);
  const path = coords.map(formatLngLat).join(";");
  const query =
    "geometries=geojson&overview=full&steps=false&alternatives=false" +
    `&access_token=${encodeURIComponent(token)}`;
  return `${DIRECTIONS_ENDPOINT}${path}?${query}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isNonNegFinite(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

function isLngLat(v: unknown): v is LngLat {
  return (
    Array.isArray(v) &&
    v.length >= 2 &&
    typeof v[0] === "number" &&
    Number.isFinite(v[0]) &&
    typeof v[1] === "number" &&
    Number.isFinite(v[1])
  );
}

const MALFORMED: WalkingRouteResult = { ok: false, reason: "malformed" };

export function parseDirectionsResponse(
  body: unknown,
  expectedLegs: number
): WalkingRouteResult {
  if (!isRecord(body)) return MALFORMED;
  if (body.code !== "Ok") {
    if (body.code === "NoRoute" || body.code === "NoSegment") {
      return { ok: false, reason: "no-route" };
    }
    return MALFORMED;
  }
  const routes = body.routes;
  if (!Array.isArray(routes) || !isRecord(routes[0])) return MALFORMED;
  const route = routes[0];
  const rawLegs = route.legs;
  if (!Array.isArray(rawLegs) || rawLegs.length !== expectedLegs) {
    return MALFORMED;
  }
  const legs: WalkingLeg[] = [];
  for (const leg of rawLegs) {
    if (!isRecord(leg)) return MALFORMED;
    if (!isNonNegFinite(leg.distance) || !isNonNegFinite(leg.duration)) {
      return MALFORMED;
    }
    legs.push({ distanceMeters: leg.distance, durationSeconds: leg.duration });
  }
  const geometry = route.geometry;
  if (!isRecord(geometry) || geometry.type !== "LineString") return MALFORMED;
  const coordinates = geometry.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return MALFORMED;
  const lineCoords: LngLat[] = [];
  for (const c of coordinates) {
    if (!isLngLat(c)) return MALFORMED;
    lineCoords.push([c[0], c[1]]);
  }
  let totalMeters = 0;
  let totalSeconds = 0;
  for (const leg of legs) {
    totalMeters += leg.distanceMeters;
    totalSeconds += leg.durationSeconds;
  }
  return {
    ok: true,
    route: {
      legs,
      totalMeters,
      totalSeconds,
      geometry: { type: "LineString", coordinates: lineCoords },
    },
  };
}

type FetchLike = (
  url: string,
  init: { method: "GET"; signal: AbortSignal }
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export async function fetchWalkingRoute(
  coords: readonly LngLat[],
  token: string,
  signal: AbortSignal,
  fetchImpl: FetchLike = fetch
): Promise<WalkingRouteResult> {
  const pre = walkingRoutePrecheck(coords.length, token);
  if (pre) return { ok: false, reason: pre };
  const url = buildDirectionsUrl(coords, token);
  let res: Awaited<ReturnType<FetchLike>>;
  try {
    // No custom headers, no referrerPolicy override: the site-wide
    // strict-origin-when-cross-origin policy already trims the Referer.
    res = await fetchImpl(url, { method: "GET", signal });
  } catch {
    return { ok: false, reason: signal.aborted ? "aborted" : "network" };
  }
  if (!res.ok) return { ok: false, reason: "http", status: res.status };
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return MALFORMED;
  }
  return parseDirectionsResponse(body, coords.length - 1);
}

export type RouteFetcher = (
  coords: readonly LngLat[],
  signal: AbortSignal
) => Promise<WalkingRouteResult>;

export type RouteScheduler = {
  request(key: string, coords: readonly LngLat[]): void;
  cancel(): void;
};

/**
 * Debounce + abort + timeout, with no browser dependency beyond
 * setTimeout/AbortController (both available under node:test). A request
 * supersedes any pending or in-flight one; superseded results are never
 * delivered.
 */
export function createRouteScheduler(
  fetcher: RouteFetcher,
  onResult: (key: string, result: WalkingRouteResult) => void,
  opts: { delayMs?: number; timeoutMs?: number } = {}
): RouteScheduler {
  const delayMs = opts.delayMs ?? WALKING_ROUTE_DEBOUNCE_MS;
  const timeoutMs = opts.timeoutMs ?? WALKING_ROUTE_TIMEOUT_MS;
  let pending: ReturnType<typeof setTimeout> | null = null;
  let inflight: AbortController | null = null;

  const abortInflight = () => {
    if (inflight) {
      inflight.abort();
      inflight = null;
    }
  };

  const fire = (key: string, coords: readonly LngLat[]) => {
    const controller = new AbortController();
    inflight = controller;
    const { signal } = controller;
    let kill: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      kill = null;
      if (signal.aborted) return;
      controller.abort();
      if (inflight === controller) inflight = null;
      onResult(key, { ok: false, reason: "timeout" });
    }, timeoutMs);
    const clearKill = () => {
      if (kill !== null) {
        clearTimeout(kill);
        kill = null;
      }
    };
    // Superseded or cancelled: the kill timer has nothing left to guard.
    signal.addEventListener("abort", clearKill);
    const settle = (result: WalkingRouteResult) => {
      clearKill();
      if (signal.aborted) return;
      if (inflight === controller) inflight = null;
      onResult(key, result);
    };
    fetcher(coords, signal).then(settle, () => {
      settle({ ok: false, reason: signal.aborted ? "aborted" : "network" });
    });
  };

  return {
    request(key, coords) {
      if (pending !== null) clearTimeout(pending);
      abortInflight();
      pending = setTimeout(() => {
        pending = null;
        fire(key, coords);
      }, delayMs);
    },
    cancel() {
      if (pending !== null) {
        clearTimeout(pending);
        pending = null;
      }
      abortInflight();
    },
  };
}

const NBSP = " ";

/** "12 min" / "1 h" / FR "1 h 05", EN "1 h 05 min"; NBSP before each unit. */
export function formatDuration(seconds: number, locale: string): string {
  const m = Math.max(1, Math.round(seconds / 60));
  if (m < 60) return `${m}${NBSP}min`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (mm === 0) return `${h}${NBSP}h`;
  const padded = String(mm).padStart(2, "0");
  if (locale === "fr") return `${h}${NBSP}h${NBSP}${padded}`;
  return `${h}${NBSP}h${NBSP}${padded}${NBSP}min`;
}
