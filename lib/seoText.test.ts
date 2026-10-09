// ---------------------------------------------------------------------------
// lib/seoText.test.ts
//
// Unit tests for the SEO meta-tag length helpers (lib/seoText.ts):
// `truncateDescription` must leave ≤ 160-char text untouched, cut longer
// text at a word boundary to ≤ 155 with an ellipsis, preserve French
// non-breaking spaces, and never leave dangling punctuation or an unbalanced
// opener; `buildTitle` must pick the first suffix that fits in 60 chars and
// never cut the base.
// Run with `npm test` (`node --test lib/seoText.test.ts`).
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import {
  DESCRIPTION_CUT,
  DESCRIPTION_LIMIT,
  DESCRIPTION_MIN,
  TITLE_MAX,
  buildTitle,
  truncateDescription,
} from "./seoText.ts";

const NBSP = " ";
const ELLIPSIS = "…";

const STORY = [" — Stories — Visit Barbizon", " — Visit Barbizon", " — Barbizon"];
const TOUR = [" — Visit Barbizon", " — Barbizon"];

function count(text: string, ch: string): number {
  return text.split(ch).length - 1;
}

// Shared invariants for prose samples that must be cut.
function assertCutProse(input: string, result: string) {
  const clean = input.replace(/[ \t\r\n\f\v]+/g, " ").trim();
  assert.ok(result.length <= DESCRIPTION_CUT, `length ${result.length} > ${DESCRIPTION_CUT}`);
  assert.ok(result.length >= DESCRIPTION_MIN, `length ${result.length} < ${DESCRIPTION_MIN}`);
  assert.ok(result.endsWith(ELLIPSIS), "must end with ellipsis");
  const body = result.slice(0, -1);
  assert.ok(clean.startsWith(body), "body must be a prefix of the normalised input");
  const last = body[body.length - 1];
  assert.ok(/[\p{L}\p{N}»)]/u.test(last), `last char before ellipsis is junk: "${last}"`);
  assert.equal(count(result, "«"), count(result, "»"));
}

test("constants match the audit's yardstick", () => {
  assert.equal(DESCRIPTION_LIMIT, 160);
  assert.equal(DESCRIPTION_CUT, 155);
  assert.equal(DESCRIPTION_MIN, 110);
  assert.equal(TITLE_MAX, 60);
});

test("1: exactly 160 chars passes unchanged", () => {
  const input = "a".repeat(160);
  const result = truncateDescription(input);
  assert.equal(result, input);
  assert.equal(result.length, 160);
});

test("2: 161 chars with no space → hard cut to 154 + ellipsis (155)", () => {
  const result = truncateDescription("a".repeat(161));
  assert.equal(result, "a".repeat(154) + ELLIPSIS);
  assert.equal(result.length, 155);
});

test("3: 155 chars unchanged", () => {
  const input = "b".repeat(155);
  assert.equal(truncateDescription(input), input);
});

test("4: word-boundary cut lands on the last space ≤ 154", () => {
  const input = "Mot ".repeat(50).trim();
  assert.equal(input.length, 199);
  const result = truncateDescription(input);
  assert.equal(result, "Mot ".repeat(38).trim() + ELLIPSIS);
  assert.equal(result.length, 152);
});

test("5: cut after a French colon strips the NBSP and the colon", () => {
  const prefix = "Mot ".repeat(37).trim();
  const input =
    prefix +
    NBSP +
    ": suite longue de texte pour dépasser la limite de cent soixante caractères sans aucun doute.";
  assert.ok(input.length > DESCRIPTION_LIMIT);
  const result = truncateDescription(input);
  assert.equal(result, prefix + ELLIPSIS);
  assert.equal(result.length, 148);
  assert.ok(!result.endsWith(" " + ELLIPSIS));
  assert.ok(!result.endsWith(":" + ELLIPSIS));
  assert.ok(!result.endsWith(NBSP + ELLIPSIS));
});

test("6: dangling « is rebalanced away when the floor allows it", () => {
  const prefix = "Mot ".repeat(35).trim();
  const input =
    prefix +
    " « citation longue qui continue bien au-delà de la limite autorisée pour une description »";
  assert.ok(input.length > DESCRIPTION_LIMIT);
  const result = truncateDescription(input);
  assert.equal(result, prefix + ELLIPSIS);
  assert.equal(result.length, 140);
  assert.equal(count(result, "«"), count(result, "»"));
});

test("7: dangling ( is rebalanced away the same way", () => {
  const prefix = "Mot ".repeat(35).trim();
  const input =
    prefix +
    " (citation longue qui continue bien au-delà de la limite autorisée pour une description)";
  assert.ok(input.length > DESCRIPTION_LIMIT);
  const result = truncateDescription(input);
  assert.equal(result, prefix + ELLIPSIS);
  assert.equal(count(result, "("), count(result, ")"));
});

test("8: unbalanced head is kept when rebalancing would fall under the floor", () => {
  const input = "« " + "x".repeat(170) + " »";
  const result = truncateDescription(input);
  assert.ok(result.startsWith("«"));
  assert.ok(result.length <= DESCRIPTION_CUT);
  assert.ok(result.endsWith(ELLIPSIS));
});

test("9: empty and whitespace-only input → empty string", () => {
  assert.equal(truncateDescription(""), "");
  assert.equal(truncateDescription("   \n "), "");
});

test("10: ASCII whitespace runs are collapsed", () => {
  assert.equal(truncateDescription("Deux  lignes\n\nici"), "Deux lignes ici");
});

test("11: French NBSP is preserved, not collapsed", () => {
  const input = "Barbizon" + NBSP + ": village des peintres";
  const result = truncateDescription(input);
  assert.equal(result, input);
  assert.ok(result.includes(NBSP));
});

test("12: hard cut never splits a surrogate pair", () => {
  const input = "a".repeat(153) + "😀" + "b".repeat(20);
  const result = truncateDescription(input);
  assert.equal(result, "a".repeat(153) + ELLIPSIS);
  assert.equal(result.length, 154);
});

test("13: FR prose with guillemets and NBSP keeps French typography", () => {
  const input =
    "Dormir à Barbizon" +
    NBSP +
    ": une auberge historique, des chambres d'hôtes et deux hôtels, dont l'Hôtellerie du Bas-Bréau, « le palace de la forêt », à deux pas de la Grande Rue et des sentiers de Fontainebleau.";
  assert.ok(input.length > DESCRIPTION_LIMIT);
  const result = truncateDescription(input);
  assertCutProse(input, result);
});

test("14: EN prose cut ends on a letter, never on punctuation", () => {
  const input =
    "Where to stay in Barbizon: a historic inn, a handful of chambres d'hôtes and two hotels at the forest edge, all within a few minutes' walk of the Grande Rue and the painters' trails.";
  assert.ok(input.length > DESCRIPTION_LIMIT);
  const result = truncateDescription(input);
  assertCutProse(input, result);
  assert.ok(!result.endsWith("," + ELLIPSIS));
  assert.ok(!result.endsWith(" a" + ELLIPSIS));
});

test("15: two thresholds — 156–160 is not cut", () => {
  const input = "Mot ".repeat(40).trim().slice(0, 158);
  assert.equal(input.length, 158);
  assert.equal(truncateDescription(input, 160, 155), input);
});

test("T1: long story title falls back to the shortest suffix", () => {
  const base = "Des pièces de lumière dans un village de forêt";
  assert.equal(base.length, 46);
  const result = buildTitle(base, STORY);
  assert.equal(result, "Des pièces de lumière dans un village de forêt — Barbizon");
  assert.equal(result.length, 57);
});

test("T2: short story title keeps the preferred suffix (unchanged from today)", () => {
  const result = buildTitle("The Gleaners", STORY);
  assert.equal(result, "The Gleaners — Stories — Visit Barbizon");
  assert.equal(result.length, 39);
});

test("T3: tour title keeps the preferred suffix", () => {
  const result = buildTitle("Parcours des Mosaïques", TOUR);
  assert.equal(result, "Parcours des Mosaïques — Visit Barbizon");
  assert.equal(result.length, 39);
});

test("T4: a 53-char name with no fitting suffix is returned bare, never cut", () => {
  const base = "N".repeat(53);
  assert.equal(buildTitle(base, [" — Barbizon"]), base);
});

test("T5: boundary — 49-char base + suffix is exactly 60 and kept", () => {
  const result = buildTitle("N".repeat(49), [" — Barbizon"]);
  assert.equal(result.length, 60);
  assert.ok(result.endsWith(" — Barbizon"));
});

test("T6: 50-char base + suffix would be 61 → bare base", () => {
  const base = "N".repeat(50);
  assert.equal(buildTitle(base, [" — Barbizon"]), base);
});

test("T7: base is trimmed", () => {
  assert.equal(buildTitle("  Auberge Ganne ", [" — Barbizon"]), "Auberge Ganne — Barbizon");
});

test("T8: empty suffix list returns the base", () => {
  assert.equal(buildTitle("X", []), "X");
});
