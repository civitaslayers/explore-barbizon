// ---------------------------------------------------------------------------
// lib/categoryLabel.test.ts
//
// Unit tests for categoryLabel()'s fallback matrix (lib/categoryLabel.ts).
// Run with `npm test` (`node --test lib/categoryLabel.test.ts`).
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import { categoryLabel, type CategoryTranslate } from "./categoryLabel.ts";

// Fake `t`: echoes unknown keys back (same contract as i18next's default
// `returnNull: false` behaviour for a missing key).
const fakeT: CategoryTranslate = (key) => {
  const known: Record<string, string> = {
    "categories.artist-house": "Maison d'artiste",
    "categories.point-of-interest": "Lieu remarquable",
  };
  return known[key] ?? key;
};

test("1. known slug resolves to its translated label", () => {
  assert.equal(
    categoryLabel("artist-house", "Artist House", fakeT),
    "Maison d'artiste"
  );
});

test("2. known DB name + unknown slug falls back to the DB name", () => {
  assert.equal(
    categoryLabel("some-unmapped-slug", "Some Category", fakeT),
    "Some Category"
  );
});

test("3. null slug falls back to the DB name", () => {
  assert.equal(categoryLabel(null, "Some Category", fakeT), "Some Category");
});

test("4. null slug + null name falls back to the point-of-interest label", () => {
  assert.equal(categoryLabel(null, null, fakeT), "Lieu remarquable");
});
