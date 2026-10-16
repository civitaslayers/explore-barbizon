// ---------------------------------------------------------------------------
// lib/eatStayType.ts
//
// Refines the "Eat & Stay" JSON-LD @type from the primary function label.
// Pure and dependency-free so it can run under node:test (lib/seo.ts imports
// @/components/SeoHead and cannot). lib/seo.ts re-exports it.
//
// Base labels are French (brain/decisions.md 2026-07-13), English lives in
// translations.en, and the JSON-LD type must not depend on which one is
// matched: diacritics are stripped ("hôtel" -> "hotel", "thé" -> "the") and
// the keyword list covers both languages. See lib/eatStayType.test.ts, which
// feeds every (en, fr) label pair from
// docs/content/2026-10-15-location-functions-fr.sql.
// ---------------------------------------------------------------------------

function normalizeLabel(label: string | undefined): string {
  return (label ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const LODGING_WORDS = ["hotel", "suite", "chambre"];
const FOOD_WORDS = ["restaurant", "cafe", "salon", "tea room"];

export function schemaTypeForEatStay(primaryLabel: string | undefined): string {
  const label = normalizeLabel(primaryLabel);
  if (LODGING_WORDS.some((w) => label.includes(w))) {
    return "LodgingBusiness";
  }
  if (FOOD_WORDS.some((w) => label.includes(w))) {
    return "FoodEstablishment";
  }
  return "LocalBusiness";
}
