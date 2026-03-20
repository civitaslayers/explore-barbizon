import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import {
  getTask,
  updateTask,
  getOutputsForTask,
  createOutput,
  deleteOutput,
  getTaskLinks,
  createTaskLink,
  deleteTaskLink,
} from "@/lib/commandCenter";
import type {
  Task,
  Output,
  TaskStatus,
  TaskType,
  ExecutionStatus,
  AssignedAgent,
  RelatedArea,
  TaskLink,
} from "@/lib/commandCenter";
import { supabase } from "@/lib/supabase";
import { buildAgentTaskBrief, copyTextToClipboard } from "@/lib/taskBriefs";

type ChiefSuggestionLevel = "note" | "warning" | "opportunity";

type ChiefSuggestionCategory = "structure" | "execution" | "handoff" | "context";

type ChiefSuggestion = {
  id: string;
  level: ChiefSuggestionLevel;
  message: string;
  category?: ChiefSuggestionCategory;
};

function hasMeaningfulLatestOutput(task: Task, outputs: Output[]): boolean {
  if ((task.latest_output ?? "").trim().length > 0) return true;
  return outputs.some((o) => (o.response ?? "").trim().length > 0);
}

/** Operational review lens; wording kept distinct from Chief of Staff diagnostics. */
function deriveReviewReadinessCues(task: Task, outputs: Output[]): string[] {
  const exec = task.execution_status;
  const hasOutput = hasMeaningfulLatestOutput(task, outputs);
  const hasLastNote = (task.last_action_note ?? "").trim().length > 0;
  const cues: string[] = [];

  if (exec === "in_progress" || exec === "review") {
    cues.push(
      hasOutput
        ? "Ready for review — output is recorded."
        : "Not ready for review — no output recorded yet."
    );
  }

  if (exec === "blocked" && !hasLastNote) {
    cues.push("Blocked — unclear without a last action note.");
  }

  if (exec === "done" && (!hasOutput || !hasLastNote)) {
    cues.push(
      "Done — documentation thin (missing output or last action note)."
    );
  }

  if (exec === "todo" && hasOutput) {
    cues.push("Work present — execution still todo.");
  }

  return cues;
}

function deriveChiefOfStaffSuggestions(
  task: Task,
  taskLinks: TaskLink[],
  outputs: Output[]
): ChiefSuggestion[] {
  const out: ChiefSuggestion[] = [];

  const title = (task.title ?? "").trim();
  const assignee = (task.assigned_to ?? "").trim();
  const exec = task.execution_status;
  const hasLatestSurface = hasMeaningfulLatestOutput(task, outputs);
  const lastNote = (task.last_action_note ?? "").trim();
  const nextStep = (task.next_step ?? "").trim();
  const impl = (task.implementation_notes ?? "").trim();

  if (!task.task_type) {
    out.push({
      id: "hygiene-task-type",
      level: "note",
      category: "structure",
      message:
        "No task type set. Consider classifying this task for clearer routing.",
    });
  }

  if (task.execution_status == null) {
    out.push({
      id: "hygiene-execution-status",
      level: "warning",
      category: "structure",
      message: assignee
        ? "No execution status while someone is assigned. Set posture so handoffs stay legible."
        : "No execution status. Set posture so handoffs stay legible.",
    });
  }

  if (!assignee) {
    out.push({
      id: "hygiene-assignee",
      level: "note",
      category: "structure",
      message: "No assignee yet. Naming who owns this reduces drift.",
    });
  }

  if (title.length > 0 && title.length <= 3) {
    out.push({
      id: "hygiene-short-title",
      level: "note",
      category: "structure",
      message: "Title is very short. A few more words usually improves scanability.",
    });
  }

  if (taskLinks.length === 0) {
    out.push({
      id: "hygiene-no-links",
      level: "note",
      category: "structure",
      message: "No linked entities. Link places or tours when work should stay anchored in the map or public layer.",
    });
  }

  if (exec === "in_progress" && !hasLatestSurface) {
    out.push({
      id: "exec-in-progress-no-output",
      level: "warning",
      category: "execution",
      message:
        "Status is in progress but no latest output is recorded. Capture a short result or paste into latest output.",
    });
  }

  if (exec === "review" && !hasLatestSurface) {
    out.push({
      id: "exec-review-no-output",
      level: "warning",
      category: "execution",
      message:
        "In review, but latest output is empty. Reviewers usually need something concrete to react to.",
    });
  }

  if (exec === "done" && !hasLatestSurface && !impl) {
    out.push({
      id: "exec-done-no-output",
      level: "warning",
      category: "execution",
      message:
        "Marked done but no output is recorded. Consider capturing what shipped or decided.",
    });
  }

  if (exec === "todo" && hasLatestSurface) {
    out.push({
      id: "exec-todo-has-output",
      level: "opportunity",
      category: "execution",
      message:
        "There is recorded output while execution is still “todo”. You may want to move posture forward.",
    });
  }

  if (hasLatestSurface && !lastNote) {
    out.push({
      id: "handoff-output-no-note",
      level: "note",
      category: "handoff",
      message:
        "Output exists but no last action note. A one-line note helps the next actor land quickly.",
    });
  }

  if (exec === "blocked" && !lastNote && !nextStep) {
    out.push({
      id: "handoff-blocked-no-context",
      level: "warning",
      category: "handoff",
      message:
        "Blocked without a last action note or next step. A short reason speeds unblock.",
    });
  }

  const contextualTypes: TaskType[] = ["content", "map", "data"];
  const tt = task.task_type;
  if (tt && contextualTypes.includes(tt)) {
    const hasPlaceOrTour = taskLinks.some(
      (l) => l.entity_type === "location" || l.entity_type === "tour"
    );
    if (!hasPlaceOrTour) {
      out.push({
        id: "context-type-without-place",
        level: "note",
        category: "context",
        message:
          "This looks like map or editorial work but no place or tour is linked yet. Link when scope is known.",
      });
    }
  }

  if (taskLinks.length >= 5) {
    out.push({
      id: "context-many-links",
      level: "note",
      category: "context",
      message:
        "Several entities are linked. If scope feels fuzzy, consider narrowing or splitting the task.",
    });
  }

  const levelRank = (l: ChiefSuggestionLevel) =>
    l === "warning" ? 0 : l === "opportunity" ? 1 : 2;
  return [...out].sort((a, b) => levelRank(a.level) - levelRank(b.level));
}

const CHIEF_LEVEL_LABEL: Record<ChiefSuggestionLevel, string> = {
  warning: "Warning",
  opportunity: "Opportunity",
  note: "Note",
};

const CHIEF_LEVEL_STYLE: Record<ChiefSuggestionLevel, string> = {
  warning: "border-umber/25 bg-umber/[0.06] text-umber/90",
  opportunity: "border-moss/20 bg-moss/[0.06] text-moss/90",
  note: "border-ink/12 bg-ink/[0.02] text-ink/50",
};

function HandoffReviewBlock({ task, outputs }: { task: Task; outputs: Output[] }) {
  const hasOutput = hasMeaningfulLatestOutput(task, outputs);
  const hasLastNote = (task.last_action_note ?? "").trim().length > 0;
  const nextStepRaw = (task.next_step ?? "").trim();
  const execLabel = task.execution_status
    ? task.execution_status.replace("_", " ")
    : "—";
  const assigneeLabel = (task.assigned_to ?? "").trim() || "—";
  const reviewCues = deriveReviewReadinessCues(task, outputs);

  return (
    <section
      className="border border-ink/12 rounded-xl p-6 mb-6"
      aria-label="Handoff and review snapshot"
    >
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-1">
        Handoff / review
      </h2>
      <p className="text-[11px] text-ink/38 leading-snug mb-4">
        Read-only snapshot of execution and review posture (saved task).
      </p>

      <dl className="grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2 text-xs text-ink/65 mb-4">
        <dt className="text-ink/40">Status</dt>
        <dd className="min-w-0 capitalize">{execLabel}</dd>
        <dt className="text-ink/40">Assignee</dt>
        <dd className="min-w-0">{assigneeLabel}</dd>
        <dt className="text-ink/40">Output</dt>
        <dd className="min-w-0">{hasOutput ? "Yes" : "No"}</dd>
        <dt className="text-ink/40">Last action</dt>
        <dd className="min-w-0">{hasLastNote ? "Yes" : "No"}</dd>
        <dt className="text-ink/40">Next step</dt>
        <dd
          className={`min-w-0 leading-snug ${
            nextStepRaw
              ? "text-ink/80 border-l-2 border-ink/20 pl-2 -ml-px"
              : ""
          }`}
        >
          {nextStepRaw || "—"}
        </dd>
      </dl>

      {reviewCues.length > 0 ? (
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-2">
            Review readiness
          </p>
          <ul className="space-y-1.5 text-[13px] text-ink/65 leading-snug">
            {reviewCues.map((c, i) => (
              <li key={`${i}-${c.slice(0, 24)}`}>· {c}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-[13px] text-ink/45 leading-snug">
          No extra review cues for the current posture.
        </p>
      )}
    </section>
  );
}

function AgentBriefBlock({
  task,
  taskLinks,
  locationMeta,
  tourMeta,
}: {
  task: Task;
  taskLinks: TaskLink[];
  locationMeta: Record<string, { name: string; slug?: string }>;
  tourMeta: Record<string, { name: string; slug?: string }>;
}) {
  const brief = useMemo(
    () => buildAgentTaskBrief(task, taskLinks, locationMeta, tourMeta),
    [task, taskLinks, locationMeta, tourMeta]
  );
  const [copied, setCopied] = useState(false);

  async function handleCopyBrief() {
    const ok = await copyTextToClipboard(brief);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      className="border border-ink/12 rounded-xl p-6 mb-6"
      aria-label="Agent brief"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-1">
            Agent brief
          </h2>
          <p className="text-[11px] text-ink/38 leading-snug">
            Derived from saved task fields and linked entities — for paste into
            your AI tool.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyBrief}
          className="shrink-0 text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded border border-ink/20 text-ink/50 hover:text-ink hover:border-ink/40 transition-colors"
        >
          {copied ? "Copied" : "Copy brief"}
        </button>
      </div>
      <pre className="text-[11px] leading-relaxed text-ink/65 font-mono whitespace-pre-wrap break-words max-h-72 overflow-y-auto rounded-lg border border-ink/10 bg-ink/[0.02] px-3 py-2.5">
        {brief}
      </pre>
    </section>
  );
}

function ChiefOfStaffSuggestionsBlock({
  suggestions,
}: {
  suggestions: ChiefSuggestion[];
}) {
  return (
    <section
      className="border border-ink/12 rounded-xl p-6 mb-6 bg-ink/[0.02]"
      aria-label="Chief of Staff suggestions"
    >
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-1">
        Chief of Staff suggestions
      </h2>
      <p className="text-[11px] text-ink/38 leading-snug mb-4">
        Read-only system guidance from the current task shape. Nothing here
        applies changes automatically.
      </p>
      {suggestions.length === 0 ? (
        <p className="text-sm text-ink/45 leading-relaxed">
          No immediate suggestions. This task looks structurally sound.
        </p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className={`rounded-lg border px-3 py-2.5 ${CHIEF_LEVEL_STYLE[s.level]}`}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                <span className="text-[9px] uppercase tracking-[0.14em] opacity-90">
                  {CHIEF_LEVEL_LABEL[s.level]}
                </span>
                {s.category && (
                  <span className="text-[9px] uppercase tracking-[0.12em] text-ink/35">
                    · {s.category}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-ink/70 leading-snug">{s.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const STATUSES: TaskStatus[] = ["backlog", "ready", "in_progress", "review", "done"];
const AGENTS: AssignedAgent[] = ["chatgpt", "claude", "cursor", "manual"];
const AREAS: RelatedArea[] = ["product", "content", "map", "database", "design", "engineering", "seo", "ops"];
const TASK_TYPES: TaskType[] = [
  "content",
  "code",
  "map",
  "data",
  "ops",
  "design",
  "research",
  "other",
];
const EXECUTION_STATUSES: ExecutionStatus[] = ["todo", "in_progress", "review", "blocked", "done"];
/** Quick actions only cycle through active handoff postures (not `todo`). */
const EXECUTION_QUICK_ACTIONS: ExecutionStatus[] = ["in_progress", "review", "blocked", "done"];
const ASSIGNEE_PRESETS = [
  "human",
  "claude",
  "cursor",
  "codex",
  "openclaw",
  "paperclip",
  "unassigned",
] as const;

const STATUS_STYLE: Record<TaskStatus, string> = {
  backlog: "bg-ink/8 text-ink/50",
  ready: "bg-umber/10 text-umber",
  in_progress: "bg-moss/15 text-moss",
  review: "bg-ink/15 text-ink/70",
  done: "bg-ink text-cream",
};

const AGENT_STYLE: Record<string, string> = {
  chatgpt: "bg-umber/10 text-umber",
  claude: "bg-moss/15 text-moss",
  cursor: "bg-ink/10 text-ink/60",
  manual: "border border-ink/20 text-ink/50",
};

const EXECUTION_STATUS_STYLE: Record<ExecutionStatus, string> = {
  todo: "bg-ink/6 text-ink/50",
  in_progress: "bg-moss/12 text-moss",
  review: "bg-ink/12 text-ink/60",
  blocked: "bg-umber/8 text-umber/90",
  done: "bg-ink/15 text-ink/65",
};

const emptyOutputForm = {
  agent: "claude" as AssignedAgent,
  prompt: "",
  response: "",
  version: 1,
};

function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (typeof navigator?.clipboard?.writeText === "function") {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <code className="text-xs font-mono text-ink/55 cursor-text px-1 py-0.5 rounded bg-ink/5 [user-select:all]">
        {id}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="text-[9px] text-ink/35 hover:text-ink/60 transition-colors"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

function sortKeyForLinkedLink(
  link: TaskLink,
  meta: Record<string, { name: string; slug?: string }> | undefined
): string {
  const m = meta?.[link.entity_id];
  const name = (m?.name ?? "").trim();
  const slug = (m?.slug ?? "").trim();
  if (name) return name.toLowerCase();
  if (slug) return slug.toLowerCase();
  return link.entity_id.toLowerCase();
}

function sortTaskLinksByDisplayKey(
  links: TaskLink[],
  meta: Record<string, { name: string; slug?: string }>
): TaskLink[] {
  return [...links].sort((a, b) =>
    sortKeyForLinkedLink(a, meta).localeCompare(sortKeyForLinkedLink(b, meta), undefined, {
      sensitivity: "base",
    })
  );
}

function handoffReadinessCues(task: Task): string[] {
  const cues: string[] = [];
  const ex = task.execution_status;
  const notDone = ex !== "done";
  if (ex === "review" && !task.latest_output?.trim()) {
    cues.push("Review posture, but latest output is empty.");
  }
  if (notDone && !task.assigned_to?.trim()) {
    cues.push("No assignee — clarify who should pick this up.");
  }
  if (notDone && !task.next_step?.trim()) {
    cues.push("No next step yet.");
  }
  return cues;
}

function taskOutputReadinessCues(task: Task): string[] {
  const cues: string[] = [];
  if (task.execution_status === "review" && !task.review_note?.trim()) {
    cues.push("In review — consider a short review note.");
  }
  const hasStructured =
    Boolean(task.source_prompt?.trim()) ||
    Boolean(task.artifact_links?.trim()) ||
    Boolean(task.implementation_notes?.trim()) ||
    Boolean(task.review_note?.trim());
  const hasLatest = Boolean(task.latest_output?.trim());
  if (task.execution_status === "done" && !hasStructured && !hasLatest) {
    cues.push("Marked done — no outputs recorded in task fields yet.");
  }
  return cues;
}

function lineLooksLikeHttpUrl(line: string): boolean {
  return /^https?:\/\//i.test(line.trim());
}

function ArtifactLinksReadonly({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 font-mono text-[12px] leading-relaxed text-ink/70 max-h-40 overflow-y-auto">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <span key={i} className="block min-h-[0.5em]" />;
        }
        if (lineLooksLikeHttpUrl(line)) {
          const href = trimmed;
          return (
            <div key={i}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink/70 hover:text-ink hover:underline break-all"
              >
                {href}
              </a>
            </div>
          );
        }
        return (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line}
          </div>
        );
      })}
    </div>
  );
}

function sortOtherTaskLinks(links: TaskLink[]): TaskLink[] {
  return [...links].sort(
    (a, b) =>
      a.entity_type.localeCompare(b.entity_type, undefined, { sensitivity: "base" }) ||
      a.entity_id.localeCompare(b.entity_id, undefined, { sensitivity: "base" })
  );
}

function linkMatchesLinkedFilter(
  link: TaskLink,
  meta: Record<string, { name: string; slug?: string }> | undefined,
  q: string
): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const m = meta?.[link.entity_id];
  const hay = [
    link.entity_type,
    link.entity_id,
    m?.name,
    m?.slug,
  ]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .map((s) => s.toLowerCase());
  return hay.some((h) => h.includes(needle));
}

const TaskDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;

  const [task, setTask] = useState<Task | null>(null);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [taskLinks, setTaskLinks] = useState<TaskLink[]>([]);
  const [locationMeta, setLocationMeta] = useState<Record<string, { name: string; slug?: string }>>({});
  const [tourMeta, setTourMeta] = useState<Record<string, { name: string; slug?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attachSlug, setAttachSlug] = useState("");
  const [attachError, setAttachError] = useState<string | null>(null);
  const [attachSuccess, setAttachSuccess] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [attachTourSlug, setAttachTourSlug] = useState("");
  const [attachTourError, setAttachTourError] = useState<string | null>(null);
  const [attachTourSuccess, setAttachTourSuccess] = useState(false);
  const [attachingTour, setAttachingTour] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [linkedEntitiesFilter, setLinkedEntitiesFilter] = useState("");

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [saving, setSaving] = useState(false);
  const [executionPatching, setExecutionPatching] = useState(false);
  const [executionFeedback, setExecutionFeedback] = useState<{
    kind: "ok" | "err";
    msg: string;
  } | null>(null);

  const [showOutputForm, setShowOutputForm] = useState(false);
  const [outputForm, setOutputForm] = useState(emptyOutputForm);
  const [savingOutput, setSavingOutput] = useState(false);
  const [outputError, setOutputError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    load(id);
  }, [id]);

  useEffect(() => {
    async function fetchLocationMeta() {
      const locationIds = taskLinks
        .filter((l) => l.entity_type === "location")
        .map((l) => l.entity_id);
      if (locationIds.length === 0) {
        setLocationMeta({});
        return;
      }
      if (!supabase) {
        setLocationMeta({});
        return;
      }
      try {
        const { data, error } = await supabase
          .from("locations")
          .select("id, name, slug")
          .in("id", locationIds);
        if (error) {
          setLocationMeta({});
          return;
        }
        const map: Record<string, { name: string; slug?: string }> = {};
        for (const row of data ?? []) {
          map[row.id] = { name: row.name ?? "", slug: row.slug ?? undefined };
        }
        setLocationMeta(map);
      } catch {
        setLocationMeta({});
      }
    }
    fetchLocationMeta();
  }, [taskLinks]);

  useEffect(() => {
    async function fetchTourMeta() {
      const tourIds = taskLinks
        .filter((l) => l.entity_type === "tour")
        .map((l) => l.entity_id);
      if (tourIds.length === 0) {
        setTourMeta({});
        return;
      }
      if (!supabase) {
        setTourMeta({});
        return;
      }
      try {
        const { data, error } = await supabase
          .from("tours")
          .select("id, name, slug")
          .in("id", tourIds);
        if (error) {
          setTourMeta({});
          return;
        }
        const map: Record<string, { name: string; slug?: string }> = {};
        for (const row of data ?? []) {
          map[row.id] = { name: row.name ?? "", slug: row.slug ?? undefined };
        }
        setTourMeta(map);
      } catch {
        setTourMeta({});
      }
    }
    fetchTourMeta();
  }, [taskLinks]);

  async function load(taskId: string) {
    setLoading(true);
    setError(null);
    try {
      const [t, o, links] = await Promise.all([
        getTask(taskId),
        getOutputsForTask(taskId),
        getTaskLinks(taskId),
      ]);
      if (!t) {
        setError("Task not found.");
        return;
      }
      setTask(t);
      setEditForm(t);
      setOutputs(o);
      setTaskLinks(links);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load task");
    } finally {
      setLoading(false);
    }
  }

  async function refreshTaskLinks(taskId: string) {
    const links = await getTaskLinks(taskId);
    setTaskLinks(links);
  }

  async function handleAttachToPlace(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;

    setAttachError(null);
    const slug = attachSlug.trim();
    if (!slug) {
      setAttachError("Enter a location slug.");
      return;
    }

    const normalizedSlug = slug.toLowerCase();
    const locationLinksNow = taskLinks.filter((l) => l.entity_type === "location");
    const slugAlreadyLinked = locationLinksNow.some((l) => {
      const s = locationMeta[l.entity_id]?.slug;
      return s != null && s.trim().toLowerCase() === normalizedSlug;
    });
    if (slugAlreadyLinked) {
      setAttachError("This location is already linked to the task.");
      return;
    }

    setAttaching(true);
    try {
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase
        .from("locations")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw new Error(error.message);

      const resolvedLocationId = data?.id;
      if (!resolvedLocationId) {
        setAttachError(`No location found for slug "${slug}".`);
        return;
      }

      // Helpers currently throw, but keep this page resilient if they return { error }.
      const createResult: any = await createTaskLink({
        task_id: task.id,
        entity_type: "location",
        entity_id: resolvedLocationId,
      });
      if (createResult?.error) {
        throw new Error(
          createResult.error.message ?? "Failed to attach location"
        );
      }

      await refreshTaskLinks(task.id);
      setAttachSlug("");
      setAttachError(null);
      setAttachSuccess(true);
      setTimeout(() => setAttachSuccess(false), 2500);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to attach";
      if (
        message.toLowerCase().includes("duplicate") ||
        message.toLowerCase().includes("unique")
      ) {
        setAttachError("This location is already linked to the task.");
      } else {
        setAttachError(message);
      }
    } finally {
      setAttaching(false);
    }
  }

  async function handleAttachTour(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;

    setAttachTourError(null);
    const slug = attachTourSlug.trim();
    if (!slug) {
      setAttachTourError("Enter a tour slug.");
      return;
    }

    const normalizedTourSlug = slug.toLowerCase();
    const tourLinksNow = taskLinks.filter((l) => l.entity_type === "tour");
    const tourSlugAlreadyLinked = tourLinksNow.some((l) => {
      const s = tourMeta[l.entity_id]?.slug;
      return s != null && s.trim().toLowerCase() === normalizedTourSlug;
    });
    if (tourSlugAlreadyLinked) {
      setAttachTourError("This tour is already linked to the task.");
      return;
    }

    setAttachingTour(true);
    try {
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase
        .from("tours")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw new Error(error.message);

      const resolvedTourId = data?.id;
      if (!resolvedTourId) {
        setAttachTourError(`No tour found for slug "${slug}".`);
        return;
      }

      const createResult: any = await createTaskLink({
        task_id: task.id,
        entity_type: "tour",
        entity_id: resolvedTourId,
      });
      if (createResult?.error) {
        throw new Error(
          createResult.error.message ?? "Failed to attach tour"
        );
      }

      await refreshTaskLinks(task.id);
      setAttachTourSlug("");
      setAttachTourError(null);
      setAttachTourSuccess(true);
      setTimeout(() => setAttachTourSuccess(false), 2500);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to attach";
      if (
        message.toLowerCase().includes("duplicate") ||
        message.toLowerCase().includes("unique")
      ) {
        setAttachTourError("This tour is already linked to the task.");
      } else {
        setAttachTourError(message);
      }
    } finally {
      setAttachingTour(false);
    }
  }

  async function handleUnlink(linkId: string) {
    if (!task) return;
    setUnlinkingId(linkId);
    const link = taskLinks.find((l) => l.id === linkId);
    const isTour = link?.entity_type === "tour";
    const setErr = isTour ? setAttachTourError : setAttachError;
    try {
      const deleteResult: any = await deleteTaskLink(linkId);
      if (deleteResult?.error) {
        setErr(
          deleteResult.error.message ?? (isTour ? "Failed to unlink tour" : "Failed to unlink location")
        );
        return;
      }

      await refreshTaskLinks(task.id);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : (isTour ? "Failed to unlink tour" : "Failed to unlink location");
      setErr(message);
    } finally {
      setUnlinkingId(null);
    }
  }

  async function handleSave() {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, {
        title: editForm.title,
        description: editForm.description ?? null,
        status: editForm.status,
        priority: editForm.priority,
        assigned_agent: editForm.assigned_agent ?? null,
        related_area: editForm.related_area ?? null,
        task_type: editForm.task_type ?? null,
        execution_status: editForm.execution_status ?? null,
        assigned_to: editForm.assigned_to?.trim() || null,
        latest_output: editForm.latest_output?.trim() || null,
        last_action_note: editForm.last_action_note?.trim() || null,
        next_step: editForm.next_step?.trim() || null,
        source_prompt: editForm.source_prompt?.trim() || null,
        artifact_links: editForm.artifact_links?.trim() || null,
        implementation_notes: editForm.implementation_notes?.trim() || null,
        review_note: editForm.review_note?.trim() || null,
      });
      setTask(updated);
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleExecutionStatusQuick(next: ExecutionStatus) {
    if (!task) return;
    setExecutionPatching(true);
    setExecutionFeedback(null);
    try {
      const updated = await updateTask(task.id, { execution_status: next });
      setTask(updated);
      setEditForm((f) => ({ ...f, ...updated }));
      setExecutionFeedback({ kind: "ok", msg: "Updated" });
      window.setTimeout(() => setExecutionFeedback(null), 2000);
    } catch (e: unknown) {
      setExecutionFeedback({
        kind: "err",
        msg: e instanceof Error ? e.message : "Could not update",
      });
      window.setTimeout(() => setExecutionFeedback(null), 4000);
    } finally {
      setExecutionPatching(false);
    }
  }

  async function handleAddOutput(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    setSavingOutput(true);
    setOutputError(null);
    try {
      await createOutput({
        task_id: task.id,
        agent: outputForm.agent,
        prompt: outputForm.prompt.trim() || null,
        response: outputForm.response.trim() || null,
        version: outputForm.version,
      });
      setOutputForm(emptyOutputForm);
      setShowOutputForm(false);
      const updated = await getOutputsForTask(task.id);
      setOutputs(updated);
    } catch (e: unknown) {
      setOutputError(e instanceof Error ? e.message : "Failed to add output");
    } finally {
      setSavingOutput(false);
    }
  }

  async function handleDeleteOutput(outputId: string) {
    if (!confirm("Delete this output?")) return;
    try {
      await deleteOutput(outputId);
      setOutputs((prev) => prev.filter((o) => o.id !== outputId));
    } catch {
      // reload on failure
      if (task) {
        const updated = await getOutputsForTask(task.id);
        setOutputs(updated);
      }
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-ink/40">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600 p-3 bg-red-50 rounded border border-red-200 mb-4">
          {error}
        </p>
        <Link href="/command-center/tasks" className="text-sm text-ink/50 no-underline hover:text-ink">
          ← Back to tasks
        </Link>
      </div>
    );
  }

  if (!task) return null;

  const readinessCues = handoffReadinessCues(task);
  const outputReadinessCues = taskOutputReadinessCues(task);
  const chiefSuggestions = deriveChiefOfStaffSuggestions(task, taskLinks, outputs);

  const locationLinks = taskLinks.filter((l) => l.entity_type === "location");
  const tourLinks = taskLinks.filter((l) => l.entity_type === "tour");
  const otherLinks = taskLinks.filter(
    (l) => l.entity_type !== "location" && l.entity_type !== "tour"
  );

  const locationLinksSorted = sortTaskLinksByDisplayKey(locationLinks, locationMeta);
  const tourLinksSorted = sortTaskLinksByDisplayKey(tourLinks, tourMeta);
  const otherLinksSorted = sortOtherTaskLinks(otherLinks);

  const linkedFilterQuery = linkedEntitiesFilter;
  const locationLinksFiltered = locationLinksSorted.filter((l) =>
    linkMatchesLinkedFilter(l, locationMeta, linkedFilterQuery)
  );
  const tourLinksFiltered = tourLinksSorted.filter((l) =>
    linkMatchesLinkedFilter(l, tourMeta, linkedFilterQuery)
  );
  const otherLinksFiltered = otherLinksSorted.filter((l) =>
    linkMatchesLinkedFilter(l, undefined, linkedFilterQuery)
  );
  const linkedFilterActive = linkedFilterQuery.trim().length > 0;
  const linkedFilterEmpty =
    linkedFilterActive &&
    locationLinksFiltered.length === 0 &&
    tourLinksFiltered.length === 0 &&
    otherLinksFiltered.length === 0;

  function renderLinkedRow(
    link: TaskLink,
    meta: Record<string, { name: string; slug?: string }>,
    basePath: string
  ) {
    const m = meta[link.entity_id];
    return (
      <li key={link.id} className="flex items-start gap-3 justify-between">
        <div className="min-w-0 flex-1">
          {m?.slug ? (
            <>
              <Link
                href={`${basePath}/${m.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink/65 hover:text-ink hover:underline"
              >
                {m.name || link.entity_id}
              </Link>
              <p className="text-[10px] text-ink/35 font-mono mt-0.5 tracking-tight">
                {m.slug}
              </p>
            </>
          ) : (
            <>
              {m?.name ? (
                <span className="text-ink/65">{m.name}</span>
              ) : (
                <CopyableId id={link.entity_id} />
              )}
            </>
          )}
          {m && (
            <div className="mt-1">
              <CopyableId id={link.entity_id} />
            </div>
          )}
        </div>
        <button
          onClick={() => handleUnlink(link.id)}
          className="text-[10px] text-ink/40 hover:text-ink transition-colors shrink-0 pt-0.5"
          disabled={unlinkingId === link.id}
          type="button"
        >
          {unlinkingId === link.id ? "Unlinking..." : "Unlink"}
        </button>
      </li>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link
        href="/command-center/tasks"
        className="text-[10px] uppercase tracking-[0.2em] text-ink/35 no-underline hover:text-ink transition-colors mb-4 inline-block"
      >
        ← Tasks
      </Link>

      {/* Linked entity summary */}
      {taskLinks.length > 0 && (
        <p className="text-[10px] text-ink/40 mb-4">
          Linked: {locationLinks.length} location{locationLinks.length !== 1 ? "s" : ""},{" "}
          {tourLinks.length} tour{tourLinks.length !== 1 ? "s" : ""},{" "}
          {otherLinks.length} other
        </p>
      )}

      {/* Task metadata */}
      <div className="border border-ink/12 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          {editing ? (
            <input
              value={editForm.title ?? ""}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="font-serif text-xl tracking-tight text-ink bg-transparent border-b border-ink/30 focus:outline-none focus:border-ink w-full mr-4"
            />
          ) : (
            <h1 className="font-serif text-xl tracking-tight leading-snug pr-4">
              {task.title}
            </h1>
          )}
          <div className="flex gap-2 shrink-0">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded bg-ink text-cream hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditForm(task); }}
                  className="text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded border border-ink/20 text-ink/50 hover:text-ink hover:border-ink/40 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded border border-ink/20 text-ink/50 hover:text-ink hover:border-ink/40 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Queue (pipeline) vs execution (work) */}
        {editing ? (
          <>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-2">
                Queue — pipeline / admin
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Queue status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TaskStatus })}
                    className="w-full rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: Number(e.target.value) })}
                    className="w-full rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Assigned agent</label>
                  <select
                    value={editForm.assigned_agent ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, assigned_agent: (e.target.value as AssignedAgent) || null })
                    }
                    className="w-full rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                  >
                    <option value="">—</option>
                    {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Area</label>
                  <select
                    value={editForm.related_area ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, related_area: (e.target.value as RelatedArea) || null })}
                    className="w-full rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                  >
                    <option value="">—</option>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Task type</label>
                  <select
                    value={editForm.task_type ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, task_type: (e.target.value as TaskType) || null })
                    }
                    className="w-full rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                  >
                    <option value="">—</option>
                    {TASK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mb-4 pt-4 border-t border-ink/8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-2">
                Execution — work posture / handoff
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Execution status</label>
                  <select
                    value={editForm.execution_status ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, execution_status: (e.target.value as ExecutionStatus) || null })
                    }
                    className="w-full rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                  >
                    <option value="">—</option>
                    {EXECUTION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">
                    Assignee / tool
                  </label>
                  <input
                    list="ccc-task-assignee-presets"
                    value={editForm.assigned_to ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, assigned_to: e.target.value || null })
                    }
                    placeholder="human, claude, cursor…"
                    className="w-full rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink placeholder-ink/30 focus:outline-none"
                  />
                  <datalist id="ccc-task-assignee-presets">
                    {ASSIGNEE_PRESETS.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Next step</label>
                  <input
                    type="text"
                    value={editForm.next_step ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, next_step: e.target.value || null })}
                    placeholder="e.g. Review latest output and approve"
                    className="w-full rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink placeholder-ink/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-2">Queue — pipeline / admin</p>
              <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${STATUS_STYLE[task.status]}`}>
                  {task.status.replace("_", " ")}
                </span>
                <span className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-ink/6 text-ink/50">
                  Priority {task.priority}
                </span>
                {task.assigned_agent && (
                  <span className={`text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${AGENT_STYLE[task.assigned_agent] ?? "bg-ink/10 text-ink/60"}`}>
                    {task.assigned_agent}
                  </span>
                )}
                {task.related_area && (
                  <span className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border border-ink/15 text-ink/45">
                    {task.related_area}
                  </span>
                )}
                {task.task_type && (
                  <span className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border border-ink/12 text-ink/45">
                    {task.task_type}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4 pt-4 border-t border-ink/8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-2">Execution — work posture / handoff</p>
              <div className="rounded-lg border border-ink/10 bg-ink/[0.02] px-3 py-2.5 mb-2">
                <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-2">Handoff readiness</p>
                <dl className="grid grid-cols-[7.5rem_1fr] gap-x-2 gap-y-1.5 text-xs text-ink/65">
                  <dt className="text-ink/40">Assigned to</dt>
                  <dd className="min-w-0">{task.assigned_to?.trim() || "—"}</dd>
                  <dt className="text-ink/40">Execution status</dt>
                  <dd className="min-w-0">
                    {task.execution_status ? (
                      <span
                        className={`inline-block text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded ${EXECUTION_STATUS_STYLE[task.execution_status] ?? "bg-ink/8 text-ink/50"}`}
                      >
                        {task.execution_status.replace("_", " ")}
                      </span>
                    ) : (
                      "—"
                    )}
                  </dd>
                  <dt className="text-ink/40">Next step</dt>
                  <dd className="min-w-0 leading-snug">{task.next_step?.trim() || "—"}</dd>
                  <dt className="text-ink/40">Latest output</dt>
                  <dd className="min-w-0">{task.latest_output?.trim() ? "Present" : "—"}</dd>
                </dl>
              </div>
              {readinessCues.length > 0 && (
                <ul className="mb-2 space-y-1 text-[11px] text-ink/45">
                  {readinessCues.map((c, i) => (
                    <li key={`${i}-${c}`}>· {c}</li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-ink/30 shrink-0">Quick</span>
                {EXECUTION_QUICK_ACTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={executionPatching}
                    onClick={() => handleExecutionStatusQuick(s)}
                    className={`text-[9px] uppercase tracking-[0.12em] px-2 py-1 rounded border transition-colors disabled:opacity-50 ${
                      task.execution_status === s
                        ? "border-ink/35 bg-ink/8 text-ink/70"
                        : "border-ink/15 text-ink/50 hover:bg-ink/5 hover:border-ink/25"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
                {executionFeedback && (
                  <span
                    className={`text-[10px] ${
                      executionFeedback.kind === "ok" ? "text-moss/90" : "text-red-600/90"
                    }`}
                  >
                    {executionFeedback.msg}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Description */}
        {editing ? (
          <textarea
            value={editForm.description ?? ""}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={3}
            placeholder="Description..."
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-none"
          />
        ) : (
          task.description && (
            <p className="text-sm text-ink/65 leading-relaxed">{task.description}</p>
          )
        )}

        {/* Work state — latest output & handoff notes */}
        <div className="mt-4 pt-4 border-t border-ink/8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-3">Work state</p>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">
                  Last action note
                </label>
                <textarea
                  value={editForm.last_action_note ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, last_action_note: e.target.value })
                  }
                  rows={2}
                  placeholder="e.g. Waiting for review before implementation"
                  className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">
                  Latest output
                </label>
                <textarea
                  value={editForm.latest_output ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, latest_output: e.target.value })}
                  rows={6}
                  placeholder="Result, draft, or implementation summary…"
                  className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-y min-h-[120px] font-mono text-[13px] leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-1">Last action</p>
                {task.last_action_note ? (
                  <p className="text-sm text-ink/60 leading-relaxed whitespace-pre-wrap">
                    {task.last_action_note}
                  </p>
                ) : (
                  <p className="text-xs text-ink/30">—</p>
                )}
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-1">Latest output</p>
                {task.latest_output ? (
                  <div className="text-sm text-ink/70 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto rounded-lg border border-ink/10 bg-ink/[0.02] px-3 py-2.5">
                    {task.latest_output}
                  </div>
                ) : (
                  <p className="text-xs text-ink/30">—</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Task outputs — structured latest work artifacts */}
        <div className="mt-4 pt-4 border-t border-ink/8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-3">Task outputs</p>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">
                  Source prompt
                </label>
                <textarea
                  value={editForm.source_prompt ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, source_prompt: e.target.value || null })
                  }
                  rows={4}
                  placeholder="Instruction or prompt used for this round of work…"
                  className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-y min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">
                  Artifact links
                </label>
                <textarea
                  value={editForm.artifact_links ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, artifact_links: e.target.value || null })
                  }
                  rows={3}
                  placeholder="One URL or path per line…"
                  className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-y min-h-[72px] font-mono text-[13px]"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">
                  Implementation notes
                </label>
                <textarea
                  value={editForm.implementation_notes ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, implementation_notes: e.target.value || null })
                  }
                  rows={4}
                  placeholder="What changed, what was built, key decisions…"
                  className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-y min-h-[88px]"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">
                  Review note
                </label>
                <textarea
                  value={editForm.review_note ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, review_note: e.target.value || null })
                  }
                  rows={2}
                  placeholder="Approval, requested changes, reviewer comment…"
                  className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-1">Source prompt</p>
                {task.source_prompt?.trim() ? (
                  <div className="text-sm text-ink/70 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto rounded-lg border border-ink/10 bg-ink/[0.02] px-3 py-2.5">
                    {task.source_prompt}
                  </div>
                ) : (
                  <p className="text-xs text-ink/30">—</p>
                )}
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-1">Artifact links</p>
                {task.artifact_links?.trim() ? (
                  <div className="rounded-lg border border-ink/10 bg-ink/[0.02] px-3 py-2.5">
                    <ArtifactLinksReadonly text={task.artifact_links} />
                  </div>
                ) : (
                  <p className="text-xs text-ink/30">—</p>
                )}
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-1">Implementation notes</p>
                {task.implementation_notes?.trim() ? (
                  <div className="text-sm text-ink/70 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto rounded-lg border border-ink/10 bg-ink/[0.02] px-3 py-2.5">
                    {task.implementation_notes}
                  </div>
                ) : (
                  <p className="text-xs text-ink/30">—</p>
                )}
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-1">Review note</p>
                {task.review_note?.trim() ? (
                  <div className="text-sm text-ink/65 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto rounded-lg border border-ink/10 bg-ink/[0.02] px-3 py-2.5">
                    {task.review_note}
                  </div>
                ) : (
                  <p className="text-xs text-ink/30">—</p>
                )}
              </div>
              {outputReadinessCues.length > 0 && (
                <ul className="pt-1 space-y-1 text-[11px] text-ink/45">
                  {outputReadinessCues.map((c, i) => (
                    <li key={`out-${i}-${c}`}>· {c}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-ink/8">
          <p className="text-[10px] text-ink/30">
            Created {new Date(task.created_at).toLocaleDateString()}
          </p>
          <p className="text-[10px] text-ink/30">
            Updated {new Date(task.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <HandoffReviewBlock task={task} outputs={outputs} />

      <AgentBriefBlock
        task={task}
        taskLinks={taskLinks}
        locationMeta={locationMeta}
        tourMeta={tourMeta}
      />

      <ChiefOfStaffSuggestionsBlock suggestions={chiefSuggestions} />

      {/* Attach area */}
      <div className="border border-ink/12 rounded-xl p-6 mb-6 bg-ink/[0.02]">
        <p className="text-[10px] text-ink/35 uppercase tracking-[0.15em] mb-4">Attach entities</p>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-ink/30 mb-1.5">Attach to place</p>
              <form onSubmit={handleAttachToPlace} className="flex gap-2 items-start">
                <input
                  value={attachSlug}
                  onChange={(e) => {
                    setAttachSlug(e.target.value);
                    setAttachError(null);
                    setAttachSuccess(false);
                  }}
                  placeholder="Location slug"
                  className="flex-1 rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                  disabled={attaching}
                />
                <button
                  type="submit"
                  disabled={attaching}
                  className="text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded bg-ink text-cream hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {attaching ? "Attaching..." : "Attach"}
                </button>
              </form>
              {attachError && <p className="mt-1 text-xs text-red-600">{attachError}</p>}
              {attachSuccess && <p className="mt-1 text-xs text-moss">Attached.</p>}
            </div>
            <div>
              <p className="text-[10px] text-ink/30 mb-1.5">Attach tour</p>
              <form onSubmit={handleAttachTour} className="flex gap-2 items-start">
                <input
                  value={attachTourSlug}
                  onChange={(e) => {
                    setAttachTourSlug(e.target.value);
                    setAttachTourError(null);
                    setAttachTourSuccess(false);
                  }}
                  placeholder="Tour slug"
                  className="flex-1 rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                  disabled={attachingTour}
                />
                <button
                  type="submit"
                  disabled={attachingTour}
                  className="text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded bg-ink text-cream hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {attachingTour ? "Attaching..." : "Attach"}
                </button>
              </form>
              {attachTourError && <p className="mt-1 text-xs text-red-600">{attachTourError}</p>}
              {attachTourSuccess && <p className="mt-1 text-xs text-moss">Attached.</p>}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-ink/8">
            <p className="text-[10px] text-ink/35 uppercase tracking-[0.15em] mb-3">Linked entities</p>
            {taskLinks.length === 0 ? (
              <p className="text-sm text-ink/40">No entities linked to this task. Attach locations or tours above.</p>
            ) : (
            <>
              <label className="sr-only" htmlFor="linked-entities-filter">
                Filter linked entities
              </label>
              <input
                id="linked-entities-filter"
                value={linkedEntitiesFilter}
                onChange={(e) => setLinkedEntitiesFilter(e.target.value)}
                placeholder="Filter linked entities…"
                className="w-full max-w-md rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink placeholder-ink/30 focus:outline-none mb-3"
                type="search"
                autoComplete="off"
              />
            {linkedFilterEmpty ? (
              <p className="text-sm text-ink/40">No linked entities match this filter.</p>
            ) : (
            <div className="space-y-4">
              {locationLinksFiltered.length > 0 && (
                <div>
                  <p className="text-[10px] text-ink/30 mb-1">Locations</p>
                  <ul className="text-sm text-ink/65 space-y-1">
                    {locationLinksFiltered.map((link) =>
                      renderLinkedRow(link, locationMeta, "/places")
                    )}
                  </ul>
                </div>
              )}
              {tourLinksFiltered.length > 0 && (
                <div>
                  <p className="text-[10px] text-ink/30 mb-1">Tours</p>
                  <ul className="text-sm text-ink/65 space-y-1">
                    {tourLinksFiltered.map((link) =>
                      renderLinkedRow(link, tourMeta, "/tours")
                    )}
                  </ul>
                </div>
              )}
              {otherLinksFiltered.length > 0 && (
                <div>
                  <p className="text-[10px] text-ink/30 mb-1.5">Other</p>
                  <ul className="text-sm text-ink/65 space-y-1.5">
                    {otherLinksFiltered.map((link) => (
                      <li key={link.id} className="flex items-center gap-3 justify-between py-0.5">
                        <span className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.1em] text-ink/40 w-20 shrink-0">{link.entity_type}</span>
                          <CopyableId id={link.entity_id} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            )}
            </>
            )}
          </div>
        </div>

      {/* Outputs */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <p className="eyebrow">Outputs ({outputs.length})</p>
          <button
            onClick={() => setShowOutputForm((v) => !v)}
            className="text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded bg-ink text-cream hover:bg-ink/90 transition-colors"
          >
            {showOutputForm ? "Cancel" : "+ Add Output"}
          </button>
        </div>

        {showOutputForm && (
          <form
            onSubmit={handleAddOutput}
            className="mb-4 p-4 border border-ink/15 rounded-xl bg-white/60 space-y-3"
          >
            {outputError && (
              <p className="text-xs text-red-600">{outputError}</p>
            )}
            <div className="flex gap-3">
              <select
                value={outputForm.agent}
                onChange={(e) => setOutputForm({ ...outputForm, agent: e.target.value as AssignedAgent })}
                className="rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
              >
                {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <input
                type="number"
                min={1}
                value={outputForm.version}
                onChange={(e) => setOutputForm({ ...outputForm, version: Number(e.target.value) })}
                className="w-20 rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                placeholder="v1"
              />
            </div>
            <textarea
              placeholder="Prompt (optional)"
              value={outputForm.prompt}
              onChange={(e) => setOutputForm({ ...outputForm, prompt: e.target.value })}
              rows={2}
              className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-none"
            />
            <textarea
              placeholder="Response / output"
              value={outputForm.response}
              onChange={(e) => setOutputForm({ ...outputForm, response: e.target.value })}
              rows={4}
              className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingOutput}
                className="text-[10px] uppercase tracking-[0.18em] px-4 py-2 rounded bg-ink text-cream hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {savingOutput ? "Saving..." : "Save Output"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {outputs.length === 0 && (
            <p className="text-sm text-ink/35 py-6 text-center border border-ink/8 rounded-xl">
              No outputs recorded yet.
            </p>
          )}
          {outputs.map((output) => (
            <div
              key={output.id}
              className="border border-ink/10 rounded-xl p-4 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${AGENT_STYLE[output.agent] ?? "bg-ink/10 text-ink/60"}`}>
                    {output.agent}
                  </span>
                  <span className="text-[10px] text-ink/30">v{output.version}</span>
                  <span className="text-[10px] text-ink/30">
                    {new Date(output.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteOutput(output.id)}
                  className="text-[10px] text-ink/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Del
                </button>
              </div>
              {output.prompt && (
                <div className="mb-2">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-1">Prompt</p>
                  <p className="text-[11px] text-ink/55 leading-relaxed whitespace-pre-wrap">
                    {output.prompt}
                  </p>
                </div>
              )}
              {output.response && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-ink/30 mb-1">Response</p>
                  <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">
                    {output.response}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

TaskDetailPage.getLayout = (page: ReactElement) => (
  <CommandCenterLayout>{page}</CommandCenterLayout>
);

export default TaskDetailPage;
