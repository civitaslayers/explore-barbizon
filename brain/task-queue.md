# Task Queue

Last updated: 2026-03-28

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

- [ ] [data,user-action] Continue replacing Unsplash placeholders with real photos — send location name + URL pairs, SQL updates run instantly
- [ ] [frontend] Wire media to place cards on the Places listing page (same pattern as hero — join media in query, render first image)
- [ ] [user-action] Commit and push today's frontend changes to Vercel (media wiring, mix-blend fix, animation fix)

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

### Content (highest priority — biggest visible gap)
- [ ] [data,user-action] Write first historical story: Maison de Millet (source: grappilles.fr)
- [ ] [data,user-action] Write first historical story: Ferme du Couvent (source: grappilles.fr)
- [ ] [data,user-action] Write first guide story: Where to sleep in Barbizon
- [ ] [data,user-action] Write first guide story: Where to eat in Barbizon
- [ ] [data,user-action] Begin writing Art & History narratives for published locations (target: all 21)

### Design sprint
- [ ] [frontend] Places page: magazine grid — larger cards, full-bleed images, editorial feel
- [ ] [frontend] Homepage: full-bleed hero with map CTA visible above fold
- [ ] [frontend] Stories page: editorial long-form layout (lead image, generous whitespace, byline)
- [ ] [frontend] Global aesthetic pass: more visual courage — bigger images, less timid spacing

### Trails
- [ ] [data,user-action] Create custom Parcours des Mosaïques GPX — current route only covers Grande Rue, not the full mosaic circuit
- [ ] [data,user-action] Investigate horse riding trails in Bas-Bréau area (Route des Chevaliers or similar)
- [ ] [data,user-action] Consider additional Fontainebleau trails: Sentier bleu no.6 Gorges d'Apremont, Parcours FB Fontainebleau-Barbizon

### Schema
- [ ] [data,schema] Create stories + story_locations tables
- [ ] [data,schema] Create artists + artist_locations tables
- [ ] [data,schema] Create visual_works + visual_work_locations tables
- [ ] [data,schema] Add is_published, tour_type, difficulty to tours table
- [ ] [data,schema] Create layers table + migrate categories.layer text → FK (do last)

### Data
- [ ] [data,user-action] Audit and fix missing place thumbnails on card components
- [ ] [data,user-action] Polish hero locations (lead text quality, coordinate accuracy)
- [ ] [data,user-action] Seed historical visual works layer — postcards first

### CCC / dashboard
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
- [ ] [frontend] AI guide: conversational layer grounded in database content
- [ ] [infra] Multi-town migration: town_settings, composite slugs, category_templates
- [ ] [infra] QR infrastructure: generate and store qr_code_url on locations
- [ ] [data,user-action] Events layer: temporary map pins for exhibitions and openings
- [ ] [data,user-action] Build first walking tour (tours + tour_stops)
- [ ] [data,user-action] Seed historical visual works layer — postcards first

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] [frontend,user-action] Add real hero video asset (footage not yet final)
- [ ] [infra] Replace data/tours.ts with live Supabase query

---

## Done (recent)
- [x] [data,sql] 72 cover images seeded across ESS (36), Art & History (21), Forest & Nature (15) layers
- [x] [frontend] Wire media table to place page hero (getLocationBySlug + toPlace adapter)
- [x] [frontend] Fix mix-blend-multiply blackening hero images
- [x] [frontend] Fix fade-in-hero animation (ease-soft → cubic-bezier in globals.css)
- [x] [data,sql] 5 trails seeded in routes table from Cirkwi GPX files (Parcours Mosaïques, Éléphant, Lantara, Cavalière, Circuit des Peintres)
- [x] [schema] Add color column to routes table
- [x] [schema] Add route_slug to locations table; link trail pins to route lines
- [x] [frontend] Per-trail hover/click reveal on map (route_slug approach, showTrails toggle removed)
- [x] [infra] Supabase Edge Function image-search deployed (v3)
- [x] [infra] ANTHROPIC_API_KEY stored as Supabase secret
