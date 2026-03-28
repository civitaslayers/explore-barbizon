# Task Queue

Last updated: 2026-03-27

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

- [ ] [data,user-action] Coordinate audit: export all locations from Supabase, verify each pin against Google Maps, fix wrong coordinates
- [ ] [data,user-action] Add ESS pending items: unnamed gallery at 78 Grande Rue, La Dame aux Coquelicots, confirm Boucherie cheese offering
- [ ] [schema] Finish populating Forest & Nature category and subcategories

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

### Content (highest priority — biggest visible gap)
- [ ] [data,user-action] Write first historical story: Maison de Millet (source: grappilles.fr)
- [ ] [data,user-action] Write first historical story: Ferme du Couvent (source: grappilles.fr)
- [ ] [data,user-action] Write first guide story: Where to sleep in Barbizon
- [ ] [data,user-action] Write first guide story: Where to eat in Barbizon
- [ ] [data,user-action] Begin writing Art & History narratives for published locations (target: all 24)

### Design sprint
- [ ] [frontend] Homepage: full-bleed hero with map CTA visible above fold
- [ ] [frontend] Places page: magazine grid — larger cards, full-bleed images, editorial feel
- [ ] [frontend] Stories page: editorial long-form layout (lead image, generous whitespace, byline)
- [ ] [frontend] Global aesthetic pass: more visual courage — bigger images, less timid spacing

### Schema
- [ ] [schema] Add type field to stories table: values history or guide
- [ ] [data,schema] Create stories + story_locations tables
- [ ] [data,schema] Create artists + artist_locations tables
- [ ] [data,schema] Add is_published, tour_type, difficulty to tours table
- [ ] [data,schema] Create layers table + migrate categories.layer text to FK
- [ ] [data,schema] Create visual_works + visual_work_locations tables

### Trails
- [ ] [data,user-action] Download and import second trail GPX (Circuit Barbizon - Reserve de la Tillaie, 15.3km from AllTrails)
- [ ] [data,user-action] Download and import additional Fontainebleau trails from AllTrails/Wikiloc

### Data
- [ ] [data,user-action] Define and seed Forest & Nature subcategories
- [ ] [data,user-action] Seed historical visual works layer — postcards first
- [ ] [data,user-action] Add real place images
- [ ] [data,user-action] Polish hero locations
- [ ] [data] Audit and fix missing place thumbnails

### CCC / dashboard
- [ ] [frontend] Wire CCC task output viewer to display latest execution result
- [ ] [frontend] Dashboard v1: locations list
- [ ] [frontend] Dashboard v1: overview page
- [ ] [frontend] Dashboard v1: login screen
- [ ] [frontend] Dashboard v1: single location editor

### Wiring
- [ ] [frontend] Stories page: wire stories table to frontend
- [ ] [frontend] Wire tours page: tours + tour_stops to pages/tours/[slug].tsx

---

## Later
*Valid work, not yet prioritised.*

- [ ] [infra] Visitor passport: gamified exploration layer
- [ ] [infra] AI guide: conversational layer grounded in database content
- [ ] [frontend] Merchant discovery trails
- [ ] [infra] Multi-town migration: town_settings, composite slugs, category_templates
- [ ] [infra] QR infrastructure: generate and store qr_code_url on locations
- [ ] [data,user-action] Events layer: temporary map pins for exhibitions and openings
- [ ] [data,user-action] Formally credit grappilles.fr as a source on the platform
- [ ] [infra] Cloudflare Stream setup for video hosting (or Vimeo Pro fallback)
- [ ] [frontend] French translations: all narratives and UI strings
- [ ] [data,user-action] Potential new locations: Tumble Inn/Hotel de la Foret, Allee des Freres Farman

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] [frontend,user-action] Add real hero video asset (footage shot but not finalized)
- [ ] [infra] Replace data/tours.ts with live Supabase query
- [ ] [frontend] Card polish and image treatment pass (blocked on real images)

---

## Completed this session (2026-03-27)
- [x] Visit Barbizon rebrand across all pages, nav, footer, meta
- [x] Practical category excluded from /places editorial listing
- [x] Map sidebar hidden by default, floating drawer on demand
- [x] Map cluster bubbles color-matched to active layer
- [x] Map icons redesigned: teardrop pins, subcategory-level Noun Project glyphs
- [x] Trail routes: routes table created, Circuit des Peintres seeded, dashed line on map, GPS navigation popup
