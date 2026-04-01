import type { NextApiRequest, NextApiResponse } from "next";
import type { Database } from "@/lib/supabase.types";
import { supabase } from "@/lib/supabase";

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
] as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const referer = req.headers.referer ?? "";
  if (!referer.includes("/dashboard")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { id } = req.query;
  if (typeof id !== "string" || !id) {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (!supabase) {
    return res.status(503).json({ error: "Database not configured" });
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

  const { data, error } = await supabase
    .from("locations")
    .update(
      payload as Database["public"]["Tables"]["locations"]["Update"]
    )
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}
