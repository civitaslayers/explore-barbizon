import type { NextApiRequest, NextApiResponse } from "next";
import {
  getTaskAdmin,
  getOutputsForTaskAdmin,
  getTaskLinksAdmin,
  updateTaskAdmin,
  deleteTaskAdmin,
} from "@/lib/commandCenter.server";
import { isUuid, parseTaskPatch } from "@/lib/commandCenterValidation";

/**
 * /api/tasks/[id] (tasks 0c6961fa + fe9f0e5d)
 *
 * GET    → 200 { task, outputs, links } (Cache-Control: no-store) | 404
 * PATCH  → body TaskPatch → 200 { task } (fresh row) | 400 | 404
 * DELETE → 204 (task_links removed first, outputs cascade) | 404
 *
 * Non-UUID ids → 400. Basic-Auth-protected in production by middleware.ts'
 * `/api/tasks/:path*` matcher; all data access via the service-role admin
 * client (the anon client is deny-all on these tables).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!isUuid(id)) {
    return res.status(400).json({ error: "Invalid task id" });
  }

  try {
    switch (req.method) {
      case "GET": {
        const [task, outputs, links] = await Promise.all([
          getTaskAdmin(id),
          getOutputsForTaskAdmin(id),
          getTaskLinksAdmin(id),
        ]);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ task, outputs, links });
      }
      case "PATCH": {
        const parsed = parseTaskPatch(req.body);
        if (!parsed.ok) return res.status(400).json({ error: parsed.error });
        const task = await updateTaskAdmin(id, parsed.value);
        if (!task) return res.status(404).json({ error: "Task not found" });
        return res.status(200).json({ task });
      }
      case "DELETE": {
        const deleted = await deleteTaskAdmin(id);
        if (!deleted) return res.status(404).json({ error: "Task not found" });
        return res.status(204).end();
      }
      default:
        res.setHeader("Allow", "GET, PATCH, DELETE");
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
