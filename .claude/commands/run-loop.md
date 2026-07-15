# Command: run-loop

Purpose:
Run one task through the full autonomous loop — plan, execute, review — and STOP
at the human gate. This supersedes the old "Cursor implements, stop after each
step" model for tasks routed to Claude Code.

Usage: `/run-loop [task description]`
If no task is given, the queue dispatches one for you — see Step 1.

---

## Step 1 — Orient (lead session)

Read `brain/current-state.md`, `brain/task-queue.md`, `brain/decisions.md`.
Confirm the task is unblocked and not a `user-action` item. Do not scan the whole repo.

**No task argument → dispatch from the queue.** The `tasks` table is the canonical
work queue (`brain/task-queue.md` is a generated display-only mirror). Via the
Supabase MCP, claim the highest-priority queued task:

```sql
select id, title, source_prompt, priority, assigned_to, task_type
from tasks
where execution_status = 'queued'
order by priority asc, created_at desc
limit 1;
```

Read its `source_prompt` as the full task specification, then mark it claimed:

```sql
update tasks set execution_status = 'in_progress', updated_at = now()
where id = '<task-id>';
```

If nothing is queued, say so and stop — do not invent work. These status writes
are operational metadata: they pass `prod-write-guard.sh` untouched (it blocks
only `merge_branch`, `is_published = true`, and destructive SQL), so no guard
change is needed. The loop never writes task *content* this way.

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

For a queue-dispatched task, record the gate as metadata before stopping — set
the status and write a one-line gate summary to the `outputs` table:

```sql
update tasks set execution_status = 'at_gate', updated_at = now()
where id = '<task-id>';

insert into outputs (task_id, agent, response, commit_hash)
values ('<task-id>', 'loop', '<one-line gate summary>', '<commit-hash>');
```

## Step 6 — After approval (human-triggered)

Once the human approves, run the merge / publish / deploy, then update
`brain/current-state.md` and trigger CCC → brain sync. Brain maintenance is the
architect/lead's job — not the executor's.

For a queue-dispatched task, close it out on the queue:

```sql
-- completed:
update tasks set execution_status = 'done', updated_at = now()
where id = '<task-id>';

-- unresolvable HOLD (release-checker HOLD twice, or a blocker only a human clears):
update tasks set execution_status = 'blocked', last_action_note = '<reason>', updated_at = now()
where id = '<task-id>';
```

## Step 7 — Retrospective (after the gate, before closing)

Ask exactly one question: **did anything in *this* run fight the process?** — a
rule that didn't fit reality, a permission prompt that shouldn't exist, a missing
check, an instruction the agents worked around.

- Most runs: the answer is **"nothing to improve."** That is the expected answer
  and a complete one. Speculative or generic improvements are **not** proposals.
- Only if a *specific friction from this run* is worth fixing, file **at most one**
  improvement proposal as a queued task, citing that friction as evidence:

```sql
insert into tasks (title, source_prompt, source, execution_status, priority, task_type)
values ('<proposal title>', '<full markdown spec + the friction it cites>',
        'loop', 'queued', 8, 'ops');
```

Proposals execute later through the normal gated loop like any other task — never
in the run that filed them.

**HARD RULE (structural, non-negotiable):**
- No agent ever applies changes to `.claude/**` in the same run that proposed them.
- Any task that touches `.claude/**` is **always human-gated**. The system may
  *propose* amendments to its own guardrails; it may never *enact* them.

---

## Notes
- Token cost: a full loop runs several subagents — expect multiples of a single-thread
  session. Use `/next-task` for routing a single step when a full loop is overkill.
- The gate is enforced structurally (agent tool allowlists + the prod-write guard hook),
  not by this prompt alone. This command describes the flow; the allowlists hold the line.
- The `tasks` table is the canonical work queue; `brain/task-queue.md` is a generated
  display-only mirror (`pages/api/brain/sync-tasks.ts`). Dispatch, status, and the gate
  summary live in `tasks` / `outputs`, never in the mirror.
