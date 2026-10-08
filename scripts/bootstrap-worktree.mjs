#!/usr/bin/env node
// scripts/bootstrap-worktree.mjs
//
// Bootstraps a fresh git worktree of this repo so it can build and run:
//   - symlinks <main>/node_modules into the worktree (absolute target)
//   - copies <main>/.env.local into the worktree (COPYFILE_EXCL, mode 600)
//
// Serves the CLAUDE.md session-discipline rule: parallel Claude Code sessions
// run in their own worktree (default home: <repo>/.claude/worktrees/<name>).
// Worktrees share the .git database but not node_modules or the gitignored
// .env.local, so each new one needs this hand-typed ln -s / cp — now scripted.
//
// The main checkout is resolved via `git rev-parse --git-common-dir`, never
// via __dirname/.. — this script's own copy lives inside each nested worktree.
//
// Usage:
//   node scripts/bootstrap-worktree.mjs <worktree-path> [--dry-run]
//   npm run worktree:bootstrap -- <worktree-path> [--dry-run]
//
// Idempotent: re-running on a bootstrapped worktree reports skips, exit 0.
// Never overwrites: an existing node_modules (real dir) or .env.local is left
// alone; a node_modules symlink pointing elsewhere is a conflict (exit 4).
//
// Exit codes:
//   0  bootstrapped, or nothing to do
//   1  unexpected error
//   2  usage error
//   3  refused — path is not a linked worktree of this repo, is the main
//      checkout itself, or the main checkout has no node_modules
//   4  conflict — worktree node_modules is a symlink elsewhere (untouched)

import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  UsageError,
  apply,
  exitCodeFor,
  gatherFacts,
  parseArgs,
  plan,
} from "./bootstrap-worktree.lib.mjs";

const USAGE =
  "Usage: node scripts/bootstrap-worktree.mjs <worktree-path> [--dry-run]\n" +
  "       npm run worktree:bootstrap -- <worktree-path> [--dry-run]";

class RefusedError extends Error {}

/** `git -C <cwd> rev-parse <flag>` → absolute realpath, or null if git fails. */
function gitPath(cwd, flag) {
  let out;
  try {
    out = execFileSync("git", ["-C", cwd, "rev-parse", flag], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
  return realpathSync(path.resolve(cwd, out));
}

function resolveDirs(worktreeArg) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const mainCommon = gitPath(here, "--git-common-dir");
  if (!mainCommon) throw new Error("Cannot locate this repo's git common dir");
  const mainDir = path.dirname(mainCommon);

  let wt;
  try {
    wt = realpathSync(path.resolve(worktreeArg));
  } catch {
    throw new RefusedError(`${worktreeArg}: path does not exist`);
  }
  const wtCommon = gitPath(wt, "--git-common-dir");
  const wtGitDir = gitPath(wt, "--git-dir");
  if (!wtCommon || !wtGitDir || wtCommon !== mainCommon) {
    throw new RefusedError(`${wt}: not a worktree of this repo`);
  }
  if (wtGitDir === wtCommon || wt === mainDir) {
    throw new RefusedError(`${wt}: is the main checkout, not a linked worktree`);
  }
  return { mainDir, wt };
}

function describe(a) {
  switch (a.kind) {
    case "symlink":
      return `link   ${a.item} -> ${a.target}`;
    case "copy":
      return `copy   ${a.item}  (mode ${a.mode.toString(8)})`;
    default:
      return `${a.kind.padEnd(6)} ${a.item} — ${a.reason}`;
  }
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    if (err instanceof UsageError) {
      process.stderr.write(`${err.message}\n${USAGE}\n`);
      process.exitCode = 2;
      return;
    }
    throw err;
  }

  try {
    const { mainDir, wt } = resolveDirs(args.worktreePath);
    const facts = gatherFacts(mainDir, wt);
    const actions = plan(mainDir, wt, facts);
    const prefix = args.dryRun ? "[dry-run] " : "";
    for (const a of actions) process.stdout.write(`${prefix}${describe(a)}\n`);
    apply(actions, { dryRun: args.dryRun });
    const applied = actions.filter((a) => a.kind === "symlink" || a.kind === "copy").length;
    const skipped = actions.filter((a) => a.kind === "skip").length;
    process.stdout.write(
      `${prefix}${applied === 0 ? "Nothing to do." : `Done: ${applied} applied, ${skipped} skipped`}\n`,
    );
    process.exitCode = exitCodeFor(actions);
  } catch (err) {
    if (err instanceof RefusedError) {
      process.stderr.write(`Refused: ${err.message}\n`);
      process.exitCode = 3;
      return;
    }
    process.stderr.write(`Error: ${err && err.message ? err.message : String(err)}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
