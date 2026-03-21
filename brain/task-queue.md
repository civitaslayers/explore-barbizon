# Task Queue

Last updated: 2026-03-22

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

- [ ] [infra,user-action] Run show_in_editorial SQL migration
- [ ] [infra,user-action] Set TAVILY_API_KEY in shell env
- [ ] [frontend] Place page visual refinement
- [ ] [frontend] Large-screen layout width refinement
- [ ] [schema] Finish populating Forest & Nature category

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [ ] [infra] Pilot Task Master AI on one multi-step CCC initiative
- [ ] [data,user-action] Add real place images
- [ ] [frontend] Card polish and image treatment pass
- [ ] [infra] Replace data/tours.ts with live Supabase query
- [ ] [frontend] Stories page: wire stories table
- [ ] [frontend,schema] Boulder trails and climbing spots
- [ ] [data,schema] Create routes table
- [ ] [data,schema] Add is_published, tour_type, difficulty to tours table
- [ ] [data,schema] Create stories + story_locations tables
- [ ] [data,schema] Create artists + artist_locations tables
- [ ] [data,schema] Create visual_works + visual_work_locations tables
- [ ] [data,schema] Create layers table + migrate categories.layer text → FK
- [ ] [frontend] Dashboard v1: login screen
- [ ] [frontend] Dashboard v1: overview page
- [ ] [frontend] Dashboard v1: locations list
- [ ] [frontend] Dashboard v1: single location editor
- [ ] [data,user-action] Polish hero locations
- [ ] [data,user-action] Build first walking trail
- [ ] [data,user-action] Improve featured places presentation
- [ ] [data,user-action] Seed historical visual works layer — postcards first
- [ ] [frontend] Wire tours page: tours + tour_stops to pages/tours/[slug].tsx
- [ ] [data,user-action] Events layer: temporary map pins for exhibitions and openings
- [ ] [infra] QR infrastructure: generate and store qr_code_url on locations
- [ ] [infra] Multi-town migration: town_settings, composite slugs, category_templates
- [ ] [frontend] Merchant discovery trails
- [ ] [infra] AI guide: conversational layer grounded in database content
- [ ] [infra] Visitor passport: gamified exploration layer

---

## Later
*Valid work, not yet prioritised.*

*(no tasks)*

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] [frontend,user-action] Add real hero video asset

---

## Done (this session)
*Completed 2026-03-21 to 2026-03-22. Run migrations/seed-ccc-completed-tasks.sql to record these in Supabase.*

- [x] [infra] Fix brain ↔ CCC drift: → brain sync button
- [x] [infra] Seed full roadmap into CCC as structured tasks
- [x] [frontend] Add inline agent assignment to CCC task list
- [x] [frontend] Add quick brief copy (▶) to CCC task list
- [x] [frontend] Add Done button to CCC task list row actions
- [x] [infra] Build POST /api/tasks/[id]/dispatch endpoint
- [x] [infra] Build POST /api/tasks/[id]/outputs endpoint
- [x] [infra] Build scripts/run-task.js CLI automation script
- [x] [infra] Build POST /api/tasks/[id]/run endpoint
- [x] [frontend] Add Run button to CCC task list
- [x] [frontend] Add Run automatically button to CCC task detail page
