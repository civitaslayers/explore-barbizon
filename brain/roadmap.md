# Roadmap

Last updated: 2026-03-13

---

## Phase 1 — Barbizon MVP (Current)

### Visual shell
- [x] Replace hero with cinematic looping video — code done, video asset needed
- [x] Reduce homepage text density — hero stripped to H1 + two CTAs
- [x] Mobile navigation — hamburger with animated X, active state
- [x] Featured place cards linkable — wrapped in Link with real slugs
- [ ] Add real video asset (`/public/videos/hero-barbizon.mp4`)
- [ ] Add real place images (`/public/images/places/*.jpg`)
- [ ] Card polish and image treatment pass
- [ ] Large-screen layout width refinement
- [ ] Place page visual refinement

### Content and data
- [ ] Complete Forest & Nature layer (data entry in Supabase)
- [ ] Polish hero locations
- [ ] Build first walking trail
- [ ] Improve featured places presentation
- [ ] Prepare historical visual works layer (postcards first — use `visual_works` model)

### Data integration
- [ ] Obtain Supabase `anon` key and add to `.env.local`
- [ ] Install `@supabase/supabase-js` and create `lib/supabase.ts`
- [ ] Replace `data/places.ts` with live Supabase query
- [ ] Replace `data/tours.ts` with live Supabase query
- [ ] Wire up Mapbox map with live location data

### Schema migrations (sequence matters — see docs/schema-reference.md)
- [ ] Add `is_published`, `tour_type`, `difficulty` to `tours`
- [ ] Create `stories` + `story_locations`
- [ ] Create `artists` + `artist_locations`
- [ ] Create `visual_works` + `visual_work_locations`
- [ ] Create `routes`
- [ ] Create `layers` + migrate `categories.layer` text → FK (breaking change — do last)

### Dashboard v1
- [ ] Login
- [ ] Overview
- [ ] Locations list
- [ ] Single location editor

---

## Phase 2 — Multi-Town Migration (Deferred)

Do not begin until Barbizon MVP is complete.

- [ ] Add `town_settings` table
- [ ] Establish composite slug discipline
- [ ] Add `category_templates` and `town_categories`
- [ ] Build town-aware dashboard logic
- [ ] Onboard town #2

---

## Long-Term Product Features

### QR infrastructure
Physical QR plaques around town linking into map/place pages.

### Merchant discovery trails
Curated local trails connecting galleries, food, commerce, and culture.

### Visual works layer
Paintings, postcards, photographs, and archival imagery linked to places via the `visual_works` + `visual_work_locations` model. Postcards are the practical starting point. Geo attribution uses `geo_confidence` — never assume exact coordinates from mosaics or secondary sources.

### Story mode
Deeper cultural narratives and articles via the `stories` table.

### AI guide
Conversational layer grounded in database content. Deferred.

### Events layer
Temporary map pins for exhibitions, openings, concerts, seasonal activity.

### Visitor passport / visits tracking
Longer-term gamified exploration layer.
