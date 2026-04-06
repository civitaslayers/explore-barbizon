**Format guide:** Status = one sentence present tense. Last Completed = newest first, max 15, area tag in brackets. Blockers = real blockers only. Next Tasks = max 5, priority order, actionable verbs. Update after every significant work block.

# Current State

Last updated: 2026-04-03

## Status

Session complete — coordinate corrections, new Lunetier category, Dormoir de Lantara fully enriched with historical media, R2 bucket restructured to locations/ prefix, map popup link bug fixed.

---

## Last Completed

- [data] Removed atelier-rouge fictional placeholder from data/places.ts, data/highlights.ts, data/tours.ts
- [fix] Map popup "View place" link restored — getMapPins() locationPins were setting placeSlug: null; changed to placeSlug: row.slug in lib/supabase.ts
- [data] Le Dormoir de Lantara fully enriched — coordinates corrected (slug was dormoir-de-lantara not dormoir-lantara), two historical images added to media table (Le Gray 1852, Lepère 1890), full descriptions and narrative rewritten with sourced Lantara biography
- [media] R2 bucket restructured — all media now under locations/{slug}/ prefix; places/ folder retired; elephant-de-barbizon.jpg and dormoir images migrated; media table URLs updated
- [data] Futaie du Bas-Bréau deleted — location and media record removed; was an open coordinate verification item
- [data] Lunetier category created — Mon Oeil and L'Atelier de Bérangère both moved from Boutique
- [data] Four location coordinate corrections — Epicerie de Barbizon (68 GR), La Galerie des Pains (70 GR), Muse Galerie (82 GR), Mon Oeil (96B GR); hours and internal_notes enriched
- [data] Muse Galerie address corrected — was "88 bis", confirmed 82 GR by GPS; address discrepancy with Peintres de la Marine source flagged in internal_notes
- [data] Mon Oeil recategorised to Lunetier — address updated to 96B, internal_notes added (Maison Moulin Lunetier, Essilor partner)
- [data] proximity_override enabled for Epicerie de Barbizon and Maison Morin — genuinely distinct establishments within 15m on Grande Rue
- [schema] booking_url column added to locations — 10 properties populated with Booking.com URLs
- [data] Les Pléiades reinserted — full content, Daubigny narrative, proximity override set
- [schema] New categories added: Nightclub, Chambre d'hôtes, Lunetier
- [data] internal_notes column added — owner/host info populated for key ESS locations
- [data] Hotel category corrected — L'Esquisse, Besharat, Petit Château moved from wrong categories
- [data] Bobo Club inserted with Nightclub category

---

## Blockers

- Hero video full edit pending — current clip is placeholder; migrate to Cloudflare Stream when ready

---

## Next Tasks

1. Deploy to Vercel and verify map popup links work on live site
2. Update docs/schema-reference.md — add booking_url and internal_notes columns (Cursor)
3. Continue location data entry — nos. 41–63 Grande Rue still unreviewed
4. Confirm Sentier des Peintres starting pin — shares Place Marc Jacquet parking or distinct point?
5. Wire artists grid to Supabase — artists + artist_locations schema

---

## Next Session Starting Point

Deploy fix first. Then update schema-reference.md, then continue Grande Rue data entry from no. 41.
