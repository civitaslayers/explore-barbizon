---
description: Update brain/current-state.md and brain/task-queue.md to reflect work just completed.
---

Work just completed: $ARGUMENTS

Update the project brain files to reflect the current state of the repository.

Do the following in order:

1. **Update `brain/current-state.md`**:
   - Change the **Status** line to reflect what is now true
   - Move completed work into **Last Completed** (keep the list to the most recent 10–15 items)
   - Update **Blockers** — remove any that are resolved, add any new ones
   - Update **Next Tasks** — reorder based on what is now most important
   - Update **Next Session Starting Point** to reflect where a new session should begin

2. **Update `brain/task-queue.md`**:
   - Mark completed tasks as `[x]`
   - Move newly unblocked tasks from Blocked → Now or Next as appropriate
   - Add any new tasks discovered during implementation
   - Update the `Last updated` date

3. If an architectural or product decision was made during the work, add it to `brain/decisions.md` (newest at top) using the format:
   ```
   ## [date]
   **Decision:** [what]
   **Reason:** [why]
   **Consequence:** [what changes]
   ```

4. If `docs/execution-queue.md` has items that are now complete, mark them `[x]`.

5. Report a summary of all changes made to brain files.

Then commit all brain file updates with a message like:
`docs: update brain after [brief description of work]`
