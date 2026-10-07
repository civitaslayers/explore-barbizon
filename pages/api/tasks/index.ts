import type { NextApiRequest, NextApiResponse } from "next";
import { createTaskAdmin } from "@/lib/commandCenter.server";
import { parseTaskCreate } from "@/lib/commandCenterValidation";

/**
 * POST /api/tasks — create a task (task fe9f0e5d).
 *
 * Body: TaskInsert (title required; status defaults "backlog", priority 3,
 * other columns null). 201 { task } | 400 | 405 | 500.
 *
 * Basic-Auth-protected in production by middleware.ts' `/api/tasks/:path*`
 * matcher. Writes via the service-role admin client; the anon client is
 * deny-all on `tasks`.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = parseTaskCreate(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  try {
    const task = await createTaskAdmin(parsed.value);
    return res.status(201).json({ task });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
