# Current State

Last updated: 2026-03-13

---

## Done

### Infrastructure
- Local Next.js project running (Pages Router)
- GitHub repo: `civitaslayers/explore-barbizon`
- Claude Code set up and reading the repo
- All brain/ and docs/ files populated with real content (no more stubs)

### Documentation
- `MAIN_BRAIN.md` — master orientation document
- `docs/design-direction.md` — design philosophy, homepage direction, palette, tone
- `docs/frontend-workflow.md` — Cursor workflow, local dev, Tailwind cautions
- `docs/schema-reference.md` — live schema (Part 1) + proposed Civitas target schema (Part 2)
- `docs/execution-queue.md` — current priorities and sequencing
- `brain/architecture-summary.md` — stack, product model, entry modes
- `brain/roadmap.md` — MVP checklist, long-term features
- `brain/decisions.md` — full decision log with reasoning

### Supabase
- Live project confirmed: `afqyrxtfbspghpfulvmy` (Civitas Layers' Project, eu-west-2, Postgres 17)
- Management API accessible via SQL query endpoint
- Full live schema pulled and documented in `docs/schema-reference.md` Part 1
- 7 tables confirmed: `towns`, `categories`, `locations`, `media`, `tours`, `tour_stops`, `users`
- All FK constraints documented
- Note: the REST API (`anon`/`service_role` key) has not been tested — only the Management API token has been used so far. The `anon` key is needed to wire up `@supabase/supabase-js` in the frontend.

### Schema design
- Proposed Civitas target schema fully documented in `docs/schema-reference.md` Part 2
- Covers: `stories`, `artists`, `visual_works`, `visual_work_locations`, `routes`, `layers`, and additions to `tours`
- `visual_works` replaces the earlier `paintings` concept — covers paintings, postcards, photographs, engravings, drawings
- Geographic interpretation lives entirely in `visual_work_locations` junction table — no coordinates on the work itself
- `geo_confidence` values: `exact`, `approximate`, `interpretive`, `unknown`
- No tables have been created yet — schema is proposed only

### Homepage (pages/index.tsx)
- Hero code updated: `<video>` element with `autoPlay muted loop playsInline`
- Poster fallback: `/images/hero-barbizon.jpg`
- Video source: `/videos/hero-barbizon.mp4` — **file not yet added to public/**
- Hero text stripped to eyebrow + H1 + two buttons only
- Second CTA changed to "Discover the Village" → `/places`
- Empty dashed map placeholder removed
- "In future iterations…" WIP copy removed from Barbizon Through Time section

### Navigation (components/Layout.tsx)
- Mobile hamburger menu added — animates to X, closes on link tap
- Active route highlighted in mobile nav
- Desktop nav unchanged

### Places data (data/places.ts)
- 7 entries total (was 3)
- Added: `maison-millet`, `auberge-ganne`, `grande-rue`, `forest-entrance`
- Existing: `atelier-rouge`, `sentier-des-peintres`, `musee-de-barbizon`
- Image paths standardised to `/images/places/`

### Featured place cards (pages/index.tsx)
- Cards now render as `<Link>` components pointing to `/places/[slug]`
- All four featured places have matching entries in `data/places.ts`

---

## Blocked / Waiting on Assets

- **Hero video** — code is in place, waiting for `/public/videos/hero-barbizon.mp4`
- **Place images** — paths set to `/images/places/*.jpg`, no actual images in `public/` yet
- **Supabase anon key** — needed before `@supabase/supabase-js` can be wired into the frontend

---

## Not Started

### Visual
- Real imagery and video assets (images exist only as paths in code)
- Card polish and image treatment pass
- Large-screen layout width refinement
- Place page visual refinement

### Data integration
- Install `@supabase/supabase-js`
- Create Supabase client (`lib/supabase.ts`)
- Replace `data/places.ts` static file with live query
- Replace `data/tours.ts` static file with live query
- Mapbox integration — no wiring started

### Schema migrations (all deferred until MVP complete)
- `is_published`, `tour_type`, `difficulty` additions to `tours`
- Create `stories` + `story_locations`
- Create `artists` + `artist_locations`
- Create `visual_works` + `visual_work_locations`
- Create `routes`
- Create `layers` + migrate `categories.layer` text → FK

### Dashboard v1
- Login
- Overview
- Locations list
- Single location editor

### Content
- Forest & Nature layer data entry
- First walking trail
- Historical postcard/media layer

---

## Key file locations

| Purpose | File |
|---|---|
| Master orientation | `MAIN_BRAIN.md` |
| Live + proposed schema | `docs/schema-reference.md` |
| Design principles | `docs/design-direction.md` |
| Dev workflow | `docs/frontend-workflow.md` |
| What to do next | `docs/execution-queue.md` |
| Decision log | `brain/decisions.md` |
| Stack + architecture | `brain/architecture-summary.md` |
| MVP checklist | `brain/roadmap.md` |
| Homepage | `pages/index.tsx` |
| Layout + nav | `components/Layout.tsx` |
| Places data | `data/places.ts` |
| Tailwind config | `tailwind.config.js` |
| Global styles | `styles/globals.css` |
