import type { NextApiRequest, NextApiResponse } from "next";
import { deleteTaskLinkAdmin } from "@/lib/commandCenter.server";
import { isUuid } from "@/lib/commandCenterValidation";

/**
 * DELETE /api/tasks/[id]/links/[linkId] (task 0c6961fa)
 *
 * Deletes one task_links row, scoped by task_id — a link belonging to a
 * different task is a 404. 204 | 400 | 404 | 405 | 500.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, linkId } = req.query;
  if (!isUuid(id)) return res.status(400).json({ error: "Invalid task id" });
  if (!isUuid(linkId)) return res.status(400).json({ error: "Invalid link id" });

  try {
    const deleted = await deleteTaskLinkAdmin(id, linkId);
    if (!deleted) return res.status(404).json({ error: "Link not found" });
    return res.status(204).end();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
