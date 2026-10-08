// ---------------------------------------------------------------------------
// lib/commandCenterValidation.ts
//
// Pure request-body parsers for the Command Center API routes under
// /api/tasks/… (tasks 0c6961fa / fe9f0e5d / b696ede8). No Supabase import,
// no env access — browser-safe and testable under `node --test`
// (lib/commandCenterValidation.test.ts).
//
// The import below is type-only (fully erased at runtime) on purpose: the
// test runner cannot resolve the `@/` alias, so this module must have zero
// runtime imports.
// ---------------------------------------------------------------------------

import type {
  ExecutionStatus,
  PromptTemplate,
  Task,
  TaskEntityType,
  TaskLink,
  TaskStatus,
} from "@/lib/commandCenter";

export const TASK_STATUSES: readonly TaskStatus[] = [
  "backlog",
  "ready",
  "in_progress",
  "review",
  "done",
];

export const EXECUTION_STATUSES: readonly ExecutionStatus[] = [
  "todo",
  "in_progress",
  "review",
  "blocked",
  "done",
];

export const TASK_ENTITY_TYPES: readonly TaskEntityType[] = [
  "location",
  "tour",
  "story",
];

export type TaskInsert = Omit<Task, "id" | "created_at" | "updated_at">;
export type TaskPatch = Partial<TaskInsert>;
export type TaskLinkInsert = Pick<TaskLink, "entity_type" | "entity_id">;
export type PromptTemplateInsert = Omit<
  PromptTemplate,
  "id" | "created_at" | "updated_at"
>;
export type PromptTemplatePatch = Partial<PromptTemplateInsert>;

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

// RFC-4122 textual form (8-4-4-4-12 hex). Deliberately not version/variant
// strict so legitimate Postgres uuids are never rejected at the route edge.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function fail<T>(error: string): ParseResult<T> {
  return { ok: false, error };
}

/** `string | null`; `undefined` is treated as null by callers that default. */
function stringOrNull(
  key: string,
  v: unknown
): ParseResult<string | null> {
  if (v === null || v === undefined) return { ok: true, value: null };
  if (typeof v !== "string") return fail(`${key} must be a string or null`);
  return { ok: true, value: v };
}

function nonEmptyString(key: string, v: unknown): ParseResult<string> {
  if (typeof v !== "string" || !v.trim())
    return fail(`${key} must be a non-empty string`);
  return { ok: true, value: v.trim() };
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

/** Every column a client may send on create/patch (the 19 TaskInsert keys). */
const TASK_INSERT_KEYS: readonly (keyof TaskInsert)[] = [
  "title",
  "description",
  "status",
  "priority",
  "related_area",
  "task_type",
  "execution_status",
  "assigned_to",
  "latest_output",
  "last_action_note",
  "next_step",
  "source_prompt",
  "artifact_links",
  "implementation_notes",
  "review_note",
  "last_run_target",
  "last_run_at",
  "last_run_note",
  "source",
];

const TASK_SOURCES: readonly NonNullable<Task["source"]>[] = [
  "claude-ai",
  "luigi",
  "loop",
];

/**
 * Validates one task field. Shared by create and patch. task_type,
 * related_area, last_run_target etc. are free text in the DB (legacy values
 * exist) so only status / execution_status / source are enum-checked.
 */
function parseTaskField(
  key: keyof TaskInsert,
  v: unknown
): ParseResult<TaskInsert[keyof TaskInsert]> {
  switch (key) {
    case "title":
      return nonEmptyString("title", v);
    case "priority":
      if (typeof v !== "number" || !Number.isInteger(v))
        return fail("priority must be an integer");
      return { ok: true, value: v };
    case "status":
      if (typeof v !== "string" || !(TASK_STATUSES as readonly string[]).includes(v))
        return fail(`status must be one of: ${TASK_STATUSES.join(", ")}`);
      return { ok: true, value: v as TaskStatus };
    case "execution_status":
      if (v === null) return { ok: true, value: null };
      if (
        typeof v !== "string" ||
        !(EXECUTION_STATUSES as readonly string[]).includes(v)
      )
        return fail(
          `execution_status must be null or one of: ${EXECUTION_STATUSES.join(", ")}`
        );
      return { ok: true, value: v as ExecutionStatus };
    case "source":
      if (v === null) return { ok: true, value: null };
      if (typeof v !== "string" || !(TASK_SOURCES as readonly string[]).includes(v))
        return fail(`source must be null or one of: ${TASK_SOURCES.join(", ")}`);
      return { ok: true, value: v as Task["source"] };
    default:
      return stringOrNull(key, v) as ParseResult<TaskInsert[keyof TaskInsert]>;
  }
}

function isTaskInsertKey(k: string): k is keyof TaskInsert {
  return (TASK_INSERT_KEYS as readonly string[]).includes(k);
}

/**
 * POST /api/tasks body. `title` required; `status` defaults to "backlog",
 * `priority` to 3, every other column to null. Unknown keys are rejected
 * (so `id` / `created_at` / `updated_at` can never be smuggled in).
 */
export function parseTaskCreate(body: unknown): ParseResult<TaskInsert> {
  if (!isRecord(body)) return fail("Body must be a JSON object");

  const value: TaskInsert = {
    title: "",
    description: null,
    status: "backlog",
    priority: 3,
    related_area: null,
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
    last_run_target: null,
    last_run_at: null,
    last_run_note: null,
    source: null,
  };

  if (!("title" in body)) return fail("title is required");

  for (const [k, v] of Object.entries(body)) {
    if (!isTaskInsertKey(k)) return fail(`Unknown field: ${k}`);
    if (v === undefined) continue;
    const parsed = parseTaskField(k, v);
    if (!parsed.ok) return parsed;
    (value as Record<string, unknown>)[k] = parsed.value;
  }

  if (!value.title) return fail("title must be a non-empty string");
  return { ok: true, value };
}

/**
 * PATCH /api/tasks/[id] body. Whitelisted keys only; empty patch rejected.
 */
export function parseTaskPatch(body: unknown): ParseResult<TaskPatch> {
  if (!isRecord(body)) return fail("Body must be a JSON object");

  const value: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!isTaskInsertKey(k)) return fail(`Unknown field: ${k}`);
    if (v === undefined) continue;
    const parsed = parseTaskField(k, v);
    if (!parsed.ok) return parsed;
    value[k] = parsed.value;
  }

  if (Object.keys(value).length === 0) return fail("Patch must contain at least one field");
  return { ok: true, value: value as TaskPatch };
}

// ---------------------------------------------------------------------------
// Task links
// ---------------------------------------------------------------------------

export function parseTaskLinkCreate(body: unknown): ParseResult<TaskLinkInsert> {
  if (!isRecord(body)) return fail("Body must be a JSON object");
  const { entity_type, entity_id } = body;
  if (
    typeof entity_type !== "string" ||
    !(TASK_ENTITY_TYPES as readonly string[]).includes(entity_type)
  )
    return fail(`entity_type must be one of: ${TASK_ENTITY_TYPES.join(", ")}`);
  const id = nonEmptyString("entity_id", entity_id);
  if (!id.ok) return id;
  return {
    ok: true,
    value: { entity_type: entity_type as TaskEntityType, entity_id: id.value },
  };
}

// ---------------------------------------------------------------------------
// Prompt templates
// ---------------------------------------------------------------------------

const PROMPT_TEMPLATE_KEYS: readonly (keyof PromptTemplateInsert)[] = [
  "name",
  "target_agent",
  "description",
  "template",
];

function isPromptTemplateKey(k: string): k is keyof PromptTemplateInsert {
  return (PROMPT_TEMPLATE_KEYS as readonly string[]).includes(k);
}

function parsePromptTemplateField(
  key: keyof PromptTemplateInsert,
  v: unknown
): ParseResult<string | null> {
  switch (key) {
    case "name":
    case "template":
    case "target_agent":
      return nonEmptyString(key, v);
    case "description":
      return stringOrNull(key, v);
  }
}

export function parsePromptTemplateCreate(
  body: unknown
): ParseResult<PromptTemplateInsert> {
  if (!isRecord(body)) return fail("Body must be a JSON object");

  for (const k of Object.keys(body)) {
    if (!isPromptTemplateKey(k)) return fail(`Unknown field: ${k}`);
  }

  const name = nonEmptyString("name", body.name);
  if (!name.ok) return name;
  const template = nonEmptyString("template", body.template);
  if (!template.ok) return template;
  const targetAgent = nonEmptyString("target_agent", body.target_agent);
  if (!targetAgent.ok) return targetAgent;
  const description = stringOrNull("description", body.description);
  if (!description.ok) return description;

  return {
    ok: true,
    value: {
      name: name.value,
      template: template.value,
      target_agent: targetAgent.value,
      description: description.value,
    },
  };
}

export function parsePromptTemplatePatch(
  body: unknown
): ParseResult<PromptTemplatePatch> {
  if (!isRecord(body)) return fail("Body must be a JSON object");

  const value: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!isPromptTemplateKey(k)) return fail(`Unknown field: ${k}`);
    if (v === undefined) continue;
    const parsed = parsePromptTemplateField(k, v);
    if (!parsed.ok) return parsed;
    value[k] = parsed.value;
  }

  if (Object.keys(value).length === 0) return fail("Patch must contain at least one field");
  return { ok: true, value: value as PromptTemplatePatch };
}
