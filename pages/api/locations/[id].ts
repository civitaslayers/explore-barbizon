import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Coordinates are IEEE-754 doubles; a value that round-trips through Postgres
// can differ from the submitted number in its least-significant bits. Compare
// with a tolerance far below any real-world coordinate significance
// (1e-9 deg ≈ 0.1 mm) instead of strict equality — strict === here previously
// failed verification AFTER the UPDATE had already committed.
const COORD_EPSILON = 1e-9;

const ALLOWED_FIELDS = [
  "name",
  "short_description",
  "full_description",
  "narrative",
  "address",
  "website",
  "phone",
  "latitude",
  "longitude",
  "is_published",
  "show_in_editorial",
  "show_on_map",
  "is_featured",
  "is_premium",
  "curation_order",
  "allow_proximity_override",
] as const;

// NOTE: `allow_proximity_override` is a live column (see docs/schema-reference.md)
// but is missing from the generated lib/supabase.types.ts — that types file is
// stale relative to the DB. Selects/updates touching this field are typed via
// local row shapes below rather than the generated Database["locations"] types.
type ExistingRow = {
  id: string;
  latitude: number;
  longitude: number;
  allow_proximity_override: boolean | null;
};

type UpdatedRow = {
  id: string;
  latitude: number;
  longitude: number;
  allow_proximity_override: boolean | null;
};

type VerifiedRow = {
  latitude: number;
  longitude: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const body =
    typeof req.body === "object" && req.body !== null
      ? (req.body as Record<string, unknown>)
      : {};

  const payload: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      payload[key] = body[key];
    }
  }

  if ("curation_order" in payload) {
    const v = payload.curation_order;
    if (v === "" || v === null || v === undefined) {
      payload.curation_order = null;
    } else if (typeof v === "string") {
      const n = Number(v);
      payload.curation_order = Number.isFinite(n) ? n : null;
    } else if (typeof v === "number" && !Number.isFinite(v)) {
      payload.curation_order = null;
    }
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: "No updatable fields in body" });
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("locations")
    .select("id, latitude, longitude, allow_proximity_override")
    .eq("id", id)
    .maybeSingle<ExistingRow>();

  if (fetchError || !existing) {
    return res.status(404).json({ error: "Location not found" });
  }

  const { data: updatedRows, error: updateError } = await supabaseAdmin
    .from("locations")
    // `allow_proximity_override` is not in the stale generated types; see note above
    .update(payload as any)
    .eq("id", id)
    .select("id, latitude, longitude, allow_proximity_override")
    .overrideTypes<UpdatedRow[]>();

  if (updateError) {
    if (updateError.message.includes("PROXIMITY GUARD:")) {
      return res
        .status(409)
        .json({ error: updateError.message, proximity: true });
    }
    return res.status(500).json({ error: updateError.message });
  }

  if (!updatedRows || updatedRows.length === 0) {
    return res.status(500).json({ error: "Update affected zero rows" });
  }

  // The row RETURNING from the UPDATE is the persisted truth — it is exactly
  // what the committed write stored. The re-select below is only a secondary
  // cross-check; it is NEVER the source of truth, and its failure must not be
  // reported as a failed save (the UPDATE has already committed).
  const persisted = updatedRows[0];

  const { data: verified } = await supabaseAdmin
    .from("locations")
    .select("latitude, longitude")
    .eq("id", id)
    .maybeSingle<VerifiedRow>();

  // Float-safe comparison — never strict === on double-precision coordinates.
  const approxEqual = (a: number, b: number) => Math.abs(a - b) < COORD_EPSILON;

  const intendedLat =
    "latitude" in payload ? Number(payload.latitude) : undefined;
  const intendedLng =
    "longitude" in payload ? Number(payload.longitude) : undefined;

  const persistedDiffersFromIntent =
    (intendedLat !== undefined &&
      !approxEqual(persisted.latitude, intendedLat)) ||
    (intendedLng !== undefined &&
      !approxEqual(persisted.longitude, intendedLng));

  // Cross-check the independent re-select against the returning row.
  const reSelectDiffers =
    !!verified &&
    (!approxEqual(persisted.latitude, verified.latitude) ||
      !approxEqual(persisted.longitude, verified.longitude));

  if (persistedDiffersFromIntent || reSelectDiffers) {
    // CRITICAL: the UPDATE has already committed. This is NOT a failed save —
    // the database changed. Report it distinctly (with committed: true) so the
    // operator knows production data moved and can reconcile it.
    return res.status(500).json({
      committed: true,
      after: { lat: persisted.latitude, lng: persisted.longitude },
      error:
        `Write COMMITTED — persisted values differ: lat ${persisted.latitude}, ` +
        `lng ${persisted.longitude}` +
        (verified
          ? ` (re-select read lat ${verified.latitude}, lng ${verified.longitude})`
          : ""),
    });
  }

  return res.status(200).json({
    before: { lat: existing.latitude, lng: existing.longitude },
    after: { lat: persisted.latitude, lng: persisted.longitude },
    ...(verified
      ? {}
      : { warning: "Write committed; re-select cross-check unavailable" }),
  });
}
