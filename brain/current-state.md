# Current State

Last updated: 2026-03-13

---

## Done

### Infrastructure
- Local Next.js project running (Pages Router)
- GitHub repo connected (`civitaslayers/explore-barbizon`)
- Claude Code set up and reading the repo
- Project brain and docs structure fully populated

### Pages (built, static data)
- `pages/index.tsx` — homepage shell
- `pages/map.tsx` — map shell
- `pages/places/index.tsx` — places listing
- `pages/places/[slug].tsx` — single place page
- `pages/tours/[slug].tsx` — single tour page
- `pages/stories/index.tsx` — stories listing
- `pages/about.tsx`
- `pages/plan-your-visit.tsx`

### Data layer
- Static TypeScript data files in `data/` (places, tours, stories, highlights)
- No live database connection yet — all data is local and hardcoded

### Documentation
- `MAIN_BRAIN.md` — master orientation document
- `docs/design-direction.md`
- `docs/frontend-workflow.md`
- `docs/schema-reference.md`
- `docs/execution-queue.md`
- `brain/architecture-summary.md`
- `brain/roadmap.md`
- `brain/decisions.md`

---

## In Progress

- Homepage visual refinement (hero, cards, layout width, text density)
- Hero placeholder not yet replaced with real video

---

## Not Started

### Visual
- Cinematic looping video hero
- Real imagery and video assets
- Card polish and image treatment pass
- Large-screen layout width refinement

### Data integration
- Supabase connection (no integration wired yet)
- Mapbox integration (no integration wired yet)
- Replace `data/` static files with live Supabase queries

### Dashboard
- Dashboard v1 (login, overview, locations list, location editor)

### Content
- Forest & Nature layer
- First walking trail
- Historical postcard/media layer
