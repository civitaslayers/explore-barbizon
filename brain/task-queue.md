# Task Queue

Last updated: 2026-07-13

Tasks are ordered by priority within each section.
Move tasks between sections as status changes.
Update this file whenever work is completed or blockers are resolved.

Task tags:
- frontend
- schema
- data
- sql
- infra
- user-action

---

## Now
*Unblocked tasks that can be started immediately.*

- [x] [ccc-v3] Both human-gated migrations run + verified in production via Supabase MCP (2026-07-13): `location_edits` table; `opening_hours` key canonicalization (16 rows, 0 full-word remaining, non-day + object values preserved).
- [user-action] Luigi: production visual pass on the fiche (`/command-center/atlas/[id]`) + card quick-edit once the Phase 2/2.1 deploy is green.
- [x] [ccc-v3] Phase 1 — Atlas index (map + list, preview cards, completeness, filters) — shipped & deployed (commit 60f0612)
- [x] [ccc-v3] Phase 2 — la fiche + card quick-edit + hours editor + parent renderer + audit + publish block + pins retirement — SHIP (5c1fd45, 13d7cae, eb61ba7)
- [x] [ccc-v3] Phase 2.1 — AtlasMapView committed-but-diverged write handling — SHIP (3491d51)

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [content] Photo sprint batch 1 with hours/website/address collection — Atlas "sans photo/horaires/adresse" filters are the worklist; fiche + card are the tools.
- [content] ferme-du-couvent description pass (describes the plain, not the farm; verify "à l'ouest" against Tier-1 before publishing).
- [schema] Update docs/schema-reference.md from live introspection — confirmed stale (curation_order missing; place_id/place_functions still in generated types; internal_notes/allow_proximity_override/booking_url absent). Refresh from live DB.

---

## Later
*Valid work, not yet prioritised.*

- [ccc-v3] Phase 3 loop — read-only linked entities (location_functions, tour_stops) on the fiche + absorb-and-delete `/dashboard/locations*` (and legacy `/dashboard/places` + `/api/places/[id]` if dead) + near-dup detector, export, command palette polish.
- [ccc-v3] v3.1 — `location_functions` sub-editor (first editable-linked-entity follow-on).
- [chore] Prune Cursor routing from CLAUDE.md + stale `.cursor/rules` (per 2026-07-13 Cursor-retired decision).
- [frontend] Tighten getStaticProps select on /places and /plan-your-visit — 136 kB page data warning
- [infra] Update middleware → proxy convention ahead of Next.js major upgrade

---

## Blocked
*Cannot proceed until the blocker is resolved.*

*(no tasks)*
