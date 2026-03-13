# Claude Code — Civitas Layers / ExploreBarbizon

## Session start protocol

Read these files in order before doing anything else:

1. `MAIN_BRAIN.md` — master project orientation, strategy, and product vision
2. `brain/current-state.md` — operational state: status, last completed, blockers
3. `brain/decisions.md` — architectural decision log
4. `brain/task-queue.md` — Now / Next / Later / Blocked
5. `docs/schema-reference.md` — live Supabase schema and proposed Civitas data model

After reading, output:
- **Status:** 2–3 sentences on where the project stands
- **Top 3 next tasks:** the highest-priority unblocked work
- **Blockers:** anything preventing progress
- **Recommended next step:** one concrete action to take now

---

## Project

**Civitas Layers / ExploreBarbizon**
A civic geo-narrative platform for heritage towns. Barbizon is the flagship prototype.
ExploreBarbizon sits between cultural magazine, museum archive, and cartographic product.

---

## Stack (fixed — do not change)

- **Next.js** — Pages Router (do not convert to App Router)
- **Supabase** — single source of truth (`afqyrxtfbspghpfulvmy`, eu-west-2, Postgres 17)
- **Mapbox** — spatial engine
- **Tailwind** — styling (all custom values defined in `tailwind.config.js` — do not invent new ones)
- **Webflow** — editorial shell only, being phased out

---

## Working principles

- Prefer refinement over rewrites — do not rebuild working code
- Preserve the editorial, visual-first, museum-cartography aesthetic
- Avoid generic SaaS or tourism-brochure design
- Keep diffs minimal and targeted
- Do not expose secrets in code or committed files
- Validate (tsc + lint) before every commit — use `/ship-feature`

---

## Slash commands

| Command | Purpose |
|---|---|
| `/next-task` | Identify and begin the next unblocked task |
| `/update-brain` | Update brain files after completing work |
| `/schema-check` | Audit schema state and propose next migration |
| `/ship-feature` | Validate, commit, push, and update brain |

---

## Agents

| Agent | Purpose |
|---|---|
| `civitas-architect` | Architecture decisions, schema evolution, system design |
| `civitas-implementer` | Scoped feature implementation, minimal diffs, data wiring |
| `civitas-content-ops` | Content seeding, SQL inserts, copy, visual_works entries |
| `civitas-release-checker` | Pre-deploy validation: tsc, lint, build, brain freshness, design checks |

---

## After significant work

Always:
1. Run `/ship-feature [description]` — validates, commits, pushes
2. This will call `/update-brain` — updates `brain/current-state.md` and `brain/task-queue.md`

---

## Field naming rules (enforced)

| Use | Not |
|---|---|
| `layer` | `map_layer` |
| `distance_meters` | `distance_km` |
| `stop_narrative` | `notes` |

---

## Deeper context

- `docs/design-direction.md` — visual principles, homepage direction, typography, palette
- `docs/frontend-workflow.md` — Cursor workflow, local dev setup, Tailwind cautions
- `docs/execution-queue.md` — historical task log
- `brain/architecture-summary.md` — stack details, product model, Supabase project info
- `brain/roadmap.md` — MVP checklist and long-term features
