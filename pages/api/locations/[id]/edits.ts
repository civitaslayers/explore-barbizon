import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ---------------------------------------------------------------------------
// GET /api/locations/[id]/edits — read endpoint for the fiche's
// EditHistoryPanel (docs/ccc-v3-phase2-implementation-plan.md item 6 /
// docs/ccc-v3-fiche-plan.md Feature 4).
//
// Graceful degradation: `location_edits` may not exist yet (the migration is
// human-gated, not yet run) — any query error returns `200 { edits: [] }`,
// never a 500, so the fiche stays fully usable pre-migration and simply shows
// "aucun historique". Same auth posture as the write route: this path is
// covered by middleware.ts's matcher (`/api/locations/:path*`).
// ---------------------------------------------------------------------------

const DEFAULT_LIMIT = 50;

export type LocationEditApiRow = {
  id: string;
  field: string;
  before_value: string | null;
  after_value: string | null;
  source_page: string | null;
  created_at: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, before } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    let query = supabaseAdmin
      .from("location_edits" as any)
      .select("id, field, before_value, after_value, source_page, created_at")
      .eq("location_id", id)
      .order("created_at", { ascending: false })
      .limit(DEFAULT_LIMIT);

    if (typeof before === "string" && before) {
      query = query.lt("created_at", before);
    }

    const { data, error } = await query;

    if (error) {
      // Expected pre-migration ("relation does not exist") — degrade
      // gracefully rather than 500ing the fiche's history panel.
      console.error(
        "[location_edits] read failed (degrading to empty history):",
        error.message
      );
      return res.status(200).json({ edits: [] });
    }

    return res
      .status(200)
      .json({ edits: (data ?? []) as unknown as LocationEditApiRow[] });
  } catch (err) {
    console.error(
      "[location_edits] read threw (degrading to empty history):",
      err instanceof Error ? err.message : err
    );
    return res.status(200).json({ edits: [] });
  }
}
