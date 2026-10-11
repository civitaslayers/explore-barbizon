// ---------------------------------------------------------------------------
// lib/assignees.test.ts
//
// Asserts the exported CCC assignee preset values. Run with `npm test`.
// ---------------------------------------------------------------------------
import test from "node:test";
import assert from "node:assert/strict";
import {
  ASSIGNEE_PRESETS,
  ASSIGNEE_EDIT_PRESETS,
  RUN_HANDOFF_TARGET_PRESETS,
  OUTPUT_AGENT_PRESETS,
} from "./assignees.ts";

test("ASSIGNEE_PRESETS", () => {
  assert.deepEqual([...ASSIGNEE_PRESETS], ["human", "claude"]);
});

test("ASSIGNEE_EDIT_PRESETS", () => {
  assert.deepEqual([...ASSIGNEE_EDIT_PRESETS], ["human", "claude"]);
});

test("RUN_HANDOFF_TARGET_PRESETS", () => {
  assert.deepEqual([...RUN_HANDOFF_TARGET_PRESETS], ["human", "claude"]);
});

test("OUTPUT_AGENT_PRESETS", () => {
  assert.deepEqual([...OUTPUT_AGENT_PRESETS], ["claude", "manual"]);
});
