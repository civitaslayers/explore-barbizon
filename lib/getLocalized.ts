// ---------------------------------------------------------------------------
// lib/getLocalized.ts
//
// Read-path helper for the French-canonical i18n model
// (brain/decisions.md, 2026-07-13, Option B). Pure, dependency-free — no
// React, no Supabase. See docs/schema-reference.md
// "Internationalization — `translations` JSONB" and
// docs/i18n-seo-implementation-plan.md Task 3 for the full contract.
//
// fr -> base column (French is canonical, translations never consulted).
// en (or any non-fr locale) -> translations[locale][field], but ONLY when
// translations[locale]._meta.status === "published" AND the value is a
// non-empty string; otherwise falls back to the base column.
//
// Never returns null/undefined. Never throws. Never surfaces a draft
// translation. Never returns "" when the base column has content.
// ---------------------------------------------------------------------------

export type Locale = "fr" | "en" | string;

export type TranslationEntry = {
  _meta?: {
    source_hash?: string;
    translated_at?: string;
    status?: string;
  };
  [field: string]: unknown;
};

export type LocalizableRow = Record<string, unknown> & {
  translations?: Record<string, TranslationEntry> | null;
};

/** Safely coerce a base-column value to a display string. Never throws. */
function baseValue(row: LocalizableRow | null | undefined, field: string): string {
  if (!row) return "";
  const value = row[field];
  if (typeof value === "string") return value;
  if (value == null) return "";
  return "";
}

/**
 * Locale-aware field reader for the French-canonical `translations` JSONB
 * contract. See the fallback matrix in
 * docs/i18n-seo-implementation-plan.md, Task 3.
 */
export function getLocalized(
  row: LocalizableRow | null | undefined,
  locale: Locale,
  field: string
): string {
  // 1. Null/undefined row — empty-safe, never throws.
  if (!row) return "";

  // 2. French is canonical — always the base column, translations never
  //    consulted for fr.
  if (locale === "fr") return baseValue(row, field);

  // 3. Non-fr locale — only show the translation when published and non-empty.
  const entry = row.translations?.[locale];
  if (entry && entry._meta?.status === "published") {
    const value = entry[field];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  // Otherwise (missing locale, draft/missing status, missing field, empty
  // value) — fall back to the base column.
  return baseValue(row, field);
}

/**
 * Non-string variant — for the rare case a translated field is not text
 * (kept separate so the default string consumer never has to narrow a
 * union). Same fallback semantics as getLocalized; returns `undefined`
 * instead of `""` when nothing is found.
 */
export function getLocalizedRaw(
  row: LocalizableRow | null | undefined,
  locale: Locale,
  field: string
): unknown {
  if (!row) return undefined;
  if (locale === "fr") return row[field];

  const entry = row.translations?.[locale];
  if (entry && entry._meta?.status === "published") {
    const value = entry[field];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return row[field];
}
