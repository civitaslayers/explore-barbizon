// ---------------------------------------------------------------------------
// lib/relatedStories.test.ts
//
// Unit tests for resolveRelated() (lib/relatedStories.ts) and a data
// integrity check over RELATED_SLUGS (data/relatedStories.ts). Run with
// `npm test` (`node --test lib/relatedStories.test.ts`).
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveRelated,
  type RelatedPlaceRow,
  type RelatedStoryRow,
} from "./relatedStories.ts";
import { RELATED_SLUGS } from "../data/relatedStories.ts";

const storyFrOnly: RelatedStoryRow = {
  slug: "rooms-of-light",
  title: "Des chambres de lumière",
  theme: "Studio",
};

const storyPublishedEn: RelatedStoryRow = {
  slug: "inn-paintings-dinner",
  title: "L'auberge où l'on payait en tableaux",
  theme: "Village life",
  translations: {
    en: {
      title: "The Inn Where Paintings Paid for Dinner",
      _meta: { status: "published" },
    },
  },
};

const storyDraftEn: RelatedStoryRow = {
  slug: "paths-to-the-forest",
  title: "Les chemins vers la forêt",
  theme: "Landscape",
  translations: {
    en: { title: "Paths to the Forest Edge", _meta: { status: "draft" } },
  },
};

const storyPublishedEnEmptyTitle: RelatedStoryRow = {
  slug: "the-gleaners",
  title: "Les Glaneuses",
  theme: "Landscape",
  translations: {
    en: { title: "", _meta: { status: "published" } },
  },
};

const placeMaisonMillet: RelatedPlaceRow = {
  slug: "maison-millet",
  name: "Maison-atelier Millet",
  categories: { name: "Artist House", slug: "artist-house" },
  translations: {
    en: { name: "Millet House and Studio", _meta: { status: "published" } },
  },
};

const placeNoCategory: RelatedPlaceRow = {
  slug: "sentier-des-peintres",
  name: "Sentier des Peintres",
  categories: null,
};

const allStories = [
  storyFrOnly,
  storyPublishedEn,
  storyDraftEn,
  storyPublishedEnEmptyTitle,
];
const allPlaces = [placeMaisonMillet, placeNoCategory];

test("1. undefined spec returns empty stories and places", () => {
  const out = resolveRelated("x", undefined, allStories, allPlaces, "fr");
  assert.deepEqual(out, { stories: [], places: [] });
});

test("2. fr locale returns base columns even when a published en translation exists", () => {
  const out = resolveRelated(
    "x",
    { stories: ["inn-paintings-dinner"], places: ["maison-millet"] },
    allStories,
    allPlaces,
    "fr"
  );
  assert.equal(out.stories[0]?.title, "L'auberge où l'on payait en tableaux");
  assert.equal(out.places[0]?.name, "Maison-atelier Millet");
});

test("3. en + published, non-empty translation returns English", () => {
  const out = resolveRelated(
    "x",
    { stories: ["inn-paintings-dinner"], places: ["maison-millet"] },
    allStories,
    allPlaces,
    "en"
  );
  assert.equal(out.stories[0]?.title, "The Inn Where Paintings Paid for Dinner");
  assert.equal(out.places[0]?.name, "Millet House and Studio");
});

test("4. en + draft translation falls back to the French base", () => {
  const out = resolveRelated(
    "x",
    { stories: ["paths-to-the-forest"], places: [] },
    allStories,
    allPlaces,
    "en"
  );
  assert.equal(out.stories[0]?.title, "Les chemins vers la forêt");
});

test("5. en + published but empty title falls back to the French base", () => {
  const out = resolveRelated(
    "x",
    { stories: ["the-gleaners"], places: [] },
    allStories,
    allPlaces,
    "en"
  );
  assert.equal(out.stories[0]?.title, "Les Glaneuses");
});

test("6. spec slug absent from rows is omitted and order is kept", () => {
  const out = resolveRelated(
    "x",
    {
      stories: ["rooms-of-light", "not-published", "the-gleaners"],
      places: ["musee-de-barbizon", "maison-millet"],
    },
    allStories,
    allPlaces,
    "fr"
  );
  assert.deepEqual(
    out.stories.map((s) => s.slug),
    ["rooms-of-light", "the-gleaners"]
  );
  assert.deepEqual(
    out.places.map((p) => p.slug),
    ["maison-millet"]
  );
});

test("7. spec containing the current story slug drops it", () => {
  const out = resolveRelated(
    "rooms-of-light",
    { stories: ["rooms-of-light", "the-gleaners"], places: [] },
    allStories,
    allPlaces,
    "fr"
  );
  assert.deepEqual(
    out.stories.map((s) => s.slug),
    ["the-gleaners"]
  );
});

test("8. duplicate slugs appear once, at their first position", () => {
  const out = resolveRelated(
    "x",
    {
      stories: ["the-gleaners", "rooms-of-light", "the-gleaners"],
      places: ["maison-millet", "maison-millet"],
    },
    allStories,
    allPlaces,
    "fr"
  );
  assert.deepEqual(
    out.stories.map((s) => s.slug),
    ["the-gleaners", "rooms-of-light"]
  );
  assert.deepEqual(
    out.places.map((p) => p.slug),
    ["maison-millet"]
  );
});

test("9. theme is trimmed; null or empty theme becomes null", () => {
  const rows: RelatedStoryRow[] = [
    { slug: "a", title: "A", theme: "  Village life " },
    { slug: "b", title: "B", theme: null },
    { slug: "c", title: "C", theme: "" },
    { slug: "d", title: "D", theme: "   " },
  ];
  const out = resolveRelated(
    "x",
    { stories: ["a", "b", "c", "d"], places: [] },
    rows,
    [],
    "fr"
  );
  assert.deepEqual(
    out.stories.map((s) => s.theme),
    ["Village life", null, null, null]
  );
});

test("10. place with categories null yields null category fields", () => {
  const out = resolveRelated(
    "x",
    { stories: [], places: ["sentier-des-peintres"] },
    allStories,
    allPlaces,
    "fr"
  );
  assert.deepEqual(out.places, [
    {
      slug: "sentier-des-peintres",
      name: "Sentier des Peintres",
      categorySlug: null,
      categoryName: null,
    },
  ]);
});

test("11. RELATED_SLUGS data integrity: slug shapes, no self-reference, no duplicates", () => {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  for (const [key, spec] of Object.entries(RELATED_SLUGS)) {
    assert.match(key, slugPattern, `key ${key}`);
    for (const s of spec.stories) assert.match(s, slugPattern, `${key} story ${s}`);
    for (const p of spec.places) assert.match(p, slugPattern, `${key} place ${p}`);
    assert.ok(
      !spec.stories.includes(key),
      `${key} lists itself under stories`
    );
    assert.equal(
      new Set(spec.stories).size,
      spec.stories.length,
      `${key} has duplicate stories`
    );
    assert.equal(
      new Set(spec.places).size,
      spec.places.length,
      `${key} has duplicate places`
    );
  }
});
