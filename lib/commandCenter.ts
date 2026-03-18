import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TaskStatus = "backlog" | "ready" | "in_progress" | "review" | "done";
export type AssignedAgent = "chatgpt" | "claude" | "cursor" | "manual";
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
  priority: number;
  assigned_agent: AssignedAgent | null;
  related_area: RelatedArea | null;
  created_at: string;
  updated_at: string;
};

export type Output = {
  id: string;
  task_id: string | null;
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
  key: string;
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
  return data ?? [];
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
  return data;
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
  return data;
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
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("tasks").delete().eq("id", id);
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
      supabase.from("tasks").select("id, title, status, assigned_agent, updated_at").order("updated_at", { ascending: false }),
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
