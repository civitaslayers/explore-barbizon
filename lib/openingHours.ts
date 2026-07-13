// ---------------------------------------------------------------------------
// lib/openingHours.ts
//
// Single source of truth for the `opening_hours` jsonb day-key convention.
// Pure, dependency-free — no React, no Supabase. Shared by the
// OpeningHoursEditor (fiche + card popover) and the public parent-field
// renderer (pages/places/[slug].tsx). See docs/ccc-v3-fiche-plan.md
// Section 3.4 for the design authority.
//
// ⚠️ Live-data findings this module is built to tolerate (see
// docs/ccc-v3-phase2-implementation-plan.md, "two schema-reality findings"):
//   1. Day-values are NOT always strings — three rows store OBJECT values
//      (e.g. {"open":"10:00","close":"13:00"} or {"closed":true}) under
//      legacy full-word day keys. These are NEVER dropped or corrupted: they
//      are preserved verbatim in the "others" bucket with a safe stringified
//      display form.
//   2. Non-day keys beyond check_in/check_out/default exist (e.g.
//      eve_of_holidays). The "others" bucket is GENERAL — any key that does
//      not normalize to mon..sun is preserved, not a hardcoded allow-list.
// ---------------------------------------------------------------------------

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

const DAY_KEY_SET: ReadonlySet<string> = new Set(DAY_KEYS);

export const DAY_LABELS_FR: Record<DayKey, string> = {
  mon: "Lundi",
  tue: "Mardi",
  wed: "Mercredi",
  thu: "Jeudi",
  fri: "Vendredi",
  sat: "Samedi",
  sun: "Dimanche",
};

// Legacy full-English day names → canonical 3-letter key. Anything else
// (already-canonical 3-letter keys, or genuinely non-day keys) passes through
// unchanged.
const LEGACY_DAY_MAP: Record<string, DayKey> = {
  monday: "mon",
  tuesday: "tue",
  wednesday: "wed",
  thursday: "thu",
  friday: "fri",
  saturday: "sat",
  sunday: "sun",
};

/** "monday" → "mon"; "mon" → "mon"; "check_in" → "check_in" (pass-through). */
export function normalizeDayKey(key: string): string {
  const lower = key.toLowerCase();
  if (DAY_KEY_SET.has(lower)) return lower;
  if (LEGACY_DAY_MAP[lower]) return LEGACY_DAY_MAP[lower];
  return key;
}

// Optional FR labels for well-known non-day keys (display only — the
// "others" bucket is never restricted to this list; any key outside
// mon…sun lands there regardless of whether it has a friendly label).
export const NON_DAY_LABELS_FR: Record<string, string> = {
  check_in: "Arrivée",
  check_out: "Départ",
  default: "Par défaut",
};

// The stored shape is documented as Record<string, string> in the fiche plan,
// but live data also holds object and boolean values (finding 1) — accept
// unknown values so nothing throws or gets coerced away.
export type OpeningHoursObject = Record<string, unknown>;

/** Safe display string for any value — never throws, never loses information. */
export function formatHoursValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "oui" : "non";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export type OtherEntry = {
  /** The original (unnormalized) key exactly as stored. */
  key: string;
  /** Safe display string — always present, even for object/boolean values. */
  value: string;
  /**
   * True only when the original value was a plain string (or this is a
   * fresh/new entry) — such entries are free-text editable. False for
   * object/boolean-shaped values (finding 1): those are shown read-only and
   * preserved verbatim on save via `raw`, never re-serialized from the
   * display string (which would risk corrupting/misrepresenting them).
   */
  editable: boolean;
  /** The exact original value — round-tripped byte-for-byte when !editable. */
  raw: unknown;
};

/**
 * Split a stored opening_hours object into the 7 canonical day rows plus a
 * general "others" bucket for everything else (non-day keys AND day keys
 * whose live value isn't a plain string). Display-normalizes legacy keys
 * (monday→mon) so pre-migration data renders under the right day with no
 * duplicate rows. Never drops a key.
 */
export function splitOpeningHours(
  value: OpeningHoursObject | null | undefined
): { days: Record<DayKey, string>; others: OtherEntry[] } {
  const days = {} as Record<DayKey, string>;
  for (const d of DAY_KEYS) days[d] = "";
  const others: OtherEntry[] = [];

  if (!value) return { days, others };

  for (const [rawKey, rawValue] of Object.entries(value)) {
    const normalized = normalizeDayKey(rawKey);
    const isDay = DAY_KEY_SET.has(normalized);

    if (isDay && typeof rawValue === "string") {
      const dayKey = normalized as DayKey;
      // Last non-empty wins if both a legacy and canonical key coexist for
      // the same day — but never overwrite a filled row with an empty one.
      if (rawValue.trim().length > 0 || days[dayKey] === "") {
        days[dayKey] = rawValue;
      }
      continue;
    }

    // Either a non-day key, or a day key with a non-string (object/boolean)
    // value (finding 1) — preserved verbatim in "others", never dropped.
    others.push({
      key: rawKey,
      value: formatHoursValue(rawValue),
      editable: typeof rawValue === "string",
      raw: rawValue,
    });
  }

  return { days, others };
}

/**
 * Rebuild the stored object from editor state. Day rows are written under
 * canonical mon…sun keys, empty ones omitted. "others" entries are written
 * back under their own original key: editable (string-origin) entries write
 * their (trimmed, empty-omitted) current text; non-editable entries are
 * preserved byte-for-byte from `raw` — never re-derived from `value`.
 */
export function buildOpeningHours(
  days: Record<DayKey, string>,
  others: OtherEntry[]
): OpeningHoursObject {
  const result: OpeningHoursObject = {};

  for (const day of DAY_KEYS) {
    const v = days[day];
    if (typeof v === "string" && v.trim().length > 0) {
      result[day] = v;
    }
  }

  for (const entry of others) {
    if (entry.editable) {
      const trimmed = entry.value.trim();
      if (trimmed.length > 0) {
        result[entry.key] = trimmed;
      }
      // empty editable "other" entries are omitted — matches the day-row rule.
    } else {
      // Safety valve (finding 1): never reshape or drop a preserved value.
      result[entry.key] = entry.raw;
    }
  }

  return result;
}

/** True if there is anything worth rendering/editing at all. */
export function hasAnyOpeningHoursContent(
  value: OpeningHoursObject | null | undefined
): boolean {
  if (!value) return false;
  const { days, others } = splitOpeningHours(value);
  return DAY_KEYS.some((d) => days[d].trim().length > 0) || others.length > 0;
}
