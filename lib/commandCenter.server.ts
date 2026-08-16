import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { taskFromRow, type Task, type TaskStatus } from "@/lib/commandCenter";

// ---------------------------------------------------------------------------
// Server-only Command Center reads (task 82295116 — CCC blind-read fix).
//
// `lib/commandCenter.ts`'s functions run against the ANON client, which is
// deny-all under RLS for tasks/outputs/decisions/memory/task_links — they
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
 * Overview stats for the CCC dashboard, admin-read. Same shape/return as
 * `getOverviewStats` in `lib/commandCenter.ts`.
 */
export async function getOverviewStatsAdmin() {
  const [tasks, recentOutputs, recentDecisions, recentMemory] =
    await Promise.all([
      supabaseAdmin
        .from("tasks")
        .select("id, title, status, assigned_to, updated_at")
        .order("updated_at", { ascending: false }),
      supabaseAdmin
        .from("outputs")
        .select("id, task_id, agent, prompt, response, version, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabaseAdmin
        .from("decisions")
        .select("id, title, context, decision, reasoning, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabaseAdmin
        .from("memory")
        .select("id, key, content, category, updated_at, created_at")
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

  if (tasks.error) throw new Error(tasks.error.message);
  if (recentOutputs.error) throw new Error(recentOutputs.error.message);
  if (recentDecisions.error) throw new Error(recentDecisions.error.message);
  if (recentMemory.error) throw new Error(recentMemory.error.message);

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
    recentDecisions: recentDecisions.data ?? [],
    recentMemory: recentMemory.data ?? [],
  };
}
