// ---------------------------------------------------------------------------
// lib/getLocalized.test.ts
//
// Unit tests for the getLocalized fallback matrix
// (docs/i18n-seo-implementation-plan.md, Task 3). Run with `npm test`
// (`node --test lib/getLocalized.test.ts`). Node >= 23 strips TS types
// natively — verified on the local runtime (node --version: v24.16.0)
// before choosing this over a plain-JS twin.
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import { getLocalized, type LocalizableRow } from "./getLocalized.ts";

function row(overrides: Partial<LocalizableRow> = {}): LocalizableRow {
  return {
    name: "Maison Millet",
    ...overrides,
  };
}

test("1. fr returns base column even when a published en translation exists", () => {
  const r = row({
    translations: {
      en: { name: "Millet House", _meta: { status: "published" } },
    },
  });
  assert.equal(getLocalized(r, "fr", "name"), "Maison Millet");
});

test("2. en + published translation returns the translated value", () => {
  const r = row({
    translations: {
      en: { name: "Millet House", _meta: { status: "published" } },
    },
  });
  assert.equal(getLocalized(r, "en", "name"), "Millet House");
});

test("3. en + status draft returns the base (never the draft)", () => {
  const r = row({
    translations: {
      en: { name: "Millet House", _meta: { status: "draft" } },
    },
  });
  assert.equal(getLocalized(r, "en", "name"), "Maison Millet");
});

test("4. en + no translations object returns the base", () => {
  const r = row();
  assert.equal(getLocalized(r, "en", "name"), "Maison Millet");
});

test("5. en + translations.en present but field missing returns the base", () => {
  const r = row({
    translations: {
      en: { short_description: "x", _meta: { status: "published" } },
    },
  });
  assert.equal(getLocalized(r, "en", "name"), "Maison Millet");
});

test("6. en + published translation whose value is empty string returns the base (never empty)", () => {
  const r = row({
    translations: {
      en: { name: "", _meta: { status: "published" } },
    },
  });
  assert.equal(getLocalized(r, "en", "name"), "Maison Millet");
});

test("7. en + _meta missing entirely (no status) returns the base", () => {
  const r = row({
    translations: {
      en: { name: "Millet House" },
    },
  });
  assert.equal(getLocalized(r, "en", "name"), "Maison Millet");
});

test("8. unknown field with no base value returns empty string (no throw)", () => {
  const r = row();
  assert.equal(getLocalized(r, "fr", "does_not_exist"), "");
  assert.equal(getLocalized(r, "en", "does_not_exist"), "");
});

test("9. row null/undefined returns empty string (no throw)", () => {
  assert.equal(getLocalized(null, "en", "name"), "");
  assert.equal(getLocalized(undefined, "fr", "name"), "");
});

test("10. unpopulated locale (e.g. zh) returns the base", () => {
  const r = row({
    translations: {
      en: { name: "Millet House", _meta: { status: "published" } },
    },
  });
  assert.equal(getLocalized(r, "zh", "name"), "Maison Millet");
});
