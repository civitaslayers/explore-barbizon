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

The Command Center (CCC) is now the active development surface — an internal AI operating system built into the same Next.js codebase.

---

## Last completed

- CCC automation API foundations: `POST /api/tasks/[id]/dispatch` + `POST /api/tasks/[id]/outputs`
- `dispatch` endpoint returns `brief_json` (structured payload) + `callback_url` — key primitive for future agent SDK integration
- `outputs` endpoint is the callback target any automation layer can POST results to
- Done button added to task list row actions (quick close-out without navigating to detail page)
- Full roadmap seeded into CCC as structured tasks (30+ tasks across all phases)
- Inline agent assignment added to task list (editable select, was read-only badge)
- Quick brief copy added to task list (▶ button on row hover)
- Brain ↔ CCC drift fixed: → brain button generates task-queue.md from live Supabase state
- MCP tooling layer: Context7, Tavily wired into Cursor and Claude Code CLI
- `docs/agent-tooling.md` created as canonical optional tooling reference

---

## Current focus

1. CCC automation loop — API foundations are in place; next is a CLI script that calls /dispatch, runs an agent, and POSTs back to /outputs
2. Run seed SQL in Supabase (`migrations/seed-ccc-roadmap-tasks.sql`) to populate the 30 roadmap tasks
3. Resume public-site work: large-screen layout audit, place-page refinement, `show_in_editorial` SQL migration

---

## Blockers

- Tavily MCP inactive until user sets `TAVILY_API_KEY` in shell env

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

Run `migrations/seed-ccc-roadmap-tasks.sql` in Supabase SQL editor to populate all roadmap tasks, then either:
- Build the CLI automation script (calls /dispatch → runs Claude → POSTs to /outputs), or
- Resume public-site work (large-screen layout, place-page refinement, show_in_editorial migration)

---

## Files likely in play next

- `pages/api/tasks/[id]/dispatch.ts` — dispatch endpoint (foundation for automation)
- `pages/api/tasks/[id]/outputs.ts` — output ingestion endpoint
- `migrations/seed-ccc-roadmap-tasks.sql` — run this in Supabase
- `pages/places/[slug].tsx` — place page refinement
- `pages/places/index.tsx` — place page refinement
