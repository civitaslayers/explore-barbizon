import type { Place } from "./places";
import { places } from "./places";

export type Tour = {
  slug: string;
  title: string;
  summary: string;
  durationHours: number;
  stops: string[]; // place slugs
};

export const tours: Tour[] = [
  {
    slug: "forest-light-walk",
    title: "Forest Light Walk",
    summary:
      "A half‑day walk from village streets to the first clearings of the Fontainebleau forest.",
    durationHours: 3,
    stops: ["atelier-rouge", "sentier-des-peintres", "musee-de-barbizon"]
  }
];

export function getAllTours(): Tour[] {
  return tours;
}

export function getTourBySlug(slug: string): Tour | undefined {
  return tours.find((tour) => tour.slug === slug);
}

export function getPlacesForTour(tour: Tour): Place[] {
  return tour.stops
    .map((slug) => places.find((p) => p.slug === slug))
    .filter((p): p is Place => Boolean(p));
}

