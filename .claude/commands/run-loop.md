# Command: run-loop

Purpose:
Run one task through the full autonomous loop — plan, execute, review — and STOP
at the human gate. This supersedes the old "Cursor implements, stop after each
step" model for tasks routed to Claude Code.

Usage: `/run-loop [task description]`
If no task is given, select the highest-priority unblocked task (see /next-task logic).

---

## Step 1 — Orient (lead session)

Read `brain/current-state.md`, `brain/task-queue.md`, `brain/decisions.md`.
Confirm the task is unblocked and not a `user-action` item. Do not scan the whole repo.

## Step 2 — Plan (civitas-architect)

Delegate to `civitas-architect`. It returns a scoped plan: files/tables touched,
the change, migration risk, and which executor should run it. Do not let it execute.

## Step 3 — Execute (route by task type)

- **Code / UI / data-wiring →** `civitas-implementer` (code + git only, no DB).
- **SQL / seeding / schema / content →** `civitas-content-ops` (dev branch only, no merge, no publish).

The executor runs the scoped plan to completion. It commits code (the pre-commit
hook gates tsc + lint) or lands data as a draft on a dev branch.

## Step 4 — Review (civitas-release-checker)

Delegate to `civitas-release-checker` (read-only). It runs tsc / lint / build and
the consistency checks and returns SHIP or HOLD with file:line detail.
On HOLD, loop back to Step 3 with the findings — at most twice, then stop and report.

## Step 5 — STOP at the gate

Do not cross these lines autonomously. Present them for a human:
- merging a Supabase dev branch to production (`merge_branch`),
- publishing content (`is_published = true`),
- deploying to production.

Output a short summary: what changed, the review verdict, and the exact gated
action waiting for approval. Then stop.

## Step 6 — After approval (human-triggered)

Once the human approves, run the merge / publish / deploy, then update
`brain/current-state.md` and trigger CCC → brain sync. Brain maintenance is the
architect/lead's job — not the executor's.

---

## Notes
- Token cost: a full loop runs several subagents — expect multiples of a single-thread
  session. Use `/next-task` for routing a single step when a full loop is overkill.
- The gate is enforced structurally (agent tool allowlists + the prod-write guard hook),
  not by this prompt alone. This command describes the flow; the allowlists hold the line.
