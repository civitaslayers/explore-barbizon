# Execution Queue

Last updated: 2026-03-13

---

## Completed This Session

- [x] Populated all brain/ and docs/ stub files from MAIN_BRAIN.md
- [x] Homepage hero: replaced static image with `<video autoPlay muted loop playsInline>`
- [x] Homepage hero: stripped to eyebrow + H1 + two CTAs — no paragraph copy
- [x] Homepage hero: second CTA renamed to "Discover the Village" → /places
- [x] Homepage: removed empty dashed map placeholder
- [x] Homepage: removed "In future iterations…" WIP copy
- [x] Navigation: added mobile hamburger menu with animated toggle and active state
- [x] Featured places: cards now wrapped in `<Link>` with real slugs
- [x] Featured places: 4 new entries added to `data/places.ts`
- [x] Schema: pulled live Supabase schema (7 tables, all columns, all FKs)
- [x] Schema: documented proposed Civitas target schema in `docs/schema-reference.md`
- [x] Schema: replaced `paintings` with `visual_works` + `visual_work_locations` model

---

## Immediate Next — Assets

These are blocking the homepage from looking right in the browser:

1. Add `/public/videos/hero-barbizon.mp4` — looping hero video
2. Add `/public/images/places/*.jpg` — images for the 7 place entries

Without these, the hero shows no background and place cards show as empty grey boxes.

---

## Next — Data Integration

Once the Supabase `anon` key is available:

1. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
2. Install `@supabase/supabase-js`
3. Create `lib/supabase.ts` — typed client
4. Replace `data/places.ts` static data with a Supabase query to `locations`
5. Replace `data/tours.ts` static data with a Supabase query to `tours` + `tour_stops`
6. Test that existing page routes (`/places/[slug]`, `/tours/[slug]`) work with live data

---

## Next — Schema Migrations

Propose and run in this order (see `docs/schema-reference.md` for full field specs):

1. Add `is_published`, `tour_type`, `difficulty` to `tours` — additive, safe first step
2. Create `stories` + `story_locations`
3. Create `artists` + `artist_locations`
4. Create `visual_works` + `visual_work_locations`
5. Create `routes`
6. Create `layers` + migrate `categories.layer` → `layer_id` FK — breaking, do last

---

## Next — Visual Refinement

After assets are in place:

1. Card polish and image treatment
2. Large-screen layout width refinement
3. Place page refinement (`pages/places/[slug].tsx`)
4. Map page refinement (`pages/map.tsx`) — before Mapbox is wired

---

## Deferred

- Mapbox integration (requires assets and data integration first)
- Dashboard v1 (login, overview, locations, editor)
- Multi-town migration (after Barbizon MVP complete)
- AI guide layer
- QR infrastructure

---

## Operating Principle

Do not confuse visual refinement with a rebuild.

- Keep existing architecture where it works
- Refine section by section
- Preserve coherence
- Avoid unnecessary rewrites
- Let the design evolve through controlled passes
