# Current State

Last updated: 2026-03-26

---

## Status

All four database layers are fully populated and clean. Art & History narrative pass complete — all 21 locations have English narratives of meaningful depth. Visual assets (hero video, place images) remain the primary gap before the product feels complete.

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
- All 21 locations have English narratives — pass complete
- Narrative lengths range from ~414 chars (Les Pleiades, intentionally concise) to ~1832 chars (Maison de Rousseau)
- Maison de Constant Troyon deleted — no confirmed address
- Maison de Charles Jacque and Maison de Barye GPS: 48.44420767584737, 2.6088388649123826 (confirmed La Juxtaposition building, 24-26 Grande Rue)
- Category layer bug fixed: art_history → Art & History on open-air-museum category
- 3 locations corrected from Forest & Nature → Art & History (Grande Rue, Le Chene Bodmer, Forest Entry Bas Breau)

**ESS notes:**
- All categories created: restaurant, hotel, galerie, boutique, fromagerie, boulangerie, epicerie, salon-de-the, traiteur, boucherie, tabac
- Besharat: 3 pins total — besharat-gallery (Art & History), besharat-gallery-ess (ESS galerie), besharat-suites (ESS hotel)
- 3 ESS locations still pending local verification:
  - Ground floor gallery at 78 Grande Rue (L'Imaginarium building) — name TBD
  - Glass artisan in Les Charmettes courtyard (38bis) — name TBD
  - Boucherie de l'Angelus description fixed (fromagerie reference removed)

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

- **Art & History narratives: complete** — all 21 locations, English
- Primary source used: grappilles.fr (Luigi's father-in-law's historical archive)
- Forest & Nature, ESS, Practical: descriptions present, narratives not a priority for those layers
- French translations: pending for all layers
- grappilles.fr credit on platform: pending

---

## Last Completed

- Art & History narrative pass — all 21 locations have English narratives
- Boucherie de l'Angelus description fixed — fromagerie reference removed
- All 4 layers fully populated (89 total locations)
- Art & History layer: 8 missing locations inserted, GPS corrections applied, category bugs fixed
- Forest & Nature layer: 13 locations (7 trails, 4 viewpoints, 3 climbing sectors)
- ESS layer: 38 locations across all categories
- Parcours des Peintres: all 19 mosaics GPS confirmed, tour stops inserted

---

## Active Blockers

- Hero video asset not yet finalised (footage partially shot, not edited)
- Place images missing for most locations
- 2 ESS locations pending local name verification (78 Grande Rue ground floor gallery, Les Charmettes glass artisan)

---

## Next Tasks

1. **Add hero video asset** — finalise footage, host on Cloudflare Stream, wire into existing video hero code
2. **Add place images** — source and optimise JPGs for key locations
3. **Credit grappilles.fr** — add source attribution on platform
4. **French translations** — all narratives once English complete
5. **Verify and insert 2 pending ESS locations** — 78 Grande Rue gallery and Les Charmettes glass artisan

---

## Next Session Starting Point

Open `brain/current-state.md` and `brain/task-queue.md`. Database and content work is largely complete for Barbizon MVP. Next priorities are visual assets (hero video, place images) and grappilles.fr attribution. For content work: French translations.