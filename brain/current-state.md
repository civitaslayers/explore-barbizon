# Current State

Last updated: 2026-03-14

---

## Status

Map page fully live with Mapbox GL JS, clustering, per-category SVG icons, search, and layer toggles — all committed. Places index and place detail pages are built with Mapbox Static thumbnails, category filters, related/nearby sections. Next work: place page refinement (geographic nearbyPlaces) and large-screen layout audit.

---

## Last Completed

- `lib/mapbox.ts`: `staticMapUrl()` + `hasMapbox` flag
- `lib/supabase.ts`: `getEditorialLocations()` (filters `show_in_editorial`), `getPublishedLocations()` for map
- `pages/places/index.tsx`: Mapbox Static thumbnails, category filter pills, card grid
- `pages/places/[slug].tsx`: hero, about, map preview, related + nearby sections
- `components/MapGL.tsx`: Mapbox GL JS, GeoJSON source, clustering, per-group SVG icons, popups, layer/search controls
- `pages/map.tsx`: left panel with search + layer toggles wired to MapGL
- All committed through `a2dfe65`

---

## Blockers

| Blocker | Needed for |
|---|---|
| `/public/videos/hero-barbizon.mp4` | Hero video renders |
| Run SQL in Supabase: `alter table categories add column show_in_editorial boolean not null default true` + update utility rows | Editorial/utility split goes live |

---

## Next Tasks

See `brain/task-queue.md` for the full ordered queue. Top unblocked items:

1. Place page refinement — geographic `nearbyPlaces` (haversine distance sort)
2. Visual refinement: large-screen layout width audit
3. Wire `show_in_editorial` once SQL migration is run
