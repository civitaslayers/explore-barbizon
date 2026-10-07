// ---------------------------------------------------------------------------
// lib/relatedStories.ts
//
// Pure resolver for the related-content sidebar on story pages. Takes the
// slug-only editorial mapping (data/relatedStories.ts) plus the DB rows the
// page fetched for those slugs, and produces display cards with every text
// value read through getLocalized() (French-canonical, published-only
// translations). No React, no Supabase, no @/ imports — testable with
// `node --test lib/relatedStories.test.ts`.
//
// Theme and category LABELS are not resolved here: they need the i18n `t`
// function and are handled at render time in components/RelatedStories.tsx
// (story.themes.* keys and lib/categoryLabel.ts respectively).
//
// Never throws, never returns null. Unknown/missing slugs are dropped;
// editorial order is preserved; duplicates collapse to their first position.
// ---------------------------------------------------------------------------

import { getLocalized, type LocalizableRow } from "./getLocalized.ts";
import type { RelatedSlugs } from "../data/relatedStories.ts";

export type RelatedStoryRow = LocalizableRow & {
  slug: string;
  title: string;
  theme: string | null;
};

export type RelatedPlaceRow = LocalizableRow & {
  slug: string;
  name: string;
  categories: { name: string; slug: string } | null;
};

export type RelatedStoryCard = {
  slug: string;
  title: string;
  theme: string | null;
};

export type RelatedPlaceCard = {
  slug: string;
  name: string;
  categorySlug: string | null;
  categoryName: string | null;
};

export type RelatedContent = {
  stories: RelatedStoryCard[];
  places: RelatedPlaceCard[];
};

export const EMPTY_RELATED: RelatedContent = { stories: [], places: [] };

export function resolveRelated(
  currentSlug: string,
  spec: RelatedSlugs | undefined,
  storyRows: RelatedStoryRow[],
  placeRows: RelatedPlaceRow[],
  locale: string
): RelatedContent {
  if (!spec) return { stories: [], places: [] };

  const storyBySlug = new Map(storyRows.map((row) => [row.slug, row]));
  const placeBySlug = new Map(placeRows.map((row) => [row.slug, row]));

  const stories: RelatedStoryCard[] = [];
  const seenStories = new Set<string>();
  for (const slug of spec.stories) {
    if (slug === currentSlug || seenStories.has(slug)) continue;
    const row = storyBySlug.get(slug);
    if (!row) continue;
    seenStories.add(slug);
    stories.push({
      slug: row.slug,
      title: getLocalized(row, locale, "title") || row.title,
      theme: row.theme?.trim() || null,
    });
  }

  const places: RelatedPlaceCard[] = [];
  const seenPlaces = new Set<string>();
  for (const slug of spec.places) {
    if (seenPlaces.has(slug)) continue;
    const row = placeBySlug.get(slug);
    if (!row) continue;
    seenPlaces.add(slug);
    places.push({
      slug: row.slug,
      name: getLocalized(row, locale, "name") || row.name,
      categorySlug: row.categories?.slug ?? null,
      categoryName: row.categories?.name ?? null,
    });
  }

  return { stories, places };
}
