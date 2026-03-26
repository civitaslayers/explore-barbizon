# Current State

Last updated: 2026-03-26

---

## Status

All four database layers are fully populated and clean. The public product serves live Supabase data on places index and detail pages. Visual assets (hero video, place images) remain the primary gap before the product feels complete. Active work is narrative writing for Art & History locations.

---

## Database — Barbizon

| Layer | Locations | Status |
|---|---|---|
| Art & History | 21 | Complete |
| Practical | 17 | Complete |
| Eat, Stay & Shop | 38 | Complete |
| Forest & Nature | 13 | Complete |

**Total: 89 published locations**

**Art & History notes:**
- Maison de Constant Troyon deleted — no confirmed address found
- Maison de Charles Jacque and Maison de Barye GPS corrected to confirmed La Juxtaposition coordinates (48.44420767584737, 2.6088388649123826) — both at 24-26 Grande Rue, today La Juxtaposition
- Category layer bug fixed: `art_history` → `Art & History` on open-air-museum category
- 3 locations corrected from Forest & Nature → Art & History (Grande Rue, Le Chene Bodmer, Forest Entry Bas Breau)

**ESS notes:**
- All categories created: restaurant, hotel, galerie, boutique, fromagerie, boulangerie, epicerie, salon-de-the, traiteur, boucherie, tabac
- Besharat: 3 pins total — besharat-gallery (Art & History), besharat-gallery-ess (ESS galerie), besharat-suites (ESS hotel)
- 3 ESS locations still pending local verification:
  - Ground floor gallery at 78 Grande Rue (L'Imaginarium building) — name TBD
  - Glass artisan in Les Charmettes courtyard (38bis) — name TBD
  - Boucherie de l'Angelus description — remove fromagerie reference

---

## Frontend / Product State

- Places index (`/places`) uses live Supabase data filtered by `is_published = true`
- Place detail pages (`/places/[slug]`) load real data by slug from Supabase
- Homepage CTAs wired: "Explore the Map" → `/map`, "Discover the Village" → `/places`
- Featured places on homepage derived from published Supabase locations (with static fallback)
- Place detail page refined toward editorial "quiet atlas" experience

**Current limitations:**
- Hero video missing — placeholder in place, asset not yet finalised
- Many places use fallback image (`/images/places/place-default.jpg`)
- Map preview depends on Mapbox configuration (`hasMapbox`)

---

## Content State

- **Active work: writing narratives for Art & History locations**
- Maison de Millet and Maison de Rousseau narratives completed using grappilles.fr source material
- All other Art & History locations have short descriptions but varying narrative depth
- Primary source: grappilles.fr (Luigi's father-in-law's historical archive)
- All content English first; French translations pending
- grappilles.fr credit on platform: pending

---

## Last Completed

- All 4 layers fully populated (89 total locations)
- Art & History layer: 8 missing locations inserted, 1 deleted (Troyon, no confirmed address), GPS corrections applied
- Forest & Nature layer: 13 locations (7 trails, 4 viewpoints, 3 climbing sectors)
- ESS layer: 38 locations across all categories
- Category bugs fixed: art_history layer typo, 3 miscategorised locations corrected
- Millet and Rousseau narratives written from primary sources
- Parcours des Peintres: all 19 mosaics GPS confirmed, tour stops inserted

---

## Active Blockers

- Hero video asset not yet finalised (footage partially shot, not edited)
- Place images missing for most locations
- 3 ESS locations pending local name verification

---

## Next Tasks

1. **Continue Art & History narratives** — Auberge Ganne, Chapelle de Barbizon, Maison de Diaz, Parcours des Mosaiques, Plaine de l'Angelus as next priorities
2. **Fix Boucherie de l'Angelus description** — remove fromagerie reference
3. **Add hero video asset** — finalise footage, host on Cloudflare Stream
4. **Add place images** — source and optimise JPGs for key locations
5. **Credit grappilles.fr** — add source attribution on platform
6. **French translations** — all narratives once English complete

---

## Next Session Starting Point

Open `brain/current-state.md` and `brain/task-queue.md`. Active work is narrative writing for Art & History layer. Continue with Auberge Ganne — fetch grappilles.fr source material, draft English narrative, update via SQL.