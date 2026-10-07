// ---------------------------------------------------------------------------
// lib/commandCenterValidation.test.ts
//
// Unit tests for the Command Center API body parsers
// (lib/commandCenterValidation.ts). Run with `npm test`.
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import {
  isUuid,
  parseTaskCreate,
  parseTaskPatch,
  parseTaskLinkCreate,
  parsePromptTemplateCreate,
  parsePromptTemplatePatch,
} from "./commandCenterValidation.ts";

const UUID = "00000000-0000-4000-8000-000000000000";

function expectError<T>(
  r: { ok: true; value: T } | { ok: false; error: string },
  contains: string
) {
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, new RegExp(contains));
}

test("isUuid accepts canonical uuids (any case) and rejects everything else", () => {
  assert.equal(isUuid(UUID), true);
  assert.equal(isUuid("A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D"), true);
  assert.equal(isUuid("prompt-templates"), false);
  assert.equal(isUuid("not-a-uuid"), false);
  assert.equal(isUuid(""), false);
  assert.equal(isUuid(undefined), false);
  assert.equal(isUuid(42), false);
  assert.equal(isUuid(UUID + "x"), false);
});

test("parseTaskPatch rejects unknown keys, incl. id / created_at / updated_at", () => {
  expectError(parseTaskPatch({ title: "x", bogus: 1 }), "Unknown field: bogus");
  expectError(parseTaskPatch({ id: UUID }), "Unknown field: id");
  expectError(parseTaskPatch({ created_at: "now" }), "Unknown field: created_at");
  expectError(parseTaskPatch({ updated_at: "now" }), "Unknown field: updated_at");
});

test("parseTaskPatch rejects an empty patch and non-objects", () => {
  expectError(parseTaskPatch({}), "at least one field");
  expectError(parseTaskPatch(null), "JSON object");
  expectError(parseTaskPatch([]), "JSON object");
  expectError(parseTaskPatch("title=x"), "JSON object");
});

test("parseTaskPatch enum-checks status and execution_status", () => {
  expectError(parseTaskPatch({ status: "shipped" }), "status must be one of");
  expectError(parseTaskPatch({ execution_status: "paused" }), "execution_status");
  const ok = parseTaskPatch({ status: "done", execution_status: null });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(ok.value, { status: "done", execution_status: null });
});

test("parseTaskPatch checks priority is an integer and title is non-empty", () => {
  expectError(parseTaskPatch({ priority: 2.5 }), "priority must be an integer");
  expectError(parseTaskPatch({ priority: "1" }), "priority must be an integer");
  expectError(parseTaskPatch({ title: "   " }), "title must be a non-empty string");
  const ok = parseTaskPatch({ priority: 1, title: "  Fix it  ", next_step: null });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(ok.value, { priority: 1, title: "Fix it", next_step: null });
});

test("parseTaskPatch: free-text columns accept string | null only", () => {
  expectError(parseTaskPatch({ assigned_to: 7 }), "assigned_to must be a string or null");
  const ok = parseTaskPatch({ task_type: "legacy-type", related_area: null });
  assert.equal(ok.ok, true);
});

test("parseTaskCreate requires title and applies defaults", () => {
  expectError(parseTaskCreate({}), "title is required");
  expectError(parseTaskCreate({ title: "" }), "title must be a non-empty string");
  expectError(parseTaskCreate({ title: "x", id: UUID }), "Unknown field: id");
  const r = parseTaskCreate({ title: " New task " });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.title, "New task");
    assert.equal(r.value.status, "backlog");
    assert.equal(r.value.priority, 3);
    assert.equal(r.value.description, null);
    assert.equal(r.value.execution_status, null);
    assert.equal(r.value.source, null);
    assert.equal(Object.keys(r.value).length, 19);
  }
});

test("parseTaskCreate honours explicit values and validates them", () => {
  const r = parseTaskCreate({ title: "t", status: "ready", priority: 1, source: "loop" });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.status, "ready");
    assert.equal(r.value.priority, 1);
    assert.equal(r.value.source, "loop");
  }
  expectError(parseTaskCreate({ title: "t", status: "nope" }), "status must be one of");
  expectError(parseTaskCreate({ title: "t", source: "cursor" }), "source must be null");
});

test("parseTaskLinkCreate", () => {
  const ok = parseTaskLinkCreate({ entity_type: "location", entity_id: UUID });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(ok.value, { entity_type: "location", entity_id: UUID });
  expectError(parseTaskLinkCreate({ entity_type: "person", entity_id: UUID }), "entity_type");
  expectError(parseTaskLinkCreate({ entity_type: "tour", entity_id: "" }), "entity_id");
  expectError(parseTaskLinkCreate(null), "JSON object");
});

test("parsePromptTemplateCreate", () => {
  const ok = parsePromptTemplateCreate({
    name: " Brief ",
    template: "Do {{x}}",
    target_agent: "claude",
  });
  assert.equal(ok.ok, true);
  if (ok.ok)
    assert.deepEqual(ok.value, {
      name: "Brief",
      template: "Do {{x}}",
      target_agent: "claude",
      description: null,
    });
  expectError(parsePromptTemplateCreate({ template: "x", target_agent: "claude" }), "name");
  expectError(parsePromptTemplateCreate({ name: "n", target_agent: "claude" }), "template");
  expectError(parsePromptTemplateCreate({ name: "n", template: "t" }), "target_agent");
  expectError(
    parsePromptTemplateCreate({ name: "n", template: "t", target_agent: "a", id: "x" }),
    "Unknown field: id"
  );
  expectError(
    parsePromptTemplateCreate({ name: "n", template: "t", target_agent: "a", description: 3 }),
    "description must be a string or null"
  );
});

test("parsePromptTemplatePatch", () => {
  const ok = parsePromptTemplatePatch({ description: null, name: "Renamed" });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(ok.value, { description: null, name: "Renamed" });
  expectError(parsePromptTemplatePatch({}), "at least one field");
  expectError(parsePromptTemplatePatch({ template: "" }), "template must be a non-empty string");
  expectError(parsePromptTemplatePatch({ updated_at: "x" }), "Unknown field: updated_at");
});
