# Claude Code — Civitas Layers / ExploreBarbizon

Last updated: 2026-03-28

This repository uses a structured AI-assisted development workflow.

Claude is the **primary thinking partner** — responsible for strategy, architecture, planning, schema design, review, and brain maintenance.

Routine coding is executed through **Cursor** using scoped implementation prompts.

GPT and Grok are available as supplementary reviewers and researchers.

---

# Session Start Protocol

At the beginning of each session, follow the session start hook.

Read in this order:

1. `brain/current-state.md`
2. `brain/task-queue.md`
3. `brain/decisions.md`

These files represent the **operational brain** of the project.

---

## Conditional Context

Only load additional documents if the task requires them.

Read `docs/schema-reference.md` if the task touches:

- Supabase
- SQL
- migrations
- schema fields
- content models

Read `MAIN_BRAIN.md` if the task touches:

- product strategy
- design philosophy
- roadmap
- dashboard architecture
- multi-town architecture

Read `docs/agent-tooling.md` if the task involves:

- writing code against Next.js, Supabase, or Mapbox APIs (use Context7)
- external research on history, libraries, or APIs (use Tavily)
- decomposing a large multi-step initiative (pilot Task Master)

Avoid loading unnecessary documents.

---

## Optional Tooling

External MCP tools are available but not mandatory. They support the brain — they do not replace it.

- **Context7** — version-accurate library docs. Invoke by appending `use context7` to any library-related prompt.
- **Tavily** — structured external research. Requires `TAVILY_API_KEY` in shell env.
- **Task Master** — task decomposition pilot. Use only for large, multi-step initiatives.

Full setup and usage guidance: `docs/agent-tooling.md`

---

# After Reading Startup Files

Return only:

**Status**
2 concise sentences describing the current project state.

**Top 3 Next Tasks**
Highest-priority unblocked tasks from task-queue.md.

**Blockers**
Anything preventing implementation.

**Recommended Next Step**
One small concrete action.

---

# Stack (fixed)

Do not change stack architecture without explicit instruction.

| Layer | Technology |
|---|---|
| Frontend | Next.js — Pages Router |
| Database | Supabase |
| Map | Mapbox GL JS |
| Styling | Tailwind CSS |
| Editorial layer | Next.js (Stories, About — all surfaces on Vercel) |

---

# Claude's Responsibilities

Claude handles:

- strategy and task ordering
- architecture decisions and schema planning
- smallest-safe-step implementation plans for Cursor
- post-implementation review
- SQL queries and migrations (run by Luigi in Supabase SQL editor)
- content narrative writing
- brain file updates at end of session

Claude may implement directly (without routing through Cursor) for:

- XS tasks (1–2 files, bug fixes, SQL, content)
- Tasks where the change is purely additive and low-risk
- Schema review and validation

Claude should hand off to Cursor for:

- multi-file UI work
- component iteration and visual refinement
- debugging local build or lint issues
- any task requiring file system access

---

# Implementation Principles

Prefer **refinement over rebuilds**.

Make the **smallest safe change**.

Limit file scope when implementing.

Avoid refactoring unrelated code.

Preserve the existing design direction and UI hierarchy.

Do not introduce new dependencies without clear justification.

---

# Schema Field Rules

These fields are locked conventions.

| Use | Not |
|---|---|
| `layer` | `map_layer` |
| `distance_meters` | `distance_km` |
| `stop_narrative` | `notes` |

Always verify field names before writing SQL or referencing schema fields in code.

---

# Brain Update Responsibility

Claude updates the brain files after every significant session.

After completing work:

1. Update `brain/current-state.md` — move completed items to Done, update blockers
2. Trigger brain sync via `/api/brain/sync-tasks` or update `brain/task-queue.md` directly
3. Commit brain updates with a clear message

Use the `ship-feature` command after a completed feature.  
Use the `update-brain` command after any significant state change.

---

# Hard Constraints

- Do not convert Pages Router to App Router
- Do not rename existing slugs or IDs without a migration plan
- Do not run `git push --force`
- Do not expose secrets in committed files — `.env.local` is gitignored
- Do not modify `MAIN_BRAIN.md` — it is the master reference document
- Supabase project ref: `afqyrxtfbspghpfulvmy`