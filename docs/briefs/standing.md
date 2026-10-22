# Standing night jobs

These run every night after the briefed queue is empty, while the run's time
cap allows, in the order S1, S2, S3. Task ids: S1 = 0a40e644, S2 = 7820f08f,
S3 = 19af6859. They are standing rows: after each run the loop puts them back
to `queued` with an `outputs` row pointing at the PR, so they never close.
S1 and S3 run at most once per night; S2 repeats until the cap.
S4 (task e791b48c) is not run by the cloud loop: the "Morning local checks"
scheduled task runs it on Luigi's computer, which has the network access and
keys the cloud sandbox lacks.
Read only the section you are running.

Rules for all standing jobs:
- Read-only on code: commit only new files under `docs/audits/` or
  `docs/sources/`. No code changes, ever.
- One docs PR per night. Every docs-only output of the night (S1, S2
  passes, S3, and any briefed job whose output is only files under
  `docs/`) goes on ONE branch, `night/<yyyy-mm-dd>-docs`, and ONE PR, where
  <yyyy-mm-dd> is the date the night run started (Europe/Paris), so a
  resumed fallback run uses the same name. The first docs job creates the
  branch from `origin/main`, pushes it, and opens the PR titled
  `night <yyyy-mm-dd>: docs and research`. Every later job, and a resumed
  run, fetches that branch, checks it out, adds its commits on top
  (messages start with the job, e.g. `S2 pass 3: ...`), and pushes. Never
  force-push: on a rejected push, fetch, rebase onto the remote branch,
  push again. Each job adds one PR comment (`gh api .../issues/<n>/comments`)
  naming the job, task id and file, and its `outputs` row points at that
  PR. Find the PR with `gh api "repos/civitaslayers/explore-barbizon/pulls?head=civitaslayers:night/<date>-docs&state=all"`;
  if it is already merged or closed, use `night/<date>-docs-2`.
  A briefed job that changes anything outside `docs/` keeps its own branch
  `night/<date>-<job>` and its own PR. This rule overrides older brief
  wording about one branch per job.
- Docs-only PRs show the Vercel check as skipped
  (`scripts/vercel-ignore-build.sh`); skipped counts as passing for them.
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
  Research rows that need an unreachable source get `notes` ending in
  `[needs-local: <url or query>]` so S4 can pick them up.
- SQL hygiene: one write statement per `execute_sql` call, and no semicolon
  inside a string literal (the connector splits on it and times out).

## S1, health audit

Produce `docs/audits/<date>-health.md`: one table per area, each finding with
severity (high / medium / low), evidence (file:line, URL + status, or SQL +
count) and a suggested fix in one line. Compare with the newest previous
`docs/audits/*-health.md` if one exists and mark each finding new / still
open / fixed.
1. Repo: `npx tsc --noEmit`, `npm run lint`, `npm test`; `npm audit
   --omit=dev` (report only, never `npm audit fix`); `npm outdated` (report
   majors only). `next build` may fail on sandbox egress: report, do not chase.
2. Production crawl (cloud runs: skip this step and step 3 and say "covered
   by S4"; the sandbox cannot reach production). Fetch `https://explorebarbizon.com/sitemap.xml`
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

## S4, morning local checks (Luigi's computer)

Runs from the repo at `~/Documents/Projects/explore-barbizon`, never in
Luigi's own working tree: `git fetch origin main`, then
`git worktree add .claude/worktrees/morning-<date> origin/main` (detached)
and `node scripts/bootstrap-worktree.mjs .claude/worktrees/morning-<date>`
from the main checkout, so node_modules and `.env.local` are shared. Never
print, copy out or commit a secret. Never `git checkout`, `reset`, `stash`
or `pull` in the main checkout, and never touch its uncommitted files.
1. SEO audit: `SEO_AUDIT_BASE_URL=https://explorebarbizon.com node
   scripts/seo-audit.mjs` (follow the canonical host if it redirects).
2. Crawl: S1 step 2 against production (sitemap, every URL, `/`, `/en`,
   non-200s, redirect chains, missing title or meta description, internal
   links that 404). Polite: one request at a time, a short pause between.
3. Images: S1 step 3 (HEAD every published `media.url`; list non-200s).
4. Research the cloud could not reach: `research_findings` rows whose
   `notes` contain `[needs-local:` plus open/lead rows whose notes say
   Gallica was unreachable, at most 10 rows, oldest first. Use Gallica's SRU
   and IIIF/ALTO endpoints with plain HTTP requests (no browser), under the
   S2 rules. Replace the `[needs-local: ...]` marker with the outcome.
5. One-off while `location_parking_distances` is empty: run
   `node scripts/compute-parking-distances.mjs` (dry run only, never
   `--execute`) and put its summary in the report: pairs computed, pairs
   skipped, and the five longest and five shortest walks by name.
6. Report `docs/audits/<date>-morning.md` (findings table as in S1, new /
   still open / fixed against the previous morning report), commit on
   branch `night/<date>-morning` in the worktree, push, open one PR via the
   GitHub REST API (`gh api`, not GraphQL). S4 keeps its own branch and PR: it runs on another machine while the
   cloud run may still be pushing, and sharing the docs branch would race. Its
   docs-only PR does not build. File follow-up tasks for high and
   medium findings under the shared rules. Then `git worktree remove` it.
7. Status: on start `update tasks set execution_status = 'in_progress',
   updated_at = now()` on e791b48c; at the end set it back to `todo` and
   insert an `outputs` row (agent 'morning-local', one line: PR, counts,
   highs). If the computer is asleep at the scheduled time the run simply
   does not happen; nothing needs recovering.
