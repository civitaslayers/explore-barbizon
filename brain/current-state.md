# Current State

Last updated: 2026-03-13

---

## Status

Visual shell partially done. Schema designed but not yet implemented. No live data connection. Blocked on assets and Supabase anon key.

---

## Last Completed

- All brain/ and docs/ files populated (no more stubs)
- Homepage hero: `<video>` element in place (code done, asset missing)
- Homepage: hero text stripped to eyebrow + H1 + two CTAs
- Homepage: second CTA → "Discover the Village" → /places
- Homepage: empty map placeholder and WIP copy removed
- Navigation: mobile hamburger with animated X and active route state
- Featured place cards: wrapped in `<Link>`, all four have slugs and data entries
- `data/places.ts`: 7 entries (maison-millet, auberge-ganne, grande-rue, forest-entrance, atelier-rouge, sentier-des-peintres, musee-de-barbizon)
- Schema: live Supabase schema pulled and documented in `docs/schema-reference.md` Part 1
- Schema: proposed Civitas target schema documented in `docs/schema-reference.md` Part 2
- `visual_works` + `visual_work_locations` model finalised (replaces `paintings`)

---

## Blockers

| Blocker | Needed for |
|---|---|
| `/public/videos/hero-barbizon.mp4` missing | Hero video to render |
| `/public/images/places/*.jpg` missing | Place cards to show images |
| Supabase `anon` key not in `.env.local` | Any live data connection |

---

## Next Tasks (in order)

1. **Add real assets** — drop video into `public/videos/`, images into `public/images/places/`
2. **Wire Supabase** — add anon key to `.env.local`, install `@supabase/supabase-js`, create `lib/supabase.ts`, replace `data/places.ts` with live query
3. **Run schema migrations** — in order: `tours` additions → `stories` → `artists` → `visual_works` → `routes` → `layers` (see `docs/schema-reference.md`)
4. **Visual refinement pass** — cards, large-screen width, place page (`pages/places/[slug].tsx`)
5. **Dashboard v1** — login, overview, locations list, single location editor

---

## Next Session Starting Point

Start at blocker resolution. If assets are available, add them to `public/` and verify the hero and place cards render. If the Supabase anon key is available, begin data integration (step 2 above). Otherwise, move to visual refinement or schema migrations.

---

## Key files

| Purpose | File |
|---|---|
| Master orientation | `MAIN_BRAIN.md` |
| Live + proposed schema | `docs/schema-reference.md` |
| What to do next (detailed) | `docs/execution-queue.md` |
| Decision log | `brain/decisions.md` |
| Stack + Supabase details | `brain/architecture-summary.md` |
| MVP checklist | `brain/roadmap.md` |
