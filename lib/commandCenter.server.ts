import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  taskFromRow,
  type Output,
  type Task,
  type TaskLink,
  type TaskStatus,
  type PromptTemplate,
} from "@/lib/commandCenter";
import type {
  PromptTemplateInsert,
  PromptTemplatePatch,
  TaskInsert,
  TaskLinkInsert,
  TaskPatch,
} from "@/lib/commandCenterValidation";

// ---------------------------------------------------------------------------
// Server-only Command Center data access (tasks 82295116, 10d2c7fc, f219286a,
// 0c6961fa, fe9f0e5d, b696ede8).
//
// This is the SOLE data-access layer for tasks / outputs / task_links /
// prompt_templates. Those tables are deny-all under RLS for the anon role, so
// the anon client silently returns [] / no-ops rather than erroring. Every
// read and write here goes through `supabaseAdmin` (service role) and is
// meant to be called ONLY from `getServerSideProps` or API routes under
// /api/tasks/… — never from a client component body, useEffect, or event
// handler. Browser code talks to those routes via `lib/commandCenterClient.ts`;
// `lib/commandCenter.ts` is types-only. `supabaseAdmin` already throws if
// imported in the browser; this guard is defense-in-depth so a mistaken
// import fails immediately and obviously at this module's own boundary too.
// ---------------------------------------------------------------------------

if (typeof window !== "undefined") {
  throw new Error(
    "lib/commandCenter.server.ts must never be imported in the browser"
  );
}

const TASK_COLUMNS =
  "id, title, description, status, priority, related_area, task_type, execution_status, assigned_to, latest_output, last_action_note, next_step, source_prompt, artifact_links, implementation_notes, review_note, last_run_target, last_run_at, last_run_note, source, created_at, updated_at";

/**
 * All tasks, admin-read, same ordering as `getTasks` (priority asc, then
 * created_at desc).
 *
 * `lib/supabase.types.ts` predates the `source` column on `tasks` — the same
 * generated-types lag already documented for `v_translation_health` in
 * `pages/command-center/index.tsx`. Cast to an untyped client for this one
 * query rather than widening the shared `Database` type for a single column.
 */
export async function getTasksAdmin(): Promise<Task[]> {
  const untypedAdmin = supabaseAdmin as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        order: (
          column: string,
          opts: { ascending: boolean }
        ) => {
          order: (
            column: string,
            opts: { ascending: boolean }
          ) => Promise<{ data: unknown; error: { message: string } | null }>;
        };
      };
    };
  };

  const { data, error } = await untypedAdmin
    .from("tasks")
    .select(TASK_COLUMNS)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as Task[]).map((row) => taskFromRow(row));
}

/**
 * Overview stats for the CCC dashboard, admin-read: task status counts,
 * recent tasks, and recent outputs.
 */
export async function getOverviewStatsAdmin() {
  const [tasks, recentOutputs] = await Promise.all([
    supabaseAdmin
      .from("tasks")
      .select("id, title, status, assigned_to, updated_at")
      .order("updated_at", { ascending: false }),
    supabaseAdmin
      .from("outputs")
      .select("id, task_id, agent, prompt, response, version, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (tasks.error) throw new Error(tasks.error.message);
  if (recentOutputs.error) throw new Error(recentOutputs.error.message);

  const statusOrder: TaskStatus[] = [
    "backlog",
    "ready",
    "in_progress",
    "review",
    "done",
  ];
  const tasksByStatus = statusOrder.reduce(
    (acc, s) => {
      acc[s] = 0;
      return acc;
    },
    {} as Record<string, number>
  );
  for (const t of tasks.data ?? []) {
    if (t.status in tasksByStatus) tasksByStatus[t.status]++;
  }

  return {
    tasksByStatus,
    recentTasks: (tasks.data ?? []).slice(0, 5),
    recentOutputs: recentOutputs.data ?? [],
  };
}

/**
 * Single task, admin-read, by id. Same `source`-column generated-types lag
 * as `getTasksAdmin` — reuses `TASK_COLUMNS` and the same untyped-cast
 * workaround. Returns `null` on a missing row (mirrors `getTask`'s contract)
 * so callers can 404 — this is load-bearing for the dispatch/run/outputs
 * routes.
 */
export async function getTaskAdmin(id: string): Promise<Task | null> {
  const untypedAdmin = supabaseAdmin as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{
            data: unknown;
            error: { message: string; code?: string } | null;
          }>;
        };
      };
    };
  };

  const { data, error } = await untypedAdmin
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  return taskFromRow(data as Task);
}

/**
 * Minimal structural view of the admin client for the `tasks` table, which
 * carries the `source`-column generated-types lag documented on
 * `getTasksAdmin`. Thenable so a chain can be awaited at any step.
 */
type UntypedResult = {
  data: unknown;
  error: { message: string; code?: string } | null;
};
type UntypedChain = PromiseLike<UntypedResult> & {
  select: (columns: string) => UntypedChain;
  insert: (values: unknown) => UntypedChain;
  update: (values: unknown) => UntypedChain;
  eq: (column: string, value: string) => UntypedChain;
  maybeSingle: () => Promise<UntypedResult>;
  single: () => Promise<UntypedResult>;
};
function untypedTasks(): UntypedChain {
  const untypedAdmin = supabaseAdmin as unknown as {
    from: (table: string) => UntypedChain;
  };
  return untypedAdmin.from("tasks");
}

/**
 * Admin update of a task. Returns the fresh row (so PATCH /api/tasks/[id]
 * can answer with it) or `null` when no row matched. Goes through the same
 * untyped cast as `getTaskAdmin` because of the `source`-column types lag.
 * Existing dispatch/run/outputs callers ignore the return value.
 */
export async function updateTaskAdmin(
  id: string,
  input: TaskPatch
): Promise<Task | null> {
  const { data, error } = await untypedTasks()
    .update(input)
    .eq("id", id)
    .select(TASK_COLUMNS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return taskFromRow(data as Task);
}

/** Admin insert of a task; returns the created row. */
export async function createTaskAdmin(input: TaskInsert): Promise<Task> {
  const { data, error } = await untypedTasks()
    .insert(input)
    .select(TASK_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return taskFromRow(data as Task);
}

/**
 * Admin delete of a task. task_links rows for the task are removed first
 * (the FK's ON DELETE behaviour is not verified, so this is explicit);
 * outputs.task_id cascades per the generated types. Returns whether a task
 * row was actually deleted.
 */
export async function deleteTaskAdmin(id: string): Promise<boolean> {
  const links = await supabaseAdmin.from("task_links").delete().eq("task_id", id);
  if (links.error) throw new Error(links.error.message);

  const { data, error } = await supabaseAdmin
    .from("tasks")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

/**
 * Admin insert of an output row. `outputs`' generated types are complete
 * (no `source`-style lag), so no untyped cast is needed here.
 */
export async function createOutputAdmin(
  input: Omit<Output, "id" | "created_at">
): Promise<Output> {
  const { data, error } = await supabaseAdmin
    .from("outputs")
    .insert(input)
    .select("id, task_id, agent, prompt, response, version, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data as Output;
}

const PROMPT_TEMPLATE_COLUMNS =
  "id, name, target_agent, description, template, created_at, updated_at";

/**
 * All prompt templates, admin-read, same ordering as the retired anon
 * getPromptTemplates() (name asc). prompt_templates has a deny-all RLS
 * policy for public (cmd ALL, qual false), so the anon read returned []
 * with no error — a blind read, not an empty library (task f219286a).
 */
export async function getPromptTemplatesAdmin(): Promise<PromptTemplate[]> {
  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .select(PROMPT_TEMPLATE_COLUMNS)
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []) as PromptTemplate[];
}

// ---------------------------------------------------------------------------
// Outputs (reads/deletes — task 0c6961fa)
// ---------------------------------------------------------------------------

const OUTPUT_COLUMNS = "id, task_id, agent, prompt, response, version, created_at";

/** All outputs for one task, newest first (same order the detail page used). */
export async function getOutputsForTaskAdmin(taskId: string): Promise<Output[]> {
  const { data, error } = await supabaseAdmin
    .from("outputs")
    .select(OUTPUT_COLUMNS)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Output[];
}

/**
 * Delete one output, scoped to its task so a mismatched (task, output) pair
 * is a no-op. Returns whether a row was deleted.
 */
export async function deleteOutputAdmin(
  taskId: string,
  outputId: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("outputs")
    .delete()
    .eq("id", outputId)
    .eq("task_id", taskId)
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

// ---------------------------------------------------------------------------
// Task links (task 0c6961fa)
// ---------------------------------------------------------------------------

const TASK_LINK_COLUMNS = "id, task_id, entity_type, entity_id, created_at";

/** All links for one task, newest first. */
export async function getTaskLinksAdmin(taskId: string): Promise<TaskLink[]> {
  const { data, error } = await supabaseAdmin
    .from("task_links")
    .select(TASK_LINK_COLUMNS)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as TaskLink[];
}

export type CreateTaskLinkResult =
  | { kind: "created"; link: TaskLink }
  | { kind: "duplicate"; link: TaskLink };

/**
 * Create a link, reporting an existing identical (task_id, entity_type,
 * entity_id) row as `duplicate` instead of throwing. A unique-violation
 * race (23505) after the pre-check is folded into the same `duplicate` path.
 */
export async function createTaskLinkAdmin(
  taskId: string,
  input: TaskLinkInsert
): Promise<CreateTaskLinkResult> {
  const existing = await supabaseAdmin
    .from("task_links")
    .select(TASK_LINK_COLUMNS)
    .eq("task_id", taskId)
    .eq("entity_type", input.entity_type)
    .eq("entity_id", input.entity_id)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return { kind: "duplicate", link: existing.data as TaskLink };

  const { data, error } = await supabaseAdmin
    .from("task_links")
    .insert({ task_id: taskId, ...input })
    .select(TASK_LINK_COLUMNS)
    .single();
  if (error) {
    if (error.code === "23505") {
      const again = await supabaseAdmin
        .from("task_links")
        .select(TASK_LINK_COLUMNS)
        .eq("task_id", taskId)
        .eq("entity_type", input.entity_type)
        .eq("entity_id", input.entity_id)
        .maybeSingle();
      if (!again.error && again.data)
        return { kind: "duplicate", link: again.data as TaskLink };
    }
    throw new Error(error.message);
  }
  return { kind: "created", link: data as TaskLink };
}

/** Delete one link, scoped to its task. Returns whether a row was deleted. */
export async function deleteTaskLinkAdmin(
  taskId: string,
  linkId: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("task_links")
    .delete()
    .eq("id", linkId)
    .eq("task_id", taskId)
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

// ---------------------------------------------------------------------------
// Prompt templates (writes — task b696ede8)
// ---------------------------------------------------------------------------

export async function createPromptTemplateAdmin(
  input: PromptTemplateInsert
): Promise<PromptTemplate> {
  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .insert(input)
    .select(PROMPT_TEMPLATE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as PromptTemplate;
}

/** Returns the fresh row, or `null` when no template matched. */
export async function updatePromptTemplateAdmin(
  id: string,
  patch: PromptTemplatePatch
): Promise<PromptTemplate | null> {
  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .update(patch)
    .eq("id", id)
    .select(PROMPT_TEMPLATE_COLUMNS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as PromptTemplate | null) ?? null;
}

/** Returns whether a row was deleted. */
export async function deletePromptTemplateAdmin(id: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}
