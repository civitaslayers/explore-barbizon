import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { getTasks } from "@/lib/commandCenter";
import type { Task } from "@/lib/commandCenter";

export type TaskSuggestion = {
  title: string;
  description: string;
  priority: number;
  task_type: string;
  related_area: string;
  assigned_to: string;
  rationale: string;
};

/**
 * POST /api/tasks/suggest
 *
 * Audits the current project state and returns 3–7 task suggestions.
 * Context: all current Supabase tasks + brain/current-state.md + brain/task-queue.md
 * Claude is asked to return ONLY a JSON object — parsed and validated here.
 *
 * Response: { suggestions: TaskSuggestion[] }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Only available in development" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Gather context.
  let tasks: Task[] = [];
  try {
    tasks = await getTasks();
  } catch (e: unknown) {
    return res.status(500).json({ error: `Failed to load tasks: ${e instanceof Error ? e.message : e}` });
  }

  const brainDir = path.join(process.cwd(), "brain");
  const currentState = readFileSafe(path.join(brainDir, "current-state.md"));
  const taskQueue = readFileSafe(path.join(brainDir, "task-queue.md"));

  const existingTitles = tasks
    .filter((t) => t.status !== "done")
    .map((t) => `- ${t.title} [${t.assigned_to ?? "unassigned"}, ${t.status}]`)
    .join("\n");

  const prompt = buildPrompt(currentState, taskQueue, existingTitles);

  let raw: string;
  try {
    raw = await runClaude(prompt);
  } catch (e: unknown) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Claude CLI failed" });
  }

  const suggestions = parseJsonSuggestions(raw);
  if (!suggestions) {
    return res.status(500).json({
      error: "Claude returned an unexpected format. Raw output stored for debugging.",
      raw: raw.slice(0, 2000),
    });
  }

  return res.status(200).json({ suggestions });
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

function buildPrompt(currentState: string, taskQueue: string, existingTitles: string): string {
  return `You are a project management assistant for ExploreBarbizon — a Next.js/Supabase cultural discovery web app.

## Current project state
${currentState}

## Current task queue (brain snapshot)
${taskQueue}

## All active tasks in the system (to avoid duplicates)
${existingTitles || "(none)"}

---

Analyse the current state and suggest 4–7 new tasks that would move the project forward. Focus on:
- Gaps in the roadmap not yet covered by existing tasks
- Logical next steps after recently completed work
- Tasks that unblock other tasks
- Anything that looks stale, missing, or should be broken into smaller steps

For each suggestion, choose:
- task_type: one of code, data, ops, design, content, research
- related_area: one of engineering, database, design, content, ops, product
- assigned_to: one of claude, cursor, human (claude = architecture/planning/SQL; cursor = UI/frontend code; human = content entry, asset creation, external actions)
- priority: 1 (urgent) to 5 (later)

Return ONLY a JSON object — no explanation, no markdown, no code fences. Start your response with { and end with }.

{
  "suggestions": [
    {
      "title": "Short task title",
      "description": "Clear description of what needs to be done and why",
      "priority": 3,
      "task_type": "code",
      "related_area": "engineering",
      "assigned_to": "cursor",
      "rationale": "Why this task is needed now, what it unblocks"
    }
  ]
}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readFileSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "(file not found)";
  }
}

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

function parseJsonSuggestions(raw: string): TaskSuggestion[] | null {
  // Try the full response first.
  const candidates = [
    raw,
    // Extract from ```json ... ```
    raw.match(/```json\s*([\s\S]*?)```/)?.[1]?.trim(),
    // Extract first {...} block
    raw.match(/\{[\s\S]*\}/)?.[0],
  ].filter((s): s is string => typeof s === "string" && s.length > 0);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed?.suggestions) && parsed.suggestions.length > 0) {
        return parsed.suggestions as TaskSuggestion[];
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}
