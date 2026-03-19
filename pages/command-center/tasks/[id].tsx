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

const emptyOutputForm = {
  agent: "claude" as AssignedAgent,
  prompt: "",
  response: "",
  version: 1,
};

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
  const [attaching, setAttaching] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [saving, setSaving] = useState(false);

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

  async function handleUnlink(linkId: string) {
    if (!task) return;
    setUnlinkingId(linkId);
    try {
      const deleteResult: any = await deleteTaskLink(linkId);
      if (deleteResult?.error) {
        setAttachError(
          deleteResult.error.message ?? "Failed to unlink location"
        );
        return;
      }

      await refreshTaskLinks(task.id);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to unlink location";
      setAttachError(message);
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
      });
      setTask(updated);
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
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

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link
        href="/command-center/tasks"
        className="text-[10px] uppercase tracking-[0.2em] text-ink/35 no-underline hover:text-ink transition-colors mb-6 inline-block"
      >
        ← Tasks
      </Link>

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

        {/* Status / priority / agent / area */}
        {editing ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Status</label>
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
              <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Agent</label>
              <select
                value={editForm.assigned_agent ?? ""}
                onChange={(e) => setEditForm({ ...editForm, assigned_agent: (e.target.value as AssignedAgent) || null })}
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
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
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
          </div>
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

        {/* Timestamps */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-ink/8">
          <p className="text-[10px] text-ink/30">
            Created {new Date(task.created_at).toLocaleDateString()}
          </p>
          <p className="text-[10px] text-ink/30">
            Updated {new Date(task.updated_at).toLocaleDateString()}
          </p>
        </div>

        {/* Linked entities */}
        <div className="mt-4 pt-4 border-t border-ink/8">
          <p className="text-[10px] text-ink/30 mb-2">Attach to place</p>
          <form onSubmit={handleAttachToPlace} className="flex gap-2 items-start">
            <input
              value={attachSlug}
              onChange={(e) => setAttachSlug(e.target.value)}
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

          <p className="text-[10px] text-ink/30 mb-2">Linked entities</p>
          {taskLinks.length === 0 ? (
            <p className="text-sm text-ink/35">No linked entities yet.</p>
          ) : (
            <div className="space-y-4">
              {taskLinks.filter((l) => l.entity_type === "location").length > 0 && (
                <div>
                  <p className="text-[10px] text-ink/30 mb-1">Locations</p>
                  <ul className="text-sm text-ink/65 space-y-1">
                    {taskLinks.filter((l) => l.entity_type === "location").map((link) => (
                      <li key={link.id} className="flex items-baseline gap-3 justify-between">
                        <span>
                          {locationMeta[link.entity_id]?.slug ? (
                            <Link
                              href={`/places/${locationMeta[link.entity_id].slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ink/65 hover:text-ink hover:underline"
                            >
                              {locationMeta[link.entity_id].name || link.entity_id}
                            </Link>
                          ) : (
                            locationMeta[link.entity_id]?.name ?? link.entity_id
                          )}
                          {locationMeta[link.entity_id] && (
                            <span className="text-ink/40 text-xs ml-1">{link.entity_id}</span>
                          )}
                        </span>
                        <button
                          onClick={() => handleUnlink(link.id)}
                          className="text-[10px] text-ink/40 hover:text-ink transition-colors"
                          disabled={unlinkingId === link.id}
                          type="button"
                        >
                          {unlinkingId === link.id ? "Unlinking..." : "Unlink"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {taskLinks.filter((l) => l.entity_type === "tour").length > 0 && (
                <div>
                  <p className="text-[10px] text-ink/30 mb-1">Tours</p>
                  <ul className="text-sm text-ink/65 space-y-1">
                    {taskLinks.filter((l) => l.entity_type === "tour").map((link) => (
                      <li key={link.id} className="flex items-baseline gap-3 justify-between">
                        <span>
                          {tourMeta[link.entity_id]?.slug ? (
                            <Link
                              href={`/tours/${tourMeta[link.entity_id].slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ink/65 hover:text-ink hover:underline"
                            >
                              {tourMeta[link.entity_id].name || link.entity_id}
                            </Link>
                          ) : (
                            tourMeta[link.entity_id]?.name ?? link.entity_id
                          )}
                          {tourMeta[link.entity_id] && (
                            <span className="text-ink/40 text-xs ml-1">{link.entity_id}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {taskLinks.filter((l) => l.entity_type !== "location" && l.entity_type !== "tour").length > 0 && (
                <div>
                  <p className="text-[10px] text-ink/30 mb-1">Other</p>
                  <ul className="text-sm text-ink/65 space-y-1">
                    {taskLinks.filter((l) => l.entity_type !== "location" && l.entity_type !== "tour").map((link) => (
                      <li key={link.id} className="flex items-baseline gap-3 justify-between">
                        <span className="text-ink/65">
                          <span className="text-ink/40">{link.entity_type}</span> {link.entity_id}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
