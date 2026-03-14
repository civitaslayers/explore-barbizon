import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Place } from "@/data/places";

// ---------------------------------------------------------------------------
// Category → group mapping
// ---------------------------------------------------------------------------

const CATEGORY_GROUP: Record<string, string> = {
  // Art & History
  "Artist House": "Art & History",
  "Museum": "Art & History",
  "Heritage Site": "Art & History",
  "Heritage Plaque": "Art & History",
  "Open-Air Museum": "Art & History",
  "Historic Paint Spot": "Art & History",
  "Galerie d'Art": "Art & History",
  "Point of Interest": "Art & History",
  "Cemetery": "Art & History",
  "Art & History": "Art & History",
  // Eat & Stay
  "Restaurant": "Eat & Stay",
  "Boutique": "Eat & Stay",
  "Boucherie": "Eat & Stay",
  "Boulangerie": "Eat & Stay",
  "Fromagerie": "Eat & Stay",
  "Epicerie": "Eat & Stay",
  "Traiteur": "Eat & Stay",
  "Salon de the": "Eat & Stay",
  "Hotel": "Eat & Stay",
  "Pharmacy": "Eat & Stay",
  "Tourist Office": "Eat & Stay",
  "Tabac / Presse": "Eat & Stay",
  "Eat, Stay & Shop": "Eat & Stay",
  // Forest & Nature
  "Trail": "Forest & Nature",
  "Forest & Nature": "Forest & Nature",
  "Climbing Area": "Forest & Nature",
  "Viewpoint": "Forest & Nature",
  // Practical
  "Parking": "Practical",
  "Bus Stop": "Practical",
  "Public Toilet": "Practical",
  "EV Charger": "Practical",
  "ATM": "Practical",
  "Practical Barbizon": "Practical",
};

export const GROUP_NAMES = [
  "Art & History",
  "Eat & Stay",
  "Forest & Nature",
  "Practical",
] as const;

export type GroupName = typeof GROUP_NAMES[number];

const GROUP_COLORS: Record<GroupName, string> = {
  "Art & History": "#7A5C3E",
  "Eat & Stay": "#5F6F52",
  "Forest & Nature": "#4A5E3A",
  "Practical": "#999999",
};

// ---------------------------------------------------------------------------
// GeoJSON builder
// ---------------------------------------------------------------------------

function buildGeoJSON(locations: Place[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: locations.map((loc) => ({
      type: "Feature",
      properties: {
        slug: loc.slug,
        name: loc.name,
        category: loc.category,
        group: CATEGORY_GROUP[loc.category] ?? "Art & History",
        shortDescription: loc.shortDescription ?? "",
      },
      geometry: {
        type: "Point",
        coordinates: [loc.longitude, loc.latitude],
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  locations: Place[];
  activeGroups: GroupName[];
};

export default function MapGL({ locations, activeGroups }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const locationsRef = useRef(locations);
  locationsRef.current = locations;

  // Initialise map once on mount
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [2.607, 48.4455],
      zoom: 14.5,
      minZoom: 10,
      maxZoom: 20,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      map.addSource("locations", {
        type: "geojson",
        data: buildGeoJSON(locationsRef.current),
      });

      GROUP_NAMES.forEach((group) => {
        const layerId = `locs-${group}`;

        map.addLayer({
          id: layerId,
          type: "circle",
          source: "locations",
          filter: ["==", ["get", "group"], group],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              12, 4,
              16, 9,
            ],
            "circle-color": GROUP_COLORS[group],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#F5F1E8",
            "circle-opacity": 0.9,
          },
        });

        // Popup on click
        map.on("click", layerId, (e) => {
          if (!e.features?.[0]) return;
          const props = e.features[0].properties as {
            slug: string;
            name: string;
            category: string;
            shortDescription: string;
          };
          const coords = (
            e.features[0].geometry as GeoJSON.Point
          ).coordinates as [number, number];

          new mapboxgl.Popup({ offset: 14, maxWidth: "260px" })
            .setLngLat(coords)
            .setHTML(
              `<div style="font-family:system-ui,sans-serif">
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(17,17,17,0.45);margin:0 0 4px 0">${props.category}</p>
                <h3 style="font-family:Georgia,serif;font-size:15px;font-weight:400;color:#111;margin:0 0 ${props.shortDescription ? "7px" : "10px"} 0;line-height:1.3">${props.name}</h3>
                ${props.shortDescription ? `<p style="font-size:11px;color:rgba(17,17,17,0.6);margin:0 0 10px 0;line-height:1.55">${props.shortDescription}</p>` : ""}
                <a href="/places/${props.slug}" style="font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:#7A5C3E;text-decoration:none">View place →</a>
              </div>`
            )
            .addTo(map);
        });

        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
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

  // Update GeoJSON source when search filters locations
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      const source = map.getSource("locations") as mapboxgl.GeoJSONSource | undefined;
      source?.setData(buildGeoJSON(locations));
    };

    if (map.isStyleLoaded()) {
      update();
    } else {
      map.once("load", update);
    }
  }, [locations]);

  // Toggle layer visibility when activeGroups changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      GROUP_NAMES.forEach((group) => {
        const layerId = `locs-${group}`;
        if (!map.getLayer(layerId)) return;
        map.setLayoutProperty(
          layerId,
          "visibility",
          activeGroups.includes(group) ? "visible" : "none"
        );
      });
    };

    if (map.isStyleLoaded()) {
      update();
    } else {
      map.once("load", update);
    }
  }, [activeGroups]);

  return <div ref={containerRef} className="h-full w-full" />;
}
