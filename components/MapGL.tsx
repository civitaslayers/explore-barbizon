import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Place } from "@/data/places";
import { getCategoryGroup, GROUP_COLORS } from "@/lib/categoryGroups";

// ---------------------------------------------------------------------------
// SVG icons — one per category type, 32×32 viewBox
// ---------------------------------------------------------------------------

const C = "#F5F1E8"; // cream

const icon = (fill: string, content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">` +
  `<circle cx="16" cy="16" r="15" fill="${fill}" stroke="${C}" stroke-width="2"/>` +
  content +
  `</svg>`;

// Shared wrapper: stroked, round caps/joins, no fill
const g = (inner: string) =>
  `<g stroke="${C}" stroke-linecap="round" stroke-linejoin="round" fill="none">${inner}</g>`;

const AH = GROUP_COLORS["Art & History"];
const ES = GROUP_COLORS["Eat & Stay"];
const FN = GROUP_COLORS["Forest & Nature"];
const PR = GROUP_COLORS["Practical"];

const ICON_SVGS: Record<string, string> = {
  // ── Art & History ──────────────────────────────────────────────────────────
  // Museum: wide pediment (3:1 aspect), three thick columns, plinth overhangs
  "eb-museum": icon(AH, g(
    `<path stroke-width="2" d="M6.5 17.5L16 11L25.5 17.5"/>` +
    `<line stroke-width="2" x1="6.5" y1="17.5" x2="25.5" y2="17.5"/>` +
    `<line stroke-width="2.5" x1="10" y1="17.5" x2="10" y2="23"/>` +
    `<line stroke-width="2.5" x1="16" y1="17.5" x2="16" y2="23"/>` +
    `<line stroke-width="2.5" x1="22" y1="17.5" x2="22" y2="23"/>` +
    `<line stroke-width="2.2" x1="6" y1="23" x2="26" y2="23"/>`
  )),
  // Gallery: landscape picture frame with canvas opening
  "eb-gallery": icon(AH, g(
    `<rect stroke-width="1.8" x="6" y="8" width="20" height="16" rx="0.5"/>` +
    `<rect stroke-width="1.5" x="9" y="11" width="14" height="10" rx="0.3"/>`
  )),

  // ── Eat & Stay ─────────────────────────────────────────────────────────────
  // Restaurant: fork (two tines + stem) + knife (spine + blade)
  "eb-restaurant": icon(ES, g(
    `<line stroke-width="1.8" x1="11" y1="10" x2="11" y2="14"/>` +
    `<line stroke-width="1.8" x1="13" y1="10" x2="13" y2="14"/>` +
    `<path stroke-width="1.8" d="M11 14Q12 16.5 12 17L12 22"/>` +
    `<line stroke-width="1.8" x1="20" y1="10" x2="20" y2="22"/>` +
    `<path stroke-width="1.8" d="M20 10Q22.5 12 22.5 16L20 16"/>`
  )),
  // Café: cup body + handle + single steam curl
  "eb-cafe": icon(ES, g(
    `<path stroke-width="1.8" d="M16 12.5Q17 10.5 16 9"/>` +
    `<path stroke-width="1.8" d="M9.5 13.5L9.5 21Q9.5 22.5 16 22.5Q22.5 22.5 22.5 21L22.5 13.5"/>` +
    `<path stroke-width="1.8" d="M22.5 15.5Q26 15.5 26 18Q26 21 22.5 21"/>`
  )),
  // Hotel: bed frame with headboard + pillow
  "eb-hotel": icon(ES, g(
    `<path stroke-width="1.8" d="M9 23L9 18L23 18L23 23"/>` +
    `<path stroke-width="1.8" d="M9 18L9 14Q9 13 10 13L22 13Q23 13 23 14L23 18"/>` +
    `<rect stroke-width="1.5" x="11" y="14" width="5.5" height="4" rx="1.5"/>`
  )),

  // ── Forest & Nature ────────────────────────────────────────────────────────
  // Tree: triangle crown + trunk
  "eb-tree": icon(FN, g(
    `<path stroke-width="1.8" d="M16 9L25 24H7L16 9Z"/>` +
    `<line stroke-width="1.8" x1="16" y1="24" x2="16" y2="26.5"/>`
  )),
  // Viewpoint: two binocular barrels + bridge
  "eb-viewpoint": icon(FN, g(
    `<rect stroke-width="1.8" x="5.5" y="14.5" width="7" height="9" rx="3.5"/>` +
    `<rect stroke-width="1.8" x="19.5" y="14.5" width="7" height="9" rx="3.5"/>` +
    `<path stroke-width="1.8" d="M12.5 16.5Q16 14 19.5 16.5"/>`
  )),
  // Boulder: all-convex silhouette, flat base via Z, single diagonal crack
  "eb-boulder": icon(FN, g(
    `<path stroke-width="1.8" d="M7 23.5Q5 23 5 19Q5.5 13 13 11Q18 9 23 14Q26 18 24.5 23.5Z"/>` +
    `<line stroke-width="1.4" x1="20" y1="13" x2="17.5" y2="17.5"/>`
  )),

  // ── Practical ──────────────────────────────────────────────────────────────
  // Parking: P letterform
  "eb-parking": icon(PR, g(
    `<line stroke-width="2" x1="13" y1="10" x2="13" y2="22"/>` +
    `<path stroke-width="2" d="M13 10Q20 10 20 14Q20 18 13 18"/>`
  )),
  // Info: filled dot + serif stem
  "eb-info": icon(PR,
    `<circle cx="16" cy="11" r="1.8" fill="${C}"/>` +
    g(
      `<line stroke-width="2" x1="14" y1="15" x2="18" y2="15"/>` +
      `<line stroke-width="2" x1="16" y1="15" x2="16" y2="22"/>` +
      `<line stroke-width="2" x1="14" y1="22" x2="18" y2="22"/>`
    )
  ),
  // Bus: body + windshield divider + two wheels
  "eb-bus": icon(PR, g(
    `<rect stroke-width="1.8" x="7.5" y="11" width="17" height="9" rx="2"/>` +
    `<line stroke-width="1.8" x1="12.5" y1="11" x2="12.5" y2="15"/>` +
    `<circle stroke-width="1.8" cx="12.5" cy="21" r="2"/>` +
    `<circle stroke-width="1.8" cx="20" cy="21" r="2"/>`
  )),
};

// Category → icon ID
const CATEGORY_ICON: Record<string, string> = {
  // Art & History
  "Artist House":        "eb-gallery",
  "Museum":              "eb-museum",
  "Heritage Site":       "eb-museum",
  "Heritage Plaque":     "eb-museum",
  "Open-Air Museum":     "eb-museum",
  "Historic Paint Spot": "eb-museum",
  "Galerie d'Art":       "eb-gallery",
  "Point of Interest":   "eb-museum",
  "Cemetery":            "eb-museum",
  "Art & History":       "eb-museum",
  // Eat & Stay
  "Restaurant":          "eb-restaurant",
  "Boucherie":           "eb-restaurant",
  "Boulangerie":         "eb-restaurant",
  "Fromagerie":          "eb-restaurant",
  "Epicerie":            "eb-restaurant",
  "Traiteur":            "eb-restaurant",
  "Boutique":            "eb-restaurant",
  "Tabac / Presse":      "eb-restaurant",
  "Eat, Stay & Shop":    "eb-restaurant",
  "Salon de the":        "eb-cafe",
  "Hotel":               "eb-hotel",
  "Tourist Office":      "eb-info",
  "Pharmacy":            "eb-info",
  // Forest & Nature
  "Trail":               "eb-tree",
  "Forest & Nature":     "eb-tree",
  "Climbing Area":       "eb-boulder",
  "Viewpoint":           "eb-viewpoint",
  // Practical
  "Parking":             "eb-parking",
  "Bus Stop":            "eb-bus",
  "Public Toilet":       "eb-info",
  "EV Charger":          "eb-info",
  "ATM":                 "eb-info",
  "Practical Barbizon":  "eb-info",
};

function getCategoryIconId(category: string): string {
  return CATEGORY_ICON[category] ?? "eb-museum";
}

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
          iconId: getCategoryIconId(loc.category),
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
        Object.entries(ICON_SVGS).map(
          ([id, svg]) => loadSVGImage(map, id, svg, 32)
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
