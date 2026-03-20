import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
// DB timestamps use DEFAULT now(); updated_at is maintained by triggers on
// tasks, memory, and prompt_templates.

export type TaskStatus = "backlog" | "ready" | "in_progress" | "review" | "done";
export type AssignedAgent = "chatgpt" | "claude" | "cursor" | "manual";
export type TaskType =
  | "content"
  | "code"
  | "map"
  | "data"
  | "ops"
  | "design"
  | "research"
  | "other";
/** Where the work stands for execution (separate from queue `status`). */
export type ExecutionStatus = "todo" | "in_progress" | "review" | "blocked" | "done";
export type RelatedArea =
  | "product"
  | "content"
  | "map"
  | "database"
  | "design"
  | "engineering"
  | "seo"
  | "ops";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number; // DB column is nullable with default 3; app always uses a numeric priority
  assigned_agent: AssignedAgent | null;
  related_area: RelatedArea | null;
  task_type: TaskType | null;
  execution_status: ExecutionStatus | null;
  assigned_to: string | null;
  latest_output: string | null;
  last_action_note: string | null;
  /** Short instruction for the next actor (human + AI handoffs). */
  next_step: string | null;
  /**
   * Exact text of the latest agent brief copied/sent via Run with… (operational snapshot).
   * Not a free-form scratch field; use implementation notes or outputs for other capture.
   */
  source_prompt: string | null;
  /** URLs or path-like references; often one per line. */
  artifact_links: string | null;
  /** What changed, was produced, or was decided (compact). */
  implementation_notes: string | null;
  /** Reviewer note, approval, or requested changes. */
  review_note: string | null;
  /** Tool or person the brief was last handed to (free text). */
  last_run_target: string | null;
  /** When the latest handoff/run was recorded. */
  last_run_at: string | null;
  /** Short note about the latest handoff/run. */
  last_run_note: string | null;
  created_at: string;
  updated_at: string;
};

export type Output = {
  id: string;
  task_id: string | null; // Nullable by design in DB; FK to tasks.id with ON DELETE CASCADE
  agent: string;
  prompt: string | null;
  response: string | null;
  version: number;
  created_at: string;
};

export type Decision = {
  id: string;
  title: string;
  context: string | null;
  decision: string;
  reasoning: string | null;
  created_at: string;
};

export type Memory = {
  id: string;
  key: string; // Unique constraint (memory_key_key); upsert uses key as logical identifier
  content: string;
  category: string | null;
  updated_at: string;
  created_at: string;
};

export type PromptTemplate = {
  id: string;
  name: string;
  target_agent: string;
  description: string | null;
  template: string;
  created_at: string;
  updated_at: string;
};

export type TaskEntityType = "location" | "tour" | "story";

export type TaskLink = {
  id: string;
  task_id: string;
  entity_type: TaskEntityType;
  // Note: entity_id is intentionally not FK-constrained to locations/tours/stories yet.
  entity_id: string;
  created_at: string;
};

/** Ensures execution columns exist at runtime (null) if DB predates migration. */
function taskFromRow(row: Task): Task {
  return {
    ...row,
    task_type: row.task_type ?? null,
    execution_status: row.execution_status ?? null,
    assigned_to: row.assigned_to ?? null,
    latest_output: row.latest_output ?? null,
    last_action_note: row.last_action_note ?? null,
    next_step: row.next_step ?? null,
    source_prompt: row.source_prompt ?? null,
    artifact_links: row.artifact_links ?? null,
    implementation_notes: row.implementation_notes ?? null,
    review_note: row.review_note ?? null,
    last_run_target: row.last_run_target ?? null,
    last_run_at: row.last_run_at ?? null,
    last_run_note: row.last_run_note ?? null,
  };
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function getTasks(): Promise<Task[]> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => taskFromRow(r as Task));
}

export async function getTask(id: string): Promise<Task | null> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return taskFromRow(data as Task);
}

export async function createTask(
  input: Omit<Task, "id" | "created_at" | "updated_at">
): Promise<Task> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("tasks")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return taskFromRow(data as Task);
}

export async function updateTask(
  id: string,
  input: Partial<Omit<Task, "id" | "created_at" | "updated_at">>
): Promise<Task> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return taskFromRow(data as Task);
}

export async function deleteTask(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Task Links (CCC <-> public entities)
// ---------------------------------------------------------------------------

export async function getTaskLinks(taskId: string): Promise<TaskLink[]> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("task_links")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTaskLink(
  input: Omit<TaskLink, "id" | "created_at">
): Promise<TaskLink> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("task_links")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTaskLink(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("task_links").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

export async function getOutputsForTask(taskId: string): Promise<Output[]> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("outputs")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecentOutputs(limit = 5): Promise<Output[]> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("outputs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createOutput(
  input: Omit<Output, "id" | "created_at">
): Promise<Output> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("outputs")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOutput(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("outputs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------

export async function getDecisions(): Promise<Decision[]> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createDecision(
  input: Omit<Decision, "id" | "created_at">
): Promise<Decision> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("decisions")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateDecision(
  id: string,
  input: Partial<Omit<Decision, "id" | "created_at">>
): Promise<Decision> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("decisions")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDecision(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("decisions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------

export async function getMemory(): Promise<Memory[]> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("memory")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertMemory(
  input: Omit<Memory, "id" | "created_at" | "updated_at">
): Promise<Memory> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("memory")
    .upsert(input, { onConflict: "key" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMemory(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("memory").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Prompt Templates
// ---------------------------------------------------------------------------

export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createPromptTemplate(
  input: Omit<PromptTemplate, "id" | "created_at" | "updated_at">
): Promise<PromptTemplate> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("prompt_templates")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePromptTemplate(
  id: string,
  input: Partial<Omit<PromptTemplate, "id" | "created_at" | "updated_at">>
): Promise<PromptTemplate> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("prompt_templates")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePromptTemplate(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("prompt_templates")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Overview stats
// ---------------------------------------------------------------------------

export async function getOverviewStats() {
  if (!supabase) throw new Error("Supabase not configured");

  const [tasks, recentOutputs, recentDecisions, recentMemory] =
    await Promise.all([
      supabase.from("tasks").select("id, title, status, assigned_to, updated_at").order("updated_at", { ascending: false }),
      supabase.from("outputs").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("decisions").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("memory").select("*").order("updated_at", { ascending: false }).limit(5),
    ]);

  if (tasks.error) throw new Error(tasks.error.message);
  if (recentOutputs.error) throw new Error(recentOutputs.error.message);
  if (recentDecisions.error) throw new Error(recentDecisions.error.message);
  if (recentMemory.error) throw new Error(recentMemory.error.message);

  const statusOrder: TaskStatus[] = ["backlog", "ready", "in_progress", "review", "done"];
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
