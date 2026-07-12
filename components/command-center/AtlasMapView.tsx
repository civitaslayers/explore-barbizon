import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DEFAULT_LIGHT_PRESET } from "@/lib/mapLight";
import { GROUP_NAMES, type GroupName } from "@/lib/categoryGroups";
import type { AtlasLocation } from "@/lib/atlasTypes";

// ---------------------------------------------------------------------------
// AtlasMapView — wholesale extraction of pages/command-center/pins.tsx's
// imperative Mapbox marker management (docs/ccc-v3-phase1-implementation-plan.md
// Section 2). Copied, not refactored; the only sanctioned behavioural change
// is replacing the old ad-hoc `inspectPinId` inspector with `onSelect(id)`,
// which now drives the shared `?sel=` URL state and LocationPreviewCard.
// pins.tsx itself stays live and unchanged as the diff reference / fallback.
// ---------------------------------------------------------------------------

type AdminPin = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  address: string | null;
  isPublished: boolean;
  allowOverride: boolean;
  group: GroupName;
  color: string;
};

function narrowLocations(locations: AtlasLocation[]): AdminPin[] {
  return locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    slug: loc.slug,
    latitude: loc.latitude,
    longitude: loc.longitude,
    address: loc.address,
    isPublished: loc.isPublished,
    allowOverride: loc.allowProximityOverride,
    group: loc.group,
    color: loc.color,
  }));
}

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
// Helpers — copied verbatim from pins.tsx.
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

// Pins closer than this to each other are treated as a visual "stack" and
// fanned apart so both are clickable (real coordinates are never touched).
const STACK_THRESHOLD_M = 2.5;
const FAN_RADIUS_PX = 18;

type StackInfo = {
  size: number;
  offset: [number, number];
  members: string[]; // pin ids in the same cluster (incl. self)
};

// Cluster pins by physical proximity, then assign each member of a 2+ cluster a
// pixel offset on a small upward fan. Pure geometry, computed once at load.
function computeStacks(pins: AdminPin[]): Map<string, StackInfo> {
  const clusters: AdminPin[][] = [];
  for (const pin of pins) {
    const cluster = clusters.find(
      (c) =>
        haversineMeters(
          c[0].latitude,
          c[0].longitude,
          pin.latitude,
          pin.longitude
        ) <= STACK_THRESHOLD_M
    );
    if (cluster) cluster.push(pin);
    else clusters.push([pin]);
  }

  const info = new Map<string, StackInfo>();
  for (const cluster of clusters) {
    if (cluster.length < 2) continue;
    const n = cluster.length;
    const members = cluster.map((p) => p.id);
    cluster.forEach((pin, i) => {
      const angle = -Math.PI / 2 + (i - (n - 1) / 2) * (Math.PI / 5);
      const offset: [number, number] = [
        FAN_RADIUS_PX * Math.cos(angle),
        FAN_RADIUS_PX * Math.sin(angle),
      ];
      info.set(pin.id, { size: n, offset, members });
    });
  }
  return info;
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
  // Never assume the body is JSON. A framework-level 404/500 (e.g. a route
  // that failed to compile, or an unhandled handler exception) returns an
  // HTML error page; calling res.json() on it throws, and that throw was
  // previously swallowed upstream — the exact silent-failure this editor
  // suffered from. Read as text and parse defensively so a non-JSON reply
  // still surfaces a readable error. (fail-loudly rule)
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
// Component
// ---------------------------------------------------------------------------

export function AtlasMapView({
  locations,
  selectedId,
  onSelect,
  hoveredId,
  centerRequest,
}: {
  locations: AtlasLocation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hoveredId?: string | null;
  centerRequest?: number;
}) {
  const initialPins = useMemo(() => narrowLocations(locations), [locations]);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const pinsRef = useRef<Map<string, AdminPin>>(new Map());
  // pinId -> the ids of every marker in its visual stack (incl. self).
  const stackClustersRef = useRef<Map<string, string[]>>(new Map());
  // Imperative map-event callbacks close over refs, never render-scoped
  // state/props directly — keep onSelect current without re-running the
  // mount-once map-init effect.
  const onSelectRef = useRef(onSelect);

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
  const pulseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

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

  // Dissolve a visual stack: drop the fan offset + leader line + count badge
  // from every marker in the cluster so they return to their true points and
  // each drags independently. Called when a stacked marker starts to drag.
  const dissolveStack = useCallback((pinId: string) => {
    const members = stackClustersRef.current.get(pinId);
    if (!members) return;
    members.forEach((memberId) => {
      const marker = markersRef.current.get(memberId);
      if (marker) {
        marker.setOffset([0, 0]);
        const el = marker.getElement();
        el.querySelector(".pin-leader")?.remove();
        el.querySelector(".pin-stack-badge")?.remove();
      }
      stackClustersRef.current.delete(memberId);
    });
  }, []);

  // Briefly pulse a marker's dot (used to highlight a search match, a
  // selected pin, or a hovered list row — map↔list linking).
  const pulseMarker = useCallback((pinId: string) => {
    const dot = markersRef.current
      .get(pinId)
      ?.getElement()
      .querySelector<HTMLElement>(".pin-dot");
    if (!dot) return;
    dot.classList.remove("pin-pulse");
    void dot.offsetWidth; // restart the animation if already pulsing
    dot.classList.add("pin-pulse");
    if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current);
    pulseTimeoutRef.current = window.setTimeout(
      () => dot.classList.remove("pin-pulse"),
      3000
    );
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

    // Bottom-right so it clears the production banner pinned to the top.
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    map.on("load", () => {
      const stacks = computeStacks(initialPins);
      stacks.forEach((info, pinId) =>
        stackClustersRef.current.set(pinId, info.members)
      );

      initialPins.forEach((pin) => {
        const stack = stacks.get(pin.id);

        const el = document.createElement("div");
        el.className = "pin-marker";

        // Leader line back to the true point (fanned-out stacked pins only).
        if (stack) {
          const [dx, dy] = stack.offset;
          const leader = document.createElement("div");
          leader.className = "pin-leader";
          leader.style.width = `${Math.hypot(dx, dy)}px`;
          leader.style.transform = `rotate(${Math.atan2(-dy, -dx)}rad)`;
          el.appendChild(leader);
        }

        const dot = document.createElement("div");
        dot.className = pin.isPublished ? "pin-dot" : "pin-dot pin-dot--draft";
        dot.style.background = pin.color;
        el.appendChild(dot);

        // Hover tooltip — name + recorded address (read-only).
        const tip = document.createElement("div");
        tip.className = "pin-tooltip";
        const tipName = document.createElement("div");
        tipName.className = "pin-tooltip-name";
        tipName.textContent = pin.name;
        tip.appendChild(tipName);
        const tipAddr = document.createElement("div");
        tipAddr.className = pin.address
          ? "pin-tooltip-address"
          : "pin-tooltip-address pin-tooltip-address--empty";
        tipAddr.textContent = pin.address ?? "— sans adresse —";
        tip.appendChild(tipAddr);
        el.appendChild(tip);

        // Draft badge (hover only).
        if (!pin.isPublished) {
          const brouillon = document.createElement("div");
          brouillon.className = "pin-brouillon";
          brouillon.textContent = "Brouillon";
          el.appendChild(brouillon);
        }

        // Stack count badge.
        if (stack) {
          const badge = document.createElement("div");
          badge.className = "pin-stack-badge";
          badge.textContent = String(stack.size);
          el.appendChild(badge);
        }

        const marker = new mapboxgl.Marker({
          element: el,
          draggable: true,
          offset: stack ? stack.offset : [0, 0],
        })
          .setLngLat([pin.longitude, pin.latitude])
          .addTo(map);

        // Distinguish a plain click (select) from a drag. A drag fires
        // dragstart; a bare click does not. The click event that follows a
        // drag's mouseup is suppressed via the `dragged` flag.
        let dragged = false;
        el.addEventListener("mousedown", () => {
          dragged = false;
        });
        marker.on("dragstart", () => {
          dragged = true;
          // Detach from the stack the moment a drag begins so this marker
          // separates and moves on its own.
          dissolveStack(pin.id);
        });
        marker.on("dragend", () => handleDragEnd(pin.id));
        el.addEventListener("click", () => {
          if (dragged) {
            dragged = false;
            return;
          }
          onSelectRef.current(pin.id);
        });

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
      if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current);
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

  // Search → pan/zoom to the best match and pulse it (debounced per keystroke).
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;
    const handle = window.setTimeout(() => {
      const match = pins.find(
        (p) => activeGroups.has(p.group) && p.name.toLowerCase().includes(query)
      );
      const map = mapRef.current;
      if (!match || !map) return;
      map.flyTo({
        center: [match.longitude, match.latitude],
        zoom: Math.max(map.getZoom(), 17),
        duration: 900,
        essential: true,
      });
      pulseMarker(match.id);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchQuery, pins, activeGroups, pulseMarker]);

  // Map↔list linking (Feature 2): hovering a list row pulses its pin.
  useEffect(() => {
    if (!hoveredId) return;
    pulseMarker(hoveredId);
  }, [hoveredId, pulseMarker]);

  // Selection agreement: pulse (not fly-to) the pin when selection changes,
  // whether the click originated here or from a list row — kept minimal per
  // the plan (no automatic camera movement on a plain select/click).
  useEffect(() => {
    if (!selectedId) return;
    pulseMarker(selectedId);
  }, [selectedId, pulseMarker]);

  // Explicit "Centrer" action from the preview card — the one case that
  // recenters the camera on demand.
  useEffect(() => {
    if (!centerRequest || !selectedId) return;
    const pin = pinsRef.current.get(selectedId);
    const map = mapRef.current;
    if (!pin || !map) return;
    map.flyTo({
      center: [pin.longitude, pin.latitude],
      zoom: Math.max(map.getZoom(), 17),
      duration: 900,
      essential: true,
    });
    pulseMarker(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerRequest]);

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
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Search + layer filters */}
      <div className="card absolute left-4 top-14 z-10 w-72 space-y-3 p-4">
        <p className="eyebrow">Atlas — Carte</p>
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
          {pins.length} pins loaded — drafts show a dashed ring
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
          <p className="mb-3 text-sm text-ink/70">
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
              <p className="mb-1 text-sm text-ink">{toastPinName ?? "Pin"} moved to</p>
              <p className="mb-3 text-sm text-ink/70">
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
              <p className="mb-3 text-sm text-ink/70">{toast.message}</p>
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
}
