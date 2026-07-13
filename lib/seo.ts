import type { LocationFull } from "@/lib/supabase";
import { getCategoryGroup, type GroupName } from "@/lib/categoryGroups";
import { getLocalized } from "@/lib/getLocalized";
import { toOpeningHoursSpecification } from "@/lib/openingHours";
import { SITE_BASE_URL } from "@/components/SeoHead";

// ---------------------------------------------------------------------------
// lib/seo.ts
//
// JSON-LD builders. Type derivation goes via lib/categoryGroups.ts's
// GROUP_NAMES (docs/i18n-seo-implementation-plan.md, Task 4b) rather than
// re-deriving group logic here, so this file and the map/filter UI never
// drift on what "Art & History" etc. means.
// ---------------------------------------------------------------------------

const GROUP_TO_SCHEMA_TYPE: Record<GroupName, string> = {
  "Art & History": "TouristAttraction",
  "Forest & Nature": "TouristAttraction",
  "Eat & Stay": "LocalBusiness", // refined below for lodging/food subtypes
  // Practical (parking, toilets, EV chargers) is neither an attraction nor a
  // business — the plan flags this mapping as unconfirmed and recommends the
  // generic schema.org `Place` type over omitting JSON-LD entirely.
  Practical: "Place",
};

function schemaTypeForEatStay(primaryLabel: string | undefined): string {
  const label = (primaryLabel ?? "").toLowerCase();
  if (label.includes("hotel") || label.includes("suite")) {
    return "LodgingBusiness";
  }
  if (
    label.includes("restaurant") ||
    label.includes("café") ||
    label.includes("cafe") ||
    label.includes("salon")
  ) {
    return "FoodEstablishment";
  }
  return "LocalBusiness";
}

/**
 * Builds the JSON-LD schema for a location detail page. `locale` drives
 * getLocalized() for the name/description fields — fr reads the base
 * columns, en reads the published translation when available.
 */
export function buildPlaceSchema(place: LocationFull, locale: string = "fr") {
  // Prefer the location's own category (locations.category_id) — the
  // majority of locations have no location_functions rows, so deriving the
  // group from functions-only (as before) silently fell through to the
  // default for most of the catalogue. Fall back to the primary function's
  // category for the multi-service-venue case where it carries more
  // specific detail (e.g. "Hotel" vs a generic parent category).
  const primaryFunction =
    place.functions.find((f) => f.is_primary) ?? place.functions[0];
  const categoryName =
    place.category?.name ?? primaryFunction?.category?.name ?? "";
  const layer = place.category?.layer ?? primaryFunction?.category?.layer ?? "";

  const group = getCategoryGroup(categoryName, layer);
  let type = GROUP_TO_SCHEMA_TYPE[group];
  if (group === "Eat & Stay") {
    type = schemaTypeForEatStay(primaryFunction?.label ?? categoryName);
  }

  const name = getLocalized(place, locale, "name") || place.name;
  const description =
    getLocalized(place, locale, "short_description") ||
    place.short_description ||
    undefined;

  const openingHoursSpecification = toOpeningHoursSpecification(
    place.opening_hours
  );

  const localePrefix = locale === "fr" ? "" : `/${locale}`;

  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    address: {
      "@type": "PostalAddress",
      streetAddress: place.address ?? undefined,
      addressLocality: "Barbizon",
      addressRegion: "Seine-et-Marne",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: place.latitude,
      longitude: place.longitude,
    },
    url: `${SITE_BASE_URL}${localePrefix}/places/${place.slug}`,
    image: place.heroImage ?? undefined,
    ...(openingHoursSpecification
      ? { openingHoursSpecification }
      : {}),
  };
}

export type ArticleSchemaSource = {
  slug: string;
  title: string;
  description?: string | null;
  author?: string | null;
  published_at?: string | null;
  image?: string | null;
};

/**
 * Builds the JSON-LD Article schema for a story detail page.
 */
export function buildArticleSchema(
  story: ArticleSchemaSource,
  locale: string = "fr"
) {
  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  const url = `${SITE_BASE_URL}${localePrefix}/stories/${story.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.description ?? undefined,
    author: story.author
      ? { "@type": "Person", name: story.author }
      : undefined,
    datePublished: story.published_at ?? undefined,
    image: story.image ?? undefined,
    mainEntityOfPage: url,
    url,
  };
}
