# Current State

Last updated: 2026-03-21

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

- CCC task model refinement: `assigned_agent` field retired, `assigned_to` convention locked
- CCC guidance surfaces refined: run-with buttons, copy/save decoupling, feedback polish, UI consistency pass
- Lightweight agent lane coordination added to CCC
- Tool-specific agent brief modes added to CCC
- MCP tooling layer planned and implemented: Context7, Tavily wired into Cursor and Claude Code CLI
- `docs/agent-tooling.md` created as canonical optional tooling reference

---

## Current focus

1. CCC surface polish
2. MCP tooling layer active (Context7 + Tavily) — verify connections after Cursor restart
3. Task Master pilot: evaluate on one multi-step initiative when ready

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

Restart Cursor, verify Context7 and Tavily appear in MCP panel, then resume place-page refinement (large-screen layout audit) and the `show_in_editorial` SQL migration.

---

## Files likely in play next

- `pages/command-center/` — CCC surface
- `lib/commandCenter.ts` — CCC data model
- `docs/agent-tooling.md` — approved MCP reference
- `pages/places/[slug].tsx` — place page refinement (after tooling verified)
- `pages/places/index.tsx` — place page refinement (after tooling verified)
