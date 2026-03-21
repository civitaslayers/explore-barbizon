import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getTasks } from "@/lib/commandCenter";
import type { Task, TaskType, RelatedArea } from "@/lib/commandCenter";

// Dev-only — filesystem writes must never reach production.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Only available in development" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const tasks = await getTasks();
    const markdown = generateBrainMarkdown(tasks);
    const filePath = path.join(process.cwd(), "brain", "task-queue.md");
    fs.writeFileSync(filePath, markdown, "utf-8");

    const active = tasks.filter((t) => t.status !== "done").length;
    return res.status(200).json({ success: true, count: active });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}

// ---------------------------------------------------------------------------
// Tag derivation
// ---------------------------------------------------------------------------

function deriveTags(task: Task): string {
  const tags: string[] = [];

  const type = task.task_type as TaskType | null;
  const area = task.related_area as RelatedArea | null;
  const assignee = (task.assigned_to ?? "").trim().toLowerCase();

  switch (type) {
    case "code":
      tags.push(area === "database" ? "infra" : "frontend");
      break;
    case "data":
      tags.push("data");
      break;
    case "content":
      tags.push("data");
      break;
    case "map":
      tags.push("frontend");
      break;
    case "design":
      tags.push("frontend");
      break;
    case "ops":
    case "research":
      tags.push("infra");
      break;
    default:
      break;
  }

  if (area === "database" && !tags.includes("infra")) {
    tags.push("schema");
  }

  if (assignee === "human") {
    tags.push("user-action");
  }

  return tags.length > 0 ? `[${tags.join(",")}] ` : "";
}

// ---------------------------------------------------------------------------
// Section partitioning
// Supabase status → brain section:
//   in_progress (not blocked) → Now
//   ready       (not blocked) → Now
//   ready / in_progress + execution_status=blocked → Blocked
//   review                    → Next
//   backlog priority 1–5      → Next
//   backlog priority 6+       → Later
//   done                      → excluded
// ---------------------------------------------------------------------------

function partitionTasks(tasks: Task[]) {
  const now: Task[] = [];
  const next: Task[] = [];
  const later: Task[] = [];
  const blocked: Task[] = [];

  for (const t of tasks) {
    if (t.status === "done") continue;

    const isBlocked = t.execution_status === "blocked";

    if (isBlocked) {
      blocked.push(t);
      continue;
    }

    if (t.status === "in_progress" || t.status === "ready") {
      now.push(t);
    } else if (t.status === "review") {
      next.push(t);
    } else if (t.status === "backlog") {
      if (t.priority <= 5) {
        next.push(t);
      } else {
        later.push(t);
      }
    }
  }

  const byPriority = (a: Task, b: Task) => a.priority - b.priority;
  return {
    now: now.sort(byPriority),
    next: next.sort(byPriority),
    later: later.sort(byPriority),
    blocked: blocked.sort(byPriority),
  };
}

// ---------------------------------------------------------------------------
// Markdown generation
// ---------------------------------------------------------------------------

function taskLine(task: Task): string {
  const tags = deriveTags(task);
  const active = task.status === "in_progress" ? " [active]" : "";
  return `- [ ] ${tags}${task.title}${active}`;
}

function generateBrainMarkdown(tasks: Task[]): string {
  const { now, next, later, blocked } = partitionTasks(tasks);
  const today = new Date().toISOString().slice(0, 10);

  const lines: string[] = [
    "# Task Queue",
    "",
    `Last updated: ${today}`,
    "",
    "Tasks are ordered by priority within each section.",
    "Move tasks between sections as status changes.",
    "Update this file whenever work is completed or blockers are resolved.",
    "",
    "Task tags:",
    "- frontend",
    "- schema",
    "- data",
    "- sql",
    "- infra",
    "- user-action",
    "",
    "---",
    "",
    "## Now",
    "*Unblocked tasks that can be started immediately.*",
    "",
  ];

  if (now.length > 0) {
    lines.push(...now.map(taskLine));
  } else {
    lines.push("*(no tasks)*");
  }

  lines.push("", "---", "", "## Next", "*Unblocked after Now tasks or after a specific blocker is resolved.*", "");

  if (next.length > 0) {
    lines.push(...next.map(taskLine));
  } else {
    lines.push("*(no tasks)*");
  }

  lines.push("", "---", "", "## Later", "*Valid work, not yet prioritised.*", "");

  if (later.length > 0) {
    lines.push(...later.map(taskLine));
  } else {
    lines.push("*(no tasks)*");
  }

  lines.push("", "---", "", "## Blocked", "*Cannot proceed until the blocker is resolved.*", "");

  if (blocked.length > 0) {
    lines.push(...blocked.map(taskLine));
  } else {
    lines.push("*(no tasks)*");
  }

  lines.push("");

  return lines.join("\n");
}
