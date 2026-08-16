# Current State

Last updated: 2026-08-16

## Status
French content migration 60% complete (64 of 107 published locations). Analytics schema live,
tracking code not yet written. CCC dashboard blind reads FIXED and merged (task 82295116,
PR #3, merge 790f1a2) — reads now run server-side via supabaseAdmin; the dashboard and
→ brain show the real queue (41 non-done). → brain is safe to run again.

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
CCC blind reads fixed and merged (PR #3) — the dashboard and → brain now reflect the real queue, so → brain is safe to regenerate brain/task-queue.md. Next priority: tighten getStaticProps on /places, then per-record hreflang gating.
