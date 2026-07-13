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

- [user-action] Luigi: production smoke-test of `/command-center/atlas` (map + list views, preview cards, completeness filters/sort, map↔list linking). Gates the Phase 2 loop.
- [x] [ccc-v3] Phase 1 — Atlas index (map + list, preview cards, completeness, filters) — shipped & deployed (commit 60f0612)

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [ccc-v3] Phase 2 loop — la fiche editor (`/atlas/[id]`) + card quick-edit + `OpeningHoursEditor` (canonical keys) + parent-field public renderer + `location_edits` audit table + distinct publish block + pins retirement. HELD until Luigi's Atlas smoke-test. Contains human gates: the 16-row hours normalization migration and any `is_published` change stop for approval.
- [schema] Update docs/schema-reference.md from live introspection — confirmed stale (curation_order missing from Part 1; place_id/place_functions still in generated types; internal_notes/allow_proximity_override/booking_url absent). Refresh from live DB.

---

## Later
*Valid work, not yet prioritised.*

- [ccc-v3] Phase 3 loop — read-only linked entities (location_functions, tour_stops) on the fiche + absorb-and-delete `/dashboard/locations*` (and legacy `/dashboard/places` + `/api/places/[id]` if dead) + near-dup detector, export, command palette polish.
- [ccc-v3] v3.1 — `location_functions` sub-editor (first editable-linked-entity follow-on).
- [content] ferme-du-couvent description pass (describes the plain, not the farm; verify "à l'ouest" against Tier-1 before publishing).
- [content] Photo sprint batch 1 with hours/website/address collection — driven by the Atlas completeness worklist.
- [frontend] Tighten getStaticProps select on /places and /plan-your-visit — 136 kB page data warning
- [infra] Update middleware → proxy convention ahead of Next.js major upgrade

---

## Blocked
*Cannot proceed until the blocker is resolved.*

*(no tasks)*
