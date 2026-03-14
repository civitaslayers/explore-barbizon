# Session Start

Use this file as the default low-token entrypoint for coding sessions.

## Purpose

Load only the minimum operational context needed to begin work.
Do not read broad strategy files unless the task clearly requires them.

---

## Read in this order

1. `brain/current-state.md`
2. `brain/task-queue.md`
3. `brain/decisions.md`

Read `docs/schema-reference.md` only if the task touches:
- Supabase
- SQL
- schema fields
- content models
- migrations

Read `MAIN_BRAIN.md` only if the task touches:
- product strategy
- design direction
- roadmap
- multi-town architecture
- dashboard philosophy
- major UX decisions

---

## After reading

Return exactly these four sections:

### Status
2 concise sentences on the current repo state.

### Next Tasks
List the top 3 unblocked tasks in priority order.

### Blockers
List any active blockers or required user actions.

### Recommended Next Step
Propose one concrete task to execute now.
Keep it small and scoped.

---

## Working rules

- Prefer the smallest safe change.
- Do not scan the whole repo unless explicitly asked.
- Do not load unnecessary files.
- Use `task-queue.md` as the source of execution priority.
- Use `current-state.md` as the source of current implementation state.
- Use `decisions.md` as the source of locked project decisions.
- If the task is schema-related, verify exact field names before proposing code.
- If a task requires user action, flag it clearly instead of pretending it can be completed in-code.

---

## Task routing guide

Use this quick routing logic:

- **Frontend/UI task**  
  Read only `current-state.md`, `task-queue.md`, `decisions.md`

- **Data wiring task**  
  Also read `docs/schema-reference.md`

- **SQL or migration task**  
  Also read `docs/schema-reference.md`

- **Strategy or architecture task**  
  Also read `MAIN_BRAIN.md`

- **Unclear request**  
  Start with the three brain files only, then pull more context only if needed

---

## Output style

Be concise.
Do not restate large amounts of project history.
Do not summarize files line by line.
Do not propose broad refactors unless explicitly requested.
