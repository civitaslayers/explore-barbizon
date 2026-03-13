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
    slug: "maison-millet",
    name: "Maison Millet",
    location: "Grande Rue, Barbizon",
    shortDescription: "The former home of Jean‑François Millet, now a quiet landmark on the village street.",
    description:
      "The house where Jean‑François Millet lived and worked for over twenty years still stands on the Grande Rue. Its garden, studio, and modest rooms suggest a life spent between domestic rhythms and the surrounding fields. More home than monument, it remains one of the few places in Barbizon where a painter's daily scale is still legible.",
    history:
      "Millet arrived in Barbizon in 1849 and stayed until his death in 1875, producing some of his most important work here. The house became a site of pilgrimage for artists and critics in the late nineteenth century, and later a protected landmark.",
    heroImage: "/images/places/maison-millet.jpg",
    category: "Studio",
    latitude: 48.4462,
    longitude: 2.6074
  },
  {
    slug: "auberge-ganne",
    name: "Auberge Ganne",
    location: "Grande Rue, Barbizon",
    shortDescription: "An inn turned museum, where walls once held sketches and evening conversations.",
    description:
      "The Auberge Ganne was the social centre of the Barbizon School: a country inn where painters lodged cheaply, argued about light and technique, and left sketches on the walls in lieu of payment. Today it functions as a museum, with those painted walls still visible behind glass.",
    history:
      "Père Ganne began hosting artists in the 1830s, accepting paintings as payment. The inn became a gathering place for Millet, Rousseau, Diaz, and their circle. Restored and reopened as a museum in the late twentieth century, it is now one of the best-preserved records of how the Barbizon painters actually lived.",
    heroImage: "/images/places/auberge-ganne.jpg",
    category: "Museum",
    latitude: 48.4458,
    longitude: 2.6068
  },
  {
    slug: "grande-rue",
    name: "Grande Rue",
    location: "Barbizon village centre",
    shortDescription: "The main street as a long, slow axis between stone houses and forest air.",
    description:
      "The Grande Rue runs the length of Barbizon from the edge of the forest to the open farmland beyond, passing studios, inns, and stone walls along the way. Walking it slowly reveals the village's rhythm: closed gates and open gardens, the smell of stone in the morning, the sound of the forest at either end.",
    heroImage: "/images/places/grande-rue.jpg",
    category: "Walk",
    latitude: 48.4455,
    longitude: 2.607
  },
  {
    slug: "forest-entrance",
    name: "Forest Entrance",
    location: "Barbizon, edge of Fontainebleau",
    shortDescription: "Where village paving gives way to sand paths, rock, and filtered light.",
    description:
      "At the end of the village, the cobblestones give way to sand and the light changes. The Fontainebleau forest begins here without fanfare: a shift in surface underfoot, the first rocks appearing between the trees, a quieter air. This threshold was the daily destination of the Barbizon painters.",
    heroImage: "/images/places/forest-entrance.jpg",
    category: "Landscape",
    latitude: 48.4448,
    longitude: 2.6055
  },
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

