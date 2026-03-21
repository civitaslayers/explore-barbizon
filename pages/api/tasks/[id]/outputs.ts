import type { NextApiRequest, NextApiResponse } from "next";
import { getTask, createOutput, updateTask } from "@/lib/commandCenter";

/**
 * POST /api/tasks/[id]/outputs
 *
 * Ingest output from an agent execution. Stores an output row and, if a
 * response is provided, syncs it to task.latest_output.
 *
 * Body: { agent: string, prompt?: string, response?: string, version?: number }
 *
 * This is the callback target included in dispatch payloads — any automation
 * layer can POST here without touching the UI.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid task id" });
  }

  const { agent, prompt, response, version } = req.body ?? {};

  if (!agent || typeof agent !== "string") {
    return res.status(400).json({ error: "agent is required" });
  }

  try {
    const task = await getTask(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const output = await createOutput({
      task_id: id,
      agent: agent.trim(),
      prompt: typeof prompt === "string" ? prompt.trim() || null : null,
      response: typeof response === "string" ? response.trim() || null : null,
      version: typeof version === "number" ? version : 1,
    });

    // Sync latest_output on the task so the detail page reflects the new output.
    if (typeof response === "string" && response.trim()) {
      await updateTask(id, { latest_output: response.trim() });
    }

    return res.status(201).json({ success: true, output });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
