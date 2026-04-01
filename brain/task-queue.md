# Task Queue

Last updated: 2026-04-01

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

- [ ] [data] Remove or unpublish atelier-rouge — fictional placeholder, no real-world referent in Barbizon
- [ ] [frontend,schema] Wire tours/[slug].tsx to live Supabase
      data (tours + tour_stops tables)
- [x] [data] Finish populating Forest & Nature category
- [x] [data] Thumbnail audit — all layers checked, one gap fixed (L'Éléphant)
- [ ] [data,user-action] Continue replacing Unsplash placeholders with real photos — send location name + URL pairs, SQL updates run instantly
- [ ] [frontend] Wire media to place cards on the Places listing page (same pattern as hero — join media in query, render first image)
- [ ] [user-action] Commit and push today's frontend changes to Vercel (media wiring, mix-blend fix, animation fix)

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [ ] [infra,user-action] Set up Cloudflare R2 bucket for media assets
- [ ] [frontend] Expand /about to absorb /plan-your-visit practical content (getting there, parking, seasons)
- [ ] [data] Seed artists table and wire /history artists grid to Supabase (replace static cards)
- [ ] [content] Source first historical postcard images for /history section 2
- [ ] [content] Essay 6 — conservation / 1861 reserve / Rousseau as activist (theme: Forest)
- [ ] [content] Add theme value to all future story INSERTs (theme column is now required in practice)

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
- [x] [data,schema] Create stories + story_locations tables
- [ ] [data,schema] Create artists + artist_locations tables
- [ ] [data,schema] Create visual_works + visual_work_locations tables
- [ ] [data,schema] Add is_published, tour_type, difficulty to tours table
- [ ] [data,schema] Create layers table + migrate categories.layer text → FK (do last)

### Data
- [x] [data,user-action] Audit and fix missing place thumbnails on card components
- [ ] [data,user-action] Polish hero locations (lead text quality, coordinate accuracy)
- [ ] [data,user-action] Seed historical visual works layer — postcards first

### CCC / dashboard
- [ ] [frontend] Dashboard v1: locations list
- [ ] [frontend] Dashboard v1: overview page
- [ ] [frontend] Dashboard v1: login screen
- [ ] [frontend] Dashboard v1: single location editor

### Wiring
- [x] [frontend] Stories page: wire stories table to frontend

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
- [x] [infra] Git LFS configured for mp4 assets
- [x] [infra] Vercel LFS enabled — hero video live in production
- [x] [frontend] Stitch 2.0 design system — Passes 1–5
- [x] [frontend] Newsreader font + token system upgrade
- [x] [frontend] Navigation overhaul + BottomNav component
- [x] [frontend] Homepage cinematic hero + Atlas Cards
- [x] [frontend] Places index tab filters + Atlas Card grid
- [x] [frontend] Place detail chip labels + italic lead
- [x] [frontend] Tour page editorial layout (Stitch)
- [x] [docs] design-direction.md rewritten for Stitch 2.0
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
- [x] [frontend] Stories index + article pages — Supabase wired, Markdown body, RelatedStories, five essays published
- [x] [frontend] Nav: Map · Places · History · Stories · About; /plan-your-visit retired from nav (route preserved)
