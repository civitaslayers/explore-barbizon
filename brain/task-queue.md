# Task Queue

Last updated: 2026-07-15

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
- [content] Content + photo sprint batch 1 — hours/website/address + photos via the Atlas "sans photo/horaires/adresse" worklist + fiche/card as the tools. Includes the ferme-du-couvent description pass (describes the plain, not the farm; verify "à l'ouest" against Tier-1 before publishing).
- [ccc-v3] Phase 3 loop — read-only linked entities (location_functions, tour_stops) on the fiche + absorb-and-delete `/dashboard/locations*` (and legacy `/dashboard/places` + `/api/places/[id]` if dead) + near-dup detector, export, command palette polish.
- [chore] Regenerate `lib/supabase.types.ts` — stale post migrations (missing `translations`, `tours.is_published`, `v_translation_health`, `tasks.source`, `outputs.commit_hash`); CCC panel currently uses a local cast.

---

## Later
*Valid work, not yet prioritised.*

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
