// scripts/bootstrap-worktree.test.mjs
// node --test over scripts/bootstrap-worktree.lib.mjs ONLY — never imports the
// CLI, so no git runs. The fixture is a mkdtemp directory with a dummy
// main/.env.local ("FIXTURE=1"); the project's real .env.local is never
// referenced. The whole fixture is removed in after().

import { test, after } from "node:test";
import assert from "node:assert/strict";
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  UsageError,
  apply,
  exitCodeFor,
  gatherFacts,
  parseArgs,
  plan,
} from "./bootstrap-worktree.lib.mjs";

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const root = mkdtempSync(path.join(tmpdir(), "bootstrap-wt-"));
const main = path.join(root, "main");
mkdirSync(path.join(main, "node_modules"), { recursive: true });
writeFileSync(path.join(main, "node_modules", ".keep"), "");
writeFileSync(path.join(main, ".env.local"), "FIXTURE=1\n");

let wtCount = 0;
function freshWorktree() {
  const wt = path.join(root, `wt-${wtCount++}`);
  mkdirSync(wt);
  return wt;
}

after(() => rmSync(root, { recursive: true, force: true }));

const FRESH = {
  mainNodeModules: "dir",
  mainEnvLocal: "file",
  wtNodeModules: "missing",
  wtNodeModulesTarget: null,
  wtEnvLocal: "missing",
};

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

test("parseArgs: no args -> UsageError", () => {
  assert.throws(() => parseArgs([]), UsageError);
});

test("parseArgs: only --dry-run -> UsageError", () => {
  assert.throws(() => parseArgs(["--dry-run"]), UsageError);
});

test("parseArgs: path + --dry-run in either order", () => {
  assert.deepEqual(parseArgs(["/x", "--dry-run"]), { worktreePath: "/x", dryRun: true });
  assert.deepEqual(parseArgs(["--dry-run", "/x"]), { worktreePath: "/x", dryRun: true });
});

test("parseArgs: path alone -> dryRun false", () => {
  assert.deepEqual(parseArgs(["/x"]), { worktreePath: "/x", dryRun: false });
});

test("parseArgs: two paths -> UsageError", () => {
  assert.throws(() => parseArgs(["/x", "/y"]), UsageError);
});

test("parseArgs: unknown flag -> UsageError", () => {
  assert.throws(() => parseArgs(["/x", "--bogus"]), UsageError);
});

// ---------------------------------------------------------------------------
// plan (pure, synthetic facts)
// ---------------------------------------------------------------------------

test("plan: fresh wt + complete main -> [symlink, copy], absolute target, mode 600", () => {
  const actions = plan("/m", "/w", FRESH);
  assert.equal(actions.length, 2);
  assert.equal(actions[0].kind, "symlink");
  assert.equal(actions[0].item, "node_modules");
  assert.ok(path.isAbsolute(actions[0].target));
  assert.equal(actions[0].target, path.join("/m", "node_modules"));
  assert.equal(actions[0].path, path.join("/w", "node_modules"));
  assert.equal(actions[1].kind, "copy");
  assert.equal(actions[1].item, ".env.local");
  assert.equal(actions[1].from, path.join("/m", ".env.local"));
  assert.equal(actions[1].to, path.join("/w", ".env.local"));
  assert.equal(actions[1].mode, 0o600);
  assert.equal(exitCodeFor(actions), 0);
});

test("plan: everything present -> two skips, exit 0", () => {
  const actions = plan("/m", "/w", {
    ...FRESH,
    wtNodeModules: "symlink",
    wtNodeModulesTarget: path.join("/m", "node_modules"),
    wtEnvLocal: "file",
  });
  assert.deepEqual(
    actions.map((a) => a.kind),
    ["skip", "skip"],
  );
  assert.match(actions[0].reason, /already linked/);
  assert.match(actions[1].reason, /already present/);
  assert.equal(exitCodeFor(actions), 0);
});

test("plan: wt node_modules is a real dir -> skip, .env.local copy still planned", () => {
  const actions = plan("/m", "/w", { ...FRESH, wtNodeModules: "dir" });
  assert.equal(actions[0].kind, "skip");
  assert.match(actions[0].reason, /real directory/);
  assert.equal(actions[1].kind, "copy");
  assert.equal(exitCodeFor(actions), 0);
});

test("plan: wt node_modules symlink to another target -> conflict, exit 4", () => {
  const actions = plan("/m", "/w", {
    ...FRESH,
    wtNodeModules: "symlink",
    wtNodeModulesTarget: "/elsewhere/node_modules",
  });
  assert.equal(actions[0].kind, "conflict");
  assert.equal(exitCodeFor(actions), 4);
});

test("plan: main node_modules missing -> refuse, exit 3, env decision still emitted", () => {
  const actions = plan("/m", "/w", { ...FRESH, mainNodeModules: "missing" });
  assert.equal(actions[0].kind, "refuse");
  assert.match(actions[0].reason, /npm install/);
  assert.equal(actions[1].kind, "copy");
  assert.equal(exitCodeFor(actions), 3);
});

test("plan: main .env.local missing -> symlink + skip", () => {
  const actions = plan("/m", "/w", { ...FRESH, mainEnvLocal: "missing" });
  assert.equal(actions[0].kind, "symlink");
  assert.equal(actions[1].kind, "skip");
  assert.match(actions[1].reason, /no \.env\.local/);
  assert.equal(exitCodeFor(actions), 0);
});

test("plan: wt .env.local is a symlink -> skip, never copy", () => {
  const actions = plan("/m", "/w", { ...FRESH, wtEnvLocal: "symlink" });
  assert.equal(actions[1].kind, "skip");
  assert.ok(!actions.some((a) => a.kind === "copy"));
});

test("plan: relative mainDir still yields an absolute symlink target", () => {
  const actions = plan("rel/main", "rel/wt", FRESH);
  assert.ok(path.isAbsolute(actions[0].target));
  assert.equal(actions[0].target, path.resolve("rel/main", "node_modules"));
});

// ---------------------------------------------------------------------------
// gatherFacts + apply on the fixture
// ---------------------------------------------------------------------------

test("gatherFacts: fresh fixture snapshot", () => {
  const wt = freshWorktree();
  assert.deepEqual(gatherFacts(main, wt), FRESH);
});

test("apply: links node_modules (absolute) and copies .env.local with mode 600", () => {
  const wt = freshWorktree();
  const actions = plan(main, wt, gatherFacts(main, wt));
  apply(actions, { dryRun: false });

  const link = path.join(wt, "node_modules");
  assert.ok(lstatSync(link).isSymbolicLink());
  const target = readlinkSync(link);
  assert.ok(path.isAbsolute(target));
  assert.equal(realpathSync(link), realpathSync(path.join(main, "node_modules")));

  const env = path.join(wt, ".env.local");
  assert.equal(readFileSync(env, "utf8"), "FIXTURE=1\n");
  assert.equal(statSync(env).mode & 0o777, 0o600);

  // idempotence: second pass is all skips and apply does not throw
  const second = plan(main, wt, gatherFacts(main, wt));
  assert.deepEqual(
    second.map((a) => a.kind),
    ["skip", "skip"],
  );
  assert.equal(exitCodeFor(second), 0);
  assert.doesNotThrow(() => apply(second, { dryRun: false }));
  assert.equal(readFileSync(env, "utf8"), "FIXTURE=1\n");
});

test("apply: dryRun on a fresh wt creates nothing", () => {
  const wt = freshWorktree();
  const actions = plan(main, wt, gatherFacts(main, wt));
  assert.equal(actions.filter((a) => a.kind === "symlink" || a.kind === "copy").length, 2);
  apply(actions, { dryRun: true });
  assert.deepEqual(gatherFacts(main, wt), FRESH);
});

test("apply: pre-seeded wt/.env.local survives unchanged", () => {
  const wt = freshWorktree();
  writeFileSync(path.join(wt, ".env.local"), "KEEP=1\n");
  const facts = gatherFacts(main, wt);
  assert.equal(facts.wtEnvLocal, "file");
  const actions = plan(main, wt, facts);
  apply(actions, { dryRun: false });
  assert.equal(readFileSync(path.join(wt, ".env.local"), "utf8"), "KEEP=1\n");
  assert.ok(lstatSync(path.join(wt, "node_modules")).isSymbolicLink());
});

test("apply: pre-seeded real wt/node_modules survives unchanged", () => {
  const wt = freshWorktree();
  mkdirSync(path.join(wt, "node_modules"));
  writeFileSync(path.join(wt, "node_modules", "marker"), "mine\n");
  const facts = gatherFacts(main, wt);
  assert.equal(facts.wtNodeModules, "dir");
  const actions = plan(main, wt, facts);
  apply(actions, { dryRun: false });
  assert.ok(lstatSync(path.join(wt, "node_modules")).isDirectory());
  assert.equal(readFileSync(path.join(wt, "node_modules", "marker"), "utf8"), "mine\n");
  assert.equal(readFileSync(path.join(wt, ".env.local"), "utf8"), "FIXTURE=1\n");
});

test("gatherFacts: existing symlink reports its resolved absolute target", () => {
  const wt = freshWorktree();
  symlinkSync("../main/node_modules", path.join(wt, "node_modules"));
  const facts = gatherFacts(main, wt);
  assert.equal(facts.wtNodeModules, "symlink");
  assert.equal(facts.wtNodeModulesTarget, path.join(root, "main", "node_modules"));
  const actions = plan(main, wt, facts);
  assert.equal(actions[0].kind, "skip");
  assert.match(actions[0].reason, /already linked/);
});
