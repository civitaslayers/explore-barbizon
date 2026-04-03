> **Format guide:** Status = one sentence present tense. Last Completed = newest first, max 15, area tag in brackets. Blockers = real blockers only. Next Tasks = max 5, priority order, actionable verbs. Update after every significant work block.

# Current State

Last updated: 2026-04-02

## Status

Major location data entry session complete — 20+ locations inserted or corrected, all known duplicates eliminated, a database-level proximity guard deployed, and the mairie map fully processed as a Tier 1 source.

---

## Last Completed

- [data] Verified and inserted coordinates for L'Ombrage (18 GR), Maison Charles Jacque (24 GR), Villa Albertine (33 GR) — proximity guard cleared for all three
- [data] Proximity guard migration deployed — trigger blocks any new pin within 15m of existing pin unless allow_proximity_override = true; all legitimate close pairs marked
- [data] All known duplicate pins eliminated — besharat-gallery, besharat-suites, la-folie-barbizon-heritage, musee-de-lesquisse, maison-barye, hotel-les-pleiades all deleted
- [data] Canonical single pins confirmed: besharat-gallery-suites (40 GR), la-folie-barbizon-hotel (5 GR), lesquisse (73 GR), les-pleiades-heritage (21 GR covers hotel+spa+restaurant+heritage+Daubigny)
- [data] Coordinates verified and corrected for 15+ locations this session — Le Gaulois, Boucherie Angélus, Épicerie Végétale, Via Veneto, La Bohème, Nunchi, Parcours Mosaïques, Sentier des Peintres, Office de Tourisme, Bus stop Angélus, La Folie Barbizon, Les Pléiades, L'Ombrage, Tumble Inn, Manoir Saint-Hérem
- [data] Galerie d'Art / Cemetery / Point of Interest categories corrected to Art & History layer (were wrongly in ESS/Practical)
- [data] 8 new heritage/POI locations inserted from mairie map — Coz Ker (34), Mairie (13), L'Ombrage (18), La Poste (20), Villa Élisabeth (30), Tumble Inn (4 rue René Ménard), Manoir Saint-Hérem (14 rue JF Millet, heritage plaque — abandoned), Villa Bernard
- [data] Hôtel Le Manoir Saint-Hérem recategorised from Hotel → Heritage Plaque (building is abandoned and closed for many years)
- [data] Galerie 39, Besharat Gallery & Suites, Arte Milenario (Rolando Arevalo), La Bohème inserted with full descriptions, verified contact details, opening hours
- [data] La Bohème narrative corrected — Eiffel/Millet son claim removed (belongs to no. 34 Coz Ker next door); Café Bouvard → La Bonne Auberge → La Bohème lineage confirmed Tier 1
- [data] 6 existing narratives enriched from mairie map — Bas-Bréau (Hôtel Siron correction), La Juxtaposition (Barye history in narrative only, not name), Cercle Laure Henry, Maison Charles Jacque, Maison de Rousseau, La Folie heritage
- [data] Mairie map (carte_Barbizon_mairie.pdf) fully processed as Tier 1 source — all Circuit des Lieux Célèbres entries cross-referenced
- [data] Duplicate ATM/La Poste consolidated — atm-poste-barbizon deleted, la-poste-barbizon kept

---

## Blockers

- Hero video full edit pending — current clip at /public/videos/hero-barbizon.mp4 is placeholder; migrate to Cloudflare Stream when ready

---

## Next Tasks

1. Continue location data entry down the Grande Rue — next unreviewed stretch is roughly nos. 41–63
2. Verify coordinates for four trail pins — Futaie du Bas-Breau, Parcours FB, Sentier bleu no.6, Sentier des Peintres (currently shares pin with Parcours Mosaïques at Place Marc Jacquet parking — confirm this is correct)
3. Wire artists grid to Supabase — artists + artist_locations schema prerequisite
4. Source historical postcard images for /history page

---

## Next Session Starting Point

Provide the three outstanding coordinates (L'Ombrage, Maison Charles Jacque, Villa Albertine), then continue location data entry from no. 41 Grande Rue northward.
