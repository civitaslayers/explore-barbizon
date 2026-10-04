import type { TranslationEntry } from "@/lib/getLocalized";

export type PlaceCategory = string;

export type Place = {
  slug: string;
  name: string;
  location: string;
  shortDescription: string;
  description: string;
  history: string | null;
  heroImage: string | null;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  route_slug?: string | null;
  // snake_case alias of shortDescription, needed so getLocalized()'s
  // base-value fallback (which reads row[field] by exact field name) works
  // without renaming shortDescription everywhere it's already used.
  short_description?: string;
  translations?: Record<string, TranslationEntry> | null;
};

export type TourListItem = {
  slug: string;
  title: string;
  summary: string;
  durationHours: number;
  stops: string[];
};
