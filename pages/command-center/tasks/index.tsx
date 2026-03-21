import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/commandCenter";
import type { Task, TaskStatus, RelatedArea } from "@/lib/commandCenter";
import {
  TASK_TEMPLATES,
  executionFieldsForCreate,
  type TaskTemplateId,
} from "@/lib/taskTemplates";
import {
  buildAgentTaskBrief,
  defaultAgentBriefModeFromAssignee,
} from "@/lib/taskBriefs";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const STATUSES: TaskStatus[] = ["backlog", "ready", "in_progress", "review", "done"];
const AREAS: RelatedArea[] = ["product", "content", "map", "database", "design", "engineering", "seo", "ops"];

const ASSIGNEE_FILTER_PRESETS = [
  "human",
  "claude",
  "cursor",
  "chatgpt",
  "codex",
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

const EXECUTION_STATUS_STYLE: Record<string, string> = {
  todo: "bg-ink/6 text-ink/50",
  in_progress: "bg-moss/12 text-moss",
  review: "bg-ink/12 text-ink/60",
  blocked: "bg-umber/8 text-umber/90",
  done: "bg-ink/15 text-ink/65",
};

const PRIORITY_LABEL: Record<number, string> = {
  1: "Urgent",
  2: "High",
  3: "Normal",
  4: "Low",
  5: "Later",
};

const emptyForm = {
  title: "",
  description: "",
  status: "backlog" as TaskStatus,
  priority: 3,
  assigned_to: "",
  related_area: "" as RelatedArea | "",
};

const TasksPage: NextPageWithLayout = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creationTemplateId, setCreationTemplateId] = useState<TaskTemplateId | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const creationTemplate =
    creationTemplateId == null
      ? null
      : TASK_TEMPLATES.find((t) => t.id === creationTemplateId) ?? null;

  // Filters from query params
  const filterStatus = (router.query.status as string) ?? "";
  const [filterAgent, setFilterAgent] = useState("");
  const [filterArea, setFilterArea] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setTasks(await getTasks());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      const execFields = executionFieldsForCreate(creationTemplate);
      await createTask({
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        related_area: (form.related_area as RelatedArea) || null,
        ...execFields,
        assigned_to: form.assigned_to.trim() || execFields.assigned_to,
      });
      setForm(emptyForm);
      setCreationTemplateId(null);
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    try {
      await updateTask(id, { status });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    } catch {
      // non-critical inline action — just reload
      await load();
    }
  }

  async function handleAssigneeChange(id: string, assignee: string) {
    try {
      await updateTask(id, { assigned_to: assignee || null });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, assigned_to: assignee || null } : t))
      );
    } catch {
      await load();
    }
  }

  async function handleCopyBrief(task: Task) {
    const mode = defaultAgentBriefModeFromAssignee(task.assigned_to);
    const brief = buildAgentTaskBrief(task, [], {}, {}, mode);
    await navigator.clipboard.writeText(brief);
    setCopiedId(task.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleSyncBrain() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/brain/sync-tasks", { method: "POST" });
      const json = await res.json();
      setSyncMsg(json.success ? `Synced (${json.count} tasks)` : (json.error ?? "Sync failed"));
    } catch {
      setSyncMsg("Sync failed");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task and all its outputs?")) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  const filtered = tasks.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterAgent && (t.assigned_to ?? "").trim().toLowerCase() !== filterAgent.toLowerCase()) {
      return false;
    }
    if (filterArea && t.related_area !== filterArea) return false;
    return true;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Command Center</p>
          <h1 className="font-serif text-2xl tracking-tight">Tasks</h1>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => {
              if (v) {
                setForm(emptyForm);
                setFormError(null);
                setCreationTemplateId(null);
              }
              return !v;
            });
          }}
          className="btn btn-primary text-[11px] py-2.5 px-5"
        >
          {showForm ? "Cancel" : "+ New Task"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 border border-ink/15 rounded-xl bg-white/60 space-y-3"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink/40 mb-1">New Task</p>
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            <span className="text-[10px] uppercase tracking-[0.15em] text-ink/35 mr-1">
              Preset
            </span>
            <button
              type="button"
              onClick={() => setCreationTemplateId(null)}
              className={`text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded border transition-colors ${
                creationTemplateId == null
                  ? "border-ink/30 bg-ink/5 text-ink"
                  : "border-ink/12 text-ink/45 hover:border-ink/25 hover:text-ink/65"
              }`}
            >
              None
            </button>
            {TASK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCreationTemplateId(t.id)}
                className={`text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded border transition-colors ${
                  creationTemplateId === t.id
                    ? "border-umber/40 bg-umber/10 text-umber"
                    : "border-ink/12 text-ink/45 hover:border-ink/25 hover:text-ink/65"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {formError && (
            <p className="text-xs text-red-600">{formError}</p>
          )}
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-ink/50"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-ink/50 resize-none"
          />
          <datalist id="ccc-new-task-assignee-presets">
            {ASSIGNEE_FILTER_PRESETS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
              className="rounded border border-ink/20 bg-white px-2 py-2 text-sm text-ink focus:outline-none focus:border-ink/50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              className="rounded border border-ink/20 bg-white px-2 py-2 text-sm text-ink focus:outline-none focus:border-ink/50"
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
              ))}
            </select>
            <input
              list="ccc-new-task-assignee-presets"
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              placeholder="Assignee (optional)"
              className="rounded border border-ink/20 bg-white px-2 py-2 text-sm text-ink placeholder-ink/35 focus:outline-none focus:border-ink/50"
            />
            <select
              value={form.related_area}
              onChange={(e) => setForm({ ...form, related_area: e.target.value as RelatedArea | "" })}
              className="rounded border border-ink/20 bg-white px-2 py-2 text-sm text-ink focus:outline-none focus:border-ink/50"
            >
              <option value="">Area —</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary text-[11px] py-2 px-5 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Task"}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) =>
            router.replace(
              e.target.value
                ? `/command-center/tasks?status=${e.target.value}`
                : "/command-center/tasks",
              undefined,
              { shallow: true }
            )
          }
          className="rounded border border-ink/20 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ink focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="rounded border border-ink/20 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ink focus:outline-none"
        >
          <option value="">All assignees</option>
          {ASSIGNEE_FILTER_PRESETS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="rounded border border-ink/20 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ink focus:outline-none"
        >
          <option value="">All Areas</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {(filterStatus || filterAgent || filterArea) && (
          <button
            onClick={() => {
              setFilterAgent("");
              setFilterArea("");
              router.replace("/command-center/tasks", undefined, { shallow: true });
            }}
            className="text-[10px] uppercase tracking-[0.15em] text-ink/35 hover:text-ink transition-colors px-2"
          >
            Clear
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleSyncBrain}
            disabled={syncing}
            className="text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded border border-ink/15 text-ink/45 hover:text-ink/70 transition-colors disabled:opacity-40"
            title="Regenerate brain/task-queue.md from current Supabase task state"
          >
            {syncing ? "Syncing…" : "→ brain"}
          </button>
          {syncMsg && (
            <span className="text-[10px] text-moss/70">{syncMsg}</span>
          )}
          <span className="text-[11px] text-ink/35">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded border border-red-200">
          {error}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-sm text-ink/40 py-8 text-center">Loading...</p>
      )}

      {/* Table */}
      {!loading && (
        <div className="border border-ink/10 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-sm text-ink/35 px-6 py-10 text-center">
              No tasks match the current filters.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-ink/2">
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-ink/40 font-normal w-8">P</th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-ink/40 font-normal">Title</th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-ink/40 font-normal">Queue</th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-ink/40 font-normal">Assignee</th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-ink/40 font-normal">Area</th>
                  <th className="px-4 py-2.5 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task, i) => (
                  <tr
                    key={task.id}
                    className={`group ${i > 0 ? "border-t border-ink/8" : ""} hover:bg-ink/2 transition-colors`}
                  >
                    <td className="px-4 py-3 text-[10px] text-ink/35">{task.priority}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/command-center/tasks/${task.id}`}
                        className="text-ink no-underline hover:text-umber font-medium leading-snug"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-[11px] text-ink/40 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      {(task.execution_status ||
                        task.assigned_to ||
                        (task.next_step && task.next_step.trim()) ||
                        (task.last_run_at &&
                          (task.last_run_target ?? "").trim())) && (
                        <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                          {task.execution_status && (
                            <span
                              className={`text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded ${EXECUTION_STATUS_STYLE[task.execution_status] ?? "bg-ink/6 text-ink/45"}`}
                            >
                              {task.execution_status.replace("_", " ")}
                            </span>
                          )}
                          {task.assigned_to && (
                            <span className="text-[9px] tracking-tight px-1.5 py-0.5 rounded border border-ink/10 text-ink/38">
                              {task.assigned_to}
                            </span>
                          )}
                          {task.next_step?.trim() && (
                            <span
                              className="text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded border border-ink/10 text-ink/35"
                              title={task.next_step.trim()}
                            >
                              Next step
                            </span>
                          )}
                          {task.last_run_at &&
                            task.last_run_target?.trim() && (
                              <span
                                className="text-[9px] tracking-tight px-1.5 py-0.5 rounded border border-ink/8 text-ink/32"
                                title={`Last handoff: ${new Date(
                                  task.last_run_at
                                ).toLocaleString()}`}
                              >
                                → {task.last_run_target.trim()}
                              </span>
                            )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value as TaskStatus)
                        }
                        className={`text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_STYLE[task.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.assigned_to ?? ""}
                        onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                        className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none bg-transparent ${
                          task.assigned_to?.trim()
                            ? (AGENT_STYLE[task.assigned_to.trim().toLowerCase()] ?? "text-ink/45")
                            : "text-ink/25"
                        }`}
                      >
                        <option value="">—</option>
                        {ASSIGNEE_FILTER_PRESETS.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {task.related_area && (
                        <span className="text-[10px] text-ink/40 uppercase tracking-[0.15em]">
                          {task.related_area}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleCopyBrief(task)}
                          className="text-[10px] text-ink/25 hover:text-moss transition-colors"
                          title={`Copy ${task.assigned_to ?? "general"} brief`}
                        >
                          {copiedId === task.id ? "✓" : "▶"}
                        </button>
                        {task.status !== "done" && (
                          <button
                            onClick={() => handleStatusChange(task.id, "done")}
                            className="text-[10px] text-ink/25 hover:text-green-600 transition-colors"
                            title="Mark done"
                          >
                            Done
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-[10px] text-ink/25 hover:text-red-500 transition-colors"
                          title="Delete task"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

TasksPage.getLayout = (page: ReactElement) => (
  <CommandCenterLayout>{page}</CommandCenterLayout>
);

export default TasksPage;
