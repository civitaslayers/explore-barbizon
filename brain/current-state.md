# Current State

Last updated: 2026-08-18

## Status
French content migration 60% complete (64 of 107 published locations). Analytics schema live,
tracking code not yet written. CCC dashboard blind reads FIXED and merged (task 82295116,
PR #3, merge 790f1a2) — reads now run server-side via supabaseAdmin; the dashboard shows the
real queue (41 non-done). The `tasks` table is the sole queue; brain/task-queue.md and its
sync are retired (task 0f9858fc, 2026-08-18).

## Last Completed
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
2. Per-record hreflang gating in SeoHead and sitemap
3. Cookieless page-view tracking implementation
4. Remaining 43 French migration records
5. suggest.ts anon blind-read follow-up (task 08309b0b) — swap getTasks() for getTasksAdmin(); small

## Next Session Starting Point
CCC blind reads fixed and merged (PR #3) — the dashboard now reflects the real queue (the `tasks` table is the sole source; there is no mirror to regenerate). Next priority: tighten getStaticProps on /places, then per-record hreflang gating.

## Operational lessons (salvaged from the retired task-queue.md)

- [x] [bug/prod] **`remotePatterns` production bug fixed** (same merge): `media.explorebarbizon.com` was missing from `next.config.mjs`, so `next/image` 400'd on every R2 hero — broken live on 2 locations, would have broken all 54. Invisible locally; proven preview-200 vs prod-400, then 200 live. Repairs `dormoir-de-lantara`.
- [x] [i18n/hotfix] `/en/` 500 production regression fixed (merge `812b144`, 2026-07-14, own worktree): next-i18next config passed explicitly at all 11 `serverSideTranslations` sites + `_app` + `outputFileTracingIncludes`. Verified live — all `/en/` routes 200; prod seo-audit 64/40/2, every hreflang/JSON-LD/sitemap check passes. Preview-audit process rule made executable (auth spot-fetch pre-merge; full audit post-merge on public prod).
- [ai-ops] [`source='loop'`, task `eb69de89`, `.claude/**`-gated] Extend the deployed-runtime verification class to `next.config.mjs` `images.remotePatterns`. Evidence (2026-07-17): the release-checker read CLAUDE.md's rule and **correctly** concluded the mandatory preview gate didn't apply — the class enumerates locale routing / runtime config / page data methods, and remotePatterns is none of them. But the change had the identical signature the rule exists to catch: `next build` passed with the hostname both present and absent, and the defect was only visible by querying production (`/_next/image?url=…` → 400 while the R2 origin → 200). `next.config.mjs` is now 2-for-2 on locally-invisible production defects (i18n bundling; image remotePatterns). Generalize the class to the shared property, add the `_next/image` → 200 preview check to the release-checker brief. (Third retrospective proposal.)
- [seo/infra] Thread a Vercel **Protection Bypass for Automation** token (`x-vercel-protection-bypass` header) into `scripts/seo-audit.mjs` so the full audit can run against SSO-protected Preview deployments — makes the pre-merge preview gate fully automated (currently pre-merge uses authenticated spot-fetches; full audit runs post-merge against public production). Follow-up from the 2026-07-14 /en/ 500 hotfix.
