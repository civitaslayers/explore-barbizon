# Task Queue

Last updated: 2026-03-14
Format: tasks are ordered by priority within each section.
Move tasks between sections as status changes.
Update this file whenever work is completed or blockers are resolved.

---

## Now
*Unblocked tasks that can be started immediately.*

- [ ] Visual refinement: large-screen layout width audit
- [ ] Run SQL in Supabase: `show_in_editorial` migration (see current-state.md) — needs user action

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [ ] Replace `data/tours.ts` with live Supabase query to `tours` + `tour_stops`
- [ ] Schema migration: add `is_published`, `tour_type`, `difficulty` to `tours` table
- [ ] Schema migration: create `stories` + `story_locations` tables
- [ ] Schema migration: create `artists` + `artist_locations` tables
- [ ] Schema migration: create `visual_works` + `visual_work_locations` tables
- [ ] Schema migration: create `routes` table
- [ ] Stories page: wire `stories` table to `pages/stories/index.tsx`

---

## Later
*Valid work, not yet prioritised.*

- [ ] Schema migration: create `layers` table + migrate `categories.layer` text → FK *(breaking — do last)*
- [ ] Dashboard v1: login screen (`/dashboard/login`)
- [ ] Dashboard v1: overview page (`/dashboard`)
- [ ] Dashboard v1: locations list (`/dashboard/locations`)
- [ ] Dashboard v1: single location editor (`/dashboard/locations/[id]`)
- [ ] Tours page: wire `tours` + `tour_stops` to `pages/tours/[slug].tsx`
- [ ] Visual works layer: seed first postcards in `visual_works`
- [ ] QR infrastructure: generate and store `qr_code_url` on locations
- [ ] Events layer: temporary pins for exhibitions and openings
- [ ] Multi-town migration: `town_settings`, composite slugs, `category_templates`

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] Hero video renders → **needs** `/public/videos/hero-barbizon.mp4`
