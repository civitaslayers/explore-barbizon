import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Place } from "@/data/places";
import { getCategoryGroup, GROUP_COLORS, type GroupName } from "@/lib/categoryGroups";

// ---------------------------------------------------------------------------
// SVG icons — one per group, 32×32 viewBox
// ---------------------------------------------------------------------------

const C = "#F5F1E8"; // cream stroke/fill (white substitute)

const icon = (fill: string, content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">` +
  `<circle cx="16" cy="16" r="15" fill="${fill}" stroke="${C}" stroke-width="2"/>` +
  content +
  `</svg>`;

const ICON_SVGS: Record<GroupName, string> = {
  // Diamond shape — cultural / art
  "Art & History": icon(
    GROUP_COLORS["Art & History"],
    `<path d="M16 8L22 16L16 24L10 16Z" fill="${C}"/>`
  ),
  // Bowl with stem — dining / stay
  "Eat & Stay": icon(
    GROUP_COLORS["Eat & Stay"],
    `<path d="M9 15Q9 22 16 22Q23 22 23 15" stroke="${C}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    `<line x1="9" y1="15" x2="23" y2="15" stroke="${C}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<line x1="16" y1="22" x2="16" y2="25" stroke="${C}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<line x1="12" y1="25" x2="20" y2="25" stroke="${C}" stroke-width="2" stroke-linecap="round"/>`
  ),
  // Tree — nature / trails
  "Forest & Nature": icon(
    GROUP_COLORS["Forest & Nature"],
    `<polygon points="16,7 24,21 8,21" fill="${C}"/>` +
    `<rect x="14" y="21" width="4" height="4" fill="${C}" rx="0.5"/>`
  ),
  // Info "i" — practical / services
  "Practical": icon(
    GROUP_COLORS["Practical"],
    `<circle cx="16" cy="10.5" r="1.8" fill="${C}"/>` +
    `<rect x="14" y="14" width="4" height="10" fill="${C}" rx="2"/>`
  ),
};

const ICON_IDS: Record<GroupName, string> = {
  "Art & History":   "eb-icon-art",
  "Eat & Stay":      "eb-icon-eat",
  "Forest & Nature": "eb-icon-forest",
  "Practical":       "eb-icon-practical",
};

// ---------------------------------------------------------------------------
// GeoJSON builder
// ---------------------------------------------------------------------------

function buildGeoJSON(locations: Place[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: locations.map((loc) => {
      const group = getCategoryGroup(loc.category);
      return {
        type: "Feature",
        properties: {
          slug: loc.slug,
          name: loc.name,
          category: loc.category,
          group,
          iconId: ICON_IDS[group],
          shortDescription: loc.shortDescription ?? "",
        },
        geometry: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude],
        },
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Load a single SVG string as a Mapbox image
// ---------------------------------------------------------------------------

function loadSVGImage(
  map: mapboxgl.Map,
  id: string,
  svgString: string,
  size: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image(size, size);
    img.onload = () => {
      if (!map.hasImage(id)) map.addImage(id, img);
      resolve();
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = { locations: Place[] };

export default function MapGL({ locations }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Initialise map — runs once on mount
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [2.6065, 48.4455],
      zoom: 15,
      minZoom: 10,
      maxZoom: 20,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", async () => {
      // Load all SVG icons before adding layers
      await Promise.all(
        (Object.entries(ICON_SVGS) as [GroupName, string][]).map(
          ([group, svg]) => loadSVGImage(map, ICON_IDS[group], svg, 32)
        )
      );

      // GeoJSON source with clustering
      map.addSource("locations", {
        type: "geojson",
        data: buildGeoJSON(locations),
        cluster: true,
        clusterMaxZoom: 15,
        clusterRadius: 44,
      });

      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "locations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": GROUP_COLORS["Art & History"],
          "circle-radius": [
            "step", ["get", "point_count"],
            16,   // < 5
            5,  20, // 5–9
            10, 24, // ≥ 10
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": C,
          "circle-opacity": 0.92,
        },
      });

      // Cluster count labels
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "locations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: { "text-color": C },
      });

      // Individual pins
      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "locations",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["get", "iconId"],
          "icon-size": 1,
          "icon-allow-overlap": true,
          "icon-anchor": "center",
        },
      });

      // Cluster click → zoom in
      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features[0]) return;
        const clusterId = features[0].properties?.cluster_id as number;
        const geom = features[0].geometry;
        if (geom.type !== "Point") return;
        const center = geom.coordinates as [number, number];
        (map.getSource("locations") as mapboxgl.GeoJSONSource)
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom == null) return;
            map.easeTo({ center, zoom });
          });
      });

      // Pin click → popup
      map.on("click", "unclustered-point", (e) => {
        if (!e.features?.[0]) return;
        const props = e.features[0].properties as {
          slug: string;
          name: string;
          category: string;
          shortDescription: string;
        };
        const geom = e.features[0].geometry;
        if (geom.type !== "Point") return;
        const coords = geom.coordinates as [number, number];

        new mapboxgl.Popup({ offset: 18, maxWidth: "260px" })
          .setLngLat(coords)
          .setHTML(
            `<div style="font-family:system-ui,sans-serif;padding:2px 0">` +
            `<p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(17,17,17,0.4);margin:0 0 5px">${props.category}</p>` +
            `<h3 style="font-family:Georgia,serif;font-size:15px;font-weight:400;color:#111;margin:0 0 ${props.shortDescription ? "7px" : "10px"};line-height:1.3">${props.name}</h3>` +
            (props.shortDescription
              ? `<p style="font-size:11px;color:rgba(17,17,17,0.6);margin:0 0 10px;line-height:1.55">${props.shortDescription}</p>`
              : "") +
            `<a href="/places/${props.slug}" style="font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:#7A5C3E;text-decoration:none">View place →</a>` +
            `</div>`
          )
          .addTo(map);
      });

      // Cursors
      ["unclustered-point", "clusters"].forEach((layer) => {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON source when locations change (search / layer filter)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const src = map.getSource("locations") as mapboxgl.GeoJSONSource | undefined;
      src?.setData(buildGeoJSON(locations));
    };
    map.isStyleLoaded() ? update() : map.once("load", update);
  }, [locations]);

  return <div ref={containerRef} className="h-full w-full" />;
}
