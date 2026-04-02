import type { PlaceFull } from "@/lib/supabase";

export function buildPlaceSchema(place: PlaceFull) {
  const primary =
    place.functions.find((f) => f.is_primary) ?? place.functions[0];
  const layer = primary?.category?.layer ?? "";

  let type: string = "TouristAttraction";
  if (layer === "Eat, Stay & Shop") {
    const label = primary?.label?.toLowerCase() ?? "";
    if (label.includes("hotel") || label.includes("suite")) {
      type = "LodgingBusiness";
    } else if (
      label.includes("restaurant") ||
      label.includes("café") ||
      label.includes("salon")
    ) {
      type = "FoodEstablishment";
    } else {
      type = "LocalBusiness";
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": type,
    name: place.name,
    description: place.seo_description ?? place.short_description ?? undefined,
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
    url: `https://explorebarbizon.com/places/${place.slug}`,
    image: place.og_image_url ?? place.heroImage ?? undefined,
  };
}
