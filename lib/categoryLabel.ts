// ---------------------------------------------------------------------------
// lib/categoryLabel.ts
//
// Display-label resolver for `categories.slug` — see brain/current-state.md
// (2026-10-05 editorial prose merge) "Known gap" note: category eyebrows
// (e.g. "Artist House") previously rendered English on French routes because
// `categories.name` is DB data, not an i18n string, and doubles as a lookup
// key for `getCategoryGroup`/`CATEGORY_ICON` in lib/categoryGroups.ts and
// components/MapGL.tsx. Those lookup keys stay untouched (still keyed on
// `categories.name`); this module resolves ONLY the user-visible label, via
// `categories.slug` against public/locales/{locale}/common.json's
// `categories.*` keys, falling back to the raw DB name (never empty, never
// throws).
// ---------------------------------------------------------------------------

import { DEFAULT_CATEGORY_SLUG } from "./categoryGroups.ts";

export type CategoryTranslate = (key: string) => string;

/**
 * Resolve a single category's display label.
 * 1. `categories.<slug>` i18n key, if the slug is known and translated.
 * 2. The raw DB `categories.name`, if the slug is missing/unknown.
 * 3. `categories.point-of-interest` as a last resort (slug AND name both
 *    missing — should be unreachable given `categories!inner(...)`, but
 *    never throws).
 */
export function categoryLabel(
  categorySlug: string | null | undefined,
  categoryName: string | null | undefined,
  t: CategoryTranslate
): string {
  if (categorySlug) {
    const key = `categories.${categorySlug}`;
    const label = t(key);
    if (label && label !== key) return label;
  }
  if (categoryName) return categoryName;
  const fallbackKey = `categories.${DEFAULT_CATEGORY_SLUG}`;
  const fallback = t(fallbackKey);
  return fallback && fallback !== fallbackKey ? fallback : "";
}

/**
 * Build a slug → label lookup for a batch of rows (e.g. map pins), for
 * consumers that only have the slug at render/popup-build time and can't
 * call `useTranslation` directly (components/MapGL.tsx's imperative Mapbox
 * popup builders run in mount-once closures).
 */
export function buildCategoryLabels(
  rows: { category: string; categorySlug?: string | null }[],
  t: CategoryTranslate
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const slug = row.categorySlug;
    if (slug && !(slug in out)) out[slug] = categoryLabel(slug, row.category, t);
  }
  return out;
}
