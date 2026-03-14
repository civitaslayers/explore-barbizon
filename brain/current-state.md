# Current State

Last updated: 2026-03-14

---

## Status

Live Supabase connection confirmed (65+ locations loading). Places listing redesigned with Mapbox Static map thumbnails, category filter pills, and `.card .card-hover` treatment. Editorial/utility category split implemented in code — pending one SQL migration to activate. Uncommitted work from last session needs committing.

---

## Last Completed

- Supabase anon key + Mapbox token added to `.env.local`
- `lib/mapbox.ts`: `staticMapUrl()` helper + `hasMapbox` flag
- `pages/places/index.tsx`: full redesign — Mapbox Static thumbnails on cards, category filter pills (client-side), `.card .card-hover` treatment, conditional short description
- `pages/places/[slug].tsx`: map preview section replaced with real Mapbox Static image (zoom 15)
- `lib/supabase.ts`: `getEditorialLocations()` added — filters `categories.show_in_editorial = true`; `getPublishedLocations()` kept for the map (all categories)
- `pages/places/index.tsx`: switched to `getEditorialLocations()`
- Serialization fix: `Place.history` and `Place.heroImage` changed from `?: string` to `string | null`
- Brain sync + committed as `940e920`, pushed

---

## Blockers

| Blocker | Needed for |
|---|---|
| `/public/videos/hero-barbizon.mp4` | Hero video renders |
| Run SQL in Supabase: `alter table categories add column show_in_editorial boolean not null default true` + update utility rows | Editorial/utility split goes live |

---

## Pending (uncommitted)

- `lib/mapbox.ts` (new)
- `lib/supabase.ts` (getEditorialLocations added)
- `pages/places/index.tsx` (redesigned)
- `pages/places/[slug].tsx` (map preview updated)

---

## Next Tasks

See `brain/task-queue.md` for the full ordered queue. Top unblocked items:

1. Commit last session's places redesign + Mapbox work
2. Run the `show_in_editorial` SQL migration in Supabase
3. Build the map page (`pages/map.tsx`) with Mapbox GL + location pins
4. Place detail page refinement
