# Current State

Last updated: 2026-03-26

---

## Status

All four database layers are now fully populated. The public product serves live Supabase data on places index and detail pages. Visual assets (hero video, place images) remain the primary gap before the product feels complete.

---

## Database — Barbizon

| Layer | Locations | Status |
|---|---|---|
| Art & History | 24 | Complete |
| Practical | 17 | Complete |
| Eat, Stay & Shop | 38 | Complete |
| Forest & Nature | 13 | Complete |

**Total: 92 published locations**

All ESS categories created and populated: restaurant, hotel, galerie, boutique, fromagerie, boulangerie, epicerie, salon-de-the, traiteur, boucherie, tabac.

Forest & Nature: 7 trails, 4 viewpoints, 3 climbing sectors. Category bug fixed (Grande Rue, Le Chene Bodmer, Forest Entry Bas Breau were miscategorised to Forest & Nature — corrected to heritage-site).

3 ESS locations still pending local verification:
- Ground floor gallery at 78 Grande Rue (L'Imaginarium building) — name TBD
- Glass artisan in Les Charmettes courtyard (38bis) — name TBD  
- Boucherie de l'Angelus description — remove fromagerie reference

---

## Frontend / Product State

### Public Product (Explore Barbizon V1)

- Places index (`/places`) uses live Supabase data filtered by `is_published = true`
- Place detail pages (`/places/[slug]`) load real data by slug from Supabase
- Homepage CTAs wired: "Explore the Map" → `/map`, "Discover the Village" → `/places`
- Featured places on homepage derived from published Supabase locations (with static fallback)

### UX / Design Progress

- Place detail page refined toward editorial "quiet atlas" experience
- Calmer hero layout, serif lead, improved text hierarchy
- Metadata presented as orientation, not dashboard
- History block treated as archival margin content

### Current Limitations

- Hero video missing — placeholder in place, asset not yet shot/finalised
- Many places use fallback image (`/images/places/place-default.jpg`)
- Map preview depends on Mapbox configuration (`hasMapbox`)

---

## Content State

- Narratives: most Art & History locations have short descriptions but full museum-style narratives are incomplete
- **Active content work: writing narratives for Art & History locations**
- Primary source: grappilles.fr (Luigi's father-in-law's historical archive — municipal records, period literature, old newspapers, cartographic materials)
- Maison de Millet and Ferme du Couvent identified as strong starting points
- All content in English first; French translations pending

---

## Last Completed

- Forest & Nature layer: 13 locations inserted (7 trails, 4 viewpoints, 3 climbing sectors)
- ESS layer: 38 locations across all categories
- All 4 Barbizon layers fully populated (92 total locations)
- Category bug fix: 3 Art & History locations miscategorised to Forest & Nature — corrected
- Galerie category created and 5 gallery entries inserted under ESS
- Besharat 3-pin policy implemented (Art & History + ESS galerie + ESS hotel)
- Parcours des Peintres: all 19