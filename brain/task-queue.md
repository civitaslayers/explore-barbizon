## 🎯 Current Focus — Explore Barbizon V1

Priority is now strictly on the **public product experience**, not Command Center or schema expansion.

### Recently Completed

- [x] Places index wired to live Supabase data
- [x] Place detail pages wired to live Supabase data (by slug)
- [x] Homepage → product navigation cleaned (CTAs + featured places)
- [x] Place detail page refined to editorial “quiet atlas” design

---

### Immediate Next (High Impact)

1. **Assets (CRITICAL)**
   - Add `/public/videos/hero-barbizon.mp4`
   - Add real `/public/images/places/*.jpg`
   - Replace placeholder visuals across homepage and place pages

2. **Tours — Live Data Wiring**
   - Connect `/tours/[slug]` to Supabase:
     - `tours`
     - `tour_stops`
     - use `distance_meters`
     - use `stop_narrative`

3. **Tour Page Refinement**
   - Apply same editorial design logic as place pages
   - Improve narrative flow and stop sequence readability

---

### Next (After Above)

- Forest & Nature layer population (first 5–10 key points)
- Map refinement (after tours + assets)
- Homepage visual polish (after real assets are in place)

---

### Paused / Deprioritized

- Command Center (CCC) improvements
- AI abstraction layer
- Multi-town architecture
- Schema expansion (stories, artists, visual_works, etc.)

These resume only after Barbizon V1 feels complete.

# Task Queue

Last updated: 2026-03-25

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

- [x] [infra,user-action] Set TAVILY_API_KEY in shell env
- [x] [infra,user-action] Run show_in_editorial SQL migration
- [x] [frontend] Place page visual refinement
- [x] [frontend] Large-screen layout width refinement
- [ ] [schema] Finish populating Forest & Nature category

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [ ] [data,schema] Add show_in_editorial column to locations table
- [ ] [frontend] Wire CCC task output viewer to display latest execution result
- [ ] [data] Audit and fix missing place thumbnails
- [ ] [data,user-action] Define and seed Forest & Nature subcategories
- [ ] [frontend] Stories page: wire stories table
- [ ] [data,user-action] Add real place images
- [ ] [frontend,schema] Boulder trails and climbing spots
- [ ] [data,schema] Create artists + artist_locations tables
- [ ] [data,schema] Create stories + story_locations tables
- [ ] [data,schema] Add is_published, tour_type, difficulty to tours table
- [ ] [data,schema] Create layers table + migrate categories.layer text → FK
- [ ] [data,schema] Create routes table
- [ ] [data,schema] Create visual_works + visual_work_locations tables
- [ ] [data,user-action] Build first walking trail
- [ ] [data,user-action] Polish hero locations
- [ ] [infra] Visitor passport: gamified exploration layer
- [ ] [frontend] Dashboard v1: locations list
- [ ] [frontend] Dashboard v1: overview page
- [ ] [frontend] Dashboard v1: login screen
- [ ] [frontend] Dashboard v1: single location editor
- [ ] [infra] AI guide: conversational layer grounded in database content
- [ ] [frontend] Merchant discovery trails
- [ ] [infra] Multi-town migration: town_settings, composite slugs, category_templates
- [ ] [infra] QR infrastructure: generate and store qr_code_url on locations
- [ ] [data,user-action] Events layer: temporary map pins for exhibitions and openings
- [ ] [frontend] Wire tours page: tours + tour_stops to pages/tours/[slug].tsx
- [ ] [data,user-action] Seed historical visual works layer — postcards first
- [ ] [data,user-action] Improve featured places presentation

---

## Later
*Valid work, not yet prioritised.*

*(no tasks)*

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] [frontend,user-action] Add real hero video asset
- [ ] [infra] Replace data/tours.ts with live Supabase query
- [ ] [frontend] Card polish and image treatment pass
