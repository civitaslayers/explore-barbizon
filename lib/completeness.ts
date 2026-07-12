// ---------------------------------------------------------------------------
// lib/completeness.ts
//
// Pure, dependency-free completeness scoring for a `locations` row. Shared by
// the Atlas GSSP (server, list filters + card badges) and, in Phase 2, the
// fiche (client, live as you type). No React, no Supabase import — see
// docs/ccc-v3-fiche-plan.md Section 4 for the design authority this
// implements verbatim.
// ---------------------------------------------------------------------------

import type { GroupName } from "@/lib/categoryGroups";

export type MissingField =
  | "photo"
  | "description"
  | "body"
  | "address"
  | "hours"
  | "website"
  | "phone"
  | "category";

export type CompletenessInput = {
  category_id: string | null;
  short_description: string | null;
  full_description: string | null;
  narrative: string | null;
  address: string | null;
  opening_hours: Record<string, string> | null;
  website: string | null;
  phone: string | null;
};

export type CompletenessCtx = {
  group: GroupName; // resolved by the CALLER via getCategoryGroup(name, layer)
  mediaCount: number; // number of media rows for this location
  functionWebsite?: boolean; // any location_functions row supplies a website
  functionPhone?: boolean; // any location_functions row supplies a phone
  functionHours?: boolean; // any location_functions row supplies opening_hours
};

export type Band = "low" | "mid" | "high" | "complete";

export type CompletenessResult = {
  score: number; // 0–100 integer
  band: Band; // < 40 low | 40–79 mid | 80–99 high | 100 complete
  missing: MissingField[]; // applicable-but-unsatisfied fields (drives the chips)
};

// The scorable field set. Deliberately excludes latitude/longitude, slug,
// name, and all flags (Section 4.2) — those are NOT NULL or curation choices,
// not completeness signals.
type FieldKey =
  | "short_description"
  | "body"
  | "photo"
  | "address"
  | "opening_hours"
  | "website"
  | "phone"
  | "category";

const WEIGHTS: Record<FieldKey, number> = {
  photo: 3,
  body: 3,
  short_description: 2,
  address: 2,
  opening_hours: 2,
  website: 1,
  phone: 1,
  category: 1,
};

const MISSING_LABEL: Record<FieldKey, MissingField> = {
  photo: "photo",
  body: "body",
  short_description: "description",
  address: "address",
  opening_hours: "hours",
  website: "website",
  phone: "phone",
  category: "category",
};

// Applicability by category group — Section 4.3's table, exact.
const APPLICABLE_FIELDS: Record<GroupName, FieldKey[]> = {
  "Art & History": ["short_description", "body", "photo", "address", "category"],
  "Eat & Stay": [
    "short_description",
    "body",
    "photo",
    "address",
    "opening_hours",
    "website",
    "phone",
    "category",
  ],
  "Forest & Nature": ["short_description", "body", "photo", "category"],
  Practical: ["short_description", "address", "category"],
};

function nonEmpty(value: string | null | undefined): boolean {
  return value != null && value.trim().length > 0;
}

function hasOpeningHours(value: Record<string, string> | null): boolean {
  if (!value) return false;
  return Object.values(value).some((v) => typeof v === "string" && v.trim().length > 0);
}

function isSatisfied(
  field: FieldKey,
  input: CompletenessInput,
  ctx: CompletenessCtx
): boolean {
  switch (field) {
    case "short_description":
      return nonEmpty(input.short_description);
    case "body":
      return nonEmpty(input.full_description) || nonEmpty(input.narrative);
    case "address":
      return nonEmpty(input.address);
    case "photo":
      return ctx.mediaCount >= 1;
    case "opening_hours":
      return hasOpeningHours(input.opening_hours) || Boolean(ctx.functionHours);
    case "website":
      return nonEmpty(input.website) || Boolean(ctx.functionWebsite);
    case "phone":
      return nonEmpty(input.phone) || Boolean(ctx.functionPhone);
    case "category":
      return input.category_id != null;
    default:
      return false;
  }
}

function bandFor(score: number): Band {
  if (score >= 100) return "complete";
  if (score >= 80) return "high";
  if (score >= 40) return "mid";
  return "low";
}

export function computeCompleteness(
  input: CompletenessInput,
  ctx: CompletenessCtx
): CompletenessResult {
  const fields = APPLICABLE_FIELDS[ctx.group];

  let weightSum = 0;
  let filledWeightSum = 0;
  const missing: MissingField[] = [];

  for (const field of fields) {
    const weight = WEIGHTS[field];
    weightSum += weight;
    const satisfied = isSatisfied(field, input, ctx);
    if (satisfied) {
      filledWeightSum += weight;
    } else {
      missing.push(MISSING_LABEL[field]);
    }
  }

  const score = weightSum > 0 ? Math.round((100 * filledWeightSum) / weightSum) : 0;

  return { score, band: bandFor(score), missing };
}
