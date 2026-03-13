export type Highlight = {
  slug: string;
  title: string;
  subtitle: string;
  category: "Studio" | "Walk" | "Landscape" | "Museum";
};

export const highlights: Highlight[] = [
  {
    slug: "atelier-rouge",
    title: "Atelier Rouge, North Light",
    subtitle: "A former painter’s studio overlooking the forest edge.",
    category: "Studio"
  },
  {
    slug: "sentier-des-peintres",
    title: "Sentier des Peintres",
    subtitle: "A quiet path tracing the steps of the Barbizon school.",
    category: "Walk"
  },
  {
    slug: "clairiere-du-soir",
    title: "Clairière du Soir",
    subtitle: "A clearing where the light falls in slow planes at dusk.",
    category: "Landscape"
  },
  {
    slug: "musee-de-barbizon",
    title: "Musée de Barbizon",
    subtitle: "Rooms of sketches, field notes, and weather studies.",
    category: "Museum"
  }
];

