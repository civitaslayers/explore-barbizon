> **Format guide:** Status = one sentence present tense. Last Completed = newest first, max 15, area tag in brackets. Blockers = real blockers only. Next Tasks = max 5, priority order, actionable verbs. Update after every significant work block.

# Current State

Last updated: 2026-04-02

## Status

Platform is live with unified place pages (7 places), 9 published stories (6 history + 3 guides), a working content dashboard, and a clean schema foundation for the Civitas multi-town model.

---

## Last Completed

- [frontend] Place editor live — /dashboard/places/[id] edit form + PATCH API /api/places/[id]
- [frontend] Unified place page template live — source: 'place' renders history + function sections + JSON-LD; source: 'location' preserves legacy path
- [schema] places + place_functions tables created; locations.place_id FK added
- [data] 7 unified place records seeded with full historical narratives, SEO fields, og_image_url, and place_functions
- [data] 14 location links established (locations.place_id → places)
- [data] les-pleiades-hotel duplicate deleted; address corrections applied (Galerie Frédéric Got → 19 GR, Maison Barye → 26 GR)
- [content] 4 new stories published: "How the Forest Was Saved", "A Day in Barbizon", "Where to Stay in Barbizon", "Where to Eat in Barbizon"
- [content] Stories layer now 9 published pieces — 6 history essays, 3 guide pieces
- [schema] stories.type column added (history | guide); all 5 existing stories set to history
- [schema] locations.curation_order column added
- [frontend] /stories page split into Essays + "In the village" sections by type
- [frontend] /places page gained curated "Where to eat" + "Where to stay" featured sections
- [data] 10 locations featured and ordered (5 restaurants + 5 hotels) with curation_order
- [data] Villa Albertine + La Bastide de Barbizon added as hotel locations
- [schema] tours gained is_published, tour_type, difficulty; both tours set to published
- [frontend] Dashboard v1 complete — overview, locations list, location editor (PATCH API), stories list, places list

---

## Blockers

- Hero video full edit pending — current clip at /public/videos/hero-barbizon.mp4 is a placeholder; migrate to Cloudflare Stream when ready

---

## Next Tasks

1. Update map to query places — map shows duplicate pins for merged places; use places table with composite function chips on click
2. Write 4 remaining Art & History narratives — Le Dormoir de Lantara, Maison Théodore Rousseau, Médaillon Rousseau-Millet, Musée de L'Esquisse
3. Remove atelier-rouge fictional placeholder location
4. Wire artists grid to Supabase — artists + artist_locations schema prerequisite

---

## Next Session Starting Point

Update map to query places table instead of locations for merged place pins.
