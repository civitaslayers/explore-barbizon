# Claude Code — Civitas Layers / ExploreBarbizon

## Session start protocol

Read these files in order before doing anything:

1. `MAIN_BRAIN.md` — master project orientation, strategy, and product vision
2. `brain/current-state.md` — operational state: what is done, what is next, what is blocked
3. `brain/decisions.md` — architectural decision log
4. `docs/schema-reference.md` — live Supabase schema and proposed Civitas data model

After reading, output:
- **Status:** one sentence on where the project stands
- **Next action:** the single most important thing to do
- **Blockers:** anything that prevents progress

---

## Project

**Civitas Layers / ExploreBarbizon**
A civic geo-narrative platform for heritage towns. Barbizon is the flagship prototype.
ExploreBarbizon sits between cultural magazine, museum archive, and cartographic product.

---

## Stack (fixed — do not change)

- **Next.js** — Pages Router (do not convert to App Router)
- **Supabase** — single source of truth (`afqyrxtfbspghpfulvmy`, eu-west-2)
- **Mapbox** — spatial engine
- **Tailwind** — styling (custom values defined in `tailwind.config.js`)
- **Webflow** — editorial shell only, being phased out

---

## Working principles

- Prefer refinement over rewrites
- Preserve the editorial, visual-first, museum-cartography aesthetic
- Avoid generic SaaS or tourism-brochure design
- Keep diffs minimal and targeted
- Do not expose secrets in code or committed files

---

## After significant work

Always update:
1. `brain/current-state.md` — current state, completed items, next steps, blockers
2. `docs/execution-queue.md` — mark completed, surface what is next

Then commit and push.

---

## Agents

Two specialist agents are available:

- **civitas-architect** — architecture decisions, schema evolution, system design
- **civitas-implementer** — scoped feature implementation, minimal diffs, data wiring

---

## Field naming rules (enforced)

| Use | Not |
|---|---|
| `layer` | `map_layer` |
| `distance_meters` | `distance_km` |
| `stop_narrative` | `notes` |

---

## Deeper context

- `docs/design-direction.md` — visual principles, homepage direction, typography
- `docs/frontend-workflow.md` — Cursor workflow, local dev setup, Tailwind cautions
- `docs/execution-queue.md` — what is next and in what order
- `brain/architecture-summary.md` — stack details, product model, Supabase project info
- `brain/roadmap.md` — MVP checklist and long-term features
