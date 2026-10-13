# Standing night jobs

These run every night after the briefed queue is empty, while the run's time
cap allows, in the order S1, S2, S3. They also appear in a dated night brief
when queued as tasks. Read only the section you are running.

Rules for all standing jobs:
- Read-only on code: commit only new files under `docs/audits/` or
  `docs/sources/`, on a fresh branch `night/<yyyy-mm-dd>-<job>` from
  `origin/main`; push and open one PR per job. No code changes, ever.
- Database writes allowed: `research_findings` (insert, and update of
  `status`/`method`/`source_*`/`quote`/`notes`/`updated_at` on rows you
  verified) and `tasks` (insert follow-ups, status writes on your own task).
  Nothing else. Never `locations`, `stories`, `tours`, `routes`, `media`,
  never `is_published`, never DDL. If any write is refused, do not retry or
  work around it: put the exact SQL in a fenced block at the end of the PR's
  markdown file for claude.ai to apply.
- Source tiers: Tier 1 = independent documentary record (POP/Mérimée,
  Gallica/BnF, Archives départementales 77, Musée d'Orsay, INSEE, official
  registries); Tier 2 = strong period or first-hand source; Tier 3 =
  grappilles.fr, barbizonvillagedespeintres.wordpress.com, Wikipedia, blogs,
  aggregators. Only Tier 1 or two independent Tier 2 sources make a row
  `confirmed`. Tier 3 alone stays `lead`. Never invent a source, a page
  number or a quote; quotes under 15 words.
- Before filing any task: select open tasks (`status <> 'done'`) and skip if
  one already covers it. Follow-ups: `status 'backlog'`, `execution_status
  'todo'`, `source 'loop'`, priority 4 to 6, description naming the evidence.
- Heartbeat: every ~20 minutes, `update tasks set updated_at = now()` on the
  task you are running, so the fallback run can tell you are alive.
- If a site is unreachable from the session (Gallica often is), note it once
  in the report and move to the next source. No curl/proxy workarounds.

## S1, health audit

Produce `docs/audits/<date>-health.md`: one table per area, each finding with
severity (high / medium / low), evidence (file:line, URL + status, or SQL +
count) and a suggested fix in one line. Compare with the newest previous
`docs/audits/*-health.md` if one exists and mark each finding new / still
open / fixed.
1. Repo: `npx tsc --noEmit`, `npm run lint`, `npm test`; `npm audit
   --omit=dev` (report only, never `npm audit fix`); `npm outdated` (report
   majors only). `next build` may fail on sandbox egress: report, do not chase.
2. Production crawl: fetch `https://explorebarbizon.com/sitemap.xml`
   (follow the canonical-host redirect if any),
   then every URL in it plus `/` and `/en`. Record non-200s, redirect chains
   longer than one hop, pages whose `<title>` or meta description is missing,
   and every internal link (`href` starting with `/`) that 404s. Run
   `node scripts/seo-audit.mjs` with `SEO_AUDIT_BASE_URL` set to production
   if the anon key env vars exist; otherwise skip it and say so.
3. Media: every `media.url` and every `locations.cover_image_url`-type URL in
   published rows: HEAD request, list non-200s.
4. Database integrity (Supabase project afqyrxtfbspghpfulvmy, SELECT only):
   published locations missing lat/lng, address, short description, French
   or English text, or `translations.en._meta.status = 'published'`;
   `v_translation_health` stale and draft counts; published rows whose
   category is in another town; duplicate slugs; tours and routes with
   English in base columns (known: task 8abfda99, mark still open);
   `story_locations` rows pointing at unpublished locations; tasks stuck in
   `in_progress` for more than 2 days (known: c36a9fb2).
5. Supabase `get_advisors` for security and performance: list each lint.
6. Vercel: latest production deployment state and runtime errors from the
   last 24 h (Vercel MCP, team `team_kzDW8vlvrFGCPql8o924gJMC`, project
   `prj_RXCdaPaVsPSRfjo7xEJQfHjdQJYm`).
File follow-up tasks for every high and medium finding not already covered.

## S2, research sweep

Goal: move `research_findings` rows from `open`/`lead` to `confirmed` or
`refuted`, and log what was learnt so nothing is researched twice.
1. Select rows with `status in ('open','lead')`, order by: rows with a
   `location_id` or `story_id` that is published first, then `created_at`.
   Work one `subject` at a time (all its rows together).
2. For each claim, look for Tier 1/2 evidence in reachable sources:
   archive.org (full text of period books and periodicals), Google Books,
   POP/Mérimée, data.bnf.fr, Gallica if reachable, Archives 77 finding aids,
   Wikimedia Commons file metadata. Cross-check any Tier 3 lead.
3. Update the row when the evidence settles it (`status`, `method`,
   `source_title`, `source_date`, `source_page`, `source_url`, a quote under
   15 words, `notes` with the reasoning). Insert new rows for new facts found
   on the way (`status 'lead'` unless Tier 1, `dossier` = this run's file).
   Do not change a row you could not improve.
4. Write `docs/sources/research-sweep-<date>.md`: per subject, what was
   checked, outcome, sources, and any change it implies for published text
   (as a proposal for Luigi, never applied). Published content flagged as
   possibly wrong gets a follow-up task, after the duplicate check.

## S3, practical facts for published locations

Goal: give the human opening-hours backfill (a0fea870) and the contact
fields a sourced head start. Proposals only.
1. Select published locations in visitor-facing categories (restaurants,
   hotels, chambres d'hôtes, salons de thé, galleries, shops, museums,
   tourist office, pharmacy) whose `opening_hours` is null, plus any missing
   website or phone. Skip any location already having a `research_findings`
   row with `subject = 'practical:<slug>'` from the last 30 days.
2. For each, find the business's own website, Google Business listing text
   as shown in search results, Office de Tourisme / Seine-et-Marne Attractivité
   listing, or Pages Jaunes. Prefer the business's own site. Note when sources
   disagree and when hours look seasonal.
3. Insert one `research_findings` row per location: `subject
   'practical:<slug>'`, `location_id`, `status 'lead'`, `method 'secondary'`,
   `claim` = hours in the canonical shape
   `{"mon":[["10:00","18:00"]],...}` (lowercase mon to sun, closed days
   omitted) plus website and phone, `source_url`, `source_title`, `found_on`
   today, `notes` with disagreements. Never write `locations`.
4. Write `docs/sources/practical-facts-<date>.md` summarising coverage
   (found / conflicting / nothing found) and listing the ready-to-review rows,
   so Luigi can confirm them in one pass.
