// ---------------------------------------------------------------------------
// lib/tourPage.ts
//
// Pure, locale-bound resolvers for `tours` rows: the tour detail page
// (pages/tours/[slug].tsx) and the plan-your-visit tour list
// (pages/plan-your-visit.tsx). Tours are localized here and only here —
// every DB string goes through getLocalized(), and the outputs are built
// field-by-field so `translations` (and internal ids) never reach page data.
// No React, no Next, no "@/" aliases: runnable under `node --test`.
// ---------------------------------------------------------------------------

import { getLocalized, type LocalizableRow } from "./getLocalized.ts";

/** Structural subset of lib/supabase.ts TourWithStops / DbTourStop. */
export type TourStopInput = LocalizableRow & {
  stop_order: number;
  stop_narrative: string | null;
  locations:
    | (LocalizableRow & {
        slug: string;
        name: string;
        short_description: string | null;
        latitude: number;
        longitude: number;
      })
    | null;
};

export type TourInput = LocalizableRow & {
  slug: string;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  distance_meters: number | null;
  stops: TourStopInput[];
};

/** Resolved, locale-bound, JSON-safe. No `translations` at any level. */
export type TourStopView = {
  stop_order: number;
  stop_narrative: string | null;
  locations: {
    slug: string;
    name: string;
    short_description: string | null;
    latitude: number;
    longitude: number;
  } | null;
};

export type TourView = {
  slug: string;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  distance_meters: number | null;
  stops: TourStopView[];
};

/** Structural subset of lib/supabase.ts TourWithStops read by toTourListItem:
 *  the tour-level text plus each stop's `location_id`. A separate type (not
 *  `TourInput & { stops: … }`) because TS resolves `.map` on an intersection
 *  of two array types against the first one only. */
export type TourListInput = LocalizableRow & {
  slug: string;
  name: string;
  description: string | null;
  duration_minutes: number | null;
  stops: { location_id: string }[];
};

/** Structurally identical to lib/types.ts TourListItem (not imported — keeps
 *  this module free of "@/" aliases). */
export type TourListItemView = {
  slug: string;
  title: string;
  summary: string;
  durationHours: number;
  stops: string[];
};

/**
 * Resolve a tour and its stops for `locale`. Stop order is preserved as given
 * (the adapter already sorted by stop_order); no re-sort here.
 */
export function localizeTour(tour: TourInput, locale: string): TourView {
  return {
    slug: tour.slug,
    name: getLocalized(tour, locale, "name") || tour.name,
    description: getLocalized(tour, locale, "description") || null,
    duration_minutes: tour.duration_minutes,
    distance_meters: tour.distance_meters,
    stops: tour.stops.map((stop): TourStopView => {
      const loc = stop.locations;
      return {
        stop_order: stop.stop_order,
        stop_narrative: getLocalized(stop, locale, "stop_narrative") || null,
        locations: loc
          ? {
              slug: loc.slug,
              name: getLocalized(loc, locale, "name") || loc.name,
              short_description:
                getLocalized(loc, locale, "short_description") || null,
              latitude: loc.latitude,
              longitude: loc.longitude,
            }
          : null,
      };
    }),
  };
}

/**
 * The plan-your-visit list item — the exact mapping the page did inline
 * before, now localized.
 */
export function toTourListItem(
  tour: TourListInput,
  locale: string
): TourListItemView {
  return {
    slug: tour.slug,
    title: getLocalized(tour, locale, "name") || tour.name,
    summary: getLocalized(tour, locale, "description") || "",
    durationHours: Math.round((tour.duration_minutes ?? 120) / 60),
    stops: tour.stops.map((s) => s.location_id),
  };
}
