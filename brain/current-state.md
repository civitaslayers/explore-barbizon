# Current State

Last updated: 2026-03-21

---

## Status

The core Barbizon app is live locally in Next.js with:
- Mapbox GL JS map page with clustering and per-category SVG icons
- Search and layer toggles
- Places index and place detail pages
- Related and nearby sections
- Mapbox Static thumbnails for place cards
- Per-place `<title>`, meta description, and Open Graph tags on place detail pages

The Command Center (CCC) is the active development surface — a complete internal AI operating system. The automation loop, knowledge base, and task intelligence layer are all live.

---

## Last completed (2026-03-21 session)

- **CCC knowledge base seeded:** Decisions (14), Memory (18 entries), Prompt Templates (6) — sourced from brain/ and docs/. Live in Supabase, visible in CCC Decisions/Memory/Prompts pages.
- **Task suggestions — pre-populated briefs:** Suggest prompt now returns `next_step` + `implementation_notes` per suggestion. Tasks created from suggestions have fully populated briefs on creation.
- **Done task collapsing:** Done tasks (status=done OR execution_status=done) hidden by default below a "▸ N done tasks" toggle. Marking queue=done now auto-syncs execution_status=done.
- **Review with Claude:** Oversight section replaced with a "Review with Claude" button. Calls `POST /api/tasks/[id]/review` → Claude evaluates latest output against requirements → verdict + issues + suggested changes + next step rendered inline. Falls back to outputs table if latest_output is empty.
- **Follow-up prompt button:** If review includes a recommended next step, a "Copy follow-up prompt" button appears — generates a full framed brief for the assigned agent ready to paste.
- **Task Master AI pilot documented:** Verdict in `docs/agent-tooling.md` — use only as one-shot PRD decomposition for >6 interdependent tasks, not ongoing task management.
- **Cursor protected files rule:** `_document.tsx`, `_app.tsx`, `lib/supabase.ts`, `tailwind.config.js`, `migrations/*` now listed as protected in the Cursor framing block, `.cursor/rules/working-style.mdc`, and the CCC Prompts template.
- **OG tags on place pages:** `og:type`, `og:url`, meta description added to `pages/places/[slug].tsx` by Cursor. Regression in `_document.tsx` (Head removed) caught and fixed.

---

## Pending SQL to run in Supabase

These migrations exist in the repo but have not yet been confirmed run:
- `migrations/seed-ccc-roadmap-tasks.sql` — 30+ structured roadmap tasks
- `migrations/seed-ccc-completed-tasks.sql` — records completed CCC work as done
- `migrations/seed-ccc-knowledge-base.sql` — Decisions, Memory, Prompt Templates (may already be seeded)
- `migrations/add-show-in-editorial-to-locations.sql` — show_in_editorial column + backfill

---

## Blockers

- Tavily MCP inactive until `TAVILY_API_KEY` is set in shell env (`~/.zshrc`)
- Hero video asset missing (`/public/videos/hero-barbizon.mp4`)

---

## Constraints

- Keep Pages Router
- Preserve current stack (Next.js, Supabase, Mapbox GL, Tailwind)
- Preserve museum-cartography direction on public site
- Keep diffs minimal
- Follow schema reference exactly
- `_document.tsx` and `_app.tsx` are global shells — never in scope for page-level tasks

---

## Recommended next step

Place page visual refinement and large-screen layout audit — both are Cursor tasks with pre-populated briefs. Use "Copy brief" from the CCC task list and paste into Cursor.

---

## Files likely in play next

- `pages/places/[slug].tsx` — place page refinement (cursor task)
- `pages/places/index.tsx` — place index refinement (cursor task)
- `pages/command-center/` — CCC iteration as needed
