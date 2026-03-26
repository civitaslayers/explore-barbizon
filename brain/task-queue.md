# Task Queue

Last updated: 2026-03-26

Tasks are ordered by priority within each section.
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

- [ ] [data,sql] Write Art & History narratives — Auberge Ganne, Chapelle, Maison Diaz, Parcours Mosaiques, Plaine Angelus
- [ ] [data,sql] Fix Boucherie de l'Angelus description — remove fromagerie reference
- [ ] [data,user-action] Verify and insert 3 pending ESS locations (78 Grande Rue gallery, Les Charmettes glass artisan)

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [ ] [data,sql] Write remaining Art & History narratives (all 21 locations)
- [ ] [data,user-action] French translations of all narratives
- [ ] [data,user-action] Credit grappilles.fr as source on platform
- [ ] [frontend,user-action] Add real hero video asset (`/public/videos/hero-barbizon.mp4`)
- [ ] [data,user-action] Add real place images (`/public/images/places/*.jpg`)
- [ ] [frontend] Card polish and image treatment pass
- [ ] [data,schema] Add show_in_editorial column to locations table
- [ ] [frontend] Stories page: wire stories table
- [ ] [frontend] Wire tours page: tours + tour_stops to pages/tours/[slug].tsx
- [ ] [data,schema] Create artists + artist_locations tables
- [ ] [data,schema] Create stories + story_locations tables
- [ ] [data,schema] Add is_published, tour_type, difficulty to tours table
- [ ] [data,schema] Create visual_works + visual_work_locations tables
- [ ] [data,schema] Create routes table
- [ ] [data,schema] Create layers table + migrate categories.layer text to FK (do last)
- [ ] [data,user-action] Seed historical visual works layer — postcards first
- [ ] [infra] QR infrastructure: generate and store qr_code_url on locations

---

## Later
*Valid work, not yet prioritised.*

- [ ] [frontend] Dashboard v1: login, overview, locations list, single location editor
- [ ] [infra] AI guide: conversational layer grounded in database content
- [ ] [infra] Multi-town migration: town_settings, composite slugs, category_templates
- [ ] [data,user-action] Events layer: temporary map pins for exhibitions and openings
- [ ] [infra] Visitor passport: gamified exploration layer
- [ ] [frontend] Merchant discovery trails

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] [frontend,user-action] Add real hero video asset — footage not yet finalised
- [ ] [infra] Replace data/tours.ts with live Supabase query — depends on tours schema migration