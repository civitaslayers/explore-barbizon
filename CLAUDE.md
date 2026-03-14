# Claude Code — Civitas Layers / ExploreBarbizon

## Session start protocol

Read these files in order before doing anything else:

1. `brain/current-state.md`
2. `brain/task-queue.md`
3. `brain/decisions.md`
4. `docs/schema-reference.md`

Read `MAIN_BRAIN.md` only if the task requires product strategy, design rationale, or long-range planning.

After reading, output:

- **Status:** 2 sentences on where the project stands
- **Top 3 next tasks:** highest-priority unblocked work
- **Blockers:** anything preventing progress
- **Recommended next step:** one concrete action to take now

---

## Project

**Civitas Layers / ExploreBarbizon**

A civic geo-narrative platform for heritage towns.  
Barbizon is the flagship prototype.

ExploreBarbizon should feel like a calm, visual, map-first cultural atlas.  
Avoid generic tourism, directory, or SaaS patterns.

---

## Stack (fixed — do not change)

- **Next.js** — Pages Router
- **Supabase** — single source of truth
- **Mapbox** — spatial engine
- **Tailwind** — use existing tokens and config only
- **Webflow** — editorial shell only, being phased out

---

## Working principles

- Prefer refinement over rewrites
- Keep diffs minimal and targeted
- Do not rebuild working code without clear reason
- Preserve the editorial, visual-first, museum-cartography aesthetic
- Do not expose secrets in code or committed files
- Validate with `tsc` and `lint` before shipping

---

## Execution rules

For any task:

1. Restate the task briefly
2. Identify only the files needed
3. Propose the smallest safe plan
4. Implement only that scope
5. Return:
   - files changed
   - what changed
   - risks or follow-ups

Do not:

- scan or refactor unrelated parts of the repo
- convert Pages Router to App Router
- invent schema fields
- invent Tailwind utilities
- change visual direction unless asked

---

## Field naming rules (enforced)

| Use | Not |
|---|---|
| `layer` | `map_layer` |
| `distance_meters` | `distance_km` |
| `stop_narrative` | `notes` |

---

## Commands

| Command | Purpose |
|---|---|
| `/next-task` | identify and begin the next unblocked task |
| `/update-brain` | update `current-state.md` and `task-queue.md` after work |
| `/schema-check` | audit schema state and propose next migration |
| `/ship-feature` | validate, commit, push, and update brain |

---

## Agents

| Agent | Purpose |
|---|---|
| `civitas-architect` | architecture, schema evolution, system design |
| `civitas-implementer` | scoped feature work, minimal diffs, data wiring |
| `civitas-content-ops` | SQL inserts, content seeding, copy, media records |
| `civitas-release-checker` | validation, build checks, design and brain freshness |

---

## Deeper context (read only when relevant)

- `MAIN_BRAIN.md`
- `docs/design-direction.md`
- `docs/frontend-workflow.md`
- `docs/execution-queue.md`
- `brain/architecture-summary.md`
- `brain/roadmap.md`
