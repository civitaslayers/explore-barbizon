import type { NextApiRequest, NextApiResponse } from "next";
import { getTask, updateTask } from "@/lib/commandCenter";
import {
  buildAgentTaskBrief,
  defaultAgentBriefModeFromAssignee,
} from "@/lib/taskBriefs";

/**
 * POST /api/tasks/[id]/dispatch
 *
 * Records that a task has been dispatched to an agent. Sets execution_status
 * to in_progress and returns a dispatch payload containing:
 *   - brief:        human-readable text brief (paste into agent chat)
 *   - brief_json:   machine-readable structured payload (for automation layers)
 *   - callback_url: POST target for the agent to submit its output
 *
 * Body: { agent?: string }  — overrides task.assigned_to for this dispatch only.
 *
 * This is the foundation for programmatic orchestration: call this endpoint,
 * pass brief_json to an agent SDK or automation layer, then have the agent
 * POST its result to callback_url.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid task id" });
  }

  try {
    const task = await getTask(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Resolve agent: explicit body param wins, falls back to task assignment.
    const bodyAgent =
      typeof req.body?.agent === "string" ? req.body.agent.trim() : null;
    const agent = bodyAgent || task.assigned_to || "general";

    // Mark as dispatched.
    await updateTask(id, { execution_status: "in_progress" });

    // Build the text brief using the existing brief system.
    const mode = defaultAgentBriefModeFromAssignee(agent);
    const brief = buildAgentTaskBrief(task, [], {}, {}, mode);

    // Derive the base URL for the callback.
    // In production this would come from an env var (NEXT_PUBLIC_SITE_URL).
    const host =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (req.headers.host ? `http://${req.headers.host}` : "http://localhost:3000");

    const callback_url = `${host}/api/tasks/${id}/outputs`;

    // Machine-readable structured payload — for automation layers that don't
    // want to parse prose. Mirrors the task fields an agent needs to act.
    const brief_json = {
      task_id: id,
      title: task.title,
      description: task.description,
      agent,
      priority: task.priority,
      task_type: task.task_type,
      related_area: task.related_area,
      next_step: task.next_step,
      implementation_notes: task.implementation_notes,
      callback_url,
    };

    return res.status(200).json({
      success: true,
      task_id: id,
      agent,
      dispatched_at: new Date().toISOString(),
      brief,
      brief_json,
      callback_url,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
