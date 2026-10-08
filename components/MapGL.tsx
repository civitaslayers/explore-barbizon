import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Place } from "@/lib/types";
import type { Route } from "@/lib/supabase";
import { getCategoryGroup, GROUP_COLORS } from "@/lib/categoryGroups";
import { DEFAULT_LIGHT_PRESET } from "@/lib/mapLight";
import { popupDayToggleState } from "@/lib/myDay";
import { buildPinPopupContent, buildTrailPopupContent } from "@/lib/popupHtml";
import type { DayStop } from "@/components/MyDayPanel";

// ---------------------------------------------------------------------------
// SVG icons — teardrop pin, 28×36 display; viewBox 0 0 40 46
// ---------------------------------------------------------------------------

const C = "#F5F1E8";

const icon = (fill: string, content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 40 46">` +
  `<path d="M20 2C10.059 2 2 10.059 2 20C2 30 12 38 20 44C28 38 38 30 38 20C38 10.059 29.941 2 20 2Z" fill="${fill}" stroke="${C}" stroke-width="1.5"/>` +
  content +
  `</svg>`;

const AH = GROUP_COLORS["Art & History"];
const ES = GROUP_COLORS["Eat & Stay"];
const FN = GROUP_COLORS["Forest & Nature"];
const PR = GROUP_COLORS["Practical"];

const ICON_SVGS: Record<string, string> = {

  // ── Art & History ───────────────────────────────────────────

  // Museum: columns + pediment
  "eb-museum": icon(AH,
    `<g fill="${C}" transform="translate(0,0)">` +
    `<polygon points="20,10 31,16 9,16"/>` +
    `<rect x="12.5" y="17" width="3" height="7"/>` +
    `<rect x="18.5" y="17" width="3" height="7"/>` +
    `<rect x="24.5" y="17" width="3" height="7"/>` +
    `<rect x="10" y="24" width="20" height="2.5"/>` +
    `</g>`
  ),

  // Artist House: house silhouette with door
  "eb-artist-house": icon(AH,
    `<g fill="${C}">` +
    `<polygon points="20,9 32,19 8,19"/>` +
    `<rect x="10" y="19" width="20" height="13"/>` +
    `<rect x="16.5" y="22" width="7" height="10" fill="${AH}"/>` +
    `</g>`
  ),

  // Gallery: painter's palette — tilted oval, thumb hole, paint dots
  "eb-gallery": icon(AH,
    `<g fill="${C}">` +
    `<ellipse cx="22" cy="19" rx="12" ry="9" transform="rotate(-20,22,19)"/>` +
    `</g>` +
    `<ellipse cx="14" cy="25" rx="3.5" ry="2.5" transform="rotate(-20,14,25)" fill="${AH}"/>` +
    `<circle cx="13" cy="14" r="2.2" fill="${AH}"/>` +
    `<circle cx="18.5" cy="11" r="2.2" fill="${AH}"/>` +
    `<circle cx="24.5" cy="12" r="2.2" fill="${AH}"/>` +
    `<circle cx="29" cy="16" r="2.2" fill="${AH}"/>` +
    `<circle cx="30" cy="22" r="2.2" fill="${AH}"/>`
  ),

  // Star: POI / Heritage Plaque / Mosaic
  "eb-poi": icon(AH,
    `<polygon points="20,9 22.8,17 31,17 24.5,21.5 27,29 20,24.5 13,29 15.5,21.5 9,17 17.2,17" fill="${C}"/>`
  ),

  // Cemetery: cross
  "eb-cemetery": icon(AH,
    `<rect x="18" y="10" width="4" height="20" fill="${C}"/>` +
    `<rect x="11" y="15" width="18" height="4" fill="${C}"/>`
  ),

  // ── Eat, Stay & Shop ────────────────────────────────────────

  // Restaurant: fork + knife — Noun Project noun-restaurant-4893136
  "eb-restaurant": icon(ES,
    `<g fill="${C}" transform="translate(7,5) scale(0.82)">` +
    `<path d="M12.191,2v17.202v8.505c0,1.084-0.741,2.089-1.811,2.264c-1.364,0.222-2.542-0.825-2.542-2.147v-8.621H5.771c-0.522,0-0.946-0.423-0.946-0.946V9.366C4.825,5.298,8.123,2,12.191,2z"/>` +
    `<path d="M26.136,2.003h-1.437v8.275c0,0.497-0.403,0.9-0.9,0.9s-0.9-0.403-0.9-0.9V2.003h-1.574v8.275c0,0.497-0.403,0.9-0.9,0.9s-0.9-0.403-0.9-0.9V2.003H18.09c-0.573,0-1.038,0.465-1.038,1.038v9.283c0.162,1.76,1.124,2.718,2.886,2.875v12.625c0,1.206,0.98,2.175,2.175,2.175s2.175-0.969,2.175-2.175V15.199c1.762-0.157,2.724-1.116,2.886-2.875V3.041C27.175,2.468,26.71,2.003,26.136,2.003z"/>` +
    `</g>`
  ),

  // Bakery / Boulangerie: croissant — Noun Project noun-croissant-8302477
  "eb-food-shop": icon(ES,
    `<g fill="${C}" transform="translate(4,5) scale(0.34)">` +
    `<path d="m63.176 62.488c-2.5781 0.050781-5.5273-0.15234-9.0586-0.6875-1.1914-0.17969-2.0469-1.0195-2.5195-2.3359-0.66797-1.8516-0.65234-4.4531 0.11328-7.7188 0.95703-4.0977 2.0977-8.1367 5.1406-10.883 1.9609-1.7695 4.7148-2.9453 8.6641-3.3086 3.0039-0.27344 5.2539 0.55859 7.9883 1.9062 4.6328 2.2852 6.4453 3.7344 7.8633 5.6953h-0.003907c0.23828 0.32812 0.44531 0.67969 0.61328 1.0469-1.0391-0.30469-2.0312-0.42188-2.9102-0.34766-1.7109 0.14453-4.0547 1.0664-6.4258 2.5156-3.3438 2.043-6.7617 5.1055-8.4961 7.9648-1.3477 2.2227-1.7031 4.3789-0.96875 6.1523zm3.9648-1.4102c-0.27734-0.33984-0.20312-0.77344-0.066406-1.2305 0.28516-0.94922 0.96094-1.9531 1.8164-2.9648 2.8398-3.3438 7.7266-6.6367 10.531-6.875 0.80859-0.070312 1.7695 0.24219 2.7461 0.74609 1.7227 0.89062 3.4414 2.4414 4.4766 4.3594 2.8008 5.1953 2.2734 10.727 0.09375 13.059-0.30859 0.32812-0.92578 0.42578-1.6484 0.51172-1.6875 0.20312-3.8906-0.070313-5.9883-0.88672-6.5273-2.5312-9.4766-3.6484-11.961-6.7227zm-19.574-0.67969h-0.003906c-1.3398-0.035157-2.6758-0.11328-4.0078-0.23438-1.8867-0.16797-3.4531-1.3555-4.7148-3.0312-2.2383-2.9688-3.5078-7.4453-3.6172-11.863-0.17188-6.9336 2.4883-13.988 9.8633-14.02 6.3477-0.027344 11.879 0.92188 16.293 2.7695-3.1172 0.76953-5.4805 2.0859-7.3164 3.7461-3.668 3.3086-5.25 8.0859-6.4062 13.027-0.92578 3.9531-0.84766 7.1641-0.089844 9.6016zm-11.684-0.28516c-2.1719-0.03125-3.8594-0.10938-5.2109-0.26953-2.3438-0.28125-3.4023-0.80859-4.3516-2.1133-6.4844-8.9297-6.7695-10.391-6.8516-11.441-0.09375-1.2266 0.57812-2.4531 1.4102-3.5781 1.5078-2.0391 3.6914-3.7266 4.8516-4.3516 2.7891-1.5 5.1133-2.2773 6.9609-2.6445-1.1914 2.8906-1.7188 6.2539-1.6328 9.6641 0.13281 5.3281 1.7578 10.691 4.4531 14.27l0.36719 0.46875zm-12.422 0.72266-0.68359 0.32812c-5.125 2.3867-7.8906 1.4375-9.8711-1.6875-3.1133-4.9062-0.79297-8.5234 2.6328-11.5 0.45703 1.6055 1.9688 4.7031 7.4102 12.199 0.16797 0.23047 0.33984 0.45312 0.51172 0.66016z" fill-rule="evenodd"/>` +
    `</g>`
  ),

  // Café: cup + steam + saucer
  "eb-cafe": icon(ES,
    `<g fill="${C}">` +
    `<path stroke="${C}" stroke-width="1.8" stroke-linecap="round" fill="none" d="M16 13Q16.8 11 16 10"/>` +
    `<path stroke="${C}" stroke-width="1.8" stroke-linecap="round" fill="none" d="M20 12Q20.8 10 20 9"/>` +
    `<path d="M12 16L13.5 25Q14 26 20 26Q26 26 26.5 25L28 16Z"/>` +
    `<path stroke="${C}" stroke-width="3" stroke-linecap="round" fill="none" d="M26.5 18Q31 18 31 21Q31 24 26.5 24"/>` +
    `<rect x="9" y="26" width="22" height="2.5" rx="1.25"/>` +
    `</g>`
  ),

  // Hotel: bed — Noun Project noun-hotel-3846052
  "eb-hotel": icon(ES,
    `<g fill="${C}" transform="translate(5,9) scale(1.18)">` +
    `<path d="M5.06,10.71a2.1,2.1,0,1,1,2.1,2.1A2.1,2.1,0,0,1,5.06,10.71Zm14.21-2.1H10.18a.38.38,0,0,0-.38.38v3.45a.378.378,0,0,0,.38.37H22.46a.376.376,0,0,0,.37-.37v-.27A3.568,3.568,0,0,0,19.27,8.61Zm3.18,4.73H4.52V5.47a.378.378,0,0,0-.38-.37H2.54a.376.376,0,0,0-.37.37V19.53a.376.376,0,0,0,.37.37h1.6a.378.378,0,0,0,.38-.37V15.69H20.48v3.84a.376.376,0,0,0,.37.37h1.6a.378.378,0,0,0,.38-.37V13.71A.378.378,0,0,0,22.45,13.34Z"/>` +
    `</g>`
  ),

  // Shop: bag
  "eb-shop": icon(ES,
    `<g fill="${C}">` +
    `<rect x="12" y="19" width="16" height="14" rx="2"/>` +
    `<path stroke="${C}" stroke-width="2.5" stroke-linecap="round" fill="none" d="M15 19Q15 13 20 13Q25 13 25 19"/>` +
    `</g>`
  ),

  // ── Forest & Nature ─────────────────────────────────────────

  // Trail: footprints
  "eb-tree": icon(FN,
    `<g fill="${C}">` +
    `<ellipse cx="15" cy="26" rx="3.5" ry="5" transform="rotate(-15,15,26)"/>` +
    `<ellipse cx="25" cy="19" rx="3.5" ry="5" transform="rotate(15,25,19)"/>` +
    `<ellipse cx="13" cy="16" rx="1.8" ry="2.5" transform="rotate(-15,13,16)"/>` +
    `<ellipse cx="23" cy="12" rx="1.8" ry="2.5" transform="rotate(15,23,12)"/>` +
    `</g>`
  ),

  // Viewpoint: binoculars — Noun Project noun-binocular-6467950
  "eb-viewpoint": icon(FN,
    `<g fill="${C}" transform="translate(4,5) scale(0.5)">` +
    `<path fill-rule="evenodd" clip-rule="evenodd" d="M17.6679 26.4918C25.603 17.8361 38.397 17.8361 46.3321 26.4918L46.3358 26.4885C47.1579 25.7507 47.2262 24.4862 46.4885 23.6642C43.0082 19.7862 38.5653 17.6007 34 17.1077V8C34 4.68629 36.6863 2 40 2H43.9448C46.6505 2 49.0215 3.81092 49.7334 6.42129L51.8331 14.1201L59.6175 24.8237C59.8298 25.1156 59.9591 25.4595 59.9918 25.8189L61.7846 45.5404C61.9262 46.3389 62 47.1608 62 48C62 55.732 55.732 62 48 62C40.268 62 34 55.732 34 48L34 24.1376C32.672 23.9541 31.328 23.9541 30 24.1376L30 48C30 55.732 23.732 62 16 62C8.26801 62 2 55.732 2 48C2 47.1608 2.07383 46.3389 2.21536 45.5404L4.00821 25.8189C4.04089 25.4595 4.17024 25.1156 4.38253 24.8237L12.1669 14.1201L14.2666 6.42129C14.9785 3.81092 17.3495 2 20.0552 2H24C27.3137 2 30 4.68629 30 8V17.1077C25.4347 17.6007 20.9918 19.7862 17.5115 23.6642C16.7738 24.4862 16.8421 25.7507 17.6642 26.4885L17.6679 26.4918ZM6.00037 48.0867C6.04692 53.5696 10.5061 58 16 58C21.5228 58 26 53.5229 26 48C26 42.4771 21.5228 38 16 38C11.1293 38 7.07184 41.4823 6.1816 46.0931L6.00037 48.0867ZM57.8184 46.0931C56.9282 41.4823 52.8707 38 48 38C42.4772 38 38 42.4771 38 48C38 53.5229 42.4772 58 48 58C53.4939 58 57.9531 53.5696 57.9996 48.0867L57.8184 46.0931Z"/>` +
    `</g>`
  ),

  // Boulder / Climbing — Noun Project noun-bouldering-7320386
  "eb-boulder": icon(FN,
    `<g fill="${C}" transform="translate(3,3) scale(0.3)">` +
    `<path d="m77.309 94c-0.22266 0-0.44531-0.050781-0.64844-0.14844l-28.84-13.852h-14.719c-5.2227-0.003906-9.457-4.2383-9.4609-9.4609v-29.238c0-0.82812 0.67188-1.5 1.5-1.5h22.148l10.641-10.859-9.1094-9.1094v-0.003906c-0.28125-0.27734-0.44141-0.66016-0.44141-1.0586v-11.27c0-0.82812 0.67188-1.5 1.5-1.5s1.5 0.67188 1.5 1.5v10.648l12.371 12.371c0.28125 0.28125 0.44141 0.66406 0.44141 1.0586v35.773l14.41 24.387c0.26953 0.46484 0.27344 1.0391 0.007813 1.5039-0.26562 0.46875-0.76172 0.75781-1.3008 0.75781zm-50.668-51.199v27.777c0.027344 3.5508 2.9102 6.418 6.4609 6.4219h15.059c0.22266 0 0.44531 0.046875 0.64844 0.14062l24.711 11.859-12.07-20.48c-0.13672-0.23047-0.21094-0.49219-0.21094-0.75781v-35.512l-1.1914-1.1797-11.047 11.281c-0.28125 0.28516-0.66797 0.44922-1.0703 0.44922z"/>` +
    `<path d="m35.922 72.199c-0.40234 0-0.78516-0.15625-1.0703-0.4375-0.58203-0.58984-0.58203-1.5352 0-2.1211l11.52-11.512c0.27734-0.28516 0.66016-0.44141 1.0586-0.4375h15.309c0.83203 0 1.5 0.67188 1.5 1.5s-0.66797 1.5-1.5 1.5h-14.688l-11.051 11.07c-0.28906 0.28125-0.67578 0.44141-1.0781 0.4375z"/>` +
    `<path d="m30 34c-3.582 0.003906-6.8086-2.1484-8.1836-5.457-1.3711-3.3047-0.61719-7.1133 1.9141-9.6484 2.5273-2.5312 6.3359-3.293 9.6445-1.9219s5.4648 4.5977 5.4648 8.1758c-0.003906 4.8828-3.957 8.8398-8.8398 8.8516zm0-14.699c-2.3672-0.003906-4.5039 1.418-5.4102 3.6055-0.91016 2.1836-0.41406 4.7031 1.2617 6.375 1.6719 1.6758 4.1875 2.1797 6.375 1.2734 2.1875-0.90234 3.6133-3.0391 3.6133-5.4062 0.003906-1.5508-0.60938-3.0391-1.707-4.1367-1.0938-1.1016-2.582-1.7188-4.1328-1.7227z"/>` +
    `</g>`
  ),

  // ── Practical ───────────────────────────────────────────────

  // Parking: P letterform
  "eb-parking": icon(PR,
    `<g fill="${C}">` +
    `<rect x="13" y="10" width="4" height="20"/>` +
    `<path d="M17 10Q27 10 27 16Q27 22 17 22Z"/>` +
    `<path d="M17 13Q23 13 23 16Q23 19 17 19Z" fill="${PR}"/>` +
    `</g>`
  ),

  // Bus stop — Noun Project noun-bus-2979599
  "eb-bus": icon(PR,
    `<g fill="${C}" transform="translate(4,6) scale(0.32)">` +
    `<path d="M5.4,32.1H3.8c-1.4,0-2.6,1.2-2.6,2.6v10.8c0,1.4,1.2,2.6,2.6,2.6h1.5c1.4,0,2.6-1.2,2.6-2.6V34.7C7.9,33.3,6.8,32.1,5.4,32.1z"/>` +
    `<path d="M96.2,33.8h-1.5c-1.4,0-2.6,1.2-2.6,2.6v10.8c0,1.4,1.2,2.6,2.6,2.6h1.5c1.4,0,2.6-1.2,2.6-2.6V36.4C98.8,34.9,97.6,33.8,96.2,33.8z"/>` +
    `<path d="M82.1,13.4C73,10,50,9.8,50,9.8S26.9,10,17.8,13.4c-9.1,3.4-7.7,10-7.7,10v55.3c0,4.3,3.5,7.7,7.7,7.7h0.9v3.5c0,1.4,1.2,2.6,2.6,2.6h10.1c1.4,0,2.6-1.2,2.6-2.6v-3.5h16h16v3.5c0,1.4,1.2,2.6,2.6,2.6h10.1c1.4,0,2.6-1.2,2.6-2.6v-3.5h0.9c4.3,0,7.7-3.5,7.7-7.7V23.3C89.8,23.3,91.2,16.8,82.1,13.4z M42,16.4c0-0.6,0.5-1.1,1.1-1.1h13.8c0.6,0,1.1,0.5,1.1,1.1v3c0,0.6-0.5,1.1-1.1,1.1H43.1c-0.6,0-1.1-0.5-1.1-1.1V16.4z M31.4,70.7c0,1.3-1,2.3-2.3,2.3h-8.9c-1.3,0-2.3-1-2.3-2.3v-4.8c0-0.7,0.3-1.4,0.9-1.8c0.6-0.4,1.3-0.6,2-0.4l8.9,2.4c1,0.3,1.7,1.2,1.7,2.2V70.7z M19.4,57.2c-0.8,0-1.4-0.6-1.4-1.4V27.7c0-0.8,0.6-1.4,1.4-1.4h60.9c0.8,0,1.4,0.6,1.4,1.4v28.1c0,0.8-0.6,1.4-1.4,1.4H19.4z M82,70.7c0,1.3-1,2.3-2.3,2.3h-8.9c-1.3,0-2.3-1-2.3-2.3v-2.4c0-1,0.7-1.9,1.7-2.2l8.9-2.4c0.7-0.2,1.4,0,2,0.4c0.6,0.4,0.9,1.1,0.9,1.8V70.7z"/>` +
    `</g>`
  ),

  // Info / WC
  "eb-info": icon(PR,
    `<circle cx="20" cy="13" r="3.5" fill="${C}"/>` +
    `<rect x="17" y="18" width="6" height="13" rx="2" fill="${C}"/>`
  ),
};

// Category → icon ID
const CATEGORY_ICON: Record<string, string> = {
  // Art & History
  "Artist House":        "eb-artist-house",
  "Museum":              "eb-museum",
  "Heritage Site":       "eb-museum",
  "Heritage Plaque":     "eb-poi",
  "Open-Air Museum":     "eb-museum",
  "Historic Paint Spot": "eb-poi",
  "Galerie d'Art":       "eb-gallery",
  "Point of Interest":   "eb-poi",
  "Cemetery":            "eb-cemetery",
  "Art & History":       "eb-museum",
  // Eat, Stay & Shop
  "Restaurant":          "eb-restaurant",
  "Boucherie":           "eb-food-shop",
  "Boulangerie":         "eb-food-shop",
  "Fromagerie":          "eb-food-shop",
  "Epicerie":            "eb-food-shop",
  "Traiteur":            "eb-food-shop",
  "Boutique":            "eb-shop",
  "Tabac / Presse":      "eb-shop",
  "Salon de the":        "eb-cafe",
  "Hotel":               "eb-hotel",
  "Tourist Office":      "eb-info",
  "Pharmacy":            "eb-info",
  "Eat, Stay & Shop":    "eb-restaurant",
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
          categorySlug: loc.categorySlug ?? "",
          group,
          iconId: getCategoryIconId(loc.category),
          shortDescription: loc.shortDescription ?? "",
          route_slug: loc.route_slug ?? "",
          placeSlug: (loc as Place & { placeSlug?: string | null }).placeSlug ?? "",
        },
        geometry: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude],
        },
      };
    }),
  };
}

// "My day" overlay — numbered stop points plus one straight LineString through
// the stops in order (>= 2). Lives in its own source so the trail handlers
// (hideAllRoutes / routes setData) never touch it.
function buildDayGeoJSON(stops: DayStop[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = stops.map((s, i) => ({
    type: "Feature",
    properties: { slug: s.slug, n: i + 1 },
    geometry: { type: "Point", coordinates: [s.longitude, s.latitude] },
  }));
  if (stops.length >= 2) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: stops.map((s) => [s.longitude, s.latitude]),
      },
    });
  }
  return { type: "FeatureCollection", features };
}

// Pan the map so an opened popup is not hidden under the floating controls
// (page overlays + Mapbox control corners) or clipped by the map edge.
// Re-checked once after the pan, since Mapbox may re-anchor the popup.
// Module-level so the mount-once effects don't take it as a dependency.
function keepPopupClear(
  map: mapboxgl.Map,
  popup: mapboxgl.Popup,
  getOverlays: () => (HTMLElement | null)[],
  recheck = true
) {
  requestAnimationFrame(() => {
    const el = popup.getElement();
    if (!el || !popup.isOpen()) return;
    const box = map.getContainer().getBoundingClientRect();
    const p = el.getBoundingClientRect();
    const margin = 12;
    const obstacles: HTMLElement[] = [
      ...getOverlays().filter((o): o is HTMLElement => o !== null),
      ...Array.from(
        map
          .getContainer()
          .querySelectorAll<HTMLElement>(
            ".mapboxgl-ctrl-top-left, .mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-right"
          )
      ),
    ];
    let down = Math.max(0, box.top + margin - p.top);
    let up = Math.max(0, p.bottom - (box.bottom - margin));
    for (const o of obstacles) {
      const r = o.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const overlaps =
        r.left < p.right && r.right > p.left && r.top < p.bottom && r.bottom > p.top;
      if (!overlaps) continue;
      if (r.top + r.height / 2 < p.top + p.height / 2) {
        down = Math.max(down, r.bottom + margin - p.top);
      } else {
        up = Math.max(up, p.bottom - (r.top - margin));
      }
    }
    const dy = down > 0 ? -down : up;
    if (dy === 0) return;
    map.panBy([0, dy], { duration: prefersReducedMotion() ? 0 : 300 });
    if (recheck) map.once("moveend", () => keepPopupClear(map, popup, getOverlays, false));
  });
}

function buildRoutesGeoJSON(routes: Route[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: routes.map((r) => ({
      type: "Feature",
      geometry: r.geojson,
      properties: {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description ?? "",
        distance_meters: r.distance_meters ?? 0,
        duration_minutes: r.duration_minutes ?? 0,
        difficulty: r.difficulty ?? "moderate",
        start_lat: r.start_lat,
        start_lng: r.start_lng,
        color: r.color ?? "#4A5E3A",
      },
    })),
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
    const img = new Image(28, 36);
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

function hideAllRoutes(map: mapboxgl.Map) {
  ["route-outline", "route-line", "route-hover"].forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "none");
  });
}

// ---------------------------------------------------------------------------
// Motion, terrain, and easing helpers
// ---------------------------------------------------------------------------

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The mount effect (empty dep array) runs on first render, which on a hard
// load of /map?location=<slug> happens BEFORE Next.js router hydration sets
// router.isReady — so the `focusSlug` prop can still be undefined even though
// the URL carries a deep link. Reading the query string directly from
// window.location sidesteps that race entirely, since it's available
// synchronously regardless of router hydration state.
const hasFocusParam = () =>
  typeof window !== "undefined" &&
  (new URLSearchParams(window.location.search).has("location") ||
    new URLSearchParams(window.location.search).has("day"));

// Heuristic, NOT a device-performance measurement: enable 3D terrain only on
// desktop-class input (mouse/trackpad). Mid-range touch devices are the terrain
// perf risk; (hover: hover) + (pointer: fine) is a reasonable proxy for "not a
// phone." Human must confirm mobile frame rate is acceptable at the review gate
// and revisit this condition if terrain measurably degrades performance.
function terrainAllowed(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

// Evaluates cubic-bezier(0.2, 0.8, 0.2, 1) — the design-doc "ease-soft" easing
// curve (note: differs from the Tailwind `ease-soft` CSS class, which uses a
// different curve — see commit message). Mapbox flyTo's `easing` option takes a
// (t: number) => number function, not a CSS string, hence this small evaluator.
function easeSoft(t: number): number {
  const x1 = 0.2, y1 = 0.8, x2 = 0.2, y2 = 1;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleCurveY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleCurveDerivativeX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  const solveCurveX = (x: number): number => {
    let u = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleCurveX(u) - x;
      if (Math.abs(dx) < 1e-6) return u;
      const d = sampleCurveDerivativeX(u);
      if (Math.abs(d) < 1e-6) break;
      u -= dx / d;
    }
    let lo = 0, hi = 1;
    u = x;
    while (lo < hi) {
      const cur = sampleCurveX(u);
      if (Math.abs(cur - x) < 1e-6) return u;
      if (x > cur) lo = u; else hi = u;
      u = (lo + hi) / 2;
    }
    return u;
  };

  return sampleCurveY(solveCurveX(t));
}

type Props = {
  locations: Place[];
  allLocations?: Place[];
  routes: Route[];
  focusSlug?: string;
  // Computed with t() in the PARENT (pages/map.tsx, a normal React component
  // where hooks work normally) and read via labelsRef/localeRef inside the
  // imperative Mapbox popup/event-handler code below — a `t` captured
  // directly inside those mount-once closures would go stale after a locale
  // change without a remount. Expected keys: trailEyebrow, loop,
  // difficultyEasy, difficultyModerate, difficultyHard, viewPlace, addToDay,
  // inDay, dayFull.
  labels: Record<string, string>;
  // categories.slug -> localized display label (lib/categoryLabel.ts's
  // buildCategoryLabels, computed with t() in the parent). Same reason as
  // `labels` above: read via a ref inside the imperative Mapbox popup
  // builders below, which run in mount-once closures that would otherwise go
  // stale after a locale change without a remount.
  categoryLabels: Record<string, string>;
  locale: string;
  // "My day" overlay (task 3c5b17b5). dayStops = resolved, ordered stops that
  // are drawn; daySlugs = raw stored slugs (popup button state); dayFull =
  // the stored day is at its cap; dayShared = a shared ?day is displayed, so
  // the popup button is hidden. fitDayToken bumps to request a camera fit.
  dayStops: DayStop[];
  daySlugs: string[];
  dayFull: boolean;
  dayShared: boolean;
  onToggleDay: (slug: string) => void;
  fitDayToken: number;
  // Page-level controls floating over the map (pages/map.tsx). An opened
  // popup is panned clear of these and of Mapbox's own control corners.
  getOverlayElements?: () => (HTMLElement | null)[];
};

export default function MapGL({
  locations,
  allLocations,
  routes,
  focusSlug,
  labels,
  categoryLabels,
  locale,
  dayStops,
  daySlugs,
  dayFull,
  dayShared,
  onToggleDay,
  fitDayToken,
  getOverlayElements,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const routesRef = useRef<Route[]>([]);
  const focusPopupRef = useRef<mapboxgl.Popup | null>(null);
  const hasIntroPlayed = useRef(false);
  const labelsRef = useRef(labels);
  const categoryLabelsRef = useRef(categoryLabels);
  const localeRef = useRef(locale);

  useEffect(() => {
    labelsRef.current = labels;
  }, [labels]);

  useEffect(() => {
    categoryLabelsRef.current = categoryLabels;
  }, [categoryLabels]);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  // "My day" refs — read inside the mount-once Mapbox closures (labelsRef pattern).
  const dayStopsRef = useRef(dayStops);
  const daySlugsRef = useRef(daySlugs);
  const dayFullRef = useRef(dayFull);
  const daySharedRef = useRef(dayShared);
  const onToggleDayRef = useRef(onToggleDay);
  const dayRefreshersRef = useRef<Set<() => void>>(new Set());

  const getOverlayElementsRef = useRef(getOverlayElements);
  useEffect(() => {
    getOverlayElementsRef.current = getOverlayElements;
  }, [getOverlayElements]);

  // Wire the popup's "Add to my day" button; keeps its label in sync while open.
  const attachDayToggle = (popup: mapboxgl.Popup, slug: string) => {
    const btn = popup
      .getElement()
      ?.querySelector<HTMLButtonElement>("[data-day-toggle]");
    if (!btn) return;
    const refresh = () => {
      const state = popupDayToggleState(
        slug,
        daySlugsRef.current,
        dayFullRef.current,
        daySharedRef.current
      );
      // Inline display (not `hidden`) — the button's inline style sets display.
      btn.style.display = state === "hidden" ? "none" : "block";
      const inDay = state === "in-day";
      const blocked = state === "full";
      btn.textContent = inDay
        ? (labelsRef.current.inDay ?? "In my day")
        : blocked
          ? (labelsRef.current.dayFull ?? "Day is full")
          : (labelsRef.current.addToDay ?? "Add to my day");
      btn.disabled = blocked;
      btn.setAttribute("aria-pressed", String(inDay));
      btn.style.opacity = blocked ? "0.5" : "1";
      btn.style.cursor = blocked ? "not-allowed" : "pointer";
    };
    refresh();
    btn.addEventListener("click", () => {
      if (daySharedRef.current) return;
      onToggleDayRef.current(slug);
    });
    dayRefreshersRef.current.add(refresh);
    popup.on("close", () => dayRefreshersRef.current.delete(refresh));
  };

  // Locale-aware /places/ link — the default locale (fr) has no URL prefix.
  const localizedPlaceHref = (slug: string): string =>
    localeRef.current !== "fr" ? `/${localeRef.current}/places/${slug}` : `/places/${slug}`;

  // Initialise map — runs once on mount
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

    // Settled/resting frame — final camera position once the intro (if any) resolves.
    const SETTLED_CAMERA = {
      center: [2.6065, 48.4455] as [number, number],
      zoom: 15,
      pitch: 40,
      bearing: 0,
    };
    // Intro start frame — southeast of the village, over the forest edge.
    const INTRO_CAMERA = {
      center: [2.6135, 48.4395] as [number, number],
      zoom: 13.8,
      pitch: 72,
      bearing: -32,
    };

    const useIntro = !prefersReducedMotion() && !hasFocusParam();
    const initialCamera = useIntro ? INTRO_CAMERA : SETTLED_CAMERA;

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
      center: initialCamera.center,
      zoom: initialCamera.zoom,
      pitch: initialCamera.pitch,
      bearing: initialCamera.bearing,
      minZoom: 10,
      maxZoom: 20,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.addControl(
      new mapboxgl.GeolocateControl({
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true,
      }),
      "top-right"
    );

    map.on("load", async () => {
      // Load all SVG icons before adding layers
      await Promise.all(
        Object.entries(ICON_SVGS).map(
          ([id, svg]) => loadSVGImage(map, id, svg, 36)
        )
      );

      // Terrain — desktop-class input only (see terrainAllowed comment above)
      if (terrainAllowed()) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
      }

      // GeoJSON source with clustering
      map.addSource("locations", {
        type: "geojson",
        data: buildGeoJSON(locations),
        cluster: true,
        clusterMaxZoom: 15,
        clusterRadius: 44,
        clusterProperties: {
          dominant_group: [
            ["coalesce", ["accumulated"], ["get", "dominant_group"]],
            ["get", "group"],
          ],
        },
      });

      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "locations",
        slot: "top",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "match",
            ["get", "dominant_group"],
            "Art & History",
            GROUP_COLORS["Art & History"],
            "Eat & Stay",
            GROUP_COLORS["Eat & Stay"],
            "Forest & Nature",
            GROUP_COLORS["Forest & Nature"],
            "Practical",
            GROUP_COLORS["Practical"],
            GROUP_COLORS["Art & History"],
          ],
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
        slot: "top",
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
        slot: "top",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["get", "iconId"],
          "icon-size": 1,
          "icon-allow-overlap": true,
          // Mapbox symbol layout supports icon-overlap; bundled types omit it.
          // @ts-expect-error — icon-overlap
          "icon-overlap": "always",
          "symbol-sort-key": [
            "match",
            ["get", "group"],
            "Forest & Nature",
            3,
            "Art & History",
            2,
            "Eat & Stay",
            1,
            0,
          ],
          "icon-anchor": "center",
        },
      });

      // ── Trail routes ──────────────────────────────────────────────────────
      map.addSource("routes", {
        type: "geojson",
        data: buildRoutesGeoJSON(routes),
      });

      // Trail outline (slightly wider, darker — gives depth)
      map.addLayer({
        id: "route-outline",
        type: "line",
        source: "routes",
        slot: "middle",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 5,
          "line-opacity": 0.3,
        },
      });

      // Trail fill
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "routes",
        slot: "middle",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 3,
          "line-opacity": 0.9,
          "line-dasharray": [2, 1.5],
        },
      });

      // Hover highlight
      map.addLayer({
        id: "route-hover",
        type: "line",
        source: "routes",
        slot: "middle",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        paint: {
          "line-color": "#F5F1E8",
          "line-width": 4,
          "line-opacity": 0,
        },
      });

      // ── My day overlay ────────────────────────────────────────────────────
      // Separate source from `routes` so trail hide/reset handlers never clear
      // it. Same line recipe as the trails; dashes signal "not a path".
      map.addSource("my-day", {
        type: "geojson",
        data: buildDayGeoJSON(dayStopsRef.current),
      });
      map.addLayer({
        id: "my-day-outline",
        type: "line",
        source: "my-day",
        slot: "middle",
        filter: ["==", ["geometry-type"], "LineString"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#7A5C3E",
          "line-width": 5,
          "line-opacity": 0.3,
        },
      });
      map.addLayer({
        id: "my-day-line",
        type: "line",
        source: "my-day",
        slot: "middle",
        filter: ["==", ["geometry-type"], "LineString"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#7A5C3E",
          "line-width": 3,
          "line-opacity": 0.9,
          "line-dasharray": [2, 1.5],
        },
      });
      map.addLayer({
        id: "my-day-stops",
        type: "circle",
        source: "my-day",
        slot: "top",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": 11,
          "circle-color": "#7A5C3E",
          "circle-stroke-width": 3,
          "circle-stroke-color": C,
        },
      });
      map.addLayer({
        id: "my-day-stop-numbers",
        type: "symbol",
        source: "my-day",
        slot: "top",
        filter: ["==", ["geometry-type"], "Point"],
        layout: {
          "text-field": ["to-string", ["get", "n"]],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-allow-overlap": true,
        },
        paint: { "text-color": C },
      });

      // Intro camera glide — settles from the forest-edge start frame into the
      // resting village frame, once (guarded by hasIntroPlayed so a style
      // reload never re-triggers it).
      if (useIntro && !hasIntroPlayed.current) {
        hasIntroPlayed.current = true;
        map.flyTo({
          center: SETTLED_CAMERA.center,
          zoom: SETTLED_CAMERA.zoom,
          pitch: SETTLED_CAMERA.pitch,
          bearing: SETTLED_CAMERA.bearing,
          duration: 2500,
          easing: easeSoft,
          essential: true,
        });
      }

      // Trail click → popup with navigate button
      map.on("click", "route-line", (e) => {
        if (!e.features?.[0]) return;
        const props = e.features[0].properties as {
          name: string;
          description: string | null;
          distance_meters: number | null;
          duration_minutes: number | null;
          difficulty: string | null;
          start_lat: number;
          start_lng: number;
        };
        const difficultyKey =
          props.difficulty === "easy"
            ? "difficultyEasy"
            : props.difficulty === "hard"
              ? "difficultyHard"
              : "difficultyModerate";
        const difficultyLabel =
          labelsRef.current[difficultyKey] ?? props.difficulty ?? "moderate";
        const trailEyebrow = labelsRef.current.trailEyebrow ?? "Trail";
        const loopLabel = labelsRef.current.loop ?? "Loop";

        const trailPopup = new mapboxgl.Popup({ offset: 12, maxWidth: "280px" })
          .setLngLat(e.lngLat)
          .setHTML(
            buildTrailPopupContent({
              name: props.name,
              description: props.description,
              distanceMeters: props.distance_meters,
              durationMinutes: props.duration_minutes,
              difficulty: props.difficulty,
              startLat: props.start_lat,
              startLng: props.start_lng,
              trailEyebrow,
              difficultyLabel,
              loopLabel,
            })
          );
        trailPopup.addTo(map);
        keepPopupClear(map, trailPopup, () => getOverlayElementsRef.current?.() ?? []);
      });

      // Hover cursor + highlight
      map.on("mouseenter", "route-line", () => {
        map.getCanvas().style.cursor = "pointer";
        map.setPaintProperty("route-hover", "line-opacity", 0.6);
      });
      map.on("mouseleave", "route-line", () => {
        map.getCanvas().style.cursor = "";
        map.setPaintProperty("route-hover", "line-opacity", 0);
      });

      // Store routes ref for later updates
      routesRef.current = routes;

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

      // Pin click → popup (+ linked trail reveal)
      map.on("click", "unclustered-point", (e) => {
        if (!e.features?.[0]) return;
        const props = e.features[0].properties as {
          slug: string;
          name: string;
          category: string;
          categorySlug: string;
          shortDescription: string;
          route_slug: string;
          placeSlug: string;
        };
        const geom = e.features[0].geometry;
        if (geom.type !== "Point") return;
        const coords = geom.coordinates as [number, number];

        if (props.route_slug) {
          hideAllRoutes(map);
          const src = map.getSource("routes") as mapboxgl.GeoJSONSource | undefined;
          if (src) {
            const activeRoute = routesRef.current.find(
              (r) => r.slug === props.route_slug
            );
            if (activeRoute) {
              src.setData(buildRoutesGeoJSON([activeRoute]));
              ["route-outline", "route-line"].forEach((id) => {
                if (map.getLayer(id))
                  map.setLayoutProperty(id, "visibility", "visible");
              });
            }
          }
        }

        // Locale-prefixed: the raw `/places/${slug}` href below previously
        // linked every pin popup to the French page even on /en/map.
        const href = props.placeSlug ? localizedPlaceHref(props.placeSlug) : null;
        const viewPlaceLabel = labelsRef.current.viewPlace ?? "View place";

        const pinPopup = new mapboxgl.Popup({ offset: 18, maxWidth: "260px" })
          .setLngLat(coords)
          .setHTML(
            buildPinPopupContent({
              slug: props.slug,
              category: props.category,
              categorySlug: props.categorySlug,
              categoryLabels: categoryLabelsRef.current,
              name: props.name,
              shortDescription: props.shortDescription,
              href,
              viewPlaceLabel,
            })
          )
          .on("close", () => {
            hideAllRoutes(map);
            const src = map.getSource("routes") as mapboxgl.GeoJSONSource | undefined;
            src?.setData(buildRoutesGeoJSON(routesRef.current));
          })
          .addTo(map);
        attachDayToggle(pinPopup, props.slug);
        keepPopupClear(map, pinPopup, () => getOverlayElementsRef.current?.() ?? []);
      });

      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point", "clusters", "route-line"],
        });
        if (features.length === 0) {
          hideAllRoutes(map);
          const src = map.getSource("routes") as mapboxgl.GeoJSONSource | undefined;
          src?.setData(buildRoutesGeoJSON(routesRef.current));
        }
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

  useEffect(() => {
    routesRef.current = routes;
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const src = map.getSource("routes") as mapboxgl.GeoJSONSource | undefined;
      src?.setData(buildRoutesGeoJSON(routes));
    };
    map.isStyleLoaded() ? update() : map.once("load", update);
  }, [routes]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusSlug) return;

    const source = allLocations ?? locations;
    const target = source.find((l) => l.slug === focusSlug);
    if (!target) return;

    const targetPlaceSlug =
      (target as Place & { placeSlug?: string | null }).placeSlug ?? "";
    const focusHref = targetPlaceSlug ? localizedPlaceHref(targetPlaceSlug) : null;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const fly = () => {
      focusPopupRef.current?.remove();
      focusPopupRef.current = null;

      map.flyTo({
        center: [target.longitude, target.latitude],
        zoom: 16,
        pitch: 55,
        duration: 1200,
      });

      timeoutId = setTimeout(() => {
        focusPopupRef.current?.remove();
        const popup = new mapboxgl.Popup({ offset: 18, maxWidth: "260px" })
          .setLngLat([target.longitude, target.latitude])
          .setHTML(
            buildPinPopupContent({
              slug: target.slug,
              category: target.category,
              categorySlug: target.categorySlug ?? "",
              categoryLabels: categoryLabelsRef.current,
              name: target.name,
              shortDescription: target.shortDescription,
              href: focusHref,
              viewPlaceLabel: labelsRef.current.viewPlace ?? "View place",
            })
          )
          .addTo(map);
        attachDayToggle(popup, target.slug);
        keepPopupClear(map, popup, () => getOverlayElementsRef.current?.() ?? []);
        focusPopupRef.current = popup;
      }, 1300);
    };

    map.isStyleLoaded() ? fly() : map.once("load", fly);

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      focusPopupRef.current?.remove();
      focusPopupRef.current = null;
    };
  }, [focusSlug, locations, allLocations]);

  // Day overlay data + popup button state. Refs are synced first so the load
  // handler (which seeds from dayStopsRef) and the popup refreshers agree.
  useEffect(() => {
    dayStopsRef.current = dayStops;
    daySlugsRef.current = daySlugs;
    dayFullRef.current = dayFull;
    daySharedRef.current = dayShared;
    onToggleDayRef.current = onToggleDay;
    dayRefreshersRef.current.forEach((refresh) => refresh());
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const src = map.getSource("my-day") as mapboxgl.GeoJSONSource | undefined;
      src?.setData(buildDayGeoJSON(dayStops));
    };
    map.isStyleLoaded() ? update() : map.once("load", update);
  }, [dayStops, daySlugs, dayFull, dayShared, onToggleDay]);

  // Camera fit on request (panel opened / shared day arrived).
  useEffect(() => {
    if (fitDayToken === 0) return;
    const map = mapRef.current;
    if (!map) return;
    const fit = () => {
      const stops = dayStopsRef.current;
      if (stops.length === 0) return;
      if (stops.length === 1) {
        map.flyTo({
          center: [stops[0].longitude, stops[0].latitude],
          zoom: 16,
          duration: prefersReducedMotion() ? 0 : 1200,
        });
        return;
      }
      const bounds = new mapboxgl.LngLatBounds();
      stops.forEach((st) => bounds.extend([st.longitude, st.latitude]));
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      map.fitBounds(bounds, {
        padding: {
          top: 80,
          left: 40,
          right: desktop ? 440 : 40,
          bottom: desktop ? 80 : 360,
        },
        maxZoom: 17,
        duration: prefersReducedMotion() ? 0 : 1200,
      });
    };
    map.isStyleLoaded() ? fit() : map.once("load", fit);
  }, [fitDayToken]);

  return <div ref={containerRef} className="h-full w-full" />;
}
