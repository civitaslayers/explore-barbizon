// ---------------------------------------------------------------------------
// lib/useWalkingRoute.ts
//
// The ONLY browser/React file of the "My day" v0.1 walking routes (task
// 0f159817). Owns the public token, a bounded success cache, the online
// check and React state; all logic lives in lib/walkingRoute.ts (tested).
//
// One debounced request per change of the ORDERED coordinate list — never
// per render, never on panel/layer toggles (the effect depends on the string
// key, not array identity). The 10-stop cap is checked before any request.
// Every failure resolves to `fallback`, which the UI renders exactly like v0.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import {
  createRouteScheduler,
  fetchWalkingRoute,
  routeKey,
  walkingRoutePrecheck,
  type LngLat,
  type RouteScheduler,
  type WalkingRoute,
  type WalkingRouteFailure,
  type WalkingRouteResult,
} from "./walkingRoute";

// Literal reference so Next inlines the public token at build time.
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const CACHE_MAX = 20;
const cache = new Map<string, WalkingRoute>();

function remember(key: string, route: WalkingRoute): void {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, route);
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

export type WalkingRouteState =
  | { status: "idle"; route: null }
  | { status: "loading"; route: null }
  | { status: "fallback"; route: null; reason: WalkingRouteFailure }
  | { status: "routed"; route: WalkingRoute };

type Settled = { key: string; result: WalkingRouteResult };

// Offline short-circuit sits inside the fetcher so nothing leaves the browser
// while offline, and the fallback still arrives through the scheduler's
// async onResult path (no synchronous setState inside an effect).
function fetcher(coords: readonly LngLat[], signal: AbortSignal) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return Promise.resolve<WalkingRouteResult>({ ok: false, reason: "offline" });
  }
  return fetchWalkingRoute(coords, TOKEN, signal);
}

export function useWalkingRoute(
  stops: readonly { latitude: number; longitude: number }[]
): WalkingRouteState {
  const coords: LngLat[] = stops.map((s) => [s.longitude, s.latitude]);
  const key = routeKey(coords);
  const coordsRef = useRef(coords);
  const schedulerRef = useRef<RouteScheduler | null>(null);
  const [settled, setSettled] = useState<Settled | null>(null);
  const [onlineTick, setOnlineTick] = useState(0);

  // Pure, render-time derivations: the cap/token precheck and the cache are
  // deterministic for a given key, so they need no state round-trip.
  const precheck = walkingRoutePrecheck(coords.length, TOKEN);
  const cached = precheck === null ? cache.get(key) : undefined;

  // Declared before the key effect: effects run in order, so the key effect
  // always reads the coordinates of the render that produced `key`.
  useEffect(() => {
    coordsRef.current = coords;
  });

  useEffect(() => {
    const scheduler = createRouteScheduler(fetcher, (k, r) => {
      if (r.ok) {
        remember(k, r.route);
      } else if (process.env.NODE_ENV !== "production") {
        console.warn("[my-day] walking route fallback:", r.reason, r.status);
      }
      setSettled({ key: k, result: r });
    });
    schedulerRef.current = scheduler;
    // Back online: routed keys hit the cache (no request); fallback keys retry.
    const onOnline = () => setOnlineTick((n) => n + 1);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("online", onOnline);
      scheduler.cancel();
      schedulerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scheduler = schedulerRef.current;
    if (!scheduler) return;
    const current = coordsRef.current;
    if (walkingRoutePrecheck(current.length, TOKEN) !== null || cache.has(key)) {
      scheduler.cancel();
      return;
    }
    scheduler.request(key, current);
  }, [key, onlineTick]);

  if (key === "") return { status: "idle", route: null };
  if (precheck !== null) return { status: "fallback", route: null, reason: precheck };
  if (cached) return { status: "routed", route: cached };
  if (!settled || settled.key !== key) return { status: "loading", route: null };
  if (settled.result.ok) return { status: "routed", route: settled.result.route };
  return { status: "fallback", route: null, reason: settled.result.reason };
}
