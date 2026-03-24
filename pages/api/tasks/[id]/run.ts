import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import { getTask, createOutput, updateTask } from "@/lib/commandCenter";
import {
  buildAgentTaskBrief,
  defaultAgentBriefModeFromAssignee,
} from "@/lib/taskBriefs";

// Dev-only — spawning claude CLI from a web server makes no sense in production.
// Extend the default timeout: claude can take 60–120 s on complex tasks.
export const config = { api: { responseLimit: false } };

/**
 * POST /api/tasks/[id]/run
 *
 * Full automated loop for claude-assigned tasks:
 *   1. Builds the brief from task state
 *   2. Spawns `claude --print <brief>` and captures stdout
 *   3. Saves the output row + syncs latest_output on the task
 *   4. Returns { success, output_id, execution_status: "review" }
 *
 * Only works in development (guards against accidental prod exposure).
 * Only runs tasks assigned to "claude" — other agents require human relay.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Only available in development" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid task id" });
  }

  let task;
  try {
    task = await getTask(id);
  } catch (e: unknown) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Failed to fetch task" });
  }

  if (!task) return res.status(404).json({ error: "Task not found" });

  const agent = (task.assigned_to ?? "").trim().toLowerCase();
  if (agent !== "claude") {
    return res.status(400).json({
      error: `Task is assigned to "${task.assigned_to || "nobody"}", not claude. Only claude tasks can be run automatically.`,
    });
  }

  // Mark as running.
  await updateTask(id, { execution_status: "in_progress" });

  // Build the brief.
  const mode = defaultAgentBriefModeFromAssignee(task.assigned_to);
  const brief = buildAgentTaskBrief(task, [], {}, {}, mode);

  // Spawn claude CLI asynchronously (non-blocking event loop).
  let response: string;
  try {
    response = await runClaude(brief);
  } catch (e: unknown) {
    // Revert execution status so the task isn't stuck as in_progress.
    await updateTask(id, { execution_status: "todo" });
    return res.status(500).json({
      error: e instanceof Error ? e.message : "claude CLI failed",
    });
  }

  if (!response) {
    await updateTask(id, { execution_status: "todo" });
    return res.status(500).json({ error: "claude returned empty output" });
  }

  // Persist output.
  let output;
  try {
    output = await createOutput({
      task_id: id,
      agent: "claude",
      prompt: brief,
      response,
      version: 1,
    });
    await updateTask(id, {
      latest_output: response,
      execution_status: "review",
    });
  } catch (e: unknown) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Failed to save output" });
  }

  return res.status(200).json({
    success: true,
    output_id: output.id,
    execution_status: "review",
    response_preview: response.slice(0, 300),
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runClaude(brief: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Pass brief via stdin rather than as a positional arg — more reliable
    // for long prompts and consistent across claude CLI versions.
    const proc = spawn("claude", ["--print"], {
      env: process.env,
    });
    proc.stdin.write(brief);
    proc.stdin.end();

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.trim() || `claude exited with code ${code}`));
      }
    });
    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn claude CLI: ${err.message}`));
    });
  });
}
