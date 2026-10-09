// ---------------------------------------------------------------------------
// lib/fetchPolicy.test.ts
//
// Unit tests for the page-data failure policy (lib/fetchPolicy.ts).
// Run with `npm test` (`node --test lib/fetchPolicy.test.ts`).
// Sleep and logger are injected so every case is silent and instant;
// `backoffMs: 7` proves the injected sleep receives the configured value.
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_BACKOFF_MS,
  degrade,
  errorMessage,
  isRetryable,
  withRetry,
  type FetchPolicyOptions,
} from "./fetchPolicy.ts";

type Harness = {
  logs: string[];
  sleeps: number[];
  opts: FetchPolicyOptions;
};

function harness(): Harness {
  const logs: string[] = [];
  const sleeps: number[] = [];
  const opts: FetchPolicyOptions = {
    logger: { error: (m: string) => logs.push(m) },
    sleep: async (ms: number) => {
      sleeps.push(ms);
    },
    backoffMs: 7,
  };
  return { logs, sleeps, opts };
}

/** Throws `boom <n>` for the first `failures` calls, then resolves `value`. */
function flaky<T>(failures: number, value: T): { fn: () => Promise<T>; calls: () => number } {
  let n = 0;
  return {
    fn: async () => {
      n += 1;
      if (n <= failures) throw new Error(`boom ${n}`);
      return value;
    },
    calls: () => n,
  };
}

test("1. withRetry: success on the first try — no sleep, no log", async () => {
  const h = harness();
  const f = flaky(0, "ok");
  const result = await withRetry("t1 label", f.fn, h.opts);
  assert.equal(result, "ok");
  assert.equal(f.calls(), 1);
  assert.deepEqual(h.sleeps, []);
  assert.deepEqual(h.logs, []);
});

test("2. withRetry: fail then succeed — one backoff, one retrying line", async () => {
  const h = harness();
  const f = flaky(1, "recovered");
  const result = await withRetry("t2 label", f.fn, h.opts);
  assert.equal(result, "recovered");
  assert.equal(f.calls(), 2);
  assert.deepEqual(h.sleeps, [7]);
  assert.equal(h.logs.length, 1);
  assert.ok(h.logs[0].includes("t2 label"));
  assert.ok(h.logs[0].includes("retrying"));
  assert.ok(h.logs[0].includes("boom 1"));
});

test("3. withRetry: fail twice — rejects with the SECOND error, two log lines", async () => {
  const h = harness();
  const f = flaky(2, "never");
  await assert.rejects(
    () => withRetry("t3 label", f.fn, h.opts),
    (err: unknown) => err instanceof Error && err.message === "boom 2"
  );
  assert.equal(f.calls(), 2);
  assert.deepEqual(h.sleeps, [7]);
  assert.equal(h.logs.length, 2);
  assert.ok(h.logs[1].includes("t3 label"));
  assert.ok(h.logs[1].includes("failed after retry"));
});

test("4. withRetry: non-retryable error — rejects with the same object, no sleep", async () => {
  const h = harness();
  const boom = new Error("No published locations");
  let calls = 0;
  const fn = async (): Promise<never> => {
    calls += 1;
    throw boom;
  };
  await assert.rejects(
    () => withRetry("t4 label", fn, h.opts),
    (err: unknown) => err === boom
  );
  assert.equal(calls, 1);
  assert.deepEqual(h.sleeps, []);
  assert.equal(h.logs.length, 1);
  assert.ok(h.logs[0].includes("not retryable"));
  assert.ok(h.logs[0].includes("t4 label"));
});

test("5. isRetryable: everything except the explicit non-retryable set", () => {
  assert.equal(isRetryable(new Error("TypeError: fetch failed")), true);
  assert.equal(isRetryable(new Error("AbortError: This operation was aborted")), true);
  // Documented: may mask a transport error on the towns query, so it is retried.
  assert.equal(isRetryable(new Error("Barbizon town not found")), true);
  assert.equal(isRetryable("string error"), true);

  assert.equal(isRetryable(new Error("Supabase not configured")), false);
  assert.equal(isRetryable(new Error("No published locations")), false);
  assert.equal(isRetryable(new Error("No published stories")), false);
  assert.equal(isRetryable(new Error("No tours found")), false);
});

test("6. errorMessage: Error → message; non-Error → String(err)", () => {
  assert.equal(errorMessage(new Error("plain")), "plain");
  assert.equal(errorMessage(42), "42");
  assert.equal(errorMessage(undefined), "undefined");
});

test("7. degrade: success — value returned, nothing logged or slept", async () => {
  const h = harness();
  const f = flaky(0, { rows: 3 });
  const result = await degrade("t7 label", f.fn, { rows: 0 }, h.opts);
  assert.deepEqual(result, { rows: 3 });
  assert.deepEqual(h.logs, []);
  assert.deepEqual(h.sleeps, []);
});

test("8. degrade: fail twice — resolves the fallback sentinel, never rejects", async () => {
  const h = harness();
  const fallback = { sentinel: true };
  const f = flaky(2, { sentinel: false });
  const result = await degrade("t8 label", f.fn, fallback, h.opts);
  assert.equal(result, fallback);
  assert.equal(f.calls(), 2);
  assert.deepEqual(h.sleeps, [7]);
  assert.equal(h.logs.length, 2);
  assert.ok(h.logs[1].includes("degraded to fallback after retry"));
  assert.ok(h.logs[1].includes("t8 label"));
});

test("9. degrade: non-retryable — resolves the fallback after a single call", async () => {
  const h = harness();
  let calls = 0;
  const fn = async (): Promise<string[]> => {
    calls += 1;
    throw new Error("No tours found");
  };
  const result = await degrade("t9 label", fn, [], h.opts);
  assert.deepEqual(result, []);
  assert.equal(calls, 1);
  assert.deepEqual(h.sleeps, []);
  assert.equal(h.logs.length, 1);
  assert.ok(h.logs[0].includes("not retryable"));
});

test("10. defaults: DEFAULT_BACKOFF_MS is 1500 and withRetry works with no opts", async () => {
  assert.equal(DEFAULT_BACKOFF_MS, 1500);
  // Success never sleeps, so the default logger/sleep paths are reachable
  // without actually waiting.
  const result = await withRetry("x", async () => 1);
  assert.equal(result, 1);
});
