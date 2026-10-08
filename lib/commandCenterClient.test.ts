// ---------------------------------------------------------------------------
// lib/commandCenterClient.test.ts
//
// Contract tests for the browser-side CCC fetch wrapper
// (lib/commandCenterClient.ts) with a stubbed globalThis.fetch.
// Run with `npm test`.
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import {
  apiGetTaskDetail,
  apiUpdateTask,
  apiDeleteTask,
  cccFetch,
} from "./commandCenterClient.ts";

type Call = { url: string; init: RequestInit | undefined };

function stubFetch(
  respond: (url: string, init: RequestInit | undefined) => Response
): { calls: Call[]; restore: () => void } {
  const calls: Call[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    calls.push({ url, init });
    return respond(url, init);
  }) as typeof fetch;
  return { calls, restore: () => { globalThis.fetch = original; } };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("cccFetch throws the route's { error } message on non-2xx", async () => {
  const stub = stubFetch(() => json(400, { error: "title is required" }));
  try {
    await assert.rejects(() => cccFetch("/api/tasks", { method: "POST", body: "{}" }), {
      message: "title is required",
    });
  } finally {
    stub.restore();
  }
});

test("cccFetch falls back to the HTTP status when the body is not JSON", async () => {
  const stub = stubFetch(() => new Response("<html>nope</html>", { status: 502 }));
  try {
    await assert.rejects(() => cccFetch("/api/tasks"), { message: "Request failed (502)" });
  } finally {
    stub.restore();
  }
});

test("cccFetch sets Content-Type: application/json and returns null on 204", async () => {
  const stub = stubFetch(() => new Response(null, { status: 204 }));
  try {
    const out = await cccFetch("/api/tasks/x", { method: "DELETE" });
    assert.equal(out, null);
    const headers = new Headers(stub.calls[0]?.init?.headers);
    assert.equal(headers.get("Content-Type"), "application/json");
  } finally {
    stub.restore();
  }
});

test("apiGetTaskDetail returns null on 404 and the detail on 200", async () => {
  const id = "00000000-0000-4000-8000-000000000000";
  const detail = { task: { id, title: "t" }, outputs: [], links: [] };
  const stub = stubFetch((url) =>
    url.endsWith(id) ? json(200, detail) : json(404, { error: "Task not found" })
  );
  try {
    assert.equal(await apiGetTaskDetail("missing"), null);
    const d = await apiGetTaskDetail(id);
    assert.deepEqual(d, detail);
    assert.equal(stub.calls[1]?.url, `/api/tasks/${id}`);
  } finally {
    stub.restore();
  }
});

test("apiUpdateTask PATCHes the JSON patch and unwraps { task }", async () => {
  const stub = stubFetch(() => json(200, { task: { id: "a", title: "new" } }));
  try {
    const t = await apiUpdateTask("a", { title: "new" });
    assert.equal(t.title, "new");
    assert.equal(stub.calls[0]?.init?.method, "PATCH");
    assert.equal(stub.calls[0]?.init?.body, JSON.stringify({ title: "new" }));
  } finally {
    stub.restore();
  }
});

test("apiDeleteTask resolves on 204 and rejects on 404", async () => {
  const stub = stubFetch((_url, init) =>
    init?.method === "DELETE" ? new Response(null, { status: 204 }) : json(500, {})
  );
  try {
    await apiDeleteTask("a");
  } finally {
    stub.restore();
  }
  const stub2 = stubFetch(() => json(404, { error: "Task not found" }));
  try {
    await assert.rejects(() => apiDeleteTask("a"), { message: "Task not found" });
  } finally {
    stub2.restore();
  }
});
