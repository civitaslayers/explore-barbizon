import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  taskFromRow,
  type Output,
  type Task,
  type TaskStatus,
  type PromptTemplate,
} from "@/lib/commandCenter";

// ---------------------------------------------------------------------------
// Server-only Command Center reads and writes (task 82295116 — CCC blind-read
// fix; task 10d2c7fc — dispatch/run/outputs blind-read fix).
//
// `lib/commandCenter.ts`'s functions run against the ANON client, which is
// deny-all under RLS for tasks/outputs/task_links — they
// silently return [] / zero counts rather than erroring. This module reads
// the same tables via `supabaseAdmin` (service role) and is meant to be
// called ONLY from `getServerSideProps` or API routes — never from a client
// component body, useEffect, or event handler. `supabaseAdmin` already
// throws if imported in the browser; this guard is defense-in-depth so a
// mistaken import fails immediately and obviously at this module's own
// boundary too.
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
 * Admin update of a task. Deliberately does not select/return the updated
 * row — no dispatch/run/outputs call site needs it, and selecting would
 * re-trip the `source`-column generated-types lag documented above.
 * `.select("id").single()` is kept only so a vanished row still throws
 * (preserves today's loud-failure behavior on update).
 */
export async function updateTaskAdmin(
  id: string,
  input: Partial<Omit<Task, "id" | "created_at" | "updated_at">>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
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
