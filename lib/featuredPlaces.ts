// ---------------------------------------------------------------------------
// lib/featuredPlaces.ts
//
// Pure, locale-bound builder for the homepage "featured places" cards
// (pages/index.tsx). Resolves name/short_description through getLocalized()
// so /en never renders the French base column, and ships resolved strings
// only — `translations` / `short_description` never leak into page data.
// No React, no Next, no "@/" aliases: runnable under `node --test`.
// ---------------------------------------------------------------------------

import { getLocalized, type LocalizableRow } from "./getLocalized.ts";

/** Prefer these slugs when present in published data (matches legacy static atlas). */
export const PREFERRED_FEATURED_SLUGS = [
  "maison-millet",
  "auberge-ganne",
  "grande-rue",
  "forest-entrance",
] as const;

/** Structural subset of lib/supabase.ts LocationCard (not imported, so this
 *  module stays node --test-able). `short_description` is the snake_case
 *  base-column alias getLocalized reads; `translations` the raw en entry. */
export type FeaturedPlaceInput = LocalizableRow & {
  slug: string;
  name: string;
  shortDescription: string;
  short_description?: string;
  category: string;
  categorySlug: string | null;
  heroImage: string | null;
};

export type FeaturedPlaceCard = {
  slug: string;
  name: string;
  description: string;
  image: string | null;
  category: string;
  categorySlug: string | null;
};

/**
 * Pick up to four cards — preferred slugs first, then fill in input order —
 * and resolve their text for `locale`. Never throws; empty input → [].
 */
export function buildFeaturedPlaces(
  places: FeaturedPlaceInput[],
  locale: string
): FeaturedPlaceCard[] {
  const bySlug = new Map(places.map((p) => [p.slug, p]));
  const picked: FeaturedPlaceInput[] = [];
  for (const slug of PREFERRED_FEATURED_SLUGS) {
    const p = bySlug.get(slug);
    if (p) picked.push(p);
  }
  for (const p of places) {
    if (picked.length >= 4) break;
    if (!picked.some((x) => x.slug === p.slug)) picked.push(p);
  }
  // Explicit object literal, never `...p`, so raw read-path inputs cannot leak.
  return picked.slice(0, 4).map((p) => ({
    slug: p.slug,
    name: getLocalized(p, locale, "name") || p.name,
    description:
      getLocalized(p, locale, "short_description") || p.shortDescription || "",
    image: p.heroImage,
    category: p.category,
    categorySlug: p.categorySlug,
  }));
}
