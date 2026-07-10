import type { GetServerSideProps, NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DEFAULT_LIGHT_PRESET } from "@/lib/mapLight";
import {
  GROUP_COLORS,
  GROUP_NAMES,
  getCategoryGroup,
  type GroupName,
} from "@/lib/categoryGroups";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AdminPin = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  isPublished: boolean;
  allowOverride: boolean;
  group: GroupName;
  color: string;
};

type NextPageWithLayout<P> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type PinsPageProps = {
  pins: AdminPin[];
};

type DragConfirmState = {
  pinId: string;
  lat: number;
  lng: number;
  distanceMeters: number;
};

type ProximityState = {
  pinId: string;
  lat: number;
  lng: number;
  neighborName: string;
  neighborSlug: string | null;
  rawError: string;
};

type ToastState =
  | {
      kind: "success";
      pinId: string;
      before: { lat: number; lng: number };
      after: { lat: number; lng: number };
    }
  | { kind: "error"; message: string };

// ---------------------------------------------------------------------------
// getServerSideProps — supabaseAdmin is referenced ONLY inside this function.
// ---------------------------------------------------------------------------

type LocationJoinRow = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  is_published: boolean | null;
  show_on_map: boolean | null;
  allow_proximity_override: boolean | null;
  categories: { name: string; layer: string } | null;
};

export const getServerSideProps: GetServerSideProps<PinsPageProps> = async () => {
  const { data, error } = await supabaseAdmin
    .from("locations")
    .select(
      "id, name, slug, latitude, longitude, is_published, show_on_map, allow_proximity_override, categories(name, layer)"
    )
    .overrideTypes<LocationJoinRow[]>();

  if (error) throw new Error(error.message);

  const pins: AdminPin[] = (data ?? []).map((row) => {
    const categoryName = row.categories?.name ?? "Point of Interest";
    const categoryLayer = row.categories?.layer ?? null;
    const group = getCategoryGroup(categoryName, categoryLayer);
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      latitude: row.latitude,
      longitude: row.longitude,
      isPublished: row.is_published ?? false,
      allowOverride: row.allow_proximity_override ?? false,
      group,
      color: GROUP_COLORS[group],
    };
  });

  return { props: { pins } };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function haversineMeters(
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

function parseProximityError(message: string): {
  name: string;
  slug: string | null;
} {
  const match = NEIGHBOR_PATTERN.exec(message);
  return { name: match?.[1] ?? "another pin", slug: match?.[2] ?? null };
}

async function patchLocation(
  id: string,
  body: Record<string, unknown>
): Promise<{
  ok: boolean;
  status: number;
  data: {
    before?: { lat: number; lng: number };
    after?: { lat: number; lng: number };
    error?: string;
    proximity?: boolean;
  };
}> {
  const res = await fetch(`/api/locations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // Never assume the body is JSON. A framework-level 404/500 (e.g. a route that
  // failed to compile, or an unhandled handler exception) returns an HTML error
  // page; calling res.json() on it throws, and that throw was previously
  // swallowed upstream — the exact silent-failure this editor suffered from.
  // Read as text and parse defensively so a non-JSON reply still surfaces a
  // readable error. (fail-loudly rule)
  const raw = await res.text();
  let data: {
    before?: { lat: number; lng: number };
    after?: { lat: number; lng: number };
    error?: string;
    proximity?: boolean;
  };
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const PinsPage: NextPageWithLayout<PinsPageProps> = ({ pins: initialPins }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const pinsRef = useRef<Map<string, AdminPin>>(new Map());

  const [pins, setPins] = useState<AdminPin[]>(initialPins);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroups, setActiveGroups] = useState<Set<GroupName>>(
    () => new Set(GROUP_NAMES)
  );
  const [dragState, setDragState] = useState<DragConfirmState | null>(null);
  const [dragBusy, setDragBusy] = useState(false);
  const [proximityState, setProximityState] = useState<ProximityState | null>(
    null
  );
  const [proximityBusy, setProximityBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [revertBusy, setRevertBusy] = useState(false);

  // Keep an always-current lookup map for imperative handlers (map event
  // callbacks close over refs, never over render-scoped state directly).
  useEffect(() => {
    pinsRef.current = new Map(pins.map((p) => [p.id, p]));
  }, [pins]);

  const snapMarkerBack = useCallback((pinId: string) => {
    const pin = pinsRef.current.get(pinId);
    const marker = markersRef.current.get(pinId);
    if (pin && marker) marker.setLngLat([pin.longitude, pin.latitude]);
  }, []);

  const handleDragEnd = useCallback((pinId: string) => {
    const marker = markersRef.current.get(pinId);
    const pin = pinsRef.current.get(pinId);
    if (!marker || !pin) return;
    const { lat, lng } = marker.getLngLat();
    const distanceMeters = haversineMeters(pin.latitude, pin.longitude, lat, lng);
    setDragState({ pinId, lat, lng, distanceMeters });
  }, []);

  // Map init — runs once on mount.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/standard",
      config: {
        basemap: {
          lightPreset: DEFAULT_LIGHT_PRESET,
          show3dObjects: true,
          showPointOfInterestLabels: false,
          showTransitLabels: false,
        },
      },
      center: [2.6065, 48.4455],
      zoom: 15,
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      initialPins.forEach((pin) => {
        const el = document.createElement("div");
        el.style.width = "16px";
        el.style.height = "16px";
        el.style.borderRadius = "50%";
        el.style.background = pin.color;
        el.style.border = "2px solid #F5F1E8";
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.28)";
        el.style.cursor = "grab";
        if (!pin.isPublished) el.style.opacity = "0.5";

        const marker = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat([pin.longitude, pin.latitude])
          .addTo(map);

        marker.on("dragend", () => handleDragEnd(pin.id));
        markersRef.current.set(pin.id, marker);
      });

      if (initialPins.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        initialPins.forEach((p) => bounds.extend([p.longitude, p.latitude]));
        map.fitBounds(bounds, { padding: 60, duration: 0 });
      }
    });

    const markers = markersRef.current;
    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // Markers are created once from the server-loaded pin list; later
    // coordinate changes are applied imperatively via marker.setLngLat,
    // not by re-running this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search + layer-filter visibility.
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    pins.forEach((pin) => {
      const marker = markersRef.current.get(pin.id);
      if (!marker) return;
      const matchesSearch = query === "" || pin.name.toLowerCase().includes(query);
      const matchesGroup = activeGroups.has(pin.group);
      marker.getElement().style.display = matchesSearch && matchesGroup ? "" : "none";
    });
  }, [pins, searchQuery, activeGroups]);

  const toggleGroup = (group: GroupName) => {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const applySuccessfulPatch = useCallback(
    (
      pinId: string,
      before: { lat: number; lng: number },
      after: { lat: number; lng: number },
      extra?: Partial<AdminPin>
    ) => {
      setPins((prev) =>
        prev.map((p) =>
          p.id === pinId
            ? { ...p, latitude: after.lat, longitude: after.lng, ...extra }
            : p
        )
      );
      const marker = markersRef.current.get(pinId);
      marker?.setLngLat([after.lng, after.lat]);
      setToast({ kind: "success", pinId, before, after });
    },
    []
  );

  const handleCancelDrag = () => {
    if (!dragState) return;
    snapMarkerBack(dragState.pinId);
    setDragState(null);
  };

  const handleConfirmDrag = async () => {
    if (!dragState) return;
    const { pinId, lat, lng } = dragState;
    setDragBusy(true);
    try {
      const res = await patchLocation(pinId, { latitude: lat, longitude: lng });
      if (res.status === 409 || res.data.proximity) {
        const { name, slug } = parseProximityError(res.data.error ?? "");
        setProximityState({
          pinId,
          lat,
          lng,
          neighborName: name,
          neighborSlug: slug,
          rawError: res.data.error ?? "",
        });
        setDragState(null);
        return;
      }
      if (!res.ok || !res.data.before || !res.data.after) {
        snapMarkerBack(pinId);
        setToast({
          kind: "error",
          message: `Save failed (HTTP ${res.status}): ${
            res.data.error ?? "Update failed"
          }`,
        });
        setDragState(null);
        return;
      }
      applySuccessfulPatch(pinId, res.data.before, res.data.after);
      setDragState(null);
    } catch (err) {
      // fail-loudly: a thrown fetch/parse error must never be silent.
      snapMarkerBack(pinId);
      setToast({
        kind: "error",
        message: `Save failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
      setDragState(null);
    } finally {
      setDragBusy(false);
    }
  };

  const handleCancelProximity = () => {
    if (!proximityState) return;
    snapMarkerBack(proximityState.pinId);
    setProximityState(null);
  };

  const handleConfirmOverride = async () => {
    if (!proximityState) return;
    const { pinId, lat, lng, neighborSlug } = proximityState;
    setProximityBusy(true);
    try {
      const neighbor = neighborSlug
        ? Array.from(pinsRef.current.values()).find((p) => p.slug === neighborSlug)
        : undefined;

      if (!neighbor) {
        setToast({
          kind: "error",
          message: `Could not resolve neighbor pin "${neighborSlug ?? "unknown"}" locally.`,
        });
        setProximityState(null);
        return;
      }

      // 1. Flag the neighbor first.
      const neighborRes = await patchLocation(neighbor.id, {
        allow_proximity_override: true,
      });
      if (!neighborRes.ok) {
        setToast({
          kind: "error",
          message: `Failed to flag neighbor pin (HTTP ${neighborRes.status}): ${
            neighborRes.data.error ?? "unknown error"
          }`,
        });
        setProximityState(null);
        return;
      }
      setPins((prev) =>
        prev.map((p) => (p.id === neighbor.id ? { ...p, allowOverride: true } : p))
      );

      // 2. Retry the dragged pin with the override flag set.
      const draggedRes = await patchLocation(pinId, {
        latitude: lat,
        longitude: lng,
        allow_proximity_override: true,
      });

      if (draggedRes.status === 409 || draggedRes.data.proximity) {
        const { name, slug } = parseProximityError(draggedRes.data.error ?? "");
        setProximityState({
          pinId,
          lat,
          lng,
          neighborName: name,
          neighborSlug: slug,
          rawError: draggedRes.data.error ?? "",
        });
        return;
      }

      if (!draggedRes.ok || !draggedRes.data.before || !draggedRes.data.after) {
        snapMarkerBack(pinId);
        setToast({
          kind: "error",
          message: `Override save failed (HTTP ${draggedRes.status}): ${
            draggedRes.data.error ?? "Update failed"
          }`,
        });
        setProximityState(null);
        return;
      }

      applySuccessfulPatch(pinId, draggedRes.data.before, draggedRes.data.after, {
        allowOverride: true,
      });
      setProximityState(null);
    } catch (err) {
      // fail-loudly: a thrown fetch/parse error must never be silent.
      snapMarkerBack(pinId);
      setToast({
        kind: "error",
        message: `Override failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
      setProximityState(null);
    } finally {
      setProximityBusy(false);
    }
  };

  const handleRevert = async () => {
    if (!toast || toast.kind !== "success") return;
    const { pinId, before } = toast;
    setRevertBusy(true);
    try {
      const res = await patchLocation(pinId, {
        latitude: before.lat,
        longitude: before.lng,
      });
      if (res.status === 409 || res.data.proximity) {
        const { name, slug } = parseProximityError(res.data.error ?? "");
        setProximityState({
          pinId,
          lat: before.lat,
          lng: before.lng,
          neighborName: name,
          neighborSlug: slug,
          rawError: res.data.error ?? "",
        });
        setToast(null);
        return;
      }
      if (!res.ok || !res.data.before || !res.data.after) {
        setToast({
          kind: "error",
          message: `Revert failed (HTTP ${res.status}): ${
            res.data.error ?? "Revert failed"
          }`,
        });
        return;
      }
      applySuccessfulPatch(pinId, res.data.before, res.data.after);
    } catch (err) {
      // fail-loudly: a thrown fetch/parse error must never be silent.
      setToast({
        kind: "error",
        message: `Revert failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
    } finally {
      setRevertBusy(false);
    }
  };

  const dragPinName = dragState ? pinsRef.current.get(dragState.pinId)?.name : null;
  const toastPinName =
    toast?.kind === "success" ? pinsRef.current.get(toast.pinId)?.name : null;

  return (
    <div className="relative h-screen w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Search + layer filters */}
      <div className="card absolute left-4 top-4 z-10 w-72 space-y-3 p-4">
        <p className="eyebrow">Pin Editor</p>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name…"
          className="w-full rounded-full bg-ink/5 px-4 py-2 text-sm text-ink placeholder:text-ink/35 outline-none focus:bg-ink/10 transition-colors duration-200 ease-soft"
        />
        <div className="flex flex-wrap gap-2">
          {GROUP_NAMES.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => toggleGroup(group)}
              className={`chip transition-opacity duration-200 ease-soft ${
                activeGroups.has(group) ? "opacity-100" : "opacity-35"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-ink/35">
          {pins.length} pins loaded — drafts shown at 50% opacity
        </p>
      </div>

      {/* Drag confirmation popover */}
      {dragState && (
        <div className="card shadow-card fixed bottom-8 left-1/2 z-20 w-96 -translate-x-1/2 p-5">
          <p className="eyebrow mb-1">Confirm move</p>
          <p className="heading-lg mb-3">{dragPinName ?? "Pin"}</p>
          <div className="mb-3 space-y-1 text-sm text-ink/70">
            <p>
              Old: {pinsRef.current.get(dragState.pinId)?.latitude.toFixed(6)},{" "}
              {pinsRef.current.get(dragState.pinId)?.longitude.toFixed(6)}
            </p>
            <p>
              New: {dragState.lat.toFixed(6)}, {dragState.lng.toFixed(6)}
            </p>
            <p className="text-ink/45">
              Moved {dragState.distanceMeters.toFixed(1)} m
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancelDrag}
              disabled={dragBusy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmDrag}
              disabled={dragBusy}
            >
              {dragBusy ? "Saving…" : "Confirm"}
            </button>
          </div>
        </div>
      )}

      {/* Proximity guard popover */}
      {proximityState && (
        <div className="card shadow-card fixed bottom-8 left-1/2 z-20 w-96 -translate-x-1/2 p-5">
          <p className="eyebrow mb-1">Proximity guard</p>
          <p className="text-sm text-ink/70 mb-3">
            This position is within 15m of an existing pin,{" "}
            <span className="text-ink">{proximityState.neighborName}</span>.
            Overriding will flag both pins as an intentional close pair.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancelProximity}
              disabled={proximityBusy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmOverride}
              disabled={proximityBusy}
            >
              {proximityBusy ? "Overriding…" : "Confirm override"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="card shadow-card fixed bottom-8 right-8 z-20 w-80 p-4">
          {toast.kind === "success" ? (
            <>
              <p className="eyebrow mb-1">Saved</p>
              <p className="text-sm text-ink mb-1">{toastPinName ?? "Pin"} moved to</p>
              <p className="text-sm text-ink/70 mb-3">
                {toast.after.lat.toFixed(6)}, {toast.after.lng.toFixed(6)}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setToast(null)}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRevert}
                  disabled={revertBusy}
                >
                  {revertBusy ? "Reverting…" : "Revert"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow mb-1">Error</p>
              <p className="text-sm text-ink/70 mb-3">{toast.message}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setToast(null)}
                >
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

PinsPage.getLayout = (page: ReactElement) => (
  <CommandCenterLayout>{page}</CommandCenterLayout>
);

export default PinsPage;
