# Current State

Last updated: 2026-03-14

---

## Status

Per-category map icons fully implemented and live. 11 category-specific SVG icons replace the previous 4 group-level icons. Museum redesigned with wide classical proportions. Boulder v4 redesigned with all-convex silhouette (no ear-reading). Preview updated to v4. All committed and pushed.

---

## Last Completed

- `components/MapGL.tsx`: 11 per-category icons (museum, gallery, restaurant, café, hotel, tree, viewpoint, boulder, parking, info, bus) replacing 4 group-level icons. Category→icon mapping covers all known categories.
- `public/map-preview.html`: updated to v4 — museum widened (3:1 pediment, thick columns, plinth overhang), boulder all-convex v4, shadow system + sidebar badges updated
- Committed as `a126564`, pushed

---

## Blockers

| Blocker | Needed for |
|---|---|
| `/public/videos/hero-barbizon.mp4` | Hero video renders |
| Run SQL in Supabase: `alter table categories add column show_in_editorial boolean not null default true` + update utility rows | Editorial/utility split goes live |

---

## Next Tasks

See `brain/task-queue.md` for the full ordered queue. Top unblocked items:

1. Visual refinement: large-screen layout width audit
2. `show_in_editorial` SQL migration — needs user to run in Supabase
3. Wire `getEditorialLocations()` filter once migration is run
