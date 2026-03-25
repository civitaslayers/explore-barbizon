# Task Queue

Last updated: 2026-03-25 (updated by Claude — completed tasks removed)

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

- [ ] [schema] Finish populating Forest & Nature category

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [ ] [data,schema] Add show_in_editorial column to locations table
- [ ] [frontend] Wire CCC task output viewer to display latest execution result
- [ ] [data] Audit and fix missing place thumbnails
- [ ] [data,user-action] Define and seed Forest & Nature subcategories
- [x] [frontend] Create sitemap.xml for public place pages
- [ ] [infra] Replace data/tours.ts with live Supabase query
- [ ] [frontend] Stories page: wire stories table
- [ ] [data,user-action] Add real place images
- [ ] [frontend] Card polish and image treatment pass
- [ ] [frontend,schema] Boulder trails and climbing spots
- [x] [data] Document CCC API contract in docs/
- [ ] [data,schema] Create artists + artist_locations tables
- [ ] [data,schema] Create stories + story_locations tables
- [ ] [data,schema] Create visual_works + visual_work_locations tables
- [ ] [data,schema] Create layers table + migrate categories.layer text → FK
- [ ] [data,schema] Create routes table
- [ ] [data,schema] Add is_published, tour_type, difficulty to tours table
- [ ] [data,user-action] Seed historical visual works layer — postcards first
- [ ] [frontend] Wire tours page: tours + tour_stops to pages/tours/[slug].tsx
- [ ] [data,user-action] Events layer: temporary map pins for exhibitions and openings
- [ ] [infra] QR infrastructure: generate and store qr_code_url on locations
- [ ] [infra] Multi-town migration: town_settings, composite slugs, category_templates
- [ ] [frontend] Merchant discovery trails
- [ ] [infra] AI guide: conversational layer grounded in database content
- [ ] [frontend] Dashboard v1: single location editor
- [ ] [infra] Visitor passport: gamified exploration layer
- [ ] [frontend] Dashboard v1: locations list
- [ ] [frontend] Dashboard v1: overview page
- [ ] [frontend] Dashboard v1: login screen
- [ ] [data,user-action] Polish hero locations
- [ ] [data,user-action] Build first walking trail
- [ ] [data,user-action] Improve featured places presentation

---

## Later
*Valid work, not yet prioritised.*

*(no tasks)*

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] [frontend,user-action] Add real hero video asset
