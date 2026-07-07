import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  const { data: verified, error: verifyError } = await supabaseAdmin
    .from("locations")
    .select("latitude, longitude")
    .eq("id", id)
    .maybeSingle<VerifiedRow>();

  if (verifyError || !verified) {
    return res.status(500).json({
      error: "Write verification failed: could not re-fetch location",
    });
  }

  if (
    ("latitude" in payload && verified.latitude !== payload.latitude) ||
    ("longitude" in payload && verified.longitude !== payload.longitude)
  ) {
    return res.status(500).json({
      error:
        "Write verification failed: persisted values do not match intended update",
    });
  }

  return res.status(200).json({
    before: { lat: existing.latitude, lng: existing.longitude },
    after: { lat: verified.latitude, lng: verified.longitude },
  });
}
