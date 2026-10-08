// ---------------------------------------------------------------------------
// lib/rlsBoundary.test.ts
//
// Boundary test for the RLS-blind family (tasks 0c6961fa / fe9f0e5d /
// b696ede8). The tables below are deny-all under RLS for the anon role, so
// any `.from("<table>")` outside the server-only modules is a silent blind
// read / no-op write. This test walks pages/, components/ and lib/ (skipping
// *.server.ts, pages/api/** and *.test.ts) and fails on the first match, and
// asserts lib/commandCenter.ts stays a types-only module.
// Run with `npm test`.
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SCAN_DIRS = ["pages", "components", "lib"];
const SOURCE_EXT = /\.(ts|tsx)$/;

const DENY_ALL_TABLES = [
  "tasks",
  "outputs",
  "task_links",
  "prompt_templates",
  "location_edits",
  "page_views",
  "decisions",
  "memory",
];
const DENY_ALL_FROM = new RegExp(
  `\\.from\\(\\s*["'](${DENY_ALL_TABLES.join("|")})["']`
);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (SOURCE_EXT.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function isExempt(file: string): boolean {
  const rel = relative(ROOT, file).split(sep).join("/");
  if (rel.startsWith("pages/api/")) return true;
  if (rel.endsWith(".server.ts")) return true;
  if (rel.endsWith(".test.ts")) return true;
  return false;
}

test("no non-server source touches a deny-all RLS table via .from()", () => {
  const files = SCAN_DIRS.flatMap((d) => walk(resolve(ROOT, d)));
  assert.ok(files.length > 0, "expected source files to scan");

  const offenders: string[] = [];
  for (const file of files) {
    if (isExempt(file)) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (DENY_ALL_FROM.test(line)) {
        offenders.push(`${relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
      }
    });
  }

  assert.deepEqual(
    offenders,
    [],
    `Deny-all RLS tables must only be accessed from *.server.ts or pages/api/**:\n${offenders.join("\n")}`
  );
});

test("lib/commandCenter.ts is types-only (no Supabase client, no queries)", () => {
  const src = readFileSync(resolve(ROOT, "lib/commandCenter.ts"), "utf8");
  assert.equal(src.includes("@/lib/supabase"), false, "must not import a Supabase client");
  assert.equal(src.includes(".from("), false, "must not run queries");
});

test("lib/commandCenterClient.ts never imports a Supabase client or the server module", () => {
  const src = readFileSync(resolve(ROOT, "lib/commandCenterClient.ts"), "utf8");
  const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  assert.ok(imports.length > 0, "expected at least one import");
  for (const spec of imports) {
    assert.doesNotMatch(spec, /supabase/i, `must not import ${spec}`);
    assert.doesNotMatch(spec, /commandCenter\.server/, `must not import ${spec}`);
  }
  assert.equal(src.includes(".from("), false, "must not run queries");
});
