# Current State

Last updated: 2026-03-22

---

## Status

The core Barbizon app is live locally in Next.js with:
- Mapbox GL JS map page with clustering and per-category SVG icons
- search and layer toggles
- places index and place detail pages
- related and nearby sections
- Mapbox Static thumbnails for place cards

The Command Center (CCC) is now the active development surface — an internal AI operating system built into the same Next.js codebase. The CCC now has a complete automated execution loop: tasks can be dispatched to Claude, executed, and their outputs captured back into Supabase without leaving the browser.

---

## Last completed

- **CCC automation loop (full):** Run button on list + detail page → `/api/tasks/[id]/run` → `claude --print` via stdin → output saved to Supabase → `execution_status = review`
- **CCC API foundations:** `POST /api/tasks/[id]/dispatch` (returns `brief_json` + `callback_url`) and `POST /api/tasks/[id]/outputs` (ingestion callback for any automation layer)
- **CLI script:** `scripts/run-task.js` + `npm run task <id>` — same loop via terminal
- **Task list UX:** inline agent assignment (select dropdown), quick brief copy (▶ on hover), Done button (on hover), always-visible Run chip for claude tasks
- **Brain ↔ CCC sync:** → brain button writes `brain/task-queue.md` from live Supabase state
- **Roadmap seeded:** 30+ structured tasks in Supabase covering all MVP phases
- **MCP tooling:** Context7 + Tavily wired into Cursor and Claude Code CLI
- `docs/agent-tooling.md` created as canonical optional tooling reference

---

## Current focus

1. Run seed SQL in Supabase (`migrations/seed-ccc-roadmap-tasks.sql`) if not already done
2. Run `migrations/seed-ccc-completed-tasks.sql` to record completed CCC work in task history
3. Resume public-site work: large-screen layout audit, place-page refinement, `show_in_editorial` SQL migration

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
- External tooling must not outrank `brain/` as source of truth

---

## Recommended next step

Run the two SQL migrations in Supabase, then use the CCC Run button on "Large-screen layout width refinement" or "Place page visual refinement" to test the full automated loop end-to-end.

---

## Files likely in play next

- `pages/places/[slug].tsx` — place page refinement (cursor task)
- `pages/places/index.tsx` — place index refinement (cursor task)
- `migrations/seed-ccc-completed-tasks.sql` — run in Supabase to record session work
- `migrations/seed-ccc-roadmap-tasks.sql` — run in Supabase if not already done
- `pages/api/tasks/[id]/run.ts` — automated execution route (test with Run button)
