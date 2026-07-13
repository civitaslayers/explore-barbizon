# Current State

Last updated: 2026-07-13

## Status

CCC v3 "La Fiche" Phases 1, 2, and 2.1 are code-complete and passed release review (Phase 2 through a HOLD→fix→SHIP cycle). Phase 1 (the Atlas index) is live in production. Phase 2 + 2.1 are committed on local `main`, **about to be pushed** (deploys them together): the full **fiche** editor (`/command-center/atlas/[id]`), **card quick-edit** of practical fields, the `OpeningHoursEditor` + parent-field public renderer, the extended verified-write PATCH with a `location_edits` audit insert, the distinct publish block, and **pins retirement** (`pins.tsx` deleted, `/command-center/pins` → 308 redirect; `AtlasMapView` is now the sole interactive map editor). Phase 2.1 fixed the committed-but-diverged write-truthfulness gap on all three of AtlasMapView's coordinate-write paths (inherited pre-existing bug from the retired `pins.tsx`). Two human-gated migrations are drafted and pending run: the `location_edits` table and the `opening_hours` key canonicalization. Publishing (`is_published`) is live in the UI but remains Luigi's manual act.

---

## Last Completed

- [ccc-v3] Phase 2.1 (commit `3491d51`, review SHIP): committed-but-diverged write handling applied to all three of `AtlasMapView`'s coordinate-write paths (drag / override-retry / revert) — marker now snaps to persisted `after` coords and surfaces the divergence instead of falsely reverting. Fixes a pre-existing bug inherited from the retired `pins.tsx`, now that AtlasMapView is the sole map editor.
- [ccc-v3] Phase 2 la fiche shipped (commits `5c1fd45`, `13d7cae`, `eb61ba7`; HOLD→fix→SHIP): fiche editor (`/atlas/[id]`) with draggable position mini-map, content/practical/flags/internal-notes/media-read-only/edit-history sections; card quick-edit (address/phone/website/opening_hours); `OpeningHoursEditor` (canonical `mon…sun` + French labels, tolerant of object-valued hours); parent-field public renderer on `/places/[slug]`; extended verified-write PATCH (+5 ALLOWED_FIELDS, per-field `location_edits` audit that can't fail the committed write); distinct publish block; pins retirement (redirect + delete). No new deps.
- [ccc-v3] Phase 2 scope amendment (commit `07fe981`, pushed): pins retirement pulled forward Phase 3 → Phase 2; card quick-edit added. Publishing/editorial stay fiche-only.
- [ccc-v3] Phase 1 Atlas index shipped, SHIP, deployed to production (commit `60f0612`): `/command-center/atlas` map+list, `LocationPreviewCard`, `lib/completeness.ts` (category-aware, `location_functions` rollup), completeness filters + worst-first sort, map↔list linking. `AtlasMapView` extracted wholesale from `pins.tsx` (10/10 parity).
- [decisions] Three parallel-session decisions recorded (2026-07-13): French is the canonical content language; slugs are locale-independent (one slug per location); Cursor retired — Claude Code /run-loop is the sole implementation path.
- [ccc-v3] "La Fiche" plan authored (architect → release-checker SHIP) and **human gate passed 2026-07-12**; all 7 OQs resolved via live SQL: `stories` confirmed a LIVE table (no story↔location join → mentions omitted in v3), `opening_hours` keys are mixed live → canonicalise to lowercase-English + French display (16-row normalization migration queued for Phase 2), Feature 8 (geocode-assist) dropped.
- [ccc] CCC v2 complete — fail-closed auth over API routes, service-role verified writes, pin editor with stack handling/search/inspector/address display, sidebar link.
- [data] Root cause of silent saves found and fixed twice: (a) anon-key writes were RLS no-ops, (b) comparator false-500s on float equality — a committed write is never again reported as failed.
- [data] Full manual pin verification pass by Luigi (~50 pins re-placed via editor); Barjole/Roz separated; le-royal confirmed correct. Published count 106 (107 location rows total).
- [data] plaine-angelus-ferme-couvent renamed to ferme-du-couvent (slug + name); duplicate rocher-elephant DELETED (snapshot preserved: 48.4415,2.6195, viewpoint).
- [schema] places + place_functions tables dropped — data migrated to locations + location_functions.
- [map] GeolocateControl added to MapGL.tsx — real-time GPS dot with heading cone.
- [data] DB hygiene migration executed in production (pin_function_search_paths, add_covering_indexes_for_fks, drop_media_purged_backup_table); advisors verified clean.
- [map] Map Immersion Pass 1 shipped — Mapbox Standard style, 3D terrain, camera choreography; commit 0ca295f. Pass 1.5: permanent dawn preset, override control removed, POI/transit labels suppressed.
- [ai-ops] Agent loop installed — tools allowlists, /run-loop, prod-write-guard, project-scoped Supabase MCP; proven across multiple cycles incl. HOLD → fix → SHIP.

---

## Blockers

- Hero video full edit pending — current clip is placeholder; migrate to Cloudflare Stream when ready
- Supabase branching unavailable on free tier — the Phase 2 `location_edits` table + 16-row hours normalization migration run via the human-gated direct-migration path (no dev branch to test DDL against)

---

## Next Tasks

1. [ccc-v3] After the Phase 2/2.1 push deploys: **Claude runs the two migrations from origin via Supabase MCP** — `create_location_edits.sql` first, then `normalize_opening_hours_keys.sql`, each with verification (Luigi-authorized 2026-07-13). Then **Luigi** does the production visual pass on the fiche + card.
2. [content] Photo sprint batch 1 with hours/website/address collection — the Atlas "sans photo/horaires/adresse" filters are the worklist; the fiche + card quick-edit are now the tools to fill them.
3. [content] ferme-du-couvent description pass (describes the plain, not the farm; verify "à l'ouest" against a Tier-1 source before publishing).
4. [ccc-v3] Phase 3 — read-only linked entities (location_functions, tour_stops) on the fiche + absorb-and-delete `/dashboard/locations*` (+ legacy `/dashboard/places`, `/api/places/[id]` if dead) + near-dup detector / export / command-palette polish.
5. [chore] Prune Cursor routing from CLAUDE.md + stale `.cursor/rules` (per the 2026-07-13 Cursor-retired decision).

---

## Next Session Starting Point

Post-deploy migrations + visual pass: run `create_location_edits.sql` then `normalize_opening_hours_keys.sql` via Supabase MCP (with verification) once the Phase 2/2.1 deploy is green, and support Luigi's production visual pass on the fiche/card. After that lands clean, the next build loop is CCC v3 **Phase 3** (linked entities read-only + absorb-and-delete `/dashboard`).
