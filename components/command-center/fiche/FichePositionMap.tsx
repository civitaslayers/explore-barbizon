import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  ATLAS_MAP_BASEMAP_CONFIG,
  ATLAS_MAP_STYLE,
  haversineMeters,
  parseProximityError,
  patchLocation,
} from "@/lib/atlasMap";

// ---------------------------------------------------------------------------
// FichePositionMap — single-draggable-marker Mapbox mini-map for one
// location (docs/ccc-v3-fiche-plan.md §3.2,
// docs/ccc-v3-phase2-implementation-plan.md item 9). Reuses the PURE helpers
// from lib/atlasMap.ts — the imperative single-marker lifecycle here is
// necessarily distinct from AtlasMapView's multi-marker/stack code (per the
// plan's explicit "do not fork the drag lifecycle across two files" rule,
// which refers to the pure helpers, not the marker management itself).
// AtlasMapView.tsx is NOT touched by this file.
// ---------------------------------------------------------------------------

type DragConfirmState = { lat: number; lng: number; distanceMeters: number };

type ProximityState = {
  lat: number;
  lng: number;
  neighborName: string;
  neighborSlug: string | null;
};

type ToastState = { kind: "success" | "error"; message: string };

export function FichePositionMap({
  locationId,
  name,
  latitude,
  longitude,
  allowProximityOverride,
  resolveNeighborId,
  onCommitted,
}: {
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
  allowProximityOverride: boolean;
  /**
   * Synchronous slug → id lookup across the currently-loaded location set,
   * threaded down from the fiche page's GSSP (a tiny id+slug list loaded
   * alongside the full record) — needed to flag the neighbour record during
   * a proximity override, mirroring AtlasMapView's use of its full pins list
   * for the same purpose.
   */
  resolveNeighborId?: (slug: string) => string | null;
  /** Called after a verified 200 write — the fiche updates its own state. */
  onCommitted: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  // Imperative map-event callbacks close over a ref, never render-scoped
  // props directly — same discipline as AtlasMapView.
  const currentRef = useRef({ latitude, longitude });

  useEffect(() => {
    currentRef.current = { latitude, longitude };
  }, [latitude, longitude]);

  const [dragState, setDragState] = useState<DragConfirmState | null>(null);
  const [dragBusy, setDragBusy] = useState(false);
  const [proximityState, setProximityState] = useState<ProximityState | null>(
    null
  );
  const [proximityBusy, setProximityBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [manualLat, setManualLat] = useState(String(latitude));
  const [manualLng, setManualLng] = useState(String(longitude));

  const snapMarkerBack = useCallback(() => {
    markerRef.current?.setLngLat([
      currentRef.current.longitude,
      currentRef.current.latitude,
    ]);
  }, []);

  const handleDragEnd = useCallback(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const { lat, lng } = marker.getLngLat();
    const distanceMeters = haversineMeters(
      currentRef.current.latitude,
      currentRef.current.longitude,
      lat,
      lng
    );
    setDragState({ lat, lng, distanceMeters });
  }, []);

  // Map init — runs once on mount. The fiche page (which owns identity via
  // its route param) remounts this component whenever the location id
  // changes, so a mount-once effect here is correct.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: ATLAS_MAP_STYLE,
      config: { basemap: ATLAS_MAP_BASEMAP_CONFIG },
      center: [longitude, latitude],
      zoom: 17,
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    map.on("load", () => {
      const el = document.createElement("div");
      el.className = "pin-marker";
      const dot = document.createElement("div");
      dot.className = "pin-dot";
      dot.style.background = "#7A5C3E";
      el.appendChild(dot);

      const marker = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(map);
      marker.on("dragend", handleDragEnd);
      markerRef.current = marker;
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // Marker is created once from the location loaded at mount; later
    // coordinate changes are applied imperatively via marker.setLngLat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCommitted = useCallback(
    (lat: number, lng: number) => {
      markerRef.current?.setLngLat([lng, lat]);
      setManualLat(String(lat));
      setManualLng(String(lng));
      onCommitted(lat, lng);
    },
    [onCommitted]
  );

  const handleCancelDrag = () => {
    snapMarkerBack();
    setDragState(null);
  };

  const handleConfirmDrag = async () => {
    if (!dragState) return;
    setDragBusy(true);
    try {
      const res = await patchLocation(locationId, {
        latitude: dragState.lat,
        longitude: dragState.lng,
      });
      if (res.status === 409 || res.data.proximity) {
        const { name: neighborName, slug } = parseProximityError(
          res.data.error ?? ""
        );
        setProximityState({
          lat: dragState.lat,
          lng: dragState.lng,
          neighborName,
          neighborSlug: slug,
        });
        setDragState(null);
        return;
      }
      if (!res.ok && !res.data.committed) {
        snapMarkerBack();
        setToast({
          kind: "error",
          message: `Échec (HTTP ${res.status}) : ${
            res.data.error ?? "Update failed"
          }`,
        });
        setDragState(null);
        return;
      }
      if (res.data.committed && res.data.after) {
        // Write committed but diverged from intent — surface distinctly,
        // never as a plain failure (verified-write decision, 2026-07-10).
        setToast({
          kind: "error",
          message:
            res.data.error ??
            "Écriture COMMISE — valeurs persistées différentes.",
        });
        applyCommitted(res.data.after.lat, res.data.after.lng);
        setDragState(null);
        return;
      }
      if (!res.data.after) {
        snapMarkerBack();
        setToast({ kind: "error", message: "Réponse inattendue du serveur." });
        setDragState(null);
        return;
      }
      applyCommitted(res.data.after.lat, res.data.after.lng);
      setToast({
        kind: "success",
        message: `Déplacé à ${res.data.after.lat.toFixed(6)}, ${res.data.after.lng.toFixed(6)}`,
      });
      setDragState(null);
    } catch (err) {
      snapMarkerBack();
      setToast({
        kind: "error",
        message: `Échec : ${err instanceof Error ? err.message : String(err)}`,
      });
      setDragState(null);
    } finally {
      setDragBusy(false);
    }
  };

  const handleCancelProximity = () => {
    snapMarkerBack();
    setProximityState(null);
  };

  const handleConfirmOverride = async () => {
    if (!proximityState) return;
    setProximityBusy(true);
    try {
      const neighborId = proximityState.neighborSlug
        ? resolveNeighborId?.(proximityState.neighborSlug) ?? null
        : null;

      if (!neighborId) {
        setToast({
          kind: "error",
          message: `Impossible de résoudre le voisin "${
            proximityState.neighborSlug ?? "inconnu"
          }" localement.`,
        });
        setProximityState(null);
        return;
      }

      const neighborRes = await patchLocation(neighborId, {
        allow_proximity_override: true,
      });
      if (!neighborRes.ok) {
        setToast({
          kind: "error",
          message: `Échec du marquage du voisin (HTTP ${neighborRes.status}) : ${
            neighborRes.data.error ?? "erreur inconnue"
          }`,
        });
        setProximityState(null);
        return;
      }

      const draggedRes = await patchLocation(locationId, {
        latitude: proximityState.lat,
        longitude: proximityState.lng,
        allow_proximity_override: true,
      });

      if (draggedRes.status === 409 || draggedRes.data.proximity) {
        const { name: neighborName, slug } = parseProximityError(
          draggedRes.data.error ?? ""
        );
        setProximityState({
          lat: proximityState.lat,
          lng: proximityState.lng,
          neighborName,
          neighborSlug: slug,
        });
        return;
      }

      if (!draggedRes.data.after) {
        snapMarkerBack();
        setToast({
          kind: "error",
          message: `Échec du déplacement (HTTP ${draggedRes.status}) : ${
            draggedRes.data.error ?? "Update failed"
          }`,
        });
        setProximityState(null);
        return;
      }

      applyCommitted(draggedRes.data.after.lat, draggedRes.data.after.lng);
      setProximityState(null);
    } catch (err) {
      snapMarkerBack();
      setToast({
        kind: "error",
        message: `Échec : ${err instanceof Error ? err.message : String(err)}`,
      });
      setProximityState(null);
    } finally {
      setProximityBusy(false);
    }
  };

  const handleManualCommit = async () => {
    const lat = Number(manualLat);
    const lng = Number(manualLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setToast({ kind: "error", message: "Latitude/longitude invalides." });
      return;
    }
    setDragBusy(true);
    try {
      const res = await patchLocation(locationId, { latitude: lat, longitude: lng });
      if (res.status === 409 || res.data.proximity) {
        const { name: neighborName, slug } = parseProximityError(
          res.data.error ?? ""
        );
        setProximityState({ lat, lng, neighborName, neighborSlug: slug });
        return;
      }
      if (!res.data.after) {
        setToast({
          kind: "error",
          message: `Échec (HTTP ${res.status}) : ${
            res.data.error ?? "Update failed"
          }`,
        });
        return;
      }
      applyCommitted(res.data.after.lat, res.data.after.lng);
      setToast({ kind: "success", message: "Position mise à jour." });
    } catch (err) {
      setToast({
        kind: "error",
        message: `Échec : ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setDragBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative h-64 w-full overflow-hidden rounded-card">
        <div ref={containerRef} className="h-full w-full" />
        {allowProximityOverride ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-cream/90 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-umber shadow-sm">
            Paire rapprochée autorisée
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-sans uppercase tracking-widest text-on-surface-variant">
            Latitude
          </label>
          <input
            type="text"
            inputMode="decimal"
            className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm text-ink"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-sans uppercase tracking-widest text-on-surface-variant">
            Longitude
          </label>
          <input
            type="text"
            inputMode="decimal"
            className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm text-ink"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
          />
        </div>
      </div>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleManualCommit}
        disabled={dragBusy}
      >
        Appliquer les coordonnées
      </button>

      {dragState ? (
        <div className="card shadow-card p-4">
          <p className="eyebrow mb-1">Confirmer le déplacement</p>
          <p className="heading-lg mb-2">{name}</p>
          <div className="mb-3 space-y-1 text-sm text-ink/70">
            <p>
              Ancien : {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
            <p>
              Nouveau : {dragState.lat.toFixed(6)}, {dragState.lng.toFixed(6)}
            </p>
            <p className="text-ink/45">
              Déplacé de {dragState.distanceMeters.toFixed(1)} m
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancelDrag}
              disabled={dragBusy}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmDrag}
              disabled={dragBusy}
            >
              {dragBusy ? "Enregistrement…" : "Confirmer"}
            </button>
          </div>
        </div>
      ) : null}

      {proximityState ? (
        <div className="card shadow-card p-4">
          <p className="eyebrow mb-1">Garde de proximité</p>
          <p className="mb-3 text-sm text-ink/70">
            Cette position est à moins de 15m d&apos;un pin existant,{" "}
            <span className="text-ink">{proximityState.neighborName}</span>.
            Confirmer marquera les deux pins comme une paire rapprochée
            intentionnelle.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancelProximity}
              disabled={proximityBusy}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmOverride}
              disabled={proximityBusy}
            >
              {proximityBusy ? "Application…" : "Confirmer l'override"}
            </button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <p
          className={`text-xs ${toast.kind === "error" ? "text-umber" : "text-moss"}`}
          role={toast.kind === "error" ? "alert" : "status"}
        >
          {toast.message}
        </p>
      ) : null}
    </div>
  );
}
