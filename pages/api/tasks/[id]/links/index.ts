import type { NextApiRequest, NextApiResponse } from "next";
import { getTaskAdmin, createTaskLinkAdmin } from "@/lib/commandCenter.server";
import { isUuid, parseTaskLinkCreate } from "@/lib/commandCenterValidation";

/**
 * POST /api/tasks/[id]/links (task 0c6961fa)
 *
 * Body: { entity_type: "location" | "tour" | "story", entity_id: string }
 * 201 { link } | 400 | 404 (task) | 405 | 500
 * 409 { error: "duplicate: …", link } when the same entity is already linked
 * — the detail page maps the "duplicate" substring to its "already linked"
 * message.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (!isUuid(id)) return res.status(400).json({ error: "Invalid task id" });

  const parsed = parseTaskLinkCreate(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  try {
    const task = await getTaskAdmin(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const result = await createTaskLinkAdmin(id, parsed.value);
    if (result.kind === "duplicate") {
      return res.status(409).json({
        error: "duplicate: this entity is already linked to the task",
        link: result.link,
      });
    }
    return res.status(201).json({ link: result.link });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
