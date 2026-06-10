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
};

export type TourListItem = {
  slug: string;
  title: string;
  summary: string;
  durationHours: number;
  stops: string[];
};
