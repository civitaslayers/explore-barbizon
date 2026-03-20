import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
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
                Queue — pipeline position
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
                Execution — current work
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-2">Queue — pipeline</p>
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/35 mb-2">Execution — work</p>
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
