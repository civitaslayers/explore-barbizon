# Current State

Last updated: 2026-07-13

## Status

CCC v3 "La Fiche" is underway. The full "La Fiche" plan (`docs/ccc-v3-fiche-plan.md`) passed the human gate on 2026-07-12 — all 7 open questions resolved against live SQL — and its Phase 1 shipped: the **Atlas index** at `/command-center/atlas` (map + list views, preview cards, category-aware completeness scoring with list filters/sort, map↔list linking, and `AtlasMapView` — a wholesale extraction of `pins.tsx` with verified 10/10 behaviour parity). Phase 1 is pushed and **live in production** (deploy READY at commit `07fe981`); read paths only, and `pins.tsx` stays live as the fallback. The Phase 2 scope was amended 2026-07-13 (pins retirement pulled forward from Phase 3; inline quick-edit added to the preview card). Phase 2's loop is HELD pending Luigi's production smoke-test of the Atlas.

---

## Last Completed

- [ccc-v3] Phase 2 scope amendment (commit `07fe981`, pushed): pins retirement pulled forward from Phase 3 → Phase 2 (redirect `/command-center/pins` → `/atlas?view=map`, remove `pins.tsx` + sidebar entry); inline quick-edit of address/phone/website/opening_hours added to the preview card (same verified changed-fields-only PATCH; audit `source_page '/command-center/atlas#card'`). Publishing/editorial stay fiche-only.
- [ccc-v3] Phase 1 Atlas index shipped, reviewed SHIP, pushed & deployed to production (commit `60f0612`): `/command-center/atlas` map+list, `LocationPreviewCard`, `lib/completeness.ts` (category-aware, `location_functions` rollup), completeness band filters + missing-field chips + worst-first sort, map↔list linking. `AtlasMapView` extracted wholesale from `pins.tsx` (10/10 parity checklist). No new deps; `pins.tsx`/`/dashboard`/API untouched.
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

1. **Luigi:** production smoke-test of `/command-center/atlas` (map + list, preview cards, completeness filters). On confirmation → fire Phase 2 `/run-loop`.
2. [ccc-v3] Phase 2 loop — la fiche editor (`/atlas/[id]`) + card quick-edit + hours editor (canonical keys) + 16-row normalization migration (human gate) + `location_edits` table + distinct publish block + pins retirement. Publishing and the migration stop for human approval.
3. [content] ferme-du-couvent description pass (currently describes the plain, not the farm; verify "à l'ouest" claim against a Tier-1 source before publishing) — now surfaced by the Atlas completeness worklist.
4. [content] Photo sprint batch 1 with hours/website/address collection — the Atlas "sans photo/horaires/adresse" filters are the worklist.

---

## Next Session Starting Point

Phase 2 loop — la fiche + card quick-edit, per the amended plan (`docs/ccc-v3-fiche-plan.md`). **HELD**: do not fire until Luigi confirms the production smoke-test of `/command-center/atlas`. On confirmation, run `/run-loop` for Phase 2; the 16-row hours migration and any `is_published` change stop at the human gate.
