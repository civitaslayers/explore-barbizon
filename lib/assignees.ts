// ---------------------------------------------------------------------------
// lib/assignees.ts
//
// Operator preset lists for the Command Center tasks UI. Rows may hold
// machine-written values (civitas-* from /run-loop) or retired ones (cursor,
// chatgpt); the fields are free text + datalist so those still render.
// ---------------------------------------------------------------------------

/** Operator-settable task assignee presets (same set as lib/taskTemplates.ts). */
export const ASSIGNEE_PRESETS = ["human", "claude"] as const;

/** Assignee presets for the tasks list inline edit and filter. */
export const ASSIGNEE_EDIT_PRESETS = ["human", "claude"] as const;

/** Presets for recording where a brief was handed (datalist); free text allowed. */
export const RUN_HANDOFF_TARGET_PRESETS = ["human", "claude"] as const;

/** Quick-pick labels for `outputs.agent` (free-text in DB; presets only). */
export const OUTPUT_AGENT_PRESETS: readonly string[] = ["claude", "manual"];
