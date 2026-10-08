import type { NextApiRequest, NextApiResponse } from "next";
import { deleteOutputAdmin } from "@/lib/commandCenter.server";
import { isUuid } from "@/lib/commandCenterValidation";

/**
 * DELETE /api/tasks/[id]/outputs/[outputId] (task 0c6961fa)
 *
 * Deletes one output, scoped by task_id — an output belonging to a different
 * task is a 404, never a cross-task delete. 204 | 400 | 404 | 405 | 500.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, outputId } = req.query;
  if (!isUuid(id)) return res.status(400).json({ error: "Invalid task id" });
  if (!isUuid(outputId)) return res.status(400).json({ error: "Invalid output id" });

  try {
    const deleted = await deleteOutputAdmin(id, outputId);
    if (!deleted) return res.status(404).json({ error: "Output not found" });
    return res.status(204).end();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
