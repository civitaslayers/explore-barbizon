---

## 2026-10-20
_Luigi's morning bug review with claude.ai, 2026-10-20 (PR #77)._

### The About page names Luigi Pérez as the creator, not the gallery
**Decision:** The About page (`/about`) names Luigi Pérez personally as the creator of Visit Barbizon. It does not mention Besharat Gallery.
**Reason:** Luigi's call. The page speaks for the project and its author, for the general public.
**Consequence:** The where-to-stay guide's transparency line (Luigi's decision of 2026-10-05, recorded in `brain/current-state.md`, not as an entry in this log) is unchanged.

---

### No public copy on paid placement, sponsorship or listing policy until monetisation is decided
**Decision:** Public copy says nothing about paid placement, sponsorship or listing policy until monetisation is decided.
**Reason:** Luigi's call: the business model is not decided, so the site makes no statement about it.
**Consequence:** The About rewrite of 2026-10-20 leaves these topics out; any later copy on them waits for a monetisation decision in this log.

---

### Félix Ziem's presence in Barbizon is confirmed by a plaque
**Decision:** Félix Ziem's presence in Barbizon is confirmed by a plaque photographed by Luigi (`research_findings` row, subject "Félix Ziem"). Ziem is added to the /history painters list (1821–1911, no place link).
**Reason:** A photographed plaque on site is the source for the claim.
**Consequence:** The /history note says only that he came to Barbizon and that a plaque recalls him.

---

### Every new public table gets explicit grants in the same migration (task e342da15, claude.ai 2026-10-20)
**Decision:** Every `create table` in `public` is followed, in the same migration, by: RLS enabled; `revoke all ... from anon, authenticated, service_role`; then either public-read grants (`select` to anon, authenticated) with a matching select policy, or internal grants (service_role only, like `page_views`). `service_role` is always granted explicitly (`select, insert, update, delete`). The pattern lives in `migrations/_TEMPLATE.sql`, and the rule in `docs/schema-reference.md` ("Migration rule: explicit grants on every new public table"). civitas-release-checker marks a migration that creates a public table without this grant decision NO SHIP.
**Reason:** Supabase changelog 45329: from 2026-10-30 new public tables and sequences in existing projects no longer get automatic Data API grants for anon, authenticated or service_role. Today our `pg_default_acl` (owners postgres and supabase_admin) still grants ALL on new tables to all three roles, so RLS is the only barrier. The explicit revoke-then-grant makes a migration mean the same thing before and after the switch, and closes default anon write grants on new tables.
**Consequence:** A table created without grants after 2026-10-30 is invisible to supabase-js; app fallbacks (for example story_locations to `data/relatedStories.ts`) would hide this silently. Existing tables keep their current grants, which are wider than needed (anon holds write grants, gated only by RLS); tightening them is a separate task. New views and functions are not covered yet. The rule binds claude.ai's direct MCP DDL too, which never passes the release checker.
**Migration risk:** none (template and docs; no live schema change).

## 2026-10-18

### Vercel skips builds for docs-only commits; brain/ still builds (Luigi, 2026-10-18)
**Decision:** `vercel.json` sets `ignoreCommand` so a deployment is skipped when nothing outside `docs/**` changed since the branch's last successful deployment (`VERCEL_GIT_PREVIOUS_SHA`). Option B of `docs/audits/2026-10-18-v3-ignored-build-step.md`, narrowed to `docs/**` only.
**Reason:** The 19 night docs PRs of 2026-10-18 produced 19 production builds with no code change. `brain/**` is not excluded because `pages/api/tasks/suggest.ts` reads `brain/current-state.md` from the deployed build.
**Consequence:** Docs-only PRs show the Vercel check as skipped, not green; the night PR merge rule accepts "skipped" for docs-only PRs. The command fails safe: an empty previous SHA, or one missing from Vercel's shallow clone, builds. A Dashboard Ignored Build Step setting, if ever added, is overridden by `vercel.json`.
**Migration risk:** none (build config only; no page data method, locale routing or runtime config touched).

### Writing and translation: French written natively, other languages adapted, native read before publishing (Luigi, 2026-10-18)
**Decision:** All visitor-facing copy follows `docs/content/writing-guide.md` and `docs/content/glossary.md`, through the `barbizon-writing` skill. Order of work: sourced fact outline, French drafted natively from it, native edit by the `civitas-native-editor` agent (French alone), English adapted from the edited French (never sentence by sentence), native edit of the English, fact parity check, then Luigi reads FR and EN in context before `_meta.status = 'published'`. Prose is drafted with Opus or Fable, not Sonnet. A new locale (it, zh, ja) needs a checked glossary column and a named native reviewer before any drafting.
**Reason:** Luigi found the published French reads translated (« Des pièces de lumière dans un village de forêt », « la manière de voir de Barbizon »). The stories were composed in English and rendered into French word for word, despite the earlier decision that French is written natively. Calques of this kind run through all ten stories and likely many location texts, and would multiply with Mandarin.
**Consequence:** Task 77e02c3f (story subtitles) and 1a2205a7 (15 location_functions) go back through this workflow before approval. A translationese audit ranks every published text so Luigi re-reads the worst first. `civitas-content-ops` reads the guide before drafting copy.
**Migration risk:** none (process and docs only).

### Place card thumbnails: photo first, static map fallback (/places grid, PR #70)
**Decision:** Every place card thumbnail renders the place's first photo (`media.url` by `display_order`, the `heroImage` that getPublishedLocations already loads) with the 800w/1600w webp pair, `object-cover`, lazy loading and the place name as alt text. The Mapbox Static map is only the fallback when a place has no photo, and the plain tinted block is the fallback when Mapbox is not configured.
**Reason:** The /places grid always rendered the static map, so no grid card ever showed a photo even though the CuratedSection cards on the same page did. Luigi's call, 2026-10-18.
**Consequence:** The gradient under the card text is slightly stronger on photo cards (from-ink/80 via-ink/30) so the cream text stays readable; map cards keep from-ink/75 via-ink/20. Supersedes the 2026-03-21 note that the Mapbox Static API is used for place card thumbnails.
**Migration risk:** none; no page data method changed.

## 2026-10-13

### Published claims get a source check before they are cut (Luigi, 2026-10-13)
**Decision:** Text already on the site was written from something an earlier session read, even when the source was not noted. Before a rewrite removes or changes any published claim, run a targeted search for that claim in at least two source families (period press, books, archives, heritage databases). If a source supports it, keep it and record the source in `research_findings`. If the check finds nothing, the claim may leave the public text, but it is never simply deleted: it is recorded in `research_findings` as `open` (with the searches tried) and noted in `internal_notes`. A claim contradicted by a stronger source is recorded as `refuted`. The approval draft shown to Luigi lists, for each removed claim, which of these three cases applies.
**Reason:** The Diaz rewrite of 2026-10-13 proposed dropping four details that a second look then supported (viper bite, generosity to Rousseau and Millet, collectors competing for his work). Cutting unchecked content loses research and sends the next session round in circles.
**Consequence:** Rewrites take one extra search pass per removed claim. Earlier AI-written text without any source (e.g. the Bas-Bréau « hunting lodge ») still goes, but only after the check and with an `open` or `refuted` row.
**Migration risk:** none

### Research findings live in `research_findings`; search it before any new research (Luigi, 2026-10-13)
**Decision:** Every historical finding, lead, open question and refuted claim is stored as one row in `public.research_findings` (subject, optional `location_id` / `story_id`, claim, status, method, source title/date/page/ref/url, verbatim quote, notes, dossier path). Status values: `confirmed` (period source read), `lead` (OCR, snippet, secondary, single source), `oral` (testimony), `open` (unanswered or pending check), `refuted` (shown wrong or unsupported). The narrative dossiers in `docs/sources/*.md` stay as the long-form record; the table is the searchable index. Any session (claude.ai, Claude Code, nightly loop) researching a subject first queries the table (full-text index on subject, claim, quote, source title, notes), and writes its new findings to it in the same session, with the dossier path.
**Reason:** Luigi asked that research never be done twice. Facts were scattered across eight dossiers and `internal_notes`, and the same searches were being repeated.
**Consequence:** Table created by claude.ai via MCP on 2026-10-13 (`migrations/create_research_findings.sql`), RLS deny-all, service role only, never exposed publicly. Backfilled with 290 rows from the eight dossiers dated 2026-10-09 to 2026-10-12 (107 confirmed, 121 lead, 35 open, 20 refuted, 7 oral). `internal_notes` keeps a short summary per location and points to the table or dossier.
**Migration risk:** low (new table only)

---

## 2026-10-12
_Night 6 (nightly loop, Fable 5.1), seven `night6/*` branches (PRs #21–#27) staged on `merge/night6` and fast-forwarded to main as `aba9df7`. Decision texts summarised from the PR bodies and `docs/briefs/2026-10-11-night.md`._

### Fonts are self-hosted; no Google Fonts request from the site (task 3afc344b)
**Decision:** Inter and Newsreader load through `next/font/local` from the `@fontsource-variable/inter` and `@fontsource-variable/newsreader` packages (the only new dependencies), exposed as `--font-inter` / `--font-newsreader`; the Google Fonts `<link>` tags are gone from `_document.tsx`.
**Reason:** The nightly sandbox could not run `next build` because the Google Fonts fetch is blocked, and every visitor page load was making a request to Google. Option (b) of the ops proposal, chosen by Luigi 2026-10-11.
**Consequence:** `next build` now passes the fonts step everywhere; the remaining sandbox build blocker is Supabase egress at page-data collection. Fontsource's latin Newsreader has `wght` only, not `opsz`; if large italics look off, the fix is the `opsz`-bearing file, not a return to Google.
**Migration risk:** none

### My day usage is counted as four anonymous events in `product_events` (task 068cfc3d)
**Decision:** `myday_add`, `myday_share_created`, `myday_shared_opened`, `myday_shared_saved`, sent as `{event, locale}` to `/api/track` (second body shape), stored in `public.product_events` (event, locale, device, occurred_at; RLS deny-all, service_role only). No slugs, identifiers or query strings. Insert failures are non-fatal and logged.
**Reason:** The 2026-10-06 decision defers the 1A mobile shell until v0 usage is observed; `page_views` drops query strings and My day lives in localStorage, so usage was invisible.
**Consequence:** Migration applied to production by claude.ai 2026-10-12 after the merge. Reading the counts is a service-role query; nothing public.
**Migration risk:** low (new table only)

### Map tips: static GeoJSON in the repo until there are three or more tips (task 5e8e23cf, plan only)
**Decision:** The Allée John Constable shortcut will be drawn from a static GeoJSON file with its own `map-tips` source and a dashed `tip-line` layer following the `my-day` pattern; a `map_tips` table only once three or more tips exist; the `routes` table is never reused for tips. Mosaics in the allée become ordinary `locations` pins.
**Reason:** Lightest option for one tip; `routes` is the walking-tour model.
**Consequence:** No code yet. `docs/plans/map-tips-layer.md` lists the six coordinates/facts Luigi must supply or confirm on site; the mosaic category needs a `CATEGORY_ICON` entry in `MapGL.tsx` or falls back to the museum icon.
**Migration risk:** none

### Image remote patterns are only the hosts in use (task eb69de89)
**Decision:** `next.config.mjs` `images.remotePatterns` keeps `api.mapbox.com` and `media.explorebarbizon.com` only; `**.supabase.co` and `images.unsplash.com` removed after a production query showed every `media.url` (97) and `stories.cover_image_url` (9) on the R2 host and no code reference to either removed host.
**Reason:** Unused allow-listed image hosts are a silent dependency; the file has already caused one serverless regression, so it stays minimal and hardcoded.
**Consequence:** Any new image host needs an explicit pattern. `scripts/seo-audit.mjs` gained the Vercel protection-bypass header (env `VERCEL_AUTOMATION_BYPASS_SECRET`) in the same change.
**Migration risk:** none

## 2026-10-09
_Overnight session 4 (Fable 5.1), seven `overnight4/*` branches staged on `merge/overnight4` and merged to main 2026-10-09 as `3c39fbb` together with the day/governance-2026-10-09 branch. Decision texts carried verbatim from the session report (`~/overnight-report-2026-10-09.md` on Luigi's Mac, job sections and appendix); job 3 (heritage plaques dossier) and job 5 (/map h1 + skip link) made no decisions. Job 8 (a46d0dc9, regenerate `lib/supabase.types.ts`) was parked: no type generator in the Supabase MCP, no CLI, no access token._

### /en localized text: pages ship resolved strings only (tasks aa55488c, 1b0ab544; job 1)
**Decision:** Every public page that renders text from locations, stories, routes or tours resolves it through getLocalized() in getStaticProps or a pure builder and ships resolved strings only; raw `translations` live only between the query adapter and getStaticProps. Nested embeds select the full column, flat list queries use the en_* aliases.
**Reason / consequence (from the job 1 report):** `/en` showed English featured cards and tour text only after this sweep; `tours.description` and `routes.description` base columns hold English prose (content task 8abfda99) and the `translations` column on tours, tour_stops and routes exists but is null everywhere. Builders `lib/featuredPlaces.ts` and `lib/tourPage.ts` carry the tests.
**Migration risk:** none (app layer); page data methods touched → Vercel-preview gate applied at merge (claude.ai verified the `merge/overnight4` preview).

---

### JSON-LD serialisation and story markdown hardening (tasks fde4fa7c, aa74362d; job 2)
**Decision:** JSON-LD is serialised with `serializeJsonLd` (`< > &` escapes, JSON.parse round-trips); story markdown renders through `renderStoryMarkdown` (dedicated Marked instance, raw HTML escaped to visible text, link/image URLs allowlisted, marked's `inRawBlock` passthrough neutralised with a `walkTokens` clear that must not be removed; tests M-H11 to M-H17 are the tripwire).
**Reason (from the job 2 report):** escape, not strip (visible to the editor, zero visual cost since no live body has HTML); URL-scheme allowlisting is in scope as the same bug class; the global `marked` export is never configured. Lead amendment: protocol-relative `//host` URLs rejected.
**Migration risk:** none; all 10 live story link destinations pass the allowlist.

---

### One getStaticProps failure policy (task 3bb15319; job 4)
**Decision:** one failure policy in `lib/fetchPolicy.ts` (primary reads retry once then throw; secondary and sitemap retry once then log and fall back; `[fetchPolicy]` log prefix; `data/stories.ts` deleted; empty results stay hard errors; towns lookups and `getRouteByTourSlug` throw on transport errors).
**Migration risk:** none; page data methods touched → Vercel-preview gate applied at merge. Stale queue items closed by this work: 15d786c9 (`data/tours.ts` no longer exists), 821c021b, c7811f1a.

---

### Meta description and title lengths (task 749c5760; job 6)
**Decision:** meta-description length enforced in SeoHead (≤160 untouched, else word-boundary cut to ≤155 with "…"); detail titles via `buildTitle` with ordered suffixes, never cutting a name; too-short text never padded; the audit measures entity-decoded text.
**Consequence:** over-long descriptions and titles in the audit go to 0; the too-short descriptions and titles are authored-text issues and stay listed in the session report for editorial work. EN `home.meta.description` shortened to 157 characters at merge (Luigi's text).
**Migration risk:** none.

---

### Versioned pre-commit hook is the single commit-time gate (tasks 505a1b6c, c626cc59, 40247d92; job 7 + governance 2026-10-09)
**Decision:** versioned `.githooks/pre-commit` plus LFS wrappers, enabled per clone with `npm run hooks:install`; `--no-verify` the only bypass; written to the shared `.git/config` (worktreeConfig is enabled but only `--worktree` writes elsewhere).
**Governance cleanup (approved by Luigi 2026-10-09, branch day/governance-2026-10-09):** the `.claude/settings.json` PreToolUse matcher `"git commit"` never fired (PreToolUse matchers match tool names, not command text), so it and `.claude/hooks/pre-commit-check.sh` were removed with no harness-level replacement: the versioned git hook is the single commit gate. The stale "not by Cursor" clause in `.claude/agents/civitas-implementer.md` was dropped in the same branch.
**Migration risk:** none; `npm run hooks:install` run once in the main checkout after the merge.

---

### page_views.referrer_host populated from document.referrer (task dd1a7f49; claude.ai session 2026-10-09)
**Decision:** `page_views.referrer_host` is populated from `document.referrer`, accepted from the beacon body on the first page load only (option (a) of the 2026-10-04 deferral; Luigi's call, recorded in brain/current-state.md and now here). The server extracts the hostname only, discards own-domain and empty values, caps the raw input at 2048 characters, and never stores path, query or scheme. Client-side route changes send no referrer. (Task dd1a7f49, claude.ai session 2026-10-09.)
**Reason:** The true external referrer only exists client-side; `req.headers.referer` on a same-origin beacon is always our own host (2026-10-04). Dropping the column would forfeit the only traffic-source signal the cookieless tracker can ever have. Accepting one bounded string from the body is a narrow, deliberate widening of the "derive server-side" boundary: the value is reduced to a hostname before it touches the database, so a spoofed value can at worst insert a junk hostname, never a payload.
**Consequence:** `components/PageViewTracker.tsx` adds `referrer: document.referrer` to the initial-load payload only; `pages/api/track.ts` parses it with `new URL()`, keeps `hostname` when it differs from `req.headers.host`, else null. The existing Referer-header path is removed (it was dead by construction). Dashboard and pitch material may now cite referrer data once production has accumulated it. Body size limit stays 1kb, which already bounds the input.
**Migration risk:** none (column exists and is nullable; app-layer only).

---

## 2026-10-07
_Overnight session 3 (Fable 5.1), merged to main 2026-10-08 as `f9a1cf8`. Decision texts drafted by civitas-architect per job and carried verbatim from the session's plan files; full report at `~/overnight-report-2026-10-07.md` on Luigi's Mac (the repo copy on branch overnight3/report-2026-10-07 was not merged; the branch was deleted after the merge)._

### CCC data access: all mutations and the task-detail read via /api/tasks/… (tasks 0c6961fa, fe9f0e5d, b696ede8; overnight session 3, job 2)
**Decision:** All Command Center mutations and the task-detail read go through API routes under /api/tasks/… (the only Basic-Auth-protected API prefix that fits), including prompt_templates at /api/tasks/prompt-templates[/id]. lib/commandCenter.ts loses every anon Supabase function and becomes a types-only module (plus taskFromRow); lib/commandCenter.server.ts is the sole data access layer for tasks, outputs, task_links, prompt_templates.
**Reason:** Deny-all RLS makes the anon client silently return []/no-op on these tables. The three pages run mutations in the browser, so an import swap is impossible; routes are required. middleware.ts cannot be edited this session, and any route outside its matcher would be an unauthenticated service-role writer on a public site. Deleting the anon functions (nothing imports them after this change) removes the trap outright.
**Consequence:** Ugly-but-safe URL /api/tasks/prompt-templates; follow-up (middleware.ts → proxy.ts, Next 16 deprecation) moves it to /api/prompt-templates with a matcher entry. Adding an output from the detail page now also syncs tasks.latest_output (reuses POST /api/tasks/[id]/outputs). updateTaskAdmin returns the fresh row (Task | null) instead of void. A node --test boundary test fails if any non-server file touches a deny-all table.
**Migration risk:** none (app-layer only; one git mv of pages/api/tasks/[id]/outputs.ts → outputs/index.ts, URL unchanged).

---

### My day v0.1: Mapbox Directions walking routes, client-side (task 0f159817; job 4)
**Decision:** My day v0.1 routes the ordered stops through Mapbox Directions (walking) client-side with the existing public token; one debounced (400 ms) request per change of the ordered coordinate list, hard-capped at 10 waypoints before any request, 8 s timeout, bounded success cache keyed by 6-decimal coordinates. Walking time comes only from the Directions duration; totals are the sum of the returned legs. Any failure renders the v0 straight-line numbers with the unchanged "à vol d'oiseau" strings and the dashed line; routed state swaps to solid line + "à pied" strings + a Mapbox/forest caveat. suggestOrder stays straight-line.
**Reason:** The route must draw whenever a day exists, so routing is automatic but structurally bounded. The token is already public and URL-restrictable, so a proxy buys nothing. Loading and fallback share the v0 rendering so the panel never shows a blank or unlabelled number.
**Consequence:** lib/walkingRoute.ts (+tests), lib/useWalkingRoute.ts; my-day-line dash data-driven on `routed`. Mapbox snaps waypoints to the nearest way. walking_speed at Mapbox default pending the forest spot-check; allowance check is Luigi's gate. Only coordinates + token leave the browser; keep strict-origin-when-cross-origin, never no-referrer.
**Migration risk:** none.

---

### Stories: related content stays a slug mapping resolved from the DB (task 33c21389; job 5)
**Decision:** Option (a): "which stories/places are related" stays a slug-only mapping in code (new data/relatedStories.ts), every display value resolved from the DB inside getStaticProps through getLocalized(), labelled at render through the existing story.themes.* i18n gating and categoryLabel(). Option (b) rejected: no story↔location relationship exists in the schema; same-theme derivation for stories would empty most sidebars (the curated pairs are deliberately cross-theme). Consequence: RELATED const with English literals deleted; RelatedStories props change; pure helper lib/relatedStories.ts with tests; getStaticProps gains two bounded .in() queries and ships only resolved cards. Unpublished/missing slugs dropped at build time. Mapping goes stale when stories are added (code edit) — price of no schema; the real home is story_locations in the deferred target schema. Migration risk none; touches a page data method → CLAUDE.md Vercel-preview gate at merge.

---

### Worktree bootstrap script (task 760db1c3; job 7)
**Decision:** Worktree bootstrap ships as scripts/bootstrap-worktree.mjs + pure bootstrap-worktree.lib.mjs + node --test fixture; main checkout resolved via `git rev-parse --git-common-dir`, not __dirname. Reason: matches the .mjs/node --test convention (lint + tests for free, no deps); git-based resolution is correct when run from the script's own copy inside a nested .claude/worktrees/<name>. Consequence: `npm run worktree:bootstrap -- <path>` replaces the hand-typed ln -s / cp; copy is EXCL + mode 600; node_modules never overwritten; non-worktree paths refused. Follow-up: allowlist the command in .claude/settings.json (human-gated). Migration risk: none.

---

### ccc-schema.md summarises the status/execution_status contract; applied-migration banners (tasks 4849c0f0, 9764665c; job 6, hygiene-level)
**Decision:** ccc-schema.md summarises the status/execution_status contract and cross-references docs/schema-reference.md as canonical rather than carrying a third verbatim copy; applied-migration banners follow the existing seed-file shape (after the original header, before first SQL) and leave stale body text in place with an explanatory note rather than rewriting it.
**Reason:** two verbatim copies (CLAUDE.md, schema-reference.md) already exist and this task is itself a drift repair — a third copy is the next drift. Rewriting applied-migration bodies would falsify the historical record of what was actually run.
**Consequence:** future changes to the trigger contract edit schema-reference.md and CLAUDE.md; ccc-schema.md only needs touching if the bullet summary becomes wrong. Stale line :41 remains until the post-merge follow-up above.
**Migration risk:** none — docs and SQL comments only.
_(Source: civitas-architect hand-back of 2026-10-07, reproduced verbatim; the line-41 follow-up it mentions was done in the 2026-10-08 brain commit.)_

---

## 2026-10-06
**Decision:** The day planner ("My day") from the "Barbizon Mobile Rethink" Claude Design board (project 7b5a0592) is adopted as a layer on the map, not as a new product model. "The map is the product" stands unchanged. The 1A board's premise that "the day is the product", with a Today tab that demotes the Atlas to a picker, is rejected. A visitor's chosen places render on the Atlas as a numbered walking route.
**Reason:** 1A's core insight is sound: the nav was built from content types, not from what a visitor is doing. But it superseded a locked decision, and the map already has the primitives a planner needs (pins, coordinates, route rendering). Making the planner map-native keeps the product model intact and gives the feature a natural home. 1A was also built on stale data (42 places vs 107 published) and on facts the database does not hold (hours on 16 of 107, no price, no parking distances).
**Consequence:** Planner ships in stages, each honest with live data. v0 (task 3c5b17b5): "Add to my day" on cards, place pages and pin panel; selection in localStorage; shareable URL of ordered slugs; numbered walking route on /map; no schema, no auth, no hours logic. v1 (task fed18dd4): hours-aware warnings, gated on the opening-hours backfill (a0fea870) and location_parking_distances (7233da57). The 1A mobile shell (Today tab, three/four-tab rework) is deferred until v0 usage is observed in page_views. Every planner fact slot renders conditionally, never a placeholder. All new UI strings are French-canonical. The 2A desktop board remains a refinement and proceeds independently (token inversion f7e2a3e7; Places grid photography under bd73b953). Design copy cannot ship until the Auberge Ganne date is verified (d074fa2e).
**Migration risk:** none for v0. v1 adds one table via a human-gated migration.

---

## 2026-10-05
**Decision:** CCC's deleted Decisions and Memory pages (`pages/command-center/decisions/index.tsx`, `pages/command-center/memory/index.tsx`, removed in the 2026-10-05 overnight session, task `a05a2c04`) 404 — they are not redirected to a replacement.
**Reason:** The `/command-center/pins` → Atlas precedent redirected because the page's function moved to a new location. Here nothing moved: the underlying `decisions`/`memory` Supabase tables are retired (2026-08-16 decision, above), not relocated, so there is no destination a redirect could honestly point to. A redirect would imply continuity that doesn't exist; a 404 is more honest.
**Consequence:** Any stray internal link to either old CCC route breaks visibly (404) rather than silently landing somewhere unrelated. The replacement surface for "where did this go" is the plain outbound link to `brain/decisions.md` on GitHub added to the CCC Overview page in the same task.
**Migration risk:** none — confirmed via repo-wide grep that nothing else links to either deleted route.

---
2026-10-04: Every translation write stamps _meta in the same statement
Decision: Any write that creates or changes translations.<locale> must set translations.<locale>._meta {source_hash, translated_at, status} in the same SQL statement. source_hash uses the exact md5 expression in v_translation_health. status is 'published' only with Luigi's approval; otherwise 'draft'.
Reason: Between 2026-08-13 and 2026-10-04, 93 records were migrated without _meta. getLocalized requires _meta.status = 'published', so every /en/ page silently served French for seven weeks and the hreflang gate had nothing to emit. Nothing failed loudly.
Consequence: Content batches from claude.ai and content-ops must include _meta. v_translation_health is the check: after any batch, stale and draft counts must match intent.
Migration risk: none (data convention; backfill done 2026-10-04).
---

## 2026-10-04
**Decision:** The per-record hreflang gate uses the same predicate as the render path — `translations.en._meta.status === "published"` plus at least one non-empty translated field — not the mere presence of a `translations->en` key. A single shared helper (`hasPublishedTranslation` in `lib/getLocalized.ts`) is the only definition; `SeoHead` call sites and `pages/sitemap.xml.tsx` both consume it, neither re-implements it.
**Reason:** `getLocalized()` already refuses to render a translation unless `_meta.status === "published"` (lib/getLocalized.ts step 3, covered by tests 3 and 7). Gating hreflang on key-presence alone would declare `/en/X` as an English alternate for a page that `getLocalized` still renders in French — reinstating the exact byte-identical-duplicate defect the 2026-08-13 decision exists to fix, while *looking* fixed. Two predicates for "has English" is the drift class this project keeps paying for (generated mirrors, dual decision logs).
**Consequence:** If the live audit shows migrated rows are populated but not stamped `_meta.status = 'published'`, the fix is a content-ops SQL stamp (separate, gated task) — never a loosening of the predicate. `scripts/seo-audit.mjs` `checkHreflang` must be taught the gated case in the same commit, otherwise the mandatory post-merge audit fails on every sampled untranslated location (it currently hard-fails on an incomplete fr/en/x-default set). When the gate is off: emit no alternates at all (not a lone self-referencing x-default — an hreflang set of one is noise), keep the per-locale self-canonical, and add `noindex,follow` on the non-default locale only. Scope is `locations`; `stories` carry the same `translations` contract and are a queued follow-up, `tours` have no `translations` column at all and need content, not SEO tags.
**Migration risk:** none (app-layer only; no schema or slug change)

---

## 2026-10-04
**Decision:** `page_views.referrer_host` cannot be populated from `req.headers.referer` on the tracking beacon, and ships null. External-referrer capture is deferred to its own task rather than smuggled into the tracker's body contract.
**Reason:** `/api/track` is called same-origin by `navigator.sendBeacon` from our own page, so the `Referer` on that request is always an explorebarbizon.com URL — the brief's own "discard if own domain" rule therefore discards 100% of values. The true external referrer only exists client-side as `document.referrer` on the first page load, which means capturing it requires accepting it from the request body — a deliberate widening of the "derive server-side, never from body" trust boundary that is the lead's call, not the implementer's.
**Consequence:** The server-side derivation ships as briefed (unspoofable, privacy-clean) and the column stays empty; nothing silently half-works. A follow-up task must decide explicitly between (a) accepting `document.referrer` from the body with server-side hostname-only extraction, own-domain discard and a length cap, or (b) dropping the column. Until then, no dashboard or pitch material should promise referrer data.
**Migration risk:** none — the column already exists and is nullable; no DDL either way.

---

## 2026-08-16
**Decision:** brain/task-queue.md and the brain sync are retired. The `tasks` table is the only queue; CCC's tasks view is the human-readable window onto it. `status` and `execution_status` are kept, not collapsed — investigation found them orthogonal (34 rows legitimately share an `execution_status` across `backlog` and `ready`); their one shared invariant (done in either means done in both) is enforced by the `tasks_sync_done` trigger, so `/run-loop` keeps writing `execution_status` alone.
**Reason:** Every desync this session traced to one store being generated from another. The sync stripped the mirror's own "do not hand-edit" header because the generator never emitted it, and the endpoint is development-only since it writes to a filesystem Vercel doesn't provide. The same failure appeared one level down inside the table: eight rows had status out of step with execution_status, and one recurred within hours because /run-loop writes only the latter. Fixing the generator would make the next desync slower to notice, not less likely.
**Consequence:** One store per data shape and no sync jobs. Append-only narrative (decisions, session history) stays in markdown, where it is written once and read often. Mutable state with transitions stays in Postgres, where transitions belong. brain/decisions.md and brain/current-state.md are unaffected — only the generated mirror goes.
**Migration risk:** low — the mirror and sync are removed; no column collapse. The status/execution_status done-invariant is enforced by the `tasks_sync_done` trigger, already applied.

---

## 2026-08-16
**Decision:** The `decisions` and `memory` Supabase tables are retired. `brain/decisions.md` is the single decision log. `tasks` and `outputs` remain canonical in Supabase.
**Reason:** `decisions` received no writes after 2026-04-02 and `memory` none after 2026-03-21, while `brain/decisions.md` continued to be updated — two logs that diverged in April. CCC displayed the dead one, which is worse than displaying nothing: a stale panel asserts something false. The markdown file won because it lives in the repo where the agents already work; the tables lost because writing to them required a UI that broke under RLS.
**Consequence:** Both tables carry a RETIRED comment. All 20 `decisions` rows merged inline into `brain/decisions.md` in chronological position — deliberately not under an "Archive" heading, because most were still-active constraints (`show_in_editorial` dual filter, `visual_works` geo_confidence, Tier 3 source policy, duplicate-elimination policy) that an agent would skip if labelled history. `memory` triaged: most rows stale or duplicated, five unique items folded into repo docs. CCC's Decisions and Memory panels must be removed.
**Migration risk:** none — no drops, rows preserved.

---

## 2026-08-16
**Decision:** Claude, Claude Code and Claude Design are the only AI tools in use. Cursor, ChatGPT, GPT, Grok, Stitch and Perplexity are retired.
**Reason:** Eight files across docs, agent definitions and application code still described a multi-tool workflow abandoned months earlier — including `.claude/agents/civitas-implementer.md`, which told the agent it was invoked by Cursor when `/run-loop` invokes it. Stale documentation that reads as authoritative caused a correct queue cleanup to be reversed on 2026-08-16.
**Consequence:** Single reconciliation pass across all eight files rather than piecemeal edits. `assigned_to` remains free text, so historical rows still contain retired values — UI must render unknown assignees gracefully. Claude Design is adopted but not yet implemented — should not have a workflow invented for it.
**Migration risk:** low — code presets are a typed change with consumers.

---

## 2026-08-13
**Decision:** The canonical task queue depends on a service-role read path. The anon key can never serve CCC.
**Reason:** RLS was enabled across public tables with deny-all on tasks, outputs, memory, decisions and task_links. CCC reads via the anon key, so every query returned zero rows. The dashboard was blind, not broken, and the "tasks table is canonical, task-queue.md is a generated mirror" model was fiction for roughly a month — the table was unreadable through its only interface, so neither artefact was trustworthy.
**Consequence:** CCC reads move server-side behind a service-role client. Deny-all policies stay — they are correct. The repo is public, so SUPABASE_SERVICE_ROLE_KEY must never enter the client bundle; this is a release-check assertion, not a convention. "→ brain" must not be clicked until /api/brain/sync-tasks returns a real count.
**Migration risk:** none (app-layer change only)

---

## 2026-08-13
**Decision:** Slug creperie-barjole renamed to barjole, with a permanent redirect.
**Reason:** The business reopened in May–June 2026 as a Mediterranean restaurant and is no longer a crêperie. Google had not yet fetched the sitemap, so the URL had no accumulated equity to lose — the cheapest possible moment to rename.
**Consequence:** /places/creperie-barjole returns 308 to /places/barjole (Next emits 308 for permanent: true, not 301). i18n covers /en automatically via locale: true. Verified in production on both locales. R2 object moved and media.url repointed.
**Migration risk:** low

---

## 2026-08-13
**Decision:** hreflang and sitemap alternates are gated per record on translations->'en' being populated, not by a global flag.
**Reason:** An audit found translations empty across all 107 published locations while SeoHead and the sitemap already declared fr/en/x-default alternates — /X and /en/X were byte-identical. A global off-switch would have suppressed hreflang on records that legitimately have translations as the migration progresses.
**Consequence:** Per-record gating is self-correcting as batches land. Records without translations get noindex,follow on the non-default locale. No flag to remember to flip.
**Migration risk:** none

---

## 2026-08-13
**Decision:** Audience measurement is first-party and Supabase-native (page_views table + record_page_view RPC). GA4 rejected. Google Search Console used for search-demand data only.
**Reason:** GA4 requires a consent banner for EU visitors, conflicting with the "quiet digital atlas" direction. A cookieless first-party table is consent-exempt under CNIL audience-measurement conditions, keeps traffic data joinable against locations, categories and layer, and produces per-location visit evidence owned by the project — useful for the Office de Tourisme pitch. Search Console carries no consent implication and is complementary.
**Consequence:** All page views write through record_page_view() with the service-role key. No analytics script, no cookie banner. Retention must be capped at 25 months — purge job outstanding. town_id already present for multi-town.
**Migration risk:** none

---

## 2026-08-13
**Decision:** French base content is written natively, not translated from English; existing English is moved into translations->'en' field by field.
**Reason:** Translated-from-English prose reads foreign to a French audience reading about their own village heritage, and the Barbizon School has settled French art-historical vocabulary. Language mixing was found to be per-field rather than per-record (maison-charles-jacque had a French short_description and an English narrative), so a per-record language flag would have corrupted data.
**Consequence:** Every factual claim is verified before being carried into French, which surfaced multiple errors in published content. Records that were French-base have no English at all and need English originals composed. Accent-stripped French corrected in passing.
**Migration risk:** none

---

## 2026-07-17
**Decision:** Media ingestion (`scripts/upload-media.mjs`, task `6612dd51`) — **shipped and executed** (merge `c62a058` `--no-ff`; gate passed on `auberge-ganne`, then the full batch: 54 folders / 122 photos / 244 objects / 92 rows / 0 conflicts / 0 failures; verified 97 rows, 0 duplicates, 0 `_general` rows, 3 captions preserved). (1) **Two variants uploaded, one referenced**: every source photo produces `-1600.webp` + `-800.webp` on R2, but the `media` row carries **only the 1600 URL**. `media.url` is one opaque absolute URL consumed by a `next/image` hero (which does its own downscaling from the largest available source) and by two raw-`<img>` renderers; an 800 source would visibly degrade the hero, so the largest variant wins. The 800 is uploaded now as forward-compat for a later frontend `srcset`/card task — a pure string swap off the 1600 URL, no DB migration, no re-ingest. (2) **`display_order` = the number parsed from the filename, anchored on the known slug**: `{slug}.jpg` → 0, `{slug}-1.jpg` → 1, `{slug}-01.jpg` → 1. Not a dense 0-based rank. (3) **No `upsert`** — `media` has no unique index, so idempotency is app-level: SELECT existing rows for the location, match on exact `url`, UPDATE the matched rows whose `display_order` changed, INSERT the rest, never DELETE, never overwrite `caption`. (4) `media.explorebarbizon.com` is added to `next.config.mjs` `images.remotePatterns` — a live production bug fix, in scope.
**Reason:** `media` has one `url` column, no variant column, and no unique constraint — all three shapes are fixed for this task (DDL is human-gated and out of scope), so the design has to fit them rather than change them. Filename-anchored `display_order` reproduces the existing live convention exactly (single image = 0; the one 2-image set = 1,2), keeps filename↔order legible, and is strictly more idempotent than dense ranking: deleting one photo from a folder renumbers nothing. Slug-anchored parsing is required, not stylistic — `media-staging/maison-45/maison-45.jpg` is a bare single-image file whose slug ends in digits, and a naive trailing-`-(\d+)` parser assigns it `display_order` 45 instead of 0. The remotePatterns gap is verified live: the R2 origin serves the image 200, but `/_next/image?url=<R2 url>` returns 400 ("Any other protocol, hostname, port, or unmatched path will respond with 400 Bad Request" — Next 16 docs), so the hero is broken today on the 2 locations that have media, and ingesting 122 photos would multiply it to 54.
**Consequence:** The `-800` objects are unreferenced by any code on arrival — dead bytes until the follow-up card/`srcset` task lands (which must also handle legacy rows whose URLs carry no variant suffix). `/places` card `<img>` will download 1600w sources for ~320px slots; bounded by the existing `loading="lazy"`, but it is the reason the follow-up matters. Re-running with a *changed* source photo produces the same URL, so the R2 object is overwritten in place and the Cloudflare CDN may serve stale pixels until purged — documented, not solved here. A location that already holds media rows whose URLs don't match any planned URL ("foreign rows") is a conflict: the folder is skipped with a loud error rather than stacking a legacy row and a new row at colliding `display_order`s. `sharp` becomes an explicit dependency (already on disk at 0.34.5 as a transitive of next@16, so no new download); `.autoOrient()` must precede resize, because sharp strips the EXIF Orientation tag by default *without applying it* — portrait iPhone photos would otherwise ship sideways. **Measured against the real payload before the gate (2026-07-17):** all 122 staged files carry an EXIF block (~17.9 kB on the sampled file) and the shipped pipeline strips it to zero on both variants while preserving sRGB; a counter-test confirmed `withMetadata()` re-injects 17,980 B, so its omission is load-bearing. However, 0 of 122 files have a non-default EXIF orientation and the GPS probe found none — so `.autoOrient()` is correct *defensive* code for future batches, not a fix for an active defect in this payload, and the EXIF strip is doing real work against device metadata rather than location data.
**Migration risk:** low — new script + additive `next.config.mjs` allowlist entry + additive `media` rows only; no DDL, no `locations` write, no deletes. The `--execute` run against production is Luigi's action, not the loop's.
**Outcome (2026-07-17, post-gate):** Every plan-level call above survived contact with the real payload. The `remotePatterns` fix was proven in the deployed runtime before merging — preview returned 200 on the same `/_next/image?url=…` that production 400'd — and 200 live after. Idempotency was proven against production, not just asserted: a second `--execute` on `auberge-ganne` produced NO-OP / 0 inserts / 0 updates and left 2 rows, not 4. EXIF-strip was proven on the CDN-served object (source 17,191 B → stripped, sRGB preserved), with a `withMetadata()` counter-test confirming the trap is real. One plan assumption was **wrong in the safe direction**: 0 of 122 files carry a non-default EXIF orientation and all 122 are uniform 16:9, so `.autoOrient()` is correct defensive code for future batches rather than a fix for an active defect — the EXIF strip is doing real work against device metadata, not GPS (none found). Two gaps the plan did not anticipate: the CLI has no `--only=<slug>`, so the brief's own staged gate was not expressible (worked around with a temp `--dir`; queued as `0b1fd1c4`), and CLAUDE.md's deployed-runtime gate does not cover this change class (queued as `eb69de89`).

---

## 2026-07-15
**Decision:** The Supabase `tasks` table is the canonical work queue; `brain/task-queue.md` is a generated display-only mirror. The loop dispatches from it (no-arg `/run-loop` claims the highest-priority `execution_status='queued'` task, reads `source_prompt` as the spec), records the gate as metadata (`at_gate` + an `outputs` summary row with `commit_hash`), and closes tasks `done`/`blocked`. `execution_status` carries the loop lifecycle `queued → in_progress → at_gate → done | blocked` (legacy `todo`/`review` tolerated); the human `status` column stays the kanban that feeds the mirror. A new `source` column (`claude-ai | luigi | loop`) records origin, distinct from `assigned_to` (executor). `/run-loop` gains a Step 7 retrospective: at most one `source='loop'` low-priority proposal per run, citing that run's specific friction. Governance codified in CLAUDE.md: claude.ai dispatches and reviews; agents execute; irreversible actions (merge/deploy, prod SQL, publish, spend) are Luigi's; the dispatcher never approves its own irreversible actions; the system may *propose* changes to its own guardrails (`.claude/**`) but never *enact* them, and no agent applies a `.claude/**` change in the run that proposed it.
**Reason:** The queue was split across `brain/task-queue.md` (hand-edited) and the tasks table with no single source of truth, and the loop had no self-noticing step — process friction went unrecorded. Making the table canonical + adding a bounded retrospective gives the loop one queue and one improvement channel without letting it rewrite its own guardrails.
**Consequence:** Migration `tasks_canonical_queue_dispatch.sql` applied + verified live (additive: `tasks.source` + CHECK, `execution_status` superset CHECK, `outputs.commit_hash`; all 66 rows valid). `.claude/commands/run-loop.md`, `.claude/settings.json` (mechanical-command allowlist pass — localhost-only curl, git worktree, node --test, seo-audit, npm start, dev-server lsof/pkill), and CLAUDE.md Session-discipline shipped to main (`--no-ff`, `eb63b7b`). First `source='loop'` proposal queued (task `05bc2e17`: assign live-schema introspection to the lead, not `civitas-architect`, which has no Supabase MCP). Executor split honored per rule: claude.ai ran the migration via MCP; Claude Code held.
**Migration risk:** none — additive/non-breaking DDL (verified against all existing rows); no agent tool-allowlist or prod-write-guard change.

---

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

## 2026-04-02 — Add barbizonvillagedespeintres.wordpress.com as Tier 3 source
**Decision:** `barbizonvillagedespeintres.wordpress.com` is added as a Tier 3 source alongside `grappilles.fr`. Subject to identical policy: valuable for orientation and anecdote, must be cross-verified against Tier 1 sources before any factual claim is published.
**Reason:** The author has institutional standing (former Tourism Office president) and the blog covers restaurants, boutiques, celebrities, trails and village history with detail not found in official sources. Not systematically updated since ~2015 but the historical content remains useful. Same rules as grappilles.fr: credited research contribution, not primary authority.
**Context:** A second blog by Jean-Michel Mahenc (former Président de l'Office du Tourisme de Barbizon), rich in anecdotal detail, village atmosphere, commerce listings and historical context.

---

## 2026-04-02 — Duplicate location elimination policy established
**Decision:** When duplicate locations are found: keep the record with better GPS accuracy and more complete content; re-point any `tour_stops` FKs to the keeper; merge narrative content before deleting; document in the session log.
**Reason:** Eliminates map pin doubling, prevents confusing duplicate place pages, and ensures tour routes stay intact.
**Context:** A session audit found 6 duplicate location records. Pattern applied to: `medallion-millet-rousseau`, `lesquisse-hotel-bar`, `maison-theodore-rousseau`, `besharat-gallery-ess`, `musee-millet`, `parcours-mosaiques`.

---

## 2026-04-02 — L'Ermitage Saint Antoine reopening date confirmed as 26 January 2026
**Decision:** All L'Ermitage content uses 26 January 2026.
**Reason:** Historical accuracy principle: when the owner confirms a date, that overrides inferred dates from third-party review timestamps. Restaurant Guru page updated 30 January 2026 confirms the review was written days after reopening.
**Context:** Initially entered as January 2025 based on a misread of review timestamps.

---

## 2026-04-02 — Galerie 41 identified as Mairie-managed municipal exhibition space
**Decision:** Galerie 41 is managed by the Mairie of Barbizon, not a private association. Expositions announced on barbizon.fr. Free admission, weekly rotation.
**Reason:** Mairie-managed spaces should be noted as such in descriptions to help visitors understand the public/open nature of the programming.
**Context:** 41 Grande Rue flagged as a temporary exhibition space similar to Cercle Laure Henry.

---

## 2026-04-02 — Cercle Laure Henry: lay association, not Mairie-owned
**Decision:** Cercle Laure Henry is run by Les Amis du Cercle Laure Henry, a private lay Christian association founded February 2016. Receives some funding support but is not municipally managed.
**Reason:** Distinction matters for editorial accuracy: Galerie 41 = municipal; Cercle Laure Henry = private associative.
**Context:** The Cercle was believed to possibly be Mairie-funded.

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

## 2026-03-21 — Use visual_works + visual_work_locations for all historical media
**Decision:** Use `visual_works` + `visual_work_locations` junction table with a `geo_confidence` field instead of a paintings table with direct coordinates.
**Reason:** Historic visual material cannot be reliably assigned exact coordinates. Barbizon mosaics are not reliable exact painting locations. Geo confidence must be explicit: exact / approximate / interpretive / unknown. No coordinates stored on the work itself — attribution lives entirely in the junction table.
**Context:** Needed a way to store paintings, postcards, photographs, and engravings with geographic attribution.

---

## 2026-03-21 — Use repo-based project brain (brain/ + docs/) for AI continuity
**Decision:** All project state, decisions, and task queues live in `brain/` and `docs/` files in the repo, not only in chat history.
**Reason:** Chat history does not persist across sessions. Brain files allow any AI session to resume with full context.
**Context:** Multiple AI sessions across Claude Code, Cursor, and ChatGPT needed shared project context.
**Superseded in part (2026-08-16):** `tasks` and `outputs` are canonical in Supabase; `brain/task-queue.md` is a generated mirror, not a source of truth.

---

## 2026-03-21 — Cursor handles frontend implementation; Claude handles architecture
**Decision:** Claude/ChatGPT handle architecture, strategy, schema design, and planning. Cursor handles frontend code, UI iteration, and component-level changes.
**Reason:** Different tools have different strengths. This separation keeps the system stable and produces better output at each layer.
**Context:** Claude alone was producing UI that lacked contemporary visual refinement and iteration speed.

---

## 2026-03-21 — Keep Pages Router — do not migrate to App Router
**Decision:** Maintain Next.js Pages Router. Do not migrate to App Router without explicit instruction.
**Reason:** Migration would be a large, risky refactor with no immediate product benefit. All existing patterns work correctly on Pages Router.
**Context:** Next.js App Router is now the default but the project started on Pages Router.

---

## 2026-03-21 — Supabase is the single source of truth for all data
**Decision:** All locations, tours, media, and user data live in Supabase. Static `data/` files in the repo are temporary placeholders only.
**Reason:** Centralised, queryable, scalable database with auth and row-level security. Enables live updates, dashboard editing, and AI-readable data without redeploys.
**Context:** The project started with static `data/places.ts` and `data/tours.ts` files.

---

## 2026-03-21 — Mapbox is the spatial engine
**Decision:** All map rendering, location pins, clustering, and trail display go through Mapbox GL JS.
**Reason:** Best-in-class for custom map styling, layer control, and geo-narrative use cases. Mapbox Static API also used for place card thumbnails. **Superseded in part (2026-10-18):** thumbnails are photo first, with the static map as the fallback only.
**Context:** Needed a map layer for place discovery with custom styling.

---

## 2026-03-21 — Homepage is visual-first and video-led
**Decision:** Hero is a `<video>` element with autoPlay muted loop playsInline. Minimal text overlay: eyebrow + H1 + two CTAs only. Long-form content lives deeper in the site.
**Reason:** Beauty and utility attract users faster than text. The video asset must be in `/public/videos/` — code is in place, asset pending.
**Context:** Early versions had heavy copy on the homepage.

---

## 2026-03-21 — Refinement-over-rebuild workflow
**Decision:** Build structure once, then refine section by section. Never prompt for full page rewrites.
**Reason:** Full rebuilds break coherence, waste time, and produce regressions. Iterative passes preserve editorial DNA and allow controlled, reviewable diffs.
**Context:** Early sessions involved full page rewrites that caused regressions.

---

## 2026-03-21 — Dashboard v1 lives inside the same Next.js codebase
**Decision:** Dashboard lives at `/dashboard` within the main Next.js app — same codebase, same Supabase client.
**Reason:** Avoids a separate admin tool. Keeps the stack unified and reduces maintenance overhead. Protected routes handle auth.
**Context:** Considered a separate admin tool (e.g. Retool, separate Next.js app).

---

## 2026-03-21 — Finish Barbizon MVP before any multi-town migration
**Decision:** Multi-town schema changes (`town_settings`, `category_templates`, composite slugs) are deferred until Barbizon MVP is complete.
**Reason:** Premature abstraction would add complexity before the core product is proven. The `town_id` FK is already on `locations` — migration will be tractable when the time comes.
**Context:** The long-term vision is a multi-town platform (Civitas Layers).

---

## 2026-03-21 — Postcards are the practical starting point for the historical media layer
**Decision:** Begin the historical visual overlay with postcards. Paintings require serious historical research and mosaic coordinates are unreliable.
**Reason:** Barbizon mosaic coordinates are not reliable exact painting locations. Postcards are more tractable and still historically significant. Use `geo_confidence = interpretive` or `unknown` for mosaic-derived positions.
**Context:** The `visual_works` model covers paintings, postcards, photographs, and engravings.

---

## 2026-03-21 — Enforce specific schema field name conventions
**Decision:** Always use `layer` (not `map_layer`), `distance_meters` (not `distance_km`), `stop_narrative` (not `notes`). These override any default assumptions.
**Reason:** Consistency across queries, migrations, and AI sessions. Documented in `CLAUDE.md` and `docs/schema-reference.md`.
**Context:** AI-assisted development sessions were generating inconsistent field names.

---

## 2026-03-21 — show_in_editorial dual-filter pattern
**Decision:** Both `locations.show_in_editorial` AND `categories.show_in_editorial` must be true for a location to appear in the editorial listing. Two independent filters, both boolean.
**Reason:** `categories.show_in_editorial` filters whole categories (utility vs. cultural). `locations.show_in_editorial` filters individual locations within an eligible category. Allows fine-grained control without schema changes.
**Context:** Needed to hide utility locations (Parking, Bus Stop) from the places listing without unpublishing them.

---

## 2026-03-21 — CCC as an AI operating system inside the Next.js app
**Decision:** Command Center is built as an internal tool at `/command-center` within the same Next.js codebase — tasks, decisions, memory, prompts, outputs all in Supabase.
**Reason:** Keeps the operating system inside the repo where all the context lives. Avoids external tools that would fragment state.
**Context:** Needed a way to coordinate tasks across Claude, Cursor, and ChatGPT without leaving the project.
**Superseded in part (2026-08-16):** `decisions` and `memory` retired as tables; `brain/decisions.md` is the single decision log. `tasks` and `outputs` remain canonical in Supabase.

---

## 2026-03-21 — Project must be developed from a local directory, not Google Drive
**Decision:** Develop from a local path only (e.g. `~/Documents/Projects/explore-barbizon`). Do not use synced or cloud-mounted folders.
**Reason:** Google Drive interfered with local dev behaviour, file watching, and build reliability.
**Context:** Early development was inside a Google Drive synced folder.

---

## 2026-03-20
**Decision:** Claude = project lead (strategy, architecture, SQL, content, brain files). Cursor = scoped implementer. GPT and Grok = supplementary only, no authority over task ordering or brain files.
**Reason:** Clearer division of responsibility prevents conflicting instructions and tool sprawl.
**Consequence:** Claude owns the full operating loop. Cursor implements from Claude-written briefs. GPT/Grok consulted for second opinions only.
