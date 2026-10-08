// ---------------------------------------------------------------------------
// lib/featuredPlaces.test.ts
//
// Unit tests for buildFeaturedPlaces() (lib/featuredPlaces.ts). Run with
// `npm test` (`node --test lib/featuredPlaces.test.ts`).
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFeaturedPlaces,
  type FeaturedPlaceInput,
} from "./featuredPlaces.ts";

function input(
  slug: string,
  overrides: Partial<FeaturedPlaceInput> = {}
): FeaturedPlaceInput {
  return {
    slug,
    name: `Name ${slug}`,
    shortDescription: `FR ${slug}`,
    short_description: `FR ${slug}`,
    category: "Artist House",
    categorySlug: "artist-house",
    heroImage: null,
    ...overrides,
  };
}

const publishedEn: FeaturedPlaceInput = {
  slug: "auberge-ganne",
  name: "Auberge Ganne",
  shortDescription: "Ancienne auberge des peintres.",
  short_description: "Ancienne auberge des peintres.",
  category: "Museum",
  categorySlug: "museum",
  heroImage: "https://example.test/ganne.webp",
  translations: {
    en: {
      short_description: "Former inn of the painters.",
      _meta: { status: "published" },
    },
  },
};

const publishedEnWithName: FeaturedPlaceInput = {
  slug: "maison-millet",
  name: "Maison Millet",
  shortDescription: "Atelier du peintre.",
  short_description: "Atelier du peintre.",
  category: "Artist House",
  categorySlug: "artist-house",
  heroImage: null,
  translations: {
    en: {
      name: "Millet House",
      short_description: "The painter's studio.",
      _meta: { status: "published" },
    },
  },
};

const draftEn: FeaturedPlaceInput = {
  slug: "grande-rue",
  name: "Grande Rue",
  shortDescription: "La rue principale.",
  short_description: "La rue principale.",
  category: "Street",
  categorySlug: "street",
  heroImage: null,
  translations: {
    en: {
      short_description: "DRAFT text",
      _meta: { status: "draft" },
    },
  },
};

const noTranslations: FeaturedPlaceInput = {
  slug: "forest-entrance",
  name: "Entrée de la forêt",
  shortDescription: "Porte de la forêt.",
  short_description: "Porte de la forêt.",
  category: "Forest",
  categorySlug: "forest",
  heroImage: null,
};

const nullShortDescription: FeaturedPlaceInput = {
  slug: "sans-description",
  name: "Sans description",
  shortDescription: "",
  short_description: "",
  category: "Other",
  categorySlug: null,
  heroImage: null,
};

const metaMissing: FeaturedPlaceInput = {
  slug: "meta-missing",
  name: "Meta manquante",
  shortDescription: "Texte FR.",
  short_description: "Texte FR.",
  category: "Other",
  categorySlug: null,
  heroImage: null,
  translations: { en: { short_description: "x" } },
};

test("en + published translation → English description, base name", () => {
  const [card] = buildFeaturedPlaces([publishedEn], "en");
  assert.equal(card.description, "Former inn of the painters.");
  assert.equal(card.name, "Auberge Ganne");
});

test("en + published translation with name → English name", () => {
  const [card] = buildFeaturedPlaces([publishedEnWithName], "en");
  assert.equal(card.name, "Millet House");
  assert.equal(card.description, "The painter's studio.");
});

test("en + draft translation → French description (draft never leaks)", () => {
  const [card] = buildFeaturedPlaces([draftEn], "en");
  assert.equal(card.description, "La rue principale.");
  assert.equal(card.name, "Grande Rue");
});

test("en + translation without _meta → French", () => {
  const [card] = buildFeaturedPlaces([metaMissing], "en");
  assert.equal(card.description, "Texte FR.");
});

test("en + no translations → French", () => {
  const [card] = buildFeaturedPlaces([noTranslations], "en");
  assert.equal(card.description, "Porte de la forêt.");
  assert.equal(card.name, "Entrée de la forêt");
});

test("fr + published translation → French base, never the translation", () => {
  const [card] = buildFeaturedPlaces([publishedEnWithName], "fr");
  assert.equal(card.name, "Maison Millet");
  assert.equal(card.description, "Atelier du peintre.");
});

test("empty short description → description is '' and does not throw", () => {
  const [card] = buildFeaturedPlaces([nullShortDescription], "en");
  assert.equal(card.description, "");
  const [cardFr] = buildFeaturedPlaces([nullShortDescription], "fr");
  assert.equal(cardFr.description, "");
});

test("ordering: preferred slugs come out in preferred order regardless of input order", () => {
  const places = [
    input("abbaye"),
    input("auberge-ganne"),
    input("forest-entrance"),
    input("grande-rue"),
    input("maison-millet"),
    input("zoo"),
  ];
  const out = buildFeaturedPlaces(places, "fr");
  assert.deepEqual(
    out.map((c) => c.slug),
    ["maison-millet", "auberge-ganne", "grande-rue", "forest-entrance"]
  );
});

test("fill: two preferred + three extras → 4 cards, preferred first, extras in input order, no duplicates", () => {
  const places = [
    input("extra-a"),
    input("grande-rue"),
    input("extra-b"),
    input("maison-millet"),
    input("extra-c"),
  ];
  const out = buildFeaturedPlaces(places, "fr");
  assert.deepEqual(
    out.map((c) => c.slug),
    ["maison-millet", "grande-rue", "extra-a", "extra-b"]
  );
  assert.equal(new Set(out.map((c) => c.slug)).size, out.length);
});

test("fewer than 4 inputs → all returned; empty → []", () => {
  const out = buildFeaturedPlaces([input("x"), input("y")], "en");
  assert.deepEqual(
    out.map((c) => c.slug),
    ["x", "y"]
  );
  assert.deepEqual(buildFeaturedPlaces([], "en"), []);
});

test("output shape: exactly the six card keys, never translations/short_description", () => {
  const out = buildFeaturedPlaces(
    [publishedEn, publishedEnWithName, draftEn, noTranslations, metaMissing],
    "en"
  );
  assert.equal(out.length, 4);
  for (const card of out) {
    assert.deepEqual(Object.keys(card).sort(), [
      "category",
      "categorySlug",
      "description",
      "image",
      "name",
      "slug",
    ]);
  }
  const serialized = JSON.stringify(out);
  assert.ok(!serialized.includes('"translations"'));
  assert.ok(!serialized.includes('"short_description"'));
});
