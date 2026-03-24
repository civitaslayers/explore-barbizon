import type { Task, TaskLink } from "@/lib/commandCenter";

/** Placeholder for missing task fields in generated agent briefs. */
export const AGENT_BRIEF_NOT_SET = "Not set";

/** Modes for tool-specific framing; selection is UI-only (not persisted). */
export type AgentBriefMode = "general" | "chatgpt" | "claude" | "cursor";

export const AGENT_BRIEF_MODE_OPTIONS: {
  mode: AgentBriefMode;
  label: string;
}[] = [
  { mode: "general", label: "General" },
  { mode: "chatgpt", label: "ChatGPT" },
  { mode: "claude", label: "Claude" },
  { mode: "cursor", label: "Cursor" },
];

/** Default brief mode from saved assignee (free-text field, common presets). */
export function defaultAgentBriefModeFromAssignee(
  assignedTo: string | null | undefined
): AgentBriefMode {
  const a = (assignedTo ?? "").trim().toLowerCase();
  if (a === "chatgpt" || a === "claude" || a === "cursor") return a;
  return "general";
}

function trimOrEmpty(s: string | null | undefined): string {
  return (s ?? "").trim();
}

type EntityMeta = Record<string, { name: string; slug?: string }>;

function displaySortKey(
  link: TaskLink,
  meta: EntityMeta | undefined
): string {
  const m = meta?.[link.entity_id];
  const name = trimOrEmpty(m?.name);
  const slug = trimOrEmpty(m?.slug);
  if (name) return name.toLowerCase();
  if (slug) return slug.toLowerCase();
  return link.entity_id.toLowerCase();
}

function formatLocationOrTourLine(
  link: TaskLink,
  meta: EntityMeta | undefined
): string {
  const m = meta?.[link.entity_id];
  const name = trimOrEmpty(m?.name);
  const slug = trimOrEmpty(m?.slug);
  const label = name || AGENT_BRIEF_NOT_SET;
  const slugPart = slug ? `slug: ${slug}` : `slug: ${AGENT_BRIEF_NOT_SET}`;
  return `- ${label} (${slugPart}; id: ${link.entity_id})`;
}

function formatOtherEntityLine(link: TaskLink): string {
  return `- ${link.entity_type}: id ${link.entity_id}`;
}

function fieldLine(label: string, value: string | null | undefined): string {
  const v = trimOrEmpty(value);
  if (!v) return `${label}: ${AGENT_BRIEF_NOT_SET}`;
  if (!v.includes("\n")) return `${label}: ${v}`;
  return `${label}:\n${v}`;
}

/** Mode-specific preamble; keep wording easy to edit independently of task facts. */
function toolFramingBlock(mode: Exclude<AgentBriefMode, "general">): string {
  switch (mode) {
    case "chatgpt":
      return [
        "## Brief framing (ChatGPT)",
        "",
        "Use for planning, synthesis, structured reasoning, and ideation / research / strategy support.",
        "",
        "Guidance: prioritize clarity; produce a structured answer; note assumptions and gaps when they affect the conclusion.",
        "",
        "---",
        "",
      ].join("\n");
    case "claude":
      return [
        "## Brief framing (Claude)",
        "",
        "Use for architecture, repo-aware reasoning, scoped change planning, careful constraint-following, and implementation strategy before coding.",
        "",
        "Guidance: if this is not code work, stay useful as rigorous planning or review — avoid improvisation; respect stated boundaries.",
        "",
        "---",
        "",
      ].join("\n");
    case "cursor":
      return [
        "## Brief framing (Cursor)",
        "",
        "Use for in-editor implementation: explicit scope limits, file-local caution, and execution over exploration.",
        "",
        "Guidance: prefer a concrete diff or patch-style output; preserve current behavior; do not broaden scope or touch unrelated files.",
        "",
        "Protected files — do NOT touch unless explicitly named in the task scope:",
        "- `pages/_document.tsx` — global HTML shell; changes affect the entire app",
        "- `pages/_app.tsx` — global app wrapper; changes affect every route",
        "- `lib/supabase.ts` — database client and type definitions",
        "- `tailwind.config.js` — design token source of truth",
        "- Any migration file in `migrations/` — never modify a migration once written",
        "",
        "---",
        "",
      ].join("\n");
  }
}

function buildAgentTaskBriefCore(
  task: Task,
  taskLinks: TaskLink[],
  locationMeta: EntityMeta,
  tourMeta: EntityMeta
): string {
  const lines: string[] = [];

  lines.push("## Task");
  lines.push(`Title: ${trimOrEmpty(task.title) || AGENT_BRIEF_NOT_SET}`);
  lines.push(fieldLine("Description", task.description));
  lines.push(`Task type: ${task.task_type ?? AGENT_BRIEF_NOT_SET}`);
  lines.push(`Task ID: ${task.id}`);

  lines.push("");
  lines.push("## Current state");
  const exec = task.execution_status;
  lines.push(
    `Execution status: ${
      exec ? exec.replace(/_/g, " ") : AGENT_BRIEF_NOT_SET
    }`
  );
  lines.push(
    `Assigned to: ${trimOrEmpty(task.assigned_to) || AGENT_BRIEF_NOT_SET}`
  );

  lines.push("");
  lines.push("## Linked entities");
  const locs = taskLinks.filter((l) => l.entity_type === "location");
  const tours = taskLinks.filter((l) => l.entity_type === "tour");
  const others = taskLinks.filter(
    (l) => l.entity_type !== "location" && l.entity_type !== "tour"
  );

  const locsSorted = [...locs].sort((a, b) =>
    displaySortKey(a, locationMeta).localeCompare(
      displaySortKey(b, locationMeta),
      undefined,
      { sensitivity: "base" }
    )
  );
  const toursSorted = [...tours].sort((a, b) =>
    displaySortKey(a, tourMeta).localeCompare(displaySortKey(b, tourMeta), undefined, {
      sensitivity: "base",
    })
  );
  const othersSorted = [...others].sort(
    (a, b) =>
      a.entity_type.localeCompare(b.entity_type, undefined, {
        sensitivity: "base",
      }) || a.entity_id.localeCompare(b.entity_id)
  );

  if (
    locsSorted.length === 0 &&
    toursSorted.length === 0 &&
    othersSorted.length === 0
  ) {
    lines.push(AGENT_BRIEF_NOT_SET);
  } else {
    if (locsSorted.length > 0) {
      lines.push("Locations:");
      for (const link of locsSorted) {
        lines.push(formatLocationOrTourLine(link, locationMeta));
      }
    }
    if (toursSorted.length > 0) {
      lines.push("Tours:");
      for (const link of toursSorted) {
        lines.push(formatLocationOrTourLine(link, tourMeta));
      }
    }
    if (othersSorted.length > 0) {
      lines.push("Other:");
      for (const link of othersSorted) {
        lines.push(formatOtherEntityLine(link));
      }
    }
  }

  lines.push("");
  lines.push("## Existing outputs/context");
  lines.push(fieldLine("Last action note", task.last_action_note));
  lines.push(fieldLine("Latest output", task.latest_output));
  lines.push(
    fieldLine(
      "Last brief sent to tool (stored snapshot)",
      task.source_prompt
    )
  );
  lines.push(fieldLine("Implementation notes", task.implementation_notes));
  lines.push(fieldLine("Review note", task.review_note));

  lines.push("");
  lines.push("## Requested next step");
  lines.push(
    `Next step: ${trimOrEmpty(task.next_step) || AGENT_BRIEF_NOT_SET}`
  );

  return lines.join("\n");
}

/**
 * Plain-text agent brief from persisted task state and resolved link metadata.
 * Does not use draft / edit-form values.
 */
export function buildAgentTaskBrief(
  task: Task,
  taskLinks: TaskLink[],
  locationMeta: EntityMeta,
  tourMeta: EntityMeta,
  mode: AgentBriefMode = "general"
): string {
  const core = buildAgentTaskBriefCore(task, taskLinks, locationMeta, tourMeta);
  if (mode === "general") return core;
  return `${toolFramingBlock(mode)}${core}`;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    if (typeof navigator?.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export { copyTextToClipboard };
