# Task Queue

Last updated: 2026-03-14

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

- [ ] [frontend] Visual refinement: large-screen layout width audit
- [ ] [sql,user-action] Run SQL in Supabase: `show_in_editorial` migration (see current-state.md)

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [ ] [frontend+data] Replace `data/tours.ts` with live Supabase query to `tours` + `tour_stops`
- [ ] [frontend+data] Stories page: wire `stories` table to `pages/stories/index.tsx`

---

## Schema Queue
*Database migrations. Execute carefully and in isolation.*

- [ ] [schema] Add `is_published`, `tour_type`, `difficulty` to `tours` table
- [ ] [schema] Create `stories` + `story_locations` tables
- [ ] [schema] Create `artists` + `artist_locations` tables
- [ ] [schema] Create `visual_works` + `visual_work_locations` tables
- [ ] [schema] Create `routes` table

---

## Later
*Valid work, not yet prioritised.*

- [ ] [schema] Create `layers` table + migrate `categories.layer` text → FK *(breaking — do last)*
- [ ] [infra] Dashboard v1: login screen (`/dashboard/login`)
- [ ] [infra] Dashboard v1: overview page (`/dashboard`)
- [ ] [infra] Dashboard v1: locations list (`/dashboard/locations`)
- [ ] [infra] Dashboard v1: single location editor (`/dashboard/locations/[id]`)
- [ ] [frontend+data] Tours page: wire `tours` + `tour_stops` to `pages/tours/[slug].tsx`
- [ ] [data] Visual works layer: seed first postcards in `visual_works`
- [ ] [infra] QR infrastructure: generate and store `qr_code_url` on locations
- [ ] [data] Events layer: temporary pins for exhibitions and openings
- [ ] [infra] Multi-town migration: `town_settings`, composite slugs, `category_templates`

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] [infra] Hero video renders → needs `/public/videos/hero-barbizon.mp4`
