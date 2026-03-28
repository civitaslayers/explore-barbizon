# Current State

Last updated: 2026-03-28

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

## Frontend — place page

- Hero image wired to `media` table: `getLocationBySlug` joins `media`, `toPlace` uses `media[0].url`
- `mix-blend-multiply` removed from hero image div (was blackening all photos)
- `fade-in-hero` animation bug fixed: `ease-soft` (Tailwind class) replaced with `cubic-bezier(.22,.61,.36,1)` in `globals.css`
- Place name, category eyebrow, and location text now correctly overlaid on hero image
- Default fallback image: `/images/places/place-default.jpg`

---

## Frontend — map

- Trail routes rendered as colored lines on the map
- Per-trail hover/click reveal wired via `route_slug` on location pins
- `showTrails` toggle removed — trails show per-pin interaction instead
- Trail pin icons distinct from place pins

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
