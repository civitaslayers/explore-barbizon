export type PlaceCategory = "Studio" | "Walk" | "Landscape" | "Museum" | "Cafe";

export type Place = {
  slug: string;
  name: string;
  location: string;
  shortDescription: string;
  description: string;
  history?: string;
  heroImage?: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
};

export const places: Place[] = [
  {
    slug: "atelier-rouge",
    name: "Atelier Rouge",
    location: "Forest edge, Barbizon",
    shortDescription: "A former painter’s north-light studio on the forest edge.",
    description:
      "Once a working studio for a Barbizon painter, Atelier Rouge still carries the geometry of north light: tall windows, pale walls, and a quiet view toward the forest. It is less a monument than a working room, where canvases and weather studies once leaned against the wall.",
    history:
      "In the later 19th century, studios like this were improvised from existing houses and barns, adapted to catch a steady north light. While the names of some of these painters have faded, the rooms they worked in still structure how the village meets the forest.",
    heroImage: "/images/places/atelier-rouge.jpg",
    category: "Studio",
    latitude: 48.443,
    longitude: 2.605
  },
  {
    slug: "sentier-des-peintres",
    name: "Sentier des Peintres",
    location: "Path from village to forest",
    shortDescription: "A path tracing the routes of 19th‑century landscape painters.",
    description:
      "The Sentier des Peintres threads the village to the forest, following inexactly the paths that painters once walked with easels and wooden paint boxes. Along the way, the light opens and narrows; clearings appear suddenly, like small rooms among the trees.",
    history:
      "The path recalls the habitual routes of the Barbizon painters, who carried portable easels toward rocks and clearings that would later appear in the Salon. Over time, these informal trajectories became semi-official trails, folded into tourist maps and walking guides.",
    heroImage: "/images/places/sentier-des-peintres.jpg",
    category: "Walk",
    latitude: 48.445,
    longitude: 2.61
  },
  {
    slug: "musee-de-barbizon",
    name: "Musée de Barbizon",
    location: "Former inn on the Grande Rue",
    shortDescription: "A house‑museum of sketches, studies, and weather notes.",
    description:
      "Housed in a former inn, the Musée de Barbizon is more archive than spectacle: sketchbooks, letters, and small field studies arranged with the calm of a reading room. It is a place to understand how the surrounding landscape translated into line and tone.",
    history:
      "Once an inn that hosted painters and early visitors, the building later became a museum dedicated to the Barbizon School. Its rooms have shifted from lodging to exhibition, but the scale remains domestic, closer to a house than a gallery.",
    heroImage: "/images/places/musee-de-barbizon.jpg",
    category: "Museum",
    latitude: 48.446,
    longitude: 2.608
  }
];

export function getAllPlaces(): Place[] {
  return places;
}

export function getPlaceBySlug(slug: string): Place | undefined {
  return places.find((place) => place.slug === slug);
}

