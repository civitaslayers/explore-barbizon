import type { ExecutionStatus, Task, TaskType } from "@/lib/commandCenter";

/** Predefined creation presets for the task form (not user-editable). */
export type TaskTemplateId = "content" | "code" | "map" | "research" | "ops";

export type TaskTemplateDefaults = {
  task_type: TaskType;
  execution_status: ExecutionStatus;
  assigned_to: string;
  next_step: string;
  source_prompt?: string;
  implementation_notes?: string;
};

export type TaskTemplate = {
  id: TaskTemplateId;
  label: string;
  defaults: TaskTemplateDefaults;
};

export const TASK_TEMPLATES: readonly TaskTemplate[] = [
  {
    id: "content",
    label: "Content",
    defaults: {
      task_type: "content",
      execution_status: "todo",
      assigned_to: "claude",
      next_step: "Draft content based on linked entity",
      source_prompt: "",
      implementation_notes: "",
    },
  },
  {
    id: "code",
    label: "Code",
    defaults: {
      task_type: "code",
      execution_status: "todo",
      assigned_to: "cursor",
      next_step: "Implement scoped change only",
    },
  },
  {
    id: "map",
    label: "Map/Data",
    defaults: {
      task_type: "map",
      execution_status: "todo",
      assigned_to: "claude",
      next_step: "Validate and structure location data",
    },
  },
  {
    id: "research",
    label: "Research",
    defaults: {
      task_type: "research",
      execution_status: "todo",
      assigned_to: "chatgpt",
      next_step: "Produce structured summary",
    },
  },
  {
    id: "ops",
    label: "Ops",
    defaults: {
      task_type: "ops",
      execution_status: "todo",
      assigned_to: "human",
      next_step: "Execute and confirm completion",
    },
  },
];

export type TaskExecutionInsert = Pick<
  Task,
  | "task_type"
  | "execution_status"
  | "assigned_to"
  | "latest_output"
  | "last_action_note"
  | "next_step"
  | "source_prompt"
  | "artifact_links"
  | "implementation_notes"
  | "review_note"
>;

const emptyExecution: TaskExecutionInsert = {
  task_type: null,
  execution_status: null,
  assigned_to: null,
  latest_output: null,
  last_action_note: null,
  next_step: null,
  source_prompt: null,
  artifact_links: null,
  implementation_notes: null,
  review_note: null,
};

/** Maps template defaults to columns sent on insert; optional strings "" become null. */
export function executionFieldsForCreate(
  template: TaskTemplate | null
): TaskExecutionInsert {
  if (!template) return emptyExecution;
  const d = template.defaults;
  const trimOrNull = (s: string | undefined) => {
    const v = s?.trim() ?? "";
    return v.length ? v : null;
  };
  return {
    task_type: d.task_type,
    execution_status: d.execution_status,
    assigned_to: d.assigned_to.trim() || null,
    latest_output: null,
    last_action_note: null,
    next_step: trimOrNull(d.next_step),
    source_prompt: trimOrNull(d.source_prompt),
    artifact_links: null,
    implementation_notes: trimOrNull(d.implementation_notes),
    review_note: null,
  };
}
