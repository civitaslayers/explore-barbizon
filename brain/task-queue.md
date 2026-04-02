# Task Queue

Last updated: 2026-04-02

Tasks are ordered by priority within each section.
Move tasks between sections as status changes.
Update this file whenever work is completed or blockers are resolved.

Task tags:
- frontend
- schema
- data
- sql
- infra
- user-action

---

## Now
*Unblocked tasks that can be started immediately.*

- [user-action] Provide verified coordinates for L'Ombrage (18 GR), Maison Charles Jacque (24 GR), Villa Albertine (33 GR) — proximity guard is blocking these three records until coordinates are correct
- [user-action] Confirm whether Sentier des Peintres and Parcours des Mosaïques correctly share the Place Marc Jacquet parking pin — or if Sentier has a distinct starting point
- [data] Continue location data entry — next unreviewed stretch is nos. 41–63 Grande Rue

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [frontend] Verify coordinates for four trail pins — Futaie du Bas-Breau, Parcours FB, Sentier bleu no.6, Sentier des Peintres
- [schema] Wire artists grid to Supabase — design artists + artist_locations tables, seed initial artist records
- [data] Source historical postcard images for /history page
- [frontend] Expand /about to absorb practical visitor content (getting here, seasons, accessibility)
- [frontend] Large-screen layout width refinement — audit place detail and index pages on viewports >1280px
- [frontend] Place page visual refinement — polish pages/places/[slug].tsx layout, image treatment, related section

---

## Later
*Valid work, not yet prioritised.*

- [data] Write sixth essay — the 1861 forest conservation story (Rousseau + Napoléon III decree)
- [data] Remove atelier-rouge placeholder location
- [frontend] Replace data/tours.ts with live Supabase query
- [frontend] Stories page: wire stories table to pages/stories/index.tsx
- [data] Add real place images — source and drop optimised JPGs into /public/images/places/
- [user-action] visitbarbizon.com domain acquisition (deferred — currently ~5K)

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [user-action] Hero video — full edit pending; current /public/videos/hero-barbizon.mp4 is a placeholder. Migrate to Cloudflare Stream or Vimeo Pro when ready.

---

## Completed this session (2026-04-02)
*For reference — do not re-do these.*

- [data] Proximity guard migration deployed (enforce_one_pin_per_location) — trigger + allow_proximity_override column
- [data] All duplicate pins eliminated: besharat-gallery, besharat-suites, la-folie-barbizon-heritage, musee-de-lesquisse, maison-barye, hotel-les-pleiades
- [data] Canonical pins confirmed: besharat-gallery-suites, la-folie-barbizon-hotel, lesquisse, les-pleiades-heritage
- [data] Galerie d'Art / Cemetery / Point of Interest categories moved to Art & History layer
- [data] 8 new locations from mairie map: Coz Ker, Mairie, L'Ombrage, La Poste, Villa Élisabeth, Tumble Inn, Manoir Saint-Hérem (heritage plaque), Villa Bernard
- [data] Manoir Saint-Hérem recategorised Hotel → Heritage Plaque (abandoned building)
- [data] Galerie 39, Besharat Gallery & Suites, Arte Milenario (Rolando Arevalo), La Bohème inserted
- [data] La Bohème narrative corrected — Eiffel/Millet son claim removed, correctly attributed to Coz Ker (34 GR)
- [data] ATM/La Poste duplicate consolidated — atm-poste-barbizon deleted
- [data] 15+ coordinate corrections applied with verified Luigi GPS values
- [data] 6 existing narratives enriched from mairie map (Bas-Bréau Hôtel Siron, La Juxtaposition, Cercle Laure Henry, Maison Charles Jacque, Maison de Rousseau, La Folie heritage)
- [data] Mairie map (carte_Barbizon_mairie.pdf) fully processed as Tier 1 source
