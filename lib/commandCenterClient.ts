// ---------------------------------------------------------------------------
// lib/commandCenterClient.ts
//
// Browser-side Command Center data access (tasks 0c6961fa / fe9f0e5d /
// b696ede8). Every call is a same-origin fetch to an API route under
// /api/tasks/… — the Basic-Auth-protected prefix — which performs the actual
// read/write via lib/commandCenter.server.ts (service role). This module
// must never import a Supabase client: tasks / outputs / task_links /
// prompt_templates are deny-all under RLS for the anon role, so a direct
// anon query would silently return [] / no-op.
//
// The import below is type-only (erased at runtime) so this module stays
// testable under `node --test`, which cannot resolve the `@/` alias.
// ---------------------------------------------------------------------------

import type { Output, PromptTemplate, Task, TaskLink } from "@/lib/commandCenter";
import type {
  PromptTemplateInsert,
  PromptTemplatePatch,
  TaskInsert,
  TaskLinkInsert,
  TaskPatch,
} from "@/lib/commandCenterValidation";

export type TaskDetail = {
  task: Task;
  outputs: Output[];
  links: TaskLink[];
};

type JsonBody = { error?: unknown } & Record<string, unknown>;

async function readJson(res: Response): Promise<JsonBody | null> {
  try {
    const parsed: unknown = await res.json();
    return typeof parsed === "object" && parsed !== null
      ? (parsed as JsonBody)
      : null;
  } catch {
    return null;
  }
}

/**
 * fetch wrapper: JSON content type, defensive JSON parsing, and a thrown
 * Error carrying the route's `{ error }` message (or the HTTP status) on
 * any non-2xx response. Returns the parsed body (null for 204 / non-JSON).
 */
export async function cccFetch(
  url: string,
  init?: RequestInit
): Promise<JsonBody | null> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await fetch(url, { ...init, headers });
  const json = await readJson(res);
  if (!res.ok) {
    const message =
      typeof json?.error === "string" && json.error
        ? json.error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

function expectField<T>(json: JsonBody | null, key: string): T {
  const v = json?.[key];
  if (v === undefined || v === null) {
    throw new Error(`Malformed response: missing "${key}"`);
  }
  return v as T;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

/** Task + outputs + links in one round-trip. `null` on 404 (task not found). */
export async function apiGetTaskDetail(id: string): Promise<TaskDetail | null> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  const json = await readJson(res);
  if (!res.ok) {
    const message =
      typeof json?.error === "string" && json.error
        ? json.error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return {
    task: expectField<Task>(json, "task"),
    outputs: expectField<Output[]>(json, "outputs"),
    links: expectField<TaskLink[]>(json, "links"),
  };
}

export async function apiCreateTask(input: TaskInsert): Promise<Task> {
  const json = await cccFetch("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return expectField<Task>(json, "task");
}

export async function apiUpdateTask(id: string, patch: TaskPatch): Promise<Task> {
  const json = await cccFetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return expectField<Task>(json, "task");
}

export async function apiDeleteTask(id: string): Promise<void> {
  await cccFetch(`/api/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

export type OutputCreateInput = {
  agent: string;
  prompt: string | null;
  response: string | null;
  version: number;
};

/**
 * Reuses POST /api/tasks/[id]/outputs (the dispatch callback target), which
 * also syncs tasks.latest_output when a response is present.
 */
export async function apiCreateOutput(
  taskId: string,
  input: OutputCreateInput
): Promise<Output> {
  const json = await cccFetch(`/api/tasks/${encodeURIComponent(taskId)}/outputs`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return expectField<Output>(json, "output");
}

export async function apiDeleteOutput(taskId: string, outputId: string): Promise<void> {
  await cccFetch(
    `/api/tasks/${encodeURIComponent(taskId)}/outputs/${encodeURIComponent(outputId)}`,
    { method: "DELETE" }
  );
}

// ---------------------------------------------------------------------------
// Task links
// ---------------------------------------------------------------------------

export async function apiCreateTaskLink(
  taskId: string,
  input: TaskLinkInsert
): Promise<TaskLink> {
  const json = await cccFetch(`/api/tasks/${encodeURIComponent(taskId)}/links`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return expectField<TaskLink>(json, "link");
}

export async function apiDeleteTaskLink(taskId: string, linkId: string): Promise<void> {
  await cccFetch(
    `/api/tasks/${encodeURIComponent(taskId)}/links/${encodeURIComponent(linkId)}`,
    { method: "DELETE" }
  );
}

// ---------------------------------------------------------------------------
// Prompt templates — lives under /api/tasks/prompt-templates because that is
// the only Basic-Auth-protected API prefix available without a middleware
// change (see brain/decisions.md, RLS-blind family).
// ---------------------------------------------------------------------------

export async function apiCreatePromptTemplate(
  input: PromptTemplateInsert
): Promise<PromptTemplate> {
  const json = await cccFetch("/api/tasks/prompt-templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return expectField<PromptTemplate>(json, "template");
}

export async function apiUpdatePromptTemplate(
  id: string,
  patch: PromptTemplatePatch
): Promise<PromptTemplate> {
  const json = await cccFetch(
    `/api/tasks/prompt-templates/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(patch) }
  );
  return expectField<PromptTemplate>(json, "template");
}

export async function apiDeletePromptTemplate(id: string): Promise<void> {
  await cccFetch(`/api/tasks/prompt-templates/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
