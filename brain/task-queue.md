# Task Queue

Last updated: 2026-07-13

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

- [x] [i18n/seo] i18n + SEO foundation shipped to production (merge `54fa35b`, --no-ff): next-i18next routing, `getLocalized` (10/10 tests), `SeoHead`+JSON-LD, `sitemap.xml.tsx`, `seo-audit.mjs` gate, CCC `TranslationHealthPanel`; Cursor retired from CLAUDE.md + ai-operating-system.md; schema-reference documents translations + `v_translation_health`.
- [x] [ccc-v3] Phase 1 / Phase 2 / Phase 2.1 shipped + both Phase 2 migrations run & verified in production (2026-07-13).
- [x] [i18n/hotfix] `/en/` 500 production regression fixed (merge `812b144`, 2026-07-14, own worktree): next-i18next config passed explicitly at all 11 `serverSideTranslations` sites + `_app` + `outputFileTracingIncludes`. Verified live — all `/en/` routes 200; prod seo-audit 64/40/2, every hreflang/JSON-LD/sitemap check passes. Preview-audit process rule made executable (auth spot-fetch pre-merge; full audit post-merge on public prod).
- [user-action] Luigi: production visual pass on the fiche (`/command-center/atlas/[id]`) + card quick-edit (if not yet done).

---

## Next
*Unblocked; in priority order.*

- **[BUG — do first] [frontend] tour-pages `is_published` content leak** — `/tours/[slug]` + its `getStaticPaths` are not gated on `is_published`, so unpublished tours are publicly reachable. Gate the path + props on `is_published` (mirror locations/stories). Small, high-priority.
- [content] Content + photo sprint batch 1 — hours/website/address + photos via the Atlas "sans photo/horaires/adresse" worklist + fiche/card as the tools. Includes the ferme-du-couvent description pass (describes the plain, not the farm; verify "à l'ouest" against Tier-1 before publishing).
- [i18n] French content migration (Option B) — draft French into `translations->'fr'` (status draft) → review in batches → promote (base←fr, en←old base, en hash stamped). Stamp `_meta.source_hash` from `v_translation_health`; never re-implement the hash. Base columns untouched until each batch is promoted.
- [ccc-v3] Phase 3 loop — read-only linked entities (location_functions, tour_stops) on the fiche + absorb-and-delete `/dashboard/locations*` (and legacy `/dashboard/places` + `/api/places/[id]` if dead) + near-dup detector, export, command palette polish.
- [chore] Regenerate `lib/supabase.types.ts` — stale post the 2026-07-13 migration (missing `translations`, `tours.is_published`, `v_translation_health`); CCC panel currently uses a local cast.
- [seo] Tune `seo-audit.mjs` French title-length lower bound — the 50-char floor (English-content heuristic) mis-flags short French/proper-noun titles; adjust so real gaps surface without noise.

---

## Later
*Valid work, not yet prioritised.*

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
