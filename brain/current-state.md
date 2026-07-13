# Current State

Last updated: 2026-07-13

## Status

CCC v3 "La Fiche" Phases 1, 2, and 2.1 are shipped and **live in production**. The Atlas surface (`/command-center/atlas`) now carries: map + list views, preview cards with completeness, the full **fiche** editor (`/command-center/atlas/[id]`), **card quick-edit** of practical fields, the `OpeningHoursEditor` + parent-field public renderer, the extended verified-write PATCH with a `location_edits` audit insert, the distinct publish block, and **pins retirement** (`pins.tsx` deleted, `/command-center/pins` → 308 redirect; `AtlasMapView` is the sole interactive map editor). Phase 2.1 fixed the committed-but-diverged write-truthfulness gap on all three of AtlasMapView's coordinate-write paths. Both human-gated migrations were **run and verified in production** (2026-07-13): the `location_edits` audit table exists, and `opening_hours` keys are canonicalized (16 rows intact, 0 full-word keys remaining, object-values preserved). Publishing (`is_published`) is live in the UI but remains Luigi's manual act. **Awaiting Luigi's production visual pass** on the fiche + card.

**Parallel i18n thread (in flight, decided 2026-07-13 — see decisions.md):** French is the canonical source language (Option B). Additive `translations` JSONB columns (keyed by locale, with per-locale `_meta{source_hash, translated_at, status}`) were **already applied to the DB on 2026-07-13**; a `v_translation_health` view is the single source of staleness-hash logic, and `<SeoHead>` emits hreflang + x-default. The one-time French content migration (draft French into `translations->'fr'`, review in batches, then promote base←fr / en←old base) is **not yet done** — batched content work still pending. Locale routing is prefix-only (`fr` default, `/en/`), slugs identical across locales.

---

## Last Completed

- [ccc-v3] Both Phase 2 migrations run + verified in production via Supabase MCP (2026-07-13): `location_edits` audit table created (shape matches the API's audit insert); `opening_hours` normalized to canonical `mon…sun` keys — 16 rows intact, 0 full-word keys remaining, `check_in`/`check_out`/`default`/`eve_of_holidays` and object-valued rows preserved verbatim. Before-state dump captured in `migrations/normalize_opening_hours_keys.sql`.
- [ccc-v3] Phase 2.1 (commit `3491d51`, review SHIP): committed-but-diverged write handling applied to all three of `AtlasMapView`'s coordinate-write paths (drag / override-retry / revert) — marker now snaps to persisted `after` coords and surfaces the divergence instead of falsely reverting. Fixes a pre-existing bug inherited from the retired `pins.tsx`, now that AtlasMapView is the sole map editor.
- [ccc-v3] Phase 2 la fiche shipped (commits `5c1fd45`, `13d7cae`, `eb61ba7`; HOLD→fix→SHIP): fiche editor (`/atlas/[id]`) with draggable position mini-map, content/practical/flags/internal-notes/media-read-only/edit-history sections; card quick-edit (address/phone/website/opening_hours); `OpeningHoursEditor` (canonical `mon…sun` + French labels, tolerant of object-valued hours); parent-field public renderer on `/places/[slug]`; extended verified-write PATCH (+5 ALLOWED_FIELDS, per-field `location_edits` audit that can't fail the committed write); distinct publish block; pins retirement (redirect + delete). No new deps.
- [ccc-v3] Phase 2 scope amendment (commit `07fe981`, pushed): pins retirement pulled forward Phase 3 → Phase 2; card quick-edit added. Publishing/editorial stay fiche-only.
- [ccc-v3] Phase 1 Atlas index shipped, SHIP, deployed to production (commit `60f0612`): `/command-center/atlas` map+list, `LocationPreviewCard`, `lib/completeness.ts` (category-aware, `location_functions` rollup), completeness filters + worst-first sort, map↔list linking. `AtlasMapView` extracted wholesale from `pins.tsx` (10/10 parity).
- [i18n] i18n architecture decided + schema groundwork applied (2026-07-13, parallel session): French = canonical source (Option B) with additive `translations` JSONB columns (per-locale `_meta` staleness hashes) applied to the DB; `v_translation_health` view is the canonical staleness source; `<SeoHead>` hreflang + x-default; prefix-only locale routing (`fr` default, `/en/`); slugs identical across locales. French content migration (draft → review → promote) still pending.
- [decisions] Two further parallel-session decisions recorded (2026-07-13): locale-identical slugs (no translated slugs); Cursor retired — Claude Code /run-loop is the sole implementation path.
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
- Supabase branching unavailable on free tier — DDL/migrations run via the human-gated direct-migration path against production (no dev branch to test against). Both Phase 2 migrations + the i18n `translations` columns were applied this way 2026-07-13.

---

## Next Tasks

1. **Luigi:** production visual pass on the fiche (`/command-center/atlas/[id]`) + card quick-edit once the Phase 2/2.1 deploy is green. (Both migrations already run + verified 2026-07-13.)
2. [content] Photo sprint batch 1 with hours/website/address collection — the Atlas "sans photo/horaires/adresse" filters are the worklist; the fiche + card quick-edit are now the tools to fill them.
3. [content] ferme-du-couvent description pass (describes the plain, not the farm; verify "à l'ouest" against a Tier-1 source before publishing).
4. [i18n] French content migration — draft French into `translations->'fr'` (status draft), review in batches, then promote (base←fr, en←old base, en hash stamped). Writers stamp `_meta.source_hash` from `v_translation_health`, never re-implement the hash. Schema groundwork already applied; the batched content work is the open piece.
5. [ccc-v3] Phase 3 — read-only linked entities (location_functions, tour_stops) on the fiche + absorb-and-delete `/dashboard/locations*` (+ legacy `/dashboard/places`, `/api/places/[id]` if dead) + near-dup detector / export / command-palette polish.
6. [chore] Prune Cursor routing from CLAUDE.md, `docs/ai-operating-system.md`, `.claude/agents/*`, and brain files (per the 2026-07-13 Cursor-retired decision).

---

## Next Session Starting Point

CCC v3 Phase 2 + 2.1 are live and both migrations are done; the immediate open item is **Luigi's production visual pass** on the fiche + card. After that, pick the next thread: the **i18n French content migration** (batched draft→review→promote against the already-applied `translations` columns), CCC v3 **Phase 3** (linked entities read-only + absorb-and-delete `/dashboard`), or the content/photo sprint using the Atlas completeness worklist.
