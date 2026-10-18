// ---------------------------------------------------------------------------
// lib/eatStayType.test.ts
//
// The JSON-LD @type for every published location must be identical before
// and after the French content swap (task 1a2205a7). Each pair below is
// (English label, French label) for one of the 15 rows in
// docs/content/2026-10-15-location-functions-fr.sql — keep in sync with it.
// Run with `npm test` (`node --test lib/eatStayType.test.ts`).
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import { schemaTypeForEatStay } from "./eatStayType.ts";

// [en, fr, expected type]
const PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ["Musée de l'École de Barbizon", "Musée de l'École de Barbizon", "LocalBusiness"],
  ["Contemporary art gallery", "Galerie d'art contemporain", "LocalBusiness"],
  ["Art suites", "Suites d'art", "LodgingBusiness"],
  ["4-star hotel and restaurant", "Hôtel 4 étoiles et restaurant", "LodgingBusiness"],
  ["Fine dining restaurant", "Restaurant gastronomique", "FoodEstablishment"],
  ["Tapas bar, happy hour, brunch", "Bar à tapas, happy hour, brunch", "LocalBusiness"],
  ["Coffee shop", "Coffee shop", "LocalBusiness"],
  ["L'Autre Nuit, bar", "L'Autre Nuit, bar", "LocalBusiness"],
  ["La Boutique par Cyrine Jarretie", "La Boutique par Cyrine Jarretie", "LocalBusiness"],
  ["Tea room, shop and gallery", "Salon de thé, boutique et galerie", "FoodEstablishment"],
  ["Hotel and bar", "Hôtel et bar", "LodgingBusiness"],
  ["Musée de l'Esquisse", "Musée de l'Esquisse", "LocalBusiness"],
  ["Musée Millet", "Musée Millet", "LocalBusiness"],
  ["Cheese shop", "Fromagerie", "LocalBusiness"],
  ["Restaurant", "Restaurant", "FoodEstablishment"],
];

test("E1: all 15 content-file rows are covered", () => {
  assert.equal(PAIRS.length, 15);
});

for (const [en, fr, expected] of PAIRS) {
  test(`E2: "${en}" and "${fr}" map to ${expected}`, () => {
    assert.equal(schemaTypeForEatStay(en), expected);
    assert.equal(schemaTypeForEatStay(fr), expected);
  });
}

test("E3: diacritics and case do not change the result", () => {
  assert.equal(schemaTypeForEatStay("HÔTEL"), "LodgingBusiness");
  assert.equal(schemaTypeForEatStay("Café"), "FoodEstablishment");
  assert.equal(schemaTypeForEatStay("Chambres d'hôtes"), "LodgingBusiness");
});

test("E4: undefined / empty label falls back to LocalBusiness", () => {
  assert.equal(schemaTypeForEatStay(undefined), "LocalBusiness");
  assert.equal(schemaTypeForEatStay(""), "LocalBusiness");
});
