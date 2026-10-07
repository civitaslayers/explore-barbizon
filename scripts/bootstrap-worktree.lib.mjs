// scripts/bootstrap-worktree.lib.mjs
//
// Pure helpers behind scripts/bootstrap-worktree.mjs. No git, no process
// exit, no logging — everything here is unit-testable against a tmp fixture
// (see bootstrap-worktree.test.mjs). The CLI resolves the main checkout and
// worktree directories, then calls gatherFacts → plan → apply.
//
// Actions never carry file contents; `reason` strings are fixed literals.

import {
  chmodSync,
  constants,
  copyFileSync,
  lstatSync,
  readlinkSync,
  symlinkSync,
} from "node:fs";
import path from "node:path";

export class UsageError extends Error {}

const ENV_MODE = 0o600;

/** argv = process.argv.slice(2) → { worktreePath, dryRun } */
export function parseArgs(argv) {
  let worktreePath = null;
  let dryRun = false;
  for (const arg of argv) {
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg.startsWith("-")) {
      throw new UsageError(`Unknown flag: ${arg}`);
    } else if (worktreePath !== null) {
      throw new UsageError("Expected exactly one <worktree-path>");
    } else {
      worktreePath = arg;
    }
  }
  if (worktreePath === null) throw new UsageError("Missing <worktree-path>");
  return { worktreePath, dryRun };
}

function kindOf(p) {
  let st;
  try {
    st = lstatSync(p);
  } catch (err) {
    if (err && err.code === "ENOENT") return "missing";
    throw err;
  }
  if (st.isSymbolicLink()) return "symlink";
  if (st.isDirectory()) return "dir";
  if (st.isFile()) return "file";
  return "other";
}

/** lstat-based snapshot of both sides. Never reads file contents. */
export function gatherFacts(mainDir, worktreeDir) {
  const main = path.resolve(mainDir);
  const wt = path.resolve(worktreeDir);
  const mainNm = kindOf(path.join(main, "node_modules"));
  const mainEnv = kindOf(path.join(main, ".env.local"));
  const wtNmPath = path.join(wt, "node_modules");
  let wtNm = kindOf(wtNmPath);
  if (wtNm === "file") wtNm = "other";
  let wtNodeModulesTarget = null;
  if (wtNm === "symlink") {
    wtNodeModulesTarget = path.resolve(wt, readlinkSync(wtNmPath));
  }
  let wtEnv = kindOf(path.join(wt, ".env.local"));
  if (wtEnv === "dir") wtEnv = "other";
  return {
    mainNodeModules: mainNm === "dir" ? "dir" : "missing",
    mainEnvLocal: mainEnv === "file" ? "file" : "missing",
    wtNodeModules: wtNm,
    wtNodeModulesTarget,
    wtEnvLocal: wtEnv,
  };
}

/** PURE: facts → Action[]. Paths are resolved to absolute here. */
export function plan(mainDir, worktreeDir, facts) {
  const main = path.resolve(mainDir);
  const wt = path.resolve(worktreeDir);
  const target = path.join(main, "node_modules");
  const linkPath = path.join(wt, "node_modules");
  const actions = [];

  if (facts.mainNodeModules === "missing") {
    actions.push({
      kind: "refuse",
      item: "node_modules",
      reason: "main checkout has no node_modules — run npm install in the main checkout first",
    });
  } else if (facts.wtNodeModules === "missing") {
    actions.push({ kind: "symlink", item: "node_modules", target, path: linkPath });
  } else if (facts.wtNodeModules === "symlink") {
    if (facts.wtNodeModulesTarget === target) {
      actions.push({ kind: "skip", item: "node_modules", reason: "already linked" });
    } else {
      actions.push({
        kind: "conflict",
        item: "node_modules",
        reason: "symlink points elsewhere — left untouched",
      });
    }
  } else {
    actions.push({
      kind: "skip",
      item: "node_modules",
      reason: "real directory present — not touching it",
    });
  }

  if (facts.wtEnvLocal !== "missing") {
    actions.push({ kind: "skip", item: ".env.local", reason: "already present" });
  } else if (facts.mainEnvLocal === "missing") {
    actions.push({ kind: "skip", item: ".env.local", reason: "main checkout has no .env.local" });
  } else {
    actions.push({
      kind: "copy",
      item: ".env.local",
      from: path.join(main, ".env.local"),
      to: path.join(wt, ".env.local"),
      mode: ENV_MODE,
    });
  }
  return actions;
}

export function exitCodeFor(actions) {
  if (actions.some((a) => a.kind === "refuse")) return 3;
  if (actions.some((a) => a.kind === "conflict")) return 4;
  return 0;
}

/** Executes symlink/copy actions only. dryRun touches nothing. */
export function apply(actions, { dryRun }) {
  if (dryRun) return;
  for (const a of actions) {
    if (a.kind === "symlink") {
      symlinkSync(a.target, a.path);
    } else if (a.kind === "copy") {
      copyFileSync(a.from, a.to, constants.COPYFILE_EXCL);
      chmodSync(a.to, a.mode);
    }
  }
}
