// ---------------------------------------------------------------------------
// data/relatedStories.ts
//
// Editorial "related" picks for story pages, slug-only. No display values
// live here: titles, themes, place names and categories are resolved from the
// database at build time (lib/relatedStories.ts, pages/stories/[slug].tsx
// getStaticProps) through getLocalized(), so they follow the locale and the
// published state of each record. Array order = editorial order.
//
// This mapping goes stale when stories are added — the price of having no
// story<->location relationship in the schema yet (see brain/decisions.md,
// task 33c21389). Unpublished or missing slugs are dropped at build time.
// ---------------------------------------------------------------------------

export type RelatedSlugs = { stories: string[]; places: string[] };

export const RELATED_SLUGS: Record<string, RelatedSlugs> = {
  "rooms-of-light": {
    stories: ["inn-paintings-dinner"],
    places: ["maison-millet"],
  },
  "paths-to-the-forest": {
    stories: ["inn-paintings-dinner"],
    places: ["sentier-des-peintres"],
  },
  "inn-paintings-dinner": {
    stories: ["rooms-of-light", "paths-to-the-forest"],
    places: ["auberge-ganne"],
  },
  "the-gleaners": {
    stories: ["rooms-of-light", "paths-to-the-forest"],
    places: ["maison-millet"],
  },
  "how-the-forest-became-a-picture": {
    stories: ["paths-to-the-forest", "the-gleaners"],
    places: ["sentier-des-peintres"],
  },
};
