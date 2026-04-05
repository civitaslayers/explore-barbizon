**Format guide:** Status = one sentence present tense. Last Completed = newest first, max 15, area tag in brackets. Blockers = real blockers only. Next Tasks = max 5, priority order, actionable verbs. Update after every significant work block.

# Current State

Last updated: 2026-04-03

## Status

Single-table spatial architecture complete — places/place_functions dropped, all 8 entries migrated to locations/location_functions, 106 published locations, codebase updated and building cleanly.

---

## Last Completed

- [map] Added GeolocateControl to MapGL.tsx — real-time GPS dot with heading cone and accuracy circle
- [schema] places + place_functions tables dropped — all data migrated to locations + location_functions
- [schema] location_functions table created — multi-service venues now use FK to locations.id
- [schema] Galerie Atelier Drochon inserted — 79 Grande Rue, category Galerie d'Art
- [schema] Artist House category rule documented — historical Barbizon School only
- [schema] booking_url and internal_notes added to schema-reference.md
- [data] Duplicate pins resolved across places/locations tables — one address one pin rule enforced
- [data] booking_url column added to locations — 10 properties populated with Booking.com URLs, Villa Albertine and Le Chic with Airbnb
- [data] Les Pléiades reinserted (was lost in duplicate cleanup) — full content, Daubigny narrative, proximity override set
- [schema] New categories added: Nightclub, Chambre d'hôtes, Chambre d'hôtes split from Hotel — accommodation layer now clean
- [schema] booking_url migration applied and documented
- [data] internal_notes column added — Ô Bout, Bobo Club, Le Relais, Besharat, all B&Bs populated with owner/host info
- [data] Hotel category corrected — L'Esquisse, Besharat, Petit Château moved from wrong categories
- [data] 6 new B&Bs/chambres d'hôtes inserted: P'tit Angélus, Cottage Barbizonnais, Petit Château, Le Chic à Barbizon, Villa Albertine recategorised
- [data] Bobo Club inserted with new Nightclub category
- [data] Galerie Alfart-LBK merged with Métranve Sculptures — single pin, address corrected to no.6
- [data] Galaxie des Arts updated — single location (83 GR), old 84bis location noted as new tourist office
- [data] Tourist office pin confirmed at 84bis, website updated to fontainebleau-tourisme.com
- [data] Apremont cluster completed — 5 climbing sectors, 2 viewpoints, Chêne Sully, Caverne des Brigands all correctly pinned
- [data] Chalet de la Caverne des Brigands fully enriched with Denecourt origin narrative
- [data] Coordinate corrections: Ô Bout, Galaxie des Arts, point-de-vue-apremont, escalade-apremont-bizons, bus stops
- [data] Three coordinate confirmations resolved: L'Ombrage, Maison Charles Jacque, Villa Albertine

---

## Blockers

- Hero video full edit pending — current clip is placeholder; migrate to Cloudflare Stream when ready

---

## Next Tasks

1. Continue location data entry — nos. 41–63 Grande Rue still unreviewed
2. Confirm Sentier des Peintres starting pin — Place Marc Jacquet or distinct point?
3. Wire artists grid to Supabase — artists + artist_locations schema
4. Source historical postcard images for /history page
5. Update supabase.types.ts to reflect location_functions FK

---

## Next Session Starting Point

Continue Grande Rue data entry from no. 41. Check supabase.types.ts for location_functions.
