# Current State

Last updated: 2026-04-01

**Status:** Five stories published and cross-linked. History page live. Map deep-links working with layer auto-enable. Nav finalised: Map · Places · History · Stories · About.

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
| Forest & Nature | 16 | 16 |
| Practical | 17 | 0 |
| **Total** | **90** | **73** |

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
- Homepage: cinematic video hero (asset path wired; final file pending — see Blockers),
  Atlas Card featured enclaves, Choose Your Path section
- Places index: tab filter row, Atlas Card grid, Archive Directory
  header
- Place detail: chip category label, italic serif lead, Archive
  Directory back link, chip labels on related/nearby
- Tour page: full Stitch editorial layout — italic serif header,
  stats aside, alternating stop grid with timeline anchor,
  archival quote block
- Navigation: simplified top bar (Visit Barbizon wordmark links
  to /) — Map · Places · History · Stories · About
- All pages wired to live Supabase data with static fallback

**Design tokens in place:**
- Newsreader (serif display) + Inter (sans UI)
- Surface hierarchy tokens, chip palette, shadow-ambient,
  ink-gradient, .chip component
- docs/design-direction.md rewritten to reflect Stitch 2.0 system

**Current limitations:**
- Tour page uses static data/tours.ts — not yet wired to Supabase
- Forest & Nature layer is complete: 16 locations published, all fully populated (short_description, full_description, narrative), all show_in_editorial = true, all show_on_map = true. Coordinates verified and corrected where needed (L'Éléphant, Dormoir/Cavalière pin offset).
- Further stories and essay 6 planned (see Next tasks)
- Hero video file still pending — see Blockers (`/public/videos/hero-barbizon.mp4`); pipeline (Git LFS / Vercel) ready when asset lands
- Most places use Unsplash placeholder images; L'Éléphant de Barbizon has a real committed photo at `/public/images/places/elephant-de-barbizon.jpg`. Image hosting infrastructure not yet set up — Cloudflare R2 identified as the solution; task queued.
- Map requires Mapbox token to render pins

**Overall status:**
Visual shell is cohesive and design-system-driven; History page and five cross-linked stories are live; map deep-links work with layer auto-enable.
Next priority: data cleanup (atelier-rouge), expand About, seed artists and postcards, essay 6 — plus wire tours to Supabase.

---

## Last completed

- [x] Created pages/history.tsx — History page with HistoryTimeline, postcards placeholder, artists grid, sources
- [x] Created components/HistoryTimeline.tsx — filterable, expandable rows, cross-links to stories
- [x] HistoryTimeline fact-corrected: Rousseau 1847, forest reserve 1861, museum 1987
- [x] Timeline story links: 1822 → how-the-forest-became-a-picture, 1830s → inn-paintings-dinner, 1847 → rooms-of-light, 1849 → the-gleaners, 1853 → paths-to-the-forest, 1861 → paths-to-the-forest
- [x] Nav updated: Map · Places · History · Stories · About — /plan-your-visit removed from nav, route preserved
- [x] Homepage section 6 replaced with /history teaser card
- [x] Published 5 stories: rooms-of-light (Studio), paths-to-the-forest (Landscape), inn-paintings-dinner (Village life), the-gleaners (Landscape), how-the-forest-became-a-picture (Art)
- [x] Story body renders as Markdown via marked (GFM + breaks), prose-story CSS class
- [x] RelatedStories component — related essays + places, wired per slug in [slug].tsx
- [x] stories.theme column added; fallback chain: theme → author → Editorial
- [x] All 5 stories cross-linked: inline body links, RELATED blocks, timeline story links
- [x] Map preview on place pages clickable → /map?location=[slug]
- [x] MapGL: focusSlug prop — flies to location and opens popup on load
- [x] Map deep-link auto-enables layer group via getCategoryGroup before flyTo
- [x] atelier-rouge identified as fictional placeholder — not yet removed from data/places.ts or Supabase

## Blockers

- Hero video asset still missing (`/public/videos/hero-barbizon.mp4`)
- atelier-rouge is a fictional placeholder in `data/places.ts` — needs removal or unpublish

## Next tasks

1. Remove or unpublish atelier-rouge
2. Expand `/about` to absorb `/plan-your-visit` practical content
3. Seed artists table and wire `/history` artists grid to Supabase
4. Source first historical postcard images for `/history` section 2
5. Write essay 6 — conservation / 1861 reserve / Rousseau as activist

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
- Art & History and most of Forest & Nature still use Unsplash placeholders; L'Éléphant uses the committed asset above
- Media hosting: Cloudflare R2 not yet provisioned (task queued)
- Place cards on the Places listing page do not yet show images (media not wired to card component)
- French translations of all English narratives deferred
- Artists and Visual Works tables not yet created (stories table live)
