import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type PlacesPatchBody = {
  name?: unknown;
  short_description?: unknown;
  historical_narrative?: unknown;
  seo_title?: unknown;
  seo_description?: unknown;
  og_image_url?: unknown;
  address?: unknown;
  is_published?: unknown;
  show_on_map?: unknown;
};

function nullableString(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return null;
  return v;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!supabase) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (typeof req.body !== "object" || req.body === null) {
    return res.status(400).json({ error: "Invalid body" });
  }

  const b = req.body as PlacesPatchBody;
  if (typeof b.name !== "string" || b.name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }
  if (typeof b.is_published !== "boolean" || typeof b.show_on_map !== "boolean") {
    return res.status(400).json({ error: "Invalid flags" });
  }

  const { error } = await supabase
    .from("locations")
    .update({
      name: b.name.trim(),
      short_description: nullableString(b.short_description),
      narrative: nullableString(b.historical_narrative),
      address: nullableString(b.address),
      is_published: b.is_published,
      show_on_map: b.show_on_map,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
