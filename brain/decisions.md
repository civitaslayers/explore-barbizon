## 2026-07-13
**Decision:** French is the canonical source language (Option B). Base columns hold French; all other locales live in a `translations` JSONB column keyed by locale (`en`, later `zh`, `ja`), each carrying translated fields + `meta_title`/`meta_description` + `_meta{source_hash, translated_at, status}`.
**Reason:** Source language should match the default locale and the town's actual language. Cheaper to migrate at 106 locations than at 500. Editorially right for the Office de Tourisme relationship.
**Consequence:** One-time content migration: French drafted into `translations->'fr'` (status draft), reviewed in batches, then promoted — base←fr, en←old base, en hash stamped. Live English base columns remain untouched until each batch is promoted. `v_translation_health` is the single canonical source of staleness-hash logic; writers stamp `_meta.source_hash` from this view, never re-implement.
**Migration risk:** low (additive columns applied 2026-07-13; content swap is batched and reve per record)

---

## 2026-07-13
**Decision:** URL slugs are identical across all locales. `/en/lieux/maison-atelier-millet`, never `/en/millet-house-studio`.
**Reason:** Translated slugs require a mapping table, break shareable URLs, and violate the never-rename-slugs rule. Proper nouns dominate our URLs; keyword value is marginal.
**Consequence:** Locale routing is prefix-only (`fr` default no prefix, `/en/`). `<SeoHead>` emits hreflang alternates + x-default (French) on every page.
**Migration risk:** none

---

## 2026-07-13
**Decision:** Cursor is retired from the workflow. Claude Code + agent loop (/run-loop) replaces it for all implementation.
**Reason:** The agent loop with structural gates (tools allowlists, prod-write-guard) supersedes the Claude→Cursor brief pattern.
**Consequence:** CLAUDE.md, docs/ai-operating-system.md, .claude/agents/*, and brain files must be purged of Cursor routing. Implementation flows: architect plans → implementer/content-ops execute → release-checker reviews → human gate.
**Migration risk:** none

---

## 2026-07-13
**Decision:** Pull the retirement of `pages/command-center/pins.tsx` forward from Phase 3 into Phase 2 of CCC v3. Phase 2 will redirect `/command-center/pins` → `/command-center/atlas?view=map`, then remove `pins.tsx` and its "Éditeur de pins" sidebar entry — leaving one interactive map editor (`AtlasMapView`). Separately, the same amendment adds inline quick-edit of the four practical fields (`address`, `phone`, `website`, `opening_hours`) to the Atlas preview card (same verified changed-fields-only PATCH; audit rows tagged `source_page = '/command-center/atlas#card'`; publishing and editorial copy stay fiche-only).
**Reason:** `AtlasMapView` shipped in Phase 1 as a wholesale extraction of the 930-line `pins.tsx` and passed a 10/10 behaviour-parity checklist at the review gate (marker render, stack fan-out, drag lifecycle, proximity-409 handling, search/pulse, filters, cleanup). With parity verified, keeping a second interactive map editor alive is maintenance surface and drift risk with no user benefit — two editors can diverge and confuse which one is authoritative. Retiring it in Phase 2 (right after the fiche + card land green) rather than waiting for the Phase 3 dashboard sweep collapses to "one map editor" sooner. The card quick-edit is the fast pass for exactly the gaps the completeness worklist surfaces (address/hours/website), keeping the fiche for deep/structural edits.
**Consequence:** `docs/ccc-v3-fiche-plan.md` amended (commit `07fe981`, pushed): IA route table, §1.4, Section 2 + new §2.1 (card quick-edit), audit `source_page` (3.9), all three phase ship-lists/risks, OQ6 resolution, and compliance item 1. Phase 2 now also greps for inbound `/command-center/pins` links and ships a **redirect (not a hard 404)** so bookmarks survive; the removal happens only after the fiche + card re-run green, so there is never a window without an interactive map editor. Phase 3 keeps only the `/dashboard` absorb-and-delete.
**Migration risk:** none from the doc amendment. Phase 2 execution carries the pins-removal risk (dangling links) — mitigated by the redirect + link grep — and the separately-gated 16-row `opening_hours` normalization migration.

---

## 2026-07-10
**Decision:** Adopt verified-write semantics as the standard for all future admin write endpoints, and extend the commit-at-gate rule to ad-hoc agent tasks. Verified-write means: (1) compare persisted vs intended numeric values with an epsilon tolerance (`|a − b| < 1e-9`), never strict `===` on floats; (2) treat the UPDATE's `RETURNING` row as the source of truth, with an independent re-select as a secondary cross-check whose failure does not fail the save; (3) a committed write is NEVER reported as a failed save — a beyond-epsilon divergence returns a distinct `committed: true` "Write COMMITTED — persisted values differ" signal so the operator knows the database changed. Separately, the commit-at-gate discipline (validate → release-checker → commit → HOLD, no push until human approval) now governs one-off agent tasks, not just `/run-loop`.
**Reason:** The pin editor silently moved five production locations: the PATCH verify-compare used strict float equality and returned 500 "verification failed" AFTER the UPDATE had already committed, so the operator saw a failed save while the data had in fact changed. (A prior layer of the same bug: admin writes ran under the anon key and were silent RLS no-ops until the service-role key was wired in.) Truthful, auditable write semantics are now a hard requirement, not a per-endpoint choice. The commit-at-gate flow proved its value repeatedly across the CCC v2 fixes, which ran outside `/run-loop`.
**Consequence:** `pages/api/locations/[id].ts` implements the pattern (`COORD_EPSILON`, returning-row truth, committed-differ response); future admin write endpoints must follow it. Follow-up queued in the `tasks` table: a `pin_moves` audit log recording before/after coords + timestamp on every coordinate PATCH — a tool that writes production data needs a paper trail. Commits `5410b0c` (comparator), `44c4e7d` (service-role key), `b603ec2` (fail-loudly client), plus the pin-editor feature commits, all on main.
**Migration risk:** none — application-layer write semantics only, no schema or data migration.

---

## 2026-07-07
**Decision:** Ship Map Immersion Pass 1 — migrate `components/MapGL.tsx` from the classic `light-v11` style to Mapbox Standard (`mapbox://styles/mapbox/standard`), with all custom layers (pins, clusters, routes) preserved via style slots, 3D terrain (exaggeration 1.2, gated to desktop-class input), and documentary camera choreography (one-time load glide, `pitch: 55` on pin-select flyTo, no idle rotation). Photorealistic 3D tiles were rejected as a design direction — EEA-unavailable and off-brand for the atlas aesthetic. Stylized landmark models (Auberge Ganne, Maison Millet, Maison Rousseau) are deferred to Pass 2, blocked on Luigi's field photos of each façade.
**Reason:** `docs/design-direction.md`'s "Motion & Immersion (2026-07)" section is the design authority; Pass 1 executes its map-immersion principles on the live map for the first time. Went through the full plan → execute → review loop, including one HOLD cycle (a camera-choreography race condition on deep-linked pages and an unflagged control-placement deviation), both fixed and re-verified before human approval.
**Consequence:** `components/MapGL.tsx`, `pages/map.tsx`, and new `lib/mapLight.ts` changed; pushed as commit `0ca295f`. **Pass 1.5 revision, decided after Pass 1 shipped but before this push:** the originally-planned time-synced light (dawn/day/dusk/night matched to real Europe/Paris time, with a user override control) was replaced with a permanent fixed-dawn preset — Luigi's call, for readability and brand fidelity over the more elaborate time-sync behavior. The override control was removed as over-prominent for what the map actually needed. `showPointOfInterestLabels` and `showTransitLabels` are also suppressed via Standard's config API (third-party POI/transit labels compete with the app's own pin system); road labels and house numbers stay on. `docs/design-direction.md` updated to match — time-synced light is now documented as deferred design intent, not shipped behavior.
**Migration risk:** none — frontend/config only, no schema or data changes. Terrain gating uses an explicit `(hover: hover) and (pointer: fine)` heuristic (documented as a proxy, not a real performance measurement) — revisit if real mobile hardware shows terrain degrading frame rate.

---

## 2026-07-05
**Decision:** Execute the DB hygiene migration in production via Supabase MCP — three migrations: `pin_function_search_paths`, `add_covering_indexes_for_fks`, `drop_media_purged_backup_table`.
**Reason:** DDL was drafted by civitas-content-ops during the prior /run-loop run (`scripts/exports/db-hygiene-drafted-sql-20260705.md`) but withheld from autonomous execution per the free-tier gate (no dev branch to test DDL against). A human reviewed the drafted SQL — including the `routes`/`outputs` FK discrepancy flagged against `docs/schema-reference.md` — and ran it directly.
**Consequence:** `set_updated_at` and `check_location_proximity` now have `search_path = public, pg_temp` pinned. Covering indexes added for the 8 previously-unindexed FKs identified in the drafted SQL. `media_purged_20260610` dropped after its export to `scripts/exports/media_purged_20260610_20260705.json` was verified (55 rows, integrity-checked). Supabase advisors re-run post-migration and report clean.
**Migration risk:** none — executed against production directly (no dev branch available on this plan); export snapshot preserved before the DROP.

---

## 2026-07-05
**Decision:** Register the Supabase MCP server project-scoped in `.mcp.json` (hosted remote `mcp.supabase.com`, `project_ref=afqyrxtfbspghpfulvmy`, features: database, docs, debugging, branching; OAuth auth — no token committed). Server name `supabase` → tools resolve as `mcp__supabase__*`, matching the agent allowlists and prod-write-guard matcher.
**Reason:** The agent loop's data track depends on agents having Supabase tools at project scope; user-level registration doesn't travel with the repo. The legacy npx stdio setup silently discovers zero tools and is banned. Feature scoping excludes account/functions/storage (least privilege). merge_branch stays withheld at the agent-allowlist level + blocked by the guard hook.
**Consequence:** `.mcp.json` gains the `supabase` server. `settings.json` gains `enableAllProjectMcpServers: true`. First session must validate via `/mcp` + a `list_tables` smoke test. Branching requires a paid Supabase plan — confirm before relying on the dev-branch sandbox.
**Migration risk:** none

---

## 2026-06-24
**Decision:** Move the implementation loop into Claude Code autonomous subagents. The lead session runs civitas-architect (plan) → civitas-implementer (code) or civitas-content-ops (dev-branch SQL) → civitas-release-checker (review) → STOP at a human gate, via /run-loop. This supersedes the Cursor-led, stop-after-each-step model for Claude Code tasks.
**Reason:** Hand-stepping every change through Cursor is slow; the agents can plan, execute, and review autonomously. The risk (hallucinated facts, silent zero-row UPDATEs, premature publishing) is contained by gating only the irreversible surface, enforced structurally rather than by prompt wording.
**Consequence:** All four agents gained `tools:` allowlists (the gate). civitas-implementer is now Claude-Code-invoked, runs to completion, has no DB tools. civitas-content-ops works on a Supabase dev branch only — no `merge_branch`, never sets `is_published = true`. civitas-release-checker is read-mostly (Bash only for tsc/lint/build). Added `/run-loop` command and `prod-write-guard.sh` PreToolUse hook (blocks prod merge + publish). CLAUDE.md documents the loop; `.cursor/rules/working-style.mdc` scoped to Cursor sessions. Autonomous: code, commits, dev-branch SQL. Human-gated: prod merge, publishing, prod deploy.
**Migration risk:** none

---

## 2026-04-06
**Decision:** R2 media bucket uses locations/{slug}/ prefix, not places/.
**Reason:** The app queries the locations table exclusively. The old places/ folder was a legacy artefact from the dual-table migration period. Bucket structure should mirror the live DB schema.
**Consequence:** All media URLs now follow https://media.explorebarbizon.com/locations/{location-slug}/{filename}. The places/ folder has been retired and deleted. media table records updated accordingly.
**Migration risk:** none

---

## 2026-04-06
**Decision:** Historical public-domain images from institutional sources (Gallica/BnF, Cleveland Museum of Art, etc.) must be downloaded and hosted on R2, not linked externally.
**Reason:** Institutional URLs are unstable over time and can break without notice.
**Consequence:** Download → upload to locations/{slug}/ on R2 → insert media record pointing to media.explorebarbizon.com. Never insert raw Gallica/CMA/museum URLs into the media table.
**Migration risk:** none

---

## 2026-04-06
**Decision:** Lunetier is a distinct ESS category covering both artisan eyewear designers and luxury opticiens.
**Reason:** Mon Oeil (opticien) and L'Atelier de Bérangère (lunetière artisane) are both eyewear specialists — grouping them under Boutique was too generic.
**Consequence:** Category slug: lunetier, layer: Eat Stay & Shop, display_order: 19. Mon Oeil and L'Atelier de Bérangère both assigned to this category.
**Migration risk:** none

---

## 2026-04-03
**Decision:** Migrate `places` + `place_functions` tables to `locations` + `location_functions`. Drop `places` and `place_functions`.
**Reason:** `places` was a parallel spatial table causing silent duplicate pins, stale coordinates, and split query paths. A single `locations` table with `location_functions` for multi-service venues is simpler, safer, and scales correctly to future towns.
**Consequence:** All 8 former `places` entries now live in `locations`. `location_functions` replaces `place_functions` with FK to `locations.id`. Code in `lib/supabase.ts`, `pages/places/[slug].tsx`, dashboard pages, and `pages/api/places/[id].ts` updated. `getMapPins()` now queries `locations` only.

---

## 2026-04-03
**Decision:** `Artist House` category is reserved for historical Barbizon School painters' homes (19th century) only. Living or contemporary artist studios use `Galerie d'Art`.
**Reason:** Prevents miscategorisation of active galleries as historical sites.
**Consequence:** Galerie Atelier Drochon correctly categorised as `Galerie d'Art`. Any future living artist studio follows the same rule.

---

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
