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

- [ ] [frontend] Swap "Explore Barbizon" → "Visit Barbizon" in Layout component (nav, footer, page titles)
- [ ] [frontend] Exclude Practical category from /places Supabase query
- [ ] [frontend] Map sidebar: make hidden by default, open only on pin click or filter activation
- [ ] [data,user-action] Coordinate audit: export all locations, verify each against Google Maps, fix wrong pins
- [ ] [frontend] Map icons: implement subcategory-level icon set (see design-direction.md icon matrix)
- [ ] [schema] Finish populating Forest & Nature category

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

### Design sprint
- [ ] [frontend] Map page: full-screen redesign — floating controls, no persistent chrome, drawer sidebar UX
- [ ] [frontend] Map mobile: bottom sheet pattern — peek state on pin tap, expand to full detail
- [ ] [frontend] Homepage: full-bleed hero with map CTA visible above fold
- [ ] [frontend] Places page: magazine grid — larger cards, full-bleed images, editorial feel
- [ ] [frontend] Stories page: editorial long-form layout (lead image, generous whitespace, byline)
- [ ] [frontend] Global aesthetic pass: more visual courage — bigger images, less timid spacing

### Schema
- [ ] [schema] Add `type` field to stories table: values `history` | `guide`
- [ ] [data,schema] Create stories + story_locations tables (if not yet done)
- [ ] [data,schema] Create artists + artist_locations tables
- [ ] [data,schema] Add is_published, tour_type, difficulty to tours table
- [ ] [data,schema] Create layers table + migrate categories.layer text → FK
- [ ] [data,schema] Create routes table
- [ ] [data,schema] Create visual_works + visual_work_locations tables

### Content
- [ ] [data,user-action] Write first historical story: Maison de Millet (source: grappilles.fr)
- [ ] [data,user-action] Write first historical story: Ferme du Couvent (source: grappilles.fr)
- [ ] [data,user-action] Write first guide story: Where to sleep in Barbizon
- [ ] [data,user-action] Write first guide story: Where to eat in Barbizon
- [ ] [data,user-action] Begin writing Art & History narratives for published locations (target: all 24)
- [ ] [data,user-action] Add ESS pending items: unnamed gallery at 78 Grande Rue, La Dame aux Coquelicots, confirm Boucherie cheese offering

### Data
- [ ] [data,user-action] Define and seed Forest & Nature subcategories
- [ ] [data,user-action] Build first walking trail
- [ ] [data,user-action] Seed historical visual works layer — postcards first
- [ ] [data,user-action] Polish hero locations (images, lead text quality)
- [ ] [data,user-action] Audit and fix missing place thumbnails
- [ ] [data,user-action] Add real place images

### CCC / dashboard
- [ ] [frontend] Wire CCC task output viewer to display latest execution result
- [ ] [frontend] Dashboard v1: locations list
- [ ] [frontend] Dashboard v1: overview page
- [ ] [frontend] Dashboard v1: login screen
- [ ] [frontend] Dashboard v1: single location editor

### Wiring
- [ ] [frontend,schema] Boulder trails and climbing spots
- [ ] [frontend] Wire tours page: tours + tour_stops to pages/tours/[slug].tsx
- [ ] [frontend] Stories page: wire stories table to frontend

---

## Later
*Valid work, not yet prioritised.*

- [ ] [infra] Visitor passport: gamified exploration layer
- [ ] [infra] AI guide: conversational layer grounded in database content
- [ ] [frontend] Merchant discovery trails
- [ ] [infra] Multi-town migration: town_settings, composite slugs, category_templates
- [ ] [infra] QR infrastructure: generate and store qr_code_url on locations
- [ ] [data,user-action] Events layer: temporary map pins for exhibitions and openings
- [ ] [data,user-action] Improve featured places presentation
- [ ] [data,user-action] Formally credit grappilles.fr as a source on the platform
- [ ] [infra] Cloudflare Stream setup for video hosting (or Vimeo Pro fallback)
- [ ] [frontend] French translations: all narratives and UI strings
- [ ] [data,user-action] Potential new locations: Tumble Inn/Hôtel de la Forêt, Allée des Frères Farman

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] [frontend,user-action] Add real hero video asset (footage shot but not finalized — Hohem iSteady M7 + iPhone)
- [ ] [infra] Replace data/tours.ts with live Supabase query
- [ ] [frontend] Card polish and image treatment pass (blocked on real images)
