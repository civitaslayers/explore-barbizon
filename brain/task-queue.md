# Task Queue

Last updated: 2026-07-17

> **Generated display-only mirror.** The Supabase `tasks` table is the canonical
> work queue (as of 2026-07-15, merge `eb63b7b`). Regenerate from live task state
> via the CCC tasks page **→ brain** button (`/api/brain/sync-tasks`). Hand-edits
> here are provisional until the next sync.

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

- [x] [media] **Media ingestion pipeline + batch 1 ingested** (task `6612dd51`, merge `c62a058` `--no-ff`, SHIP): `scripts/upload-media.mjs` + 17/17 tests; staging → R2 (`-1600`/`-800` WebP q82, EXIF stripped, autoOrient, sRGB) + additive `media` rows. **54 folders, 122 photos, 244 objects, 92 rows, 0 conflicts/errors/failures.** Verified: 97 rows, 0 duplicates, 0 `_general` rows, 3 captions preserved. Staged gate (auberge-ganne first, Luigi-approved) then full batch post-merge.
- [x] [bug/prod] **`remotePatterns` production bug fixed** (same merge): `media.explorebarbizon.com` was missing from `next.config.mjs`, so `next/image` 400'd on every R2 hero — broken live on 2 locations, would have broken all 54. Invisible locally; proven preview-200 vs prod-400, then 200 live. Repairs `dormoir-de-lantara`.
- [x] [frontend] Tour read-paths gated on `is_published` (task `55316745`, merge `c681381`, SHIP): 3 `.eq("is_published", true)` filters in `lib/supabase.ts` (on-demand / build-time / index). Preventive, verified 200 live post-merge.
- [x] [seo] seo-audit length bounds tuned (task `5a286f8c`, merge `d99fa21`, SHIP): title 30–60, desc 110–160 (uppers unchanged). Prod 64/40/2 → 78/26/2. Retires the old "French title-length floor" task.
- [x] [ai-ops] Task-queue dispatch + retrospective shipped to main (merge `eb63b7b`, --no-ff): `tasks` table = canonical queue, this file = generated mirror. Migration applied + verified (`tasks.source`, `execution_status` superset CHECK +queued/at_gate, `outputs.commit_hash`). `/run-loop` Step 1 dispatch / Step 5 at_gate+outputs summary / Step 6 done|blocked / new Step 7 retrospective; `settings.json` allowlist pass; CLAUDE.md governance lines.
- [x] [i18n/seo] i18n + SEO foundation shipped to production (merge `54fa35b`, --no-ff): next-i18next routing, `getLocalized` (10/10 tests), `SeoHead`+JSON-LD, `sitemap.xml.tsx`, `seo-audit.mjs` gate, CCC `TranslationHealthPanel`; Cursor retired from CLAUDE.md + ai-operating-system.md; schema-reference documents translations + `v_translation_health`.
- [x] [ccc-v3] Phase 1 / Phase 2 / Phase 2.1 shipped + both Phase 2 migrations run & verified in production (2026-07-13).
- [x] [i18n/hotfix] `/en/` 500 production regression fixed (merge `812b144`, 2026-07-14, own worktree): next-i18next config passed explicitly at all 11 `serverSideTranslations` sites + `_app` + `outputFileTracingIncludes`. Verified live — all `/en/` routes 200; prod seo-audit 64/40/2, every hreflang/JSON-LD/sitemap check passes. Preview-audit process rule made executable (auth spot-fetch pre-merge; full audit post-merge on public prod).
- [user-action] Luigi: production visual pass on the fiche (`/command-center/atlas/[id]`) + card quick-edit (if not yet done).

---

## Next
*Unblocked; in priority order.*

- [i18n] French content migration (Option B) — **pilot batch queued (`9634d7c4`, 5 entities)**, then the full run: draft French into `translations->'fr'` (status draft) → review in batches → promote (base←fr, en←old base, en hash stamped). Stamp `_meta.source_hash` from `v_translation_health`; never re-implement the hash. Base columns untouched until each batch is promoted.
- [ops] [`82295116`, claude-ai, p4] Fix CCC dashboard blind reads — tasks/outputs/decisions/memory read via the anon client against deny-all RLS, so every read returns `[]` and the dashboard shows "No tasks yet" while the queue holds 70+ rows. Move reads server-side via `lib/supabaseAdmin` behind the existing Basic Auth (the Traductions panel is the working pattern); surface `execution_status` + `source` chips. No RLS changes.
- [ops] [`0b1fd1c4`, claude-ai, p5] `upload-media.mjs --only=<slug>` — no per-location filter exists, so the staged gate ("--execute one location first") isn't expressible; the 2026-07-17 gate needed a temp-dir workaround. Error loudly if the slug has no staging folder (a typo must not read as success). Also the tool for re-ingesting one location after replacing a photo.
- [frontend] Card/`srcset` follow-on — `/places` cards (`pages/places/index.tsx:156`, raw `<img>`) + `MediaStrip` pull the 1600w source (~360–585 kB) into ~320 px slots across 54 locations; `loading="lazy"` bounds the damage. The `-800.webp` variants are already on R2 and unreferenced — a pure string swap off the 1600 URL, no migration, no re-ingest. Must fall back for the 3 legacy rows whose URLs have no variant suffix.
- [content] Content + photo sprint — hours/website/address via the Atlas "sans horaires/adresse" worklist + fiche/card. **Photos: 56/106 locations now have media**; the remaining ~50 are the gap. Also: all 94 new media rows have `caption = null` by design (the pipeline never writes `caption` — it's editorial, set via CCC), so captions are now a content pass with a tool that exists. Includes the ferme-du-couvent description pass (describes the plain, not the farm; verify "à l'ouest" against Tier-1 before publishing).
- [ccc-v3] Phase 3 loop — read-only linked entities (location_functions, tour_stops) on the fiche + absorb-and-delete `/dashboard/locations*` (and legacy `/dashboard/places` + `/api/places/[id]` if dead) + near-dup detector, export, command palette polish.
- [chore] Regenerate `lib/supabase.types.ts` — stale post migrations (missing `translations`, `tours.is_published`, `v_translation_health`, `tasks.source`, `outputs.commit_hash`); CCC panel currently uses a local cast.

---

## Later
*Valid work, not yet prioritised.*

- [ai-ops] [`source='loop'`, task `eb69de89`, `.claude/**`-gated] Extend the deployed-runtime verification class to `next.config.mjs` `images.remotePatterns`. Evidence (2026-07-17): the release-checker read CLAUDE.md's rule and **correctly** concluded the mandatory preview gate didn't apply — the class enumerates locale routing / runtime config / page data methods, and remotePatterns is none of them. But the change had the identical signature the rule exists to catch: `next build` passed with the hostname both present and absent, and the defect was only visible by querying production (`/_next/image?url=…` → 400 while the R2 origin → 200). `next.config.mjs` is now 2-for-2 on locally-invisible production defects (i18n bundling; image remotePatterns). Generalize the class to the shared property, add the `_next/image` → 200 preview check to the release-checker brief. (Third retrospective proposal.)
- [ai-ops] [`source='loop'`, task `760db1c3`] Worktree bootstrap — Turbopack-safe `node_modules` + `.env.local` for fresh worktrees. Evidence across two runs: a bare `ln -s` symlink lets lint/scripts run but makes the default `npm run build` (Turbopack) panic (`points out of the filesystem root`); `next build --webpack` is the fallback. Ship a `worktree-setup` helper or Session-discipline note that survives both lint and a production build. (Second retrospective proposal, refined.)
- [ai-ops] [`source='loop'`, task `05bc2e17`, `.claude/**`-gated] run-loop: assign live-schema introspection to the **lead** (or `civitas-content-ops`, which has `execute_sql`), not `civitas-architect` — the architect's tool allowlist has no Supabase MCP, so it cannot read live schema as run-loop Step 2 implies. Doc/flow fix only; do NOT grant the architect DB access. (First retrospective proposal.)
- [seo/infra] Thread a Vercel **Protection Bypass for Automation** token (`x-vercel-protection-bypass` header) into `scripts/seo-audit.mjs` so the full audit can run against SSO-protected Preview deployments — makes the pre-merge preview gate fully automated (currently pre-merge uses authenticated spot-fetches; full audit runs post-merge against public production). Follow-up from the 2026-07-14 /en/ 500 hotfix.
- [ccc-v3] v3.1 — `location_functions` sub-editor (first editable-linked-entity follow-on).
- [chore] Finish the Cursor-routing prune — `.claude/agents/*` + `.cursor/rules` (CLAUDE.md + ai-operating-system.md done 2026-07-13).
- [content] Reshape object-valued `opening_hours` (epicerie-de-barbizon, galerie-des-pains, muse-galerie) into the string convention — currently preserved + shown read-only in the editor's "Autres entrées".
- [schema] Finish docs/schema-reference.md refresh — translations + `v_translation_health` now documented; still stale on curation_order, place_id/place_functions in generated types, internal_notes/allow_proximity_override/booking_url.
- [frontend] Tighten getStaticProps select on /places and /plan-your-visit — 136 kB page data warning
- [infra] Update middleware → proxy convention ahead of Next.js major upgrade

---

## Blocked
*Cannot proceed until the blocker is resolved.*

*(no tasks)*
