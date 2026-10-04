# Current State

Last updated: 2026-10-04

## Status
Cookieless page-view tracking (task 66deb8a9) and per-record hreflang gating (task eb5f1e3e)
merged to main (`a11360d`, fast-forward from `feat/tracker-hreflang`) and deployed to production.
`page_views` is now live (verified: a real preview visit inserted a row with correct
path/locale/device, no raw IP/UA logged). Hreflang/sitemap alternates are gated on
`translations.en._meta.status = 'published'` plus a non-empty `name`/`short_description` (the same
rule `getLocalized()` already used to render translations) — post-merge production seo-audit
(2026-10-04): 93 of 107 published locations emit real fr/en/x-default alternates, 14 correctly
gated off (no alternates, `noindex,follow`), 0 hreflang-class failures. Self-correcting in real
time: a location missing only `name`/`short_description` (`maison-charles-jacque`) was still
gated when checked pre-merge, then started passing post-merge once claude.ai's parallel migration
batch filled that field in — no code change needed. `scripts/seo-audit.mjs` updated in the same
commit to expect the per-record gate. CCC dashboard blind reads FIXED and
merged (task 82295116, PR #3, merge 790f1a2) — reads now run server-side via supabaseAdmin; the
dashboard shows the real queue. PR #4 (fix/retire-task-queue-mirror, task 0f9858fc) merged to main
(292f313 merge commit) and deployed — brain/task-queue.md and pages/api/brain/sync-tasks.ts
removed; the Supabase `tasks` table is now the sole work queue, with CCC's `/command-center/tasks`
as the human-readable window onto it.

---
2026-10-04 audit (claude.ai, live DB): no deploys or DB writes between 2026-08-18 and 2026-10-04. page_views has 0 rows: the schema shipped 2026-08-13 but the client tracker (task 66deb8a9) never shipped, so no first-party analytics exist for that period. Content at audit time: 107 published, 64 French-native with English in translations->en, 52 with media, 16 with opening hours, 0 video. Open: the 1A mobile board "the day is the product" conflict still has no brain/decisions.md entry.
---

---
2026-10-04 content and data work (claude.ai, live DB, verbatim handoff):
- French migration: 93 of 107 published locations are now French-native with English in translations->en (was 64). Eat, Stay & Shop and Forest & Nature layers complete. Remaining 14 are all Art & History: 7 Heritage Plaques (blocked, verification session) + allee-john-constable, caverne-des-brigands, chene-sully, la-poste-barbizon, mairie-barbizon, cimetiere-barbizon, monument-farman (need a Tier 1 research session).
- _meta backfill: no migrated record had translations.en._meta, so getLocalized never rendered English and /en/ pages served French since August. All 93 now carry _meta {source_hash (same md5 as v_translation_health), translated_at, status: published}. v_translation_health locations: 93 current, 18 missing, 0 stale.
- maison-charles-jacque: added missing translations.en.short_description; now passes the hreflang gate.
- Factual corrections, each logged in that record's internal_notes: escalade-gorges-apremont (false "bouldering began at Apremont, first circuit by Pierre Mercier 1952"; first circuit was 1947, Fred Bernick, Cuvier-Rempart); escalade-cuvier-chatillon (removed unsourced "first 8A 1984"); parcours-fb (conflated forest area with biosphere reserve); sentier-bleu-gorges-apremont (Denecourt was not a garde forestier); sentier-cavaliere-brigands (1845 -> mid-1840s); valet-des-fromages (Barbizon is on the Plaine de Bière, not the Brie plateau); galerie-des-pains (removed "oldest trade fraternity" superlative); nunchi, bobo-club, desert-apremont, point-de-vue-apremont (unsourced claims moved to internal_notes).
- tabac-barbizon rewritten: reopened under a new owner (was described as closed while published).
- Names and addresses: 25 names and 8 addresses corrected (missing accents, "--" separators normalised to the existing em dash convention).
- page_views: tracker vrified in production (mobile row, 09:22 UTC), all test rows purged; table empty pending first real traffic.
- New tasks: dd7cff85 (stale strategy docs, P6), 06e9fec8 (canonical host apex vs www, P1, human).
---

## Last Completed
- [ops+seo] Tracker + hreflang gating shipped (tasks 66deb8a9, eb5f1e3e; branch feat/tracker-hreflang; merge a11360d, fast-forward to main; deployed 2026-10-04). `pages/api/track.ts` + `components/PageViewTracker.tsx` write to the existing `page_views` schema via `record_page_view()` RPC (service-role client, bot-filtered, sha256 visitor-day hash, no raw IP/UA stored); mounted in `_app.tsx`, no-ops outside `NODE_ENV=production` (fires on Vercel Preview too). `lib/getLocalized.ts` gained `hasPublishedTranslation()`, consumed by both `SeoHead` (new `hasEnglishVersion` prop, default `true` so the ~9 i18n-catalogue pages are unaffected) and `pages/sitemap.xml.tsx` — one predicate, no duplication. Ran through the full loop (architect → implementer → release-checker SHIP) plus two rounds of live preview verification (before and after claude.ai's 93-row translation-status stamp); release-checker, unit tests (6 new `hasPublishedTranslation` cases), and a full local `seo-audit.mjs` run against production data all green. Stories/tours deliberately out of scope (same `translations` contract, queued as follow-ups).
- [ops] Task queue mirror retired (task 0f9858fc, PR #4, merge 292f313) — brain/task-queue.md and pages/api/brain/sync-tasks.ts deleted; the Supabase `tasks` table is the sole canonical queue, CCC's tasks view is the read-only window onto it. Closed and deployed 2026-10-04.
- [ops] CCC dashboard blind reads fixed (task 82295116, PR #3, merge 790f1a2) — root cause was lib/commandCenter.ts reading via the anon client against deny-all RLS. New server-only lib/commandCenter.server.ts (getTasksAdmin/getOverviewStatsAdmin via supabaseAdmin, explicit columns); index.tsx + tasks/index.tsx reads moved into getServerSideProps; sync-tasks.ts uses the admin read. Service-role key verified absent from the client bundle. Ran through /run-loop: lead-planned → implementer → release-checker SHIP after 1 HOLD (SSR read failures now surface a banner, not a silent empty list). Follow-ups queued: 08309b0b (suggest.ts same-family blind read), 729ede25 (loop retrospective, .claude/**-gated).
- [content] French migration, 64 of 107 locations — French in base columns, English into translations->'en'
- [content] Factual corrections found during migration: chapel 1858→1889, bell tower architect corrected to Charles-Louis Millet (second son of J-F Millet), L'Angélus provenance corrected to the 1910 Chauchard bequest, Chêne Bodmer confirmed no longer standing, Laure Henry corrected from "1920s benefactress" to soprano (d. 1906), museum renamed to Musée départemental des peintres de Barbizon
- [data] Slug rename creperie-barjole → barjole — redirect, both locales, media and R2 all verified in production
- [schema] page_views table + record_page_view() RPC — cookieless, RLS deny-all, service_role only
- [infra] Google Search Console verified via DNS (Domain property)
- [ops] Task queue reconciled: 8 completed-but-open rows closed, 2 duplicate pairs merged, retired assignees cleared. 10 ready / 31 backlog / 42 done.

## Blockers
- Heritage Plaque batch (7 records) blocked pending a dedicated verification session

## Next Tasks
1. Tighten getStaticProps select on /places — 143 kB, over threshold, grows with each translation batch
2. Remaining French migration records (93 of 107 now have published English; ~14 still need translation + status stamp)
3. suggest.ts anon blind-read follow-up (task 08309b0b) — swap getTasks() for getTasksAdmin(); small
4. Stories hreflang gating — same `translations`/`_meta.status` contract as locations, currently unconditional; queued follow-up from the eb5f1e3e branch
5. page_views retention/purge job (25-month cap per 2026-08-13 decision) — outstanding since the schema shipped

## Next Session Starting Point
Tracker + hreflang gating are live in production. Next priority: tighten getStaticProps on /places, then continue the French migration (translations need both the content AND the `_meta.status=published` stamp to actually surface via hreflang/getLocalized).

## Operational lessons (salvaged from the retired task-queue.md)

- [x] [bug/prod] **`remotePatterns` production bug fixed** (same merge): `media.explorebarbizon.com` was missing from `next.config.mjs`, so `next/image` 400'd on every R2 hero — broken live on 2 locations, would have broken all 54. Invisible locally; proven preview-200 vs prod-400, then 200 live. Repairs `dormoir-de-lantara`.
- [x] [i18n/hotfix] `/en/` 500 production regression fixed (merge `812b144`, 2026-07-14, own worktree): next-i18next config passed explicitly at all 11 `serverSideTranslations` sites + `_app` + `outputFileTracingIncludes`. Verified live — all `/en/` routes 200; prod seo-audit 64/40/2, every hreflang/JSON-LD/sitemap check passes. Preview-audit process rule made executable (auth spot-fetch pre-merge; full audit post-merge on public prod).
- [ai-ops] [`source='loop'`, task `eb69de89`, `.claude/**`-gated] Extend the deployed-runtime verification class to `next.config.mjs` `images.remotePatterns`. Evidence (2026-07-17): the release-checker read CLAUDE.md's rule and **correctly** concluded the mandatory preview gate didn't apply — the class enumerates locale routing / runtime config / page data methods, and remotePatterns is none of them. But the change had the identical signature the rule exists to catch: `next build` passed with the hostname both present and absent, and the defect was only visible by querying production (`/_next/image?url=…` → 400 while the R2 origin → 200). `next.config.mjs` is now 2-for-2 on locally-invisible production defects (i18n bundling; image remotePatterns). Generalize the class to the shared property, add the `_next/image` → 200 preview check to the release-checker brief. (Third retrospective proposal.)
- [seo/infra] Thread a Vercel **Protection Bypass for Automation** token (`x-vercel-protection-bypass` header) into `scripts/seo-audit.mjs` so the full audit can run against SSO-protected Preview deployments — makes the pre-merge preview gate fully automated (currently pre-merge uses authenticated spot-fetches; full audit runs post-merge against public production). Follow-up from the 2026-07-14 /en/ 500 hotfix.
