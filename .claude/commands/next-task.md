---
description: Identify and begin the next unblocked task from the task queue.
---

Read `brain/task-queue.md` and `brain/current-state.md`.

Then do the following:

1. List all tasks currently in the **Now** section of `brain/task-queue.md`.
2. Cross-reference against the **Blocked** section — exclude any task whose blocker is unresolved.
3. Identify the single highest-priority unblocked task.
4. State clearly:
   - **Task:** what it is
   - **Why now:** why this is the right next step
   - **Files to touch:** which files will need to change
   - **Definition of done:** what "complete" looks like for this task
5. Ask for confirmation before starting, unless $ARGUMENTS contains "go" — in which case begin immediately.

If $ARGUMENTS names a specific task (e.g. "visual refinement" or "schema migration"), find that task in the queue and apply the same breakdown.

After completing the task:
- Run /update-brain to record what was done.
- Move the completed task from Now to a completed section or remove it.
