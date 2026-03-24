import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import { getTask, getOutputsForTask, createOutput } from "@/lib/commandCenter";

export const config = { api: { responseLimit: false } };

/**
 * POST /api/tasks/[id]/review
 *
 * Asks Claude to review the task's latest output against its requirements
 * and suggest changes if needed. Dev-only.
 *
 * Returns { review: string, output_id: string }
 * Saves an output row with agent="review" for the paper trail.
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

  // Prefer task.latest_output; fall back to the most recent output row.
  let output = (task.latest_output ?? "").trim();
  if (!output) {
    try {
      const rows = await getOutputsForTask(id);
      const latest = rows.find((r) => (r.response ?? "").trim().length > 0);
      output = (latest?.response ?? "").trim();
    } catch {
      // ignore — will 400 below if still empty
    }
  }
  if (!output) {
    return res.status(400).json({ error: "No output to review. Add an output first." });
  }

  const prompt = buildReviewPrompt(task, output);

  let review: string;
  try {
    review = await runClaude(prompt);
  } catch (e: unknown) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "claude CLI failed" });
  }

  if (!review) {
    return res.status(500).json({ error: "claude returned empty review" });
  }

  let savedOutput;
  try {
    savedOutput = await createOutput({
      task_id: id,
      agent: "review",
      prompt,
      response: review,
      version: 1,
    });
  } catch {
    // Non-fatal — still return the review even if saving fails.
  }

  return res.status(200).json({
    success: true,
    review,
    output_id: savedOutput?.id ?? null,
  });
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

function buildReviewPrompt(task: { title?: string | null; description?: string | null; task_type?: string | null; assigned_to?: string | null; implementation_notes?: string | null; next_step?: string | null }, output: string): string {
  const lines: string[] = [];

  lines.push("You are reviewing the output of a completed task in the ExploreBarbizon / Civitas Layers project.");
  lines.push("");
  lines.push("## Task");
  lines.push(`Title: ${task.title ?? "—"}`);
  if (task.description?.trim()) lines.push(`Description: ${task.description.trim()}`);
  if (task.task_type) lines.push(`Type: ${task.task_type}`);
  if (task.assigned_to) lines.push(`Assigned to: ${task.assigned_to}`);
  lines.push("");

  if (task.implementation_notes?.trim()) {
    lines.push("## What was expected");
    lines.push(task.implementation_notes.trim());
    lines.push("");
  }

  if (task.next_step?.trim()) {
    lines.push("## Next step that was set");
    lines.push(task.next_step.trim());
    lines.push("");
  }

  lines.push("## Output to review");
  lines.push(output);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("Review this output against the task requirements. Be specific and direct.");
  lines.push("Return exactly this structure:");
  lines.push("");
  lines.push("**Verdict:** Looks good | Needs changes | Incomplete");
  lines.push("");
  lines.push("**Issues:** List specific problems, omissions, or inconsistencies. Write \"None\" if everything is correct.");
  lines.push("");
  lines.push("**Suggested changes:** Concrete, actionable changes. Write \"None\" if no changes are needed.");
  lines.push("");
  lines.push("**Recommended next step:** One sentence on what should happen next with this task.");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("claude", ["--print"], { env: process.env });
    proc.stdin.write(prompt);
    proc.stdin.end();

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || `claude exited with code ${code}`));
    });
    proc.on("error", (err) => reject(new Error(`Failed to spawn claude: ${err.message}`)));
  });
}
