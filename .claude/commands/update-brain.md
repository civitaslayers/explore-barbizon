---
description: Update brain/current-state.md and the tasks table (via CCC) to reflect work just completed.
---

Work just completed: $ARGUMENTS

Update the project brain to reflect the current state of the repository. The
`tasks` table (Supabase) is the sole work queue — CCC's tasks page is the
human-readable window onto it. "Update the queue" means editing tasks in CCC
(or directly in the `tasks` table), not regenerating a file.

Do the following in order:

1. **Update `brain/current-state.md`**:
   - Change the **Status** line to reflect what is now true
   - Move completed work into **Last Completed** (keep the list to the most recent 10–15 items)
   - Update **Blockers** — remove any that are resolved, add any new ones
   - Update **Next Tasks** — reorder based on what is now most important
   - Update **Next Session Starting Point** to reflect where a new session should begin

2. **Update the `tasks` table** (via CCC or Supabase MCP):
   - Mark completed tasks `done` (both `status` and `execution_status`)
   - Move newly unblocked tasks to `ready` as appropriate
   - Add any new tasks discovered during implementation

3. If an architectural or product decision was made during the work, add it to `brain/decisions.md` (newest at top) using the format:
   ```
   ## [date]
   **Decision:** [what]
   **Reason:** [why]
   **Consequence:** [what changes]
   ```

4. If `docs/execution-queue.md` has items that are now complete, mark them `[x]`.

5. Report a summary of all changes made to brain files and the tasks table.

Then commit all brain file updates with a message like:
`docs: update brain after [brief description of work]`
