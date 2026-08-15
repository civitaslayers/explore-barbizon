# Current State

Last updated: 2026-08-13

## Status
French content migration 60% complete (64 of 107 published locations). Analytics schema live,
tracking code not yet written. CCC dashboard confirmed blind since RLS rollout — task queue
was unmaintainable through its only interface until reconciled by hand on 2026-08-13.

## Last Completed
- [content] French migration, 64 of 107 locations — French in base columns, English into translations->'en'
- [content] Factual corrections found during migration: chapel 1858→1889, bell tower architect corrected to Charles-Louis Millet (second son of J-F Millet), L'Angélus provenance corrected to the 1910 Chauchard bequest, Chêne Bodmer confirmed no longer standing, Laure Henry corrected from "1920s benefactress" to soprano (d. 1906), museum renamed to Musée départemental des peintres de Barbizon
- [data] Slug rename creperie-barjole → barjole — redirect, both locales, media and R2 all verified in production
- [schema] page_views table + record_page_view() RPC — cookieless, RLS deny-all, service_role only
- [infra] Google Search Console verified via DNS (Domain property)
- [ops] Task queue reconciled: 8 completed-but-open rows closed, 2 duplicate pairs merged, retired assignees cleared. 10 ready / 31 backlog / 42 done.

## Blockers
- CCC dashboard blind — RLS deny-all on tasks/outputs/memory/decisions/task_links, read via anon key. Do NOT click "→ brain" until fixed; it would write an empty queue.
- Heritage Plaque batch (7 records) blocked pending a dedicated verification session

## Next Tasks
1. Fix CCC blind reads via service-role read path (priority 1 — unblocks task management)
2. Tighten getStaticProps select on /places — 143 kB, over threshold, grows with each translation batch
3. Per-record hreflang gating in SeoHead and sitemap
4. Cookieless page-view tracking implementation
5. Remaining 43 French migration records

## Next Session Starting Point
Fix CCC blind reads first — everything else in the queue is harder to track until it works.
