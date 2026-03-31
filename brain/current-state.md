# Current State

Last updated: 2026-03-31

---

## Platform identity

**Civitas Layers** — civic geo-narrative platform
**Public brand**: Visit Barbizon (`explorebarbizon.com`)
**Stack**: Next.js (Pages Router), Supabase, Mapbox GL, Tailwind, Vercel
**Supabase project**: `afqyrxtfbspghpfulvmy` (eu-west-2, Postgres 17)

---

## Database — live counts

| Layer | Locations | Media |
|---|---|---|
| Eat, Stay & Shop | 36 | 36 |
| Art & History | 21 | 21 |
| Forest & Nature | 15 | 15 |
| Practical | 17 | 0 |
| **Total** | **89** | **72** |

All 72 media rows are cover images. Practical layer intentionally has no images.
~10 ESS locations now have real photos from tourism sites and business pages; the rest have Unsplash placeholders pending real photo replacement.

---

## Routes — live

5 published trails in the `routes` table, all with GPX-derived GeoJSON, color, and `is_published = true`:

| Name | Slug | Distance | Duration | Color |
|---|---|---|---|---|
| Parcours des Mosaïques | `parcours-des-mosaiques` | 870m | 20min | `#8A5A3B` |
| Sentier des Peintres — L'Éléphant | `sentier-des-peintres-elephant` | 1.9km | 45min | `#C9A227` |
| Sentier des Peintres — Le Dormoir de Lantara | `sentier-dormoir-de-lantara` | 1.9km | 50min | `#C9A227` |
| Sentier de la Cavalière des Brigands | `sentier-cavaliere-des-brigands` | 2.05km | 55min | `#4A5E3A` |
| Circuit des Peintres de Barbizon | `circuit-des-peintres` | 7.4km | 110min | `#C9A227` |

GPX sources: Cirkwi / Balad'Nature (official Fontainebleau Tourisme).
`routes` table has a `color` column added via migration.
`locations.route_slug` column added — trail pins link to their route line for hover/click reveal on the map.

---

## Public Product (Explore Barbizon V1)

**Design system:** Stitch 2.0 design overhaul complete (March 2026).
All five design passes shipped in a single session.

**What is live and working:**
- Homepage: cinematic video hero (hero-barbizon.mp4 in place),
  Atlas Card featured enclaves, Choose Your Path section
- Places index: tab filter row, Atlas Card grid, Archive Directory
  header
- Place detail: chip category label, italic serif lead, Archive
  Directory back link, chip labels on related/nearby
- Tour page: full Stitch editorial layout — italic serif header,
  stats aside, alternating stop grid with timeline anchor,
  archival quote block
- Navigation: simplified top bar (Visit Barbizon wordmark links
  to /), BottomNav with 4 tabs (Atlas / Trails / Stories / Places)
- All pages wired to live Supabase data with static fallback

**Design tokens in place:**
- Newsreader (serif display) + Inter (sans UI)
- Surface hierarchy tokens, chip palette, shadow-ambient,
  ink-gradient, .chip component
- docs/design-direction.md rewritten to reflect Stitch 2.0 system

**Current limitations:**
- Tour page uses static data/tours.ts — not yet wired to Supabase
- Forest & Nature layer has no location data in Supabase
- Stories page exists but has no content
- Hero video is live; place images are still mostly placeholders
- Map requires Mapbox token to render pins

**Overall status:**
Visual shell is now cohesive and design-system-driven.
Next priority is content depth: wire tours to Supabase,
populate Forest & Nature, begin Stories.

---

## Last completed

- [x] Created 3 published stories: rooms-of-light, paths-to-the-forest, inn-paintings-dinner
- [x] Story body renders as Markdown via marked (breaks + gfm), prose-story CSS class
- [x] RelatedStories component — related essays + places in this essay, wired per slug
- [x] HistoryTimeline fact-corrected: Rousseau 1847, forest reserve 1861, museum 1987
- [x] Timeline story links: 1830s → inn-paintings-dinner, 1847 → rooms-of-light, 1853 → paths-to-the-forest, 1861 → paths-to-the-forest
- [x] stories.theme column added; queries updated in index and slug pages; fallback chain: theme → author → "Editorial"
- [x] atelier-rouge identified as fictional placeholder — not yet removed from data/places.ts
- [x] Created pages/history.tsx — History page with timeline, postcards placeholder, artists grid, sources
- [x] Created components/HistoryTimeline.tsx — client component with filter toolbar and expandable rows
- [x] Updated nav: Map · Places · History · Stories · About (removed Plan Your Visit)
- [x] Homepage section 6 replaced with /history teaser card
- [x] /plan-your-visit route preserved but removed from nav

---

## Key source: grappilles.fr

Historical archive built by Luigi's father-in-law. Primary research source for Art & History narratives. Formally credited on the platform. All narrative content derived from it is attributed.

---

## Infrastructure

- `explorebarbizon.com` domain connected to Vercel
- Mapbox token embedded at build time via `NEXT_PUBLIC_` env var (requires redeploy on change)
- Supabase Edge Function `image-search` deployed (v3) — server-side image scraper, not currently in active use
- `ANTHROPIC_API_KEY` stored as Supabase secret

---

## Known gaps / pending

- ~26 ESS locations still have Unsplash placeholder images (real photos being collected)
- Art & History and Forest & Nature layers have all Unsplash placeholders
- Place cards on the Places listing page do not yet show images (media not wired to card component)
- French translations of all English narratives deferred
- Homepage full-bleed hero video: structure built in Webflow with placeholder URL; final footage pending
- Stories, Artists, Visual Works tables not yet created
