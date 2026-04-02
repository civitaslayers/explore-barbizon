## 2026-04-02
**Decision:** Database proximity guard deployed — trigger blocks inserts/updates placing a pin within 15m of an existing published pin in the same town.
**Reason:** Repeated duplicate pins were being created across sessions, requiring manual cleanup each time. A hard database constraint removes the possibility of accidental duplication.
**Consequence:** Any INSERT or UPDATE on locations that would create a near-duplicate throws a descriptive error. The only way through is setting `allow_proximity_override = true` on both records — a deliberate, documented action. All currently legitimate close pairs (same address, genuinely distinct businesses) have been marked. Migration: `enforce_one_pin_per_location`.
**Migration risk:** low

---

## 2026-04-02
**Decision:** One pin per physical establishment — absolutely no exceptions without allow_proximity_override.
**Reason:** Duplicate pins for the same building (Besharat, La Folie, Les Pléiades, L'Esquisse) were found repeatedly across sessions. The rule must be enforced at the database level, not just as a convention.
**Consequence:** When a location has multiple purposes (gallery + hotel, ATM + post office, heritage + active business), use the single most editorially significant category. Merge all content into one record. Never create two records for the same physical address unless they have genuinely separate entrances and independent identities AND allow_proximity_override is set.
**Migration risk:** none

---

## 2026-04-02
**Decision:** Canonical single pins established for key multi-purpose locations.
**Reason:** Multiple records existed for Besharat, La Folie, Les Pléiades, and L'Esquisse. One authoritative slug per building is the rule going forward.
**Consequence:**
- Besharat → `besharat-gallery-suites` (40 Grande Rue) — covers gallery + 5 suites
- La Folie Barbizon → `la-folie-barbizon-hotel` (5 Grande Rue) — covers hotel + restaurant + heritage
- Les Pléiades → `les-pleiades-heritage` (21 Grande Rue) — covers hotel + spa + restaurant + Daubigny heritage plaque
- L'Esquisse → `lesquisse` (73 Grande Rue) — covers hotel + café + museum
Deleted slugs: besharat-gallery, besharat-suites, la-folie-barbizon-heritage, musee-de-lesquisse, hotel-les-pleiades, maison-barye
**Migration risk:** low

---

## 2026-04-02
**Decision:** Hôtel Le Manoir Saint-Hérem recategorised from Hotel → Heritage Plaque.
**Reason:** The building is abandoned and has been closed for many years. Presenting it as an active hotel would mislead visitors.
**Consequence:** Pin uses Heritage Plaque category (Art & History layer). Description frames it in past tense as a former hotel where Picasso stayed. No phone, no hours, no booking link.
**Migration risk:** none

---

## 2026-04-02
**Decision:** Galerie d'Art, Cemetery, and Point of Interest categories moved to Art & History layer.
**Reason:** These were incorrectly assigned to Eat, Stay & Shop and Practical layers — a data quality error at creation time. Galleries and heritage markers are cultural, not commercial or logistical.
**Consequence:** All locations in these categories now render with the Art & History map icon and colour. categoryGroups.ts already mapped them correctly; the database was out of sync with the frontend expectation.
**Migration risk:** low

---

## 2026-04-02
**Decision:** Mairie map (carte_Barbizon_mairie.pdf) classified as Tier 1 source for street-by-street historical attributions.
**Reason:** Produced by the mairie of Barbizon — an institutional primary source. Historical claims (building lineages, former occupants, name changes) can be stated as fact without cross-verification against other sources.
**Consequence:** Claims sourced from this document do not require the "awaiting verification" caveat used for Tier 3 sources (grappilles.fr, barbizonvillagedespeintres.wordpress.com). Specifically confirmed as Tier 1: Café Bouvard → La Bonne Auberge → La Bohème lineage; Coz Ker (34 GR) as residence of François Millet son then Gustave Eiffel; all Circuit des Lieux Célèbres attributions.
**Migration risk:** none

---

## 2026-04-02
**Decision:** Eiffel/Millet son story belongs to no. 34 (Coz Ker), NOT no. 35 (La Bohème).
**Reason:** The mairie map clearly attributes "COZ KER — François MILLET un des fils de J.F. MILLET habita cette maison avant Gustave EIFFEL" to no. 34. La Bohème is no. 35. The Mahenc blog (Tier 3) had conflated the two adjacent properties.
**Consequence:** La Bohème narrative was corrected to remove the Eiffel/Millet claim. Coz Ker (slug: coz-ker) was created as a Heritage Plaque at no. 34 carrying the correct attribution.
**Migration risk:** none

---

## 2026-04-02
**Decision:** La Juxtaposition (26 GR) — Barye's history goes in the narrative field only, not in the pin name.
**Reason:** The current business is La Juxtaposition. Antoine-Louis Barye's former presence is heritage context, not the identity of the current establishment. Names on pins should reflect what visitors will find today.
**Consequence:** Pin name stays "La Juxtaposition". The narrative field documents that this was Barye's home and studio. The deleted record maison-barye is not to be recreated.
**Migration risk:** none

---

## 2026-04-02
**Decision:** One pin per location regardless of mixed purpose (gallery + hotel, ATM + post office, etc.)
**Reason:** Duplicate pins at the same coordinates create map clutter and editorial confusion. The primary use/identity of the location determines its category.
**Consequence:** When a location has multiple purposes, choose the single most editorially significant category. Never create two records for the same physical address unless they have genuinely separate entrances and independent identities.
**Migration risk:** none

---

## 2026-03-27
**Decision:** Stories is the home for both historical essays and practical-editorial guides (best places to stay, eat, etc.)
**Reason:** Places is a catalogue; Plan Your Visit is logistics. Stories is the only section with an editorial voice capable of holding both cultural depth and curated recommendations.
**Consequence:** Add `type` field to `stories` table with values `history` | `guide`. Stories index can filter or badge by type. Plan Your Visit remains logistics-only.

---

## 2026-03-27
**Decision:** Map sidebar is hidden by default; opens only on pin click or filter activation.
**Reason:** Persistent sidebar reduces map real estate and is not intuitive on mobile. Industry standard for modern map products is a drawer/sheet pattern.
**Consequence:** Desktop: slide-in drawer, dismisses on map click outside. Mobile: bottom sheet with peek state (name + category) expanding to full detail on tap. Map controls remain as floating elements.

---

## 2026-03-27
**Decision:** Map icons must be differentiated at the subcategory level, not the group level.
**Reason:** Group-level icons are not specific enough — a museum and a gallery look identical. Users need to distinguish at a glance.
**Consequence:** Each subcategory slug gets its own icon shape within its layer color. Implementation in `components/MapGL.tsx`.

---

## 2026-03-27
**Decision:** Practical category is excluded from the Places editorial page (`/places`).
**Reason:** Bus stops, parking, and public toilets are map utilities — they do not inspire discovery. The Places page is an editorial catalogue for cultural and commercial locations.
**Consequence:** Filter Practical layer out of the Supabase query in `pages/places/index.tsx`. Practical pins remain fully visible on the map.

---

## 2026-03-27
**Decision:** Public-facing brand is "Visit Barbizon", not "Explore Barbizon".
**Reason:** "Visit..." is shorter, translates better across languages, and scales cleanly to other cities. The domain remains explorebarbizon.com — visitbarbizon.com is currently priced at ~5K, deferred.
**Consequence:** All UI wordmarks, nav headers, page titles, and footer references use "Visit Barbizon".

---

## 2026-03-27
**Decision:** The map is the primary product. All editorial content is a funnel into the map.
**Reason:** Map-first philosophy must be reflected in homepage design and navigation hierarchy.
**Consequence:** Homepage hero leads directly to map CTA above the fold. No text walls above the scroll break.

---

## 2026-03-20
**Decision:** Claude = project lead (strategy, architecture, SQL, content, brain files). Cursor = scoped implementer. GPT and Grok = supplementary only, no authority over task ordering or brain files.
**Reason:** Clearer division of responsibility prevents conflicting instructions and tool sprawl.
**Consequence:** Claude owns the full operating loop. Cursor implements from Claude-written briefs. GPT/Grok consulted for second opinions only.
