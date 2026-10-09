// ---------------------------------------------------------------------------
// lib/jsonLd.test.ts
//
// Unit tests for serializeJsonLd (lib/jsonLd.ts): the output must never
// contain a raw < > or & (so "</script>" can never close the JSON-LD element)
// and must JSON.parse back to the same value on every case.
// Run with `npm test` (`node --test lib/jsonLd.test.ts`).
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import { serializeJsonLd } from "./jsonLd.ts";

function roundTrip(v: unknown): string {
  const out = serializeJsonLd(v);
  assert.deepEqual(JSON.parse(out), v);
  assert.ok(!/[<>&]/.test(out), `raw < > or & found in: ${out}`);
  return out;
}

test("J1: </script> in a value cannot close the script element", () => {
  const out = roundTrip({ name: "x</script><script>alert(1)</script>" });
  assert.ok(!/<\/script/i.test(out));
  assert.ok(out.includes("\\u003c/script\\u003e"));
});

test("J2: hostile keys are escaped too", () => {
  roundTrip({ "</script>": 1, "a&b": "<" });
});

test("J3: array root with nested objects", () => {
  const out = roundTrip([
    { "@type": "A", list: ["<", { deep: ">" }] },
    { "@type": "B", c: "&" },
  ]);
  assert.ok(out.startsWith("["));
});

test("J4: HTML comment openers/closers never appear raw", () => {
  const out = roundTrip({ d: "<!--", e: "-->", f: "<!--<script>" });
  assert.ok(!out.includes("<!--"));
  assert.ok(!out.includes("-->"));
});

test("J5: U+2028 / U+2029 are escaped", () => {
  const out = roundTrip({ s: "a\u2028b\u2029c" });
  assert.ok(!out.includes("\u2028"));
  assert.ok(!out.includes("\u2029"));
  assert.ok(out.includes("\\u2028"));
});

test("J6: undefined values are still dropped", () => {
  const out = serializeJsonLd({ a: undefined, b: "x" });
  assert.deepEqual(JSON.parse(out), { b: "x" });
  assert.ok(!out.includes('"a"'));
  assert.ok(!/[<>&]/.test(out));
});

test("J7: non-ASCII, NBSP, numbers, booleans and null untouched", () => {
  const out = roundTrip({ t: "« Café — été »\u00a0!", n: 48.4, b: true, z: null });
  assert.ok(out.includes("« Café — été »\u00a0!"));
});

test("J8: existing JSON escapes survive the replaces", () => {
  roundTrip({ q: 'back\\slash "quoted"' });
});

test("J9: case variants and pre-escaped slashes", () => {
  roundTrip({ s: "</SCRIPT >", u: "<\\/script>" });
});

test("J10: undefined root serialises to the empty string", () => {
  assert.equal(serializeJsonLd(undefined), "");
});

test("J11: Article-shaped literal with hostile strings in every slot", () => {
  const HOSTILE = '</script><img src=x onerror="alert(1)"> & "q"';
  const out = roundTrip({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: HOSTILE,
    description: HOSTILE,
    author: { "@type": "Person", name: HOSTILE },
    url: "https://explorebarbizon.com/stories/x?a=1&b=2",
  });
  assert.ok(out.startsWith("{"));
});

test("J12: benign data is byte-identical to JSON.stringify", () => {
  const input = { "@type": "Place", name: "Auberge Ganne" };
  const out = roundTrip(input);
  assert.equal(out, JSON.stringify(input));
});
