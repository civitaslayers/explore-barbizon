# Current State

Last updated: 2026-10-08

## Status

**2026-10-08 overnight session 3 — merged and deployed.** Seven `overnight3/*`
branches (jobs 1–7 of the 2026-10-07 overnight session, ten task IDs) were
merged locally on `main` in the reviewed order (docs-stale-sections →
tool-model-remnants → rls-blind-family → popup-escaping → my-day-directions →
stories-related-db → worktree-bootstrap), pushed once as `f9a1cf8`, and
deployed as `dpl_6iQJF8wLxqN7EwFwhn7tuAfozmKA` (READY, production). Rollback
target: `dpl_6UVBQYefXdnRRkrxrJv2N1ZaAPdS` (commit `46cae34`). Conflicts were
limited to the `package.json` test line at every step (union kept) plus two
adjacent import lines in `components/MapGL.tsx` (both kept). Pre-push gate on
the merged tree: tsc clean, lint 0 errors / 9 pre-existing warnings,
check:i18n pass, build green, 130/130 tests. Post-deploy: `scripts/seo-audit.mjs`
against production shows the same 23 known failures as before (task 749c5760),
none new; `/en/stories/rooms-of-light` serves the English sidebar; `/map` 200
with the v0.1 strings; `/api/tasks` and `/api/tasks/prompt-templates` return 401
without Basic Auth. Landed: popup HTML escaping (`lib/popupHtml.ts`), the
RLS-blind family closed (all CCC mutations via `/api/tasks/…`, anon helpers
deleted, `lib/rlsBoundary.test.ts`), Claude-only presets, My day v0.1 walking
routes via Mapbox Directions (Luigi's allowance / forest spot-check /
`walking_speed` decisions still open), DB-sourced related stories, the stale
docs fixes, and `scripts/bootstrap-worktree.mjs`. Tasks 2663bba1, 0c6961fa,
fe9f0e5d, b696ede8, 838c32a4, 0f159817, 33c21389, 4849c0f0, 9764665c, 760db1c3
set to done; the eight `overnight3/*` branches deleted. Audit follow-ups filed
2026-10-07: aa55488c, 1b0ab544 (visitor-visible French on /en), fe8ecbb1
(contrast), 3bb15319, 749c5760, 7066408c, bc8e61e7, plus fde4fa7c, aa74362d,
d9f5e4c3, a46d0dc9. Open for Luigi: `.claude/settings.json` allowlist for the
bootstrap script; the pre-commit-hook assumption in CLAUDE.md/run-loop (no such
hook exists); 56029c79 should also move prompt-templates to `/api/prompt-templates`.

---
**2026-10-06 overnight session 2 — merged.** 7 queued tasks (15 task rows —
several jobs each covered multiple task IDs) were worked end-to-end
(plan → implement → review) overnight on individual `overnight2/*` branches
off `main`, each pushed with build/lint/test/check:i18n green. This morning,
on Luigi's explicit approval, all 7 branches were rebased onto current
`main` (which had since gained PRs #5 and #6, the day-planner decision) and
merged locally in the report's recommended order, then pushed once
(`c4c6c93..50fca45`), producing one production deploy
(`dpl_FEPePo9RMRpsWjQPYCHnrg28xdbk`, READY). Rollback target if needed:
`dpl_8fTDBTzcE3SoDTFDJ8rj7v61S9AQ` (commit `c4c6c93`, the production
deployment immediately before this push).

Two merge-time conflicts, both predicted in the overnight report:
`lib/commandCenter.server.ts` (two branches each appended new admin-client
functions at the same insertion point — resolved by keeping both blocks) and
`docs/ccc-schema.md` (two branches independently reached the same fix for
the `target_agent` column line — resolved by keeping the docs-updates
branch's version, per Luigi's explicit call). Full verification gate
(tsc/lint/test/check:i18n/build) green after every merge step and on the
final merged `main`; `seo-audit` against a local build showed 23
pre-existing title/meta-description length failures on story/tour/location
editorial copy (zero hreflang/JSON-LD/sitemap failures) — confirmed
unrelated to any of the 7 merges, same pre-existing debt class explicitly
accepted before. Post-deploy verification on `explorebarbizon.com`:
`/places` and `/en/places` serve correctly localized category labels (French
on `/places`, English on `/en/places`); `/map` page-data confirms each pin
carries both the unchanged `category` lookup key and the new `categorySlug`
field. All 15 task rows set to `done`. Branch cleanup: `git cherry`
confirmed the stray mixed branch (`overnight2/claude-only-tool-model-cleanup`,
noted as a loose end in the entry below) and its local backup added nothing
not already on `main` by content — both deleted, local only, never pushed.
All 7 merged `overnight2/*` branches deleted, local and origin.

Fixed across the 7 branches: category display labels now localize on FR/EN
routes (homepage, `/places`, map popups) via a slug-keyed
`categories.<slug>` catalogue; three more RLS-blind-read instances
(dispatch/run/outputs.ts, prompt_templates) via the established admin-client
pattern — the task-automation HTTP contract had never actually worked
end-to-end before, since every call 404'd under deny-all RLS; a real UI
data-loss bug in the CCC tasks list (closed `<select>` going blank for
unknown assignee values, destructive clear option at the blank select's
first position); two previously-broken task templates (code/research
presets defaulting to retired `cursor`/`chatgpt`, un-runnable by
`/api/tasks/[id]/run.ts`'s own gate) now default to `claude`; an LLM prompt
that was teaching itself to assign new tasks to a retired tool fixed; four
doc/migration-comment fixes (sources.md, ccc-schema.md decisions/memory
tombstone, schema-reference.md now documents live `stories`/`routes`); three
hygiene fixes (dead `DbLocation` type, a spent 1055-line corrective patch,
an imprecise image `sizes` hint). A read-only investigation confirmed
`page_views.referrer_host` is null by design, not bug — Luigi chose option
(a) (accept `document.referrer` from the beacon body, first page load only,
hostname-only extraction) for the follow-up task (`dd1a7f49`); not yet
implemented.

`CLAUDE.md`'s `MAIN_BRAIN.md` hard constraint now carries an explicit
exception line (Luigi's instruction): modification is allowed only when
Luigi explicitly asks for it in the current session, and only to record a
decision already written to `brain/decisions.md` — written to close the gap
the overnight session flagged around the day-planner PR #5 edit below.

Full per-branch detail, the verification results, and the complete list of
follow-up tasks filed are in `~/overnight-report-2026-10-06.md` (outside the
repo, not re-duplicated here).

---

**2026-10-06 "My day" decision, PR #5.** Task `a44d7765` (done).
`brain/decisions.md` gains the 2026-10-06 entry: the day planner from the
Barbizon Mobile Rethink board is a layer on the map, not a new product model,
and 1A's "the day is the product" / Today-tab premise is rejected.
`MAIN_BRAIN.md` gains one line under "Product model" pointing to that entry.
This is an explicit exception, approved by Luigi, to the do-not-modify rule.
The branch `docs/my-day-decision` was cherry-picked from `origin/main`,
reviewed by Luigi and merged as `ba10c79`. Doc-only, so it needs no deploy or
SEO audit. Tasks table: `a44d7765` is done and `3c5b17b5` (planner v0) moved
from `backlog` to `ready`. `/run-loop` has not been started for it.

---
2026-10-06 design review and planning (claude.ai, live DB, verbatim handoff):
- Session start: 107 of 111 locations published, 100 with English; 54 non-done tasks.
- "Barbizon Mobile Rethink" (Claude Design project 7b5a0592) revisited. 1A conflict resolved: the day planner ("My day") is a layer on the map, not a new product model. Recorded in brain/decisions.md 2026-10-06 (PR #5, merge ba10c79).
- Planner dependencies unchanged since the 2026-08-15 review: opening_hours on 16 of 107 published, media on 52 of 107, 0 video, phone on 27 of 107, no price or amenities columns, no parking-distance table, 2 tours.
- page_views now holds 69 rows (0 at the 2026-10-04 audit).
- Tasks filed after a duplicate check: a44d7765 record decision (done), 3c5b17b5 planner v0 (ready, P2), f7e2a3e7 2A token inversion (ready, P3), a0fea870 opening hours backfill (ready, P2, human), d074fa2e Auberge Ganne 1987 vs 1995 verification (ready, P2), 7233da57 location_parking_distances (backlog, P4), fed18dd4 planner v1 hours-aware (backlog, P4).
- Places grid photography from the 2A board is covered by existing task bd73b953; no new row filed.
- Open, awaiting Luigi: the two P1 Heritage Plaque tasks overlap (verification must precede migration); not yet linked or merged.
- Duplicate copies of the decision commits remain on overnight2/claude-only-tool-model-cleanup and drop out when that branch is rebased onto main.

---
2026-10-05 content work (claude.ai, live DB, verbatim handoff):
- Stories: all 9 migrated to French-native (base columns) with English in translations.en +published; byte-verified against reviewed batch files. v_translation_health stories: 9 current.
- Fact corrections in stories: Hugo/Sand moved from the 1850s to the 1870s; "le grand refusé"; 300,000 gold francs figure removed (belongs to 1870s debates); Ganne "paid in paintings" now framed as legend; museum opened 1995 (bought 1987, departmental 2004); Denecourt 1842 and "le Sylvain"; protection = artistic series 1853, decree 13 August 1861 (1,097 ha = 542 + 555); Gleaners 1889 sale + Pommery donation 1890 confirmed (Orsay); guides cross-checked against locations (Barjole, L'Ermitage, Muse Galerie no. 82, Via Veneto, Bas-Bréau/Siron, L'Esquisse museum, population). Broken body links /places/forest-entrance, /places/grande-rue, /places/musee-de-barbizon removed.
- Guides: Besharat superlatives reduced to facts; transparency line added to where-to-stay (Luigi's decision); Le P'tit Angélus, Artemis Suite & Gîte (independent B&Bs) and Galerie L'Angélus added.
- Locations corrected (FR+EN, _meta current): ae-ganne (payment legend, 1820s, 1987/1995/2004), les-pleiades (Daubigny ownership and 1830s claims removed, plaque kept), lesquisse (one sentence). Location EN also published: la-poste-barbizon, mairie-barbizon, chene-sully. tours.name "Parcours des Mosaïques".
- Locations: 100 current, 11 missing (7 Heritage Plaques + 4 unpublished).
---

**2026-10-05 story cover images + getLocalized wiring merge.** Tasks
`46b54e68` (story cover images, done) and the `getLocalized` wiring
prerequisite of `be763b6d` (stories French-canonical migration, task itself
still open — content authorship is the remaining piece) merged to `main` via
two sequential merges (`b3aeb70`, `88045fe`), pushed once
(`5beeb24..88045fe`), one production deploy (`dpl_6Y9L1JA78EHWfDN3C63XQ76zT2Hh`,
READY). Rollback target: `dpl_9gtJLW4nbMpDFNCxxzNH5Pq5ytQ8` (commit `5beeb24`,
prior production).

`pages/stories/index.tsx` and `pages/stories/[slug].tsx` now correctly read
`title`/`subtitle`/`body` through `getLocalized()` (previously `index.tsx`
didn't call it at all, and `[slug].tsx` wired title/subtitle but not body) —
confirmed behavior-neutral today, since no story row has a published
`translations.en` yet.

Schema: `stories.cover_credit`, `stories.cover_alt` added (migration
`add_stories_cover_credit_alt.sql`, approved by Luigi). All 9 `stories` rows
now carry `cover_image_url`/`cover_credit`/`cover_alt` in FR base columns,
mirrored into `translations.en` (dormant — no `_meta` written for these two
fields, surfaces once `be763b6d`'s content migration publishes the row). 5
public-domain paintings (Millet ×2, Monet, Rousseau, Corot — each verified
PD-Art/CC0 directly off its Wikimedia Commons file page, not assumed)
uploaded to R2 under `stories/<slug>-{1600,800}.webp`; 4 covers reuse existing
own-site location photography, no re-upload. `/stories` index: essay cards
get 4:3 thumbnails, "Dans le village" guide cards get 16:9; story detail
pages get a full-width `object-contain` hero (paintings aren't cropped) with
a conditional credit caption (only when `cover_credit` is non-null). Story
`theme` values also localized (`story.themes.*` in `common.json`, 7 known DB
values mapped, unknown falls back to `story.themeFallback`) — `
components/RelatedStories.tsx` still renders `theme` raw/unmapped on the same
page, flagged as an addendum to the pre-existing `33c21389` follow-up
(replace the hardcoded `RELATED` const with a DB-sourced query), not fixed
here.

Verified on production: `/stories`, `/en/stories` show covers + localized
theme labels; `/stories/the-gleaners` shows hero + correct FR credit caption;
`/stories/inn-paintings-dinner` shows hero with zero caption elements
(own-photo cover, no credit, by design).

**Next:** claude.ai will write the French story text (title/subtitle/body,
all 9 rows) into the DB per task `be763b6d`'s remaining scope. One redeploy
needed afterward for the static pages to pick it up — no code change
required, the read path is already wired.

**2026-10-05 editorial prose merge.** Tasks `1b180958` (homepage/about/history/
plan-your-visit FR/EN prose + HistoryTimeline restructure) and `15dbdb55`
(`pages/stories/index.tsx` FR/EN prose) merged to `main` via `ef92e5c` on branch
`feat/editorial-prose-i18n`, pushed once (`8dc8416..ef92e5c`), one production
deploy (`dpl_9gtJLW4nbMpDFNCxxzNH5Pq5ytQ8`, READY, aliased to
`explorebarbizon.com`). Rollback target: `dpl_3RGbZsEFB2i9m188TcNuDVS1iLYN`
(commit `8dc8416`, prior production). New `public/locales/{fr,en}/pages.json`
carries all editorial prose for home/about/history/plan-your-visit/stories,
copied verbatim from Luigi-approved sources (a claude.ai-authored markdown
handoff for the first four pages, direct chat-supplied strings for stories and
two gate-feedback fixes). `HistoryTimeline.tsx` restructured from 13 to 11
events (`{dateKey,tag,headlineKey,detailKey,essayLinks}`), the homepage hero
now renders per-locale line breaks via a `titleLines` array (not `<br/>`), and
`scripts/check-i18n-strings.mjs` gained a permanent FR/EN key-parity check
(there was never a `KNOWN_UNMIGRATED` allow-list to remove, despite being
asked for one three times across this task — confirmed absent each time).
`tours.name` typo fixed directly in the DB by claude.ai (`Parcours des
Mosaïques`) — EN variant not expressible, `tours` has no `translations`
column, follow-up task filed. Verified on production: `/`, `/en` show the
3-line hero in both locales; `/history`, `/en/history`, `/stories`,
`/en/stories` all 200 with correct FR/EN titles and copy. Known gap, not
fixed here: homepage/`/places` category eyebrows (e.g. "Artist House") still
render English on FR routes — this is DB data (`categories.name`), not a
hardcoded string, and doubles as a lookup key in `MapGL.tsx`'s icon map —
follow-up task filed, needs a `categories.slug`-keyed label map, not a direct
translation of `categories.name`.

**2026-10-05 overnight session — merged.** 10 queued tasks (11 task rows — task 10
covered two) were worked end-to-end (plan → implement → review) overnight on
individual `overnight/*` branches off `main` (`ec8f13e`), each pushed with a Vercel
preview, none merged at the time. This morning, on Luigi's explicit approval, all 10
branches were merged to `main` locally in dependency order and pushed once
(`ec8f13e..11ad938`), producing a single production deploy. Two rebase-first merges
(`overnight/cards-800w-srcset` before `overnight/curated-cards-error-handling`'s
`CuratedSection` edits, and `overnight/stale-strategy-docs` before `overnight/
reconcile-claude-only-tool-model`'s `CLAUDE.md` edits) completed with zero real
conflicts — both pairs touched the same file but different lines/sections, so content
from both sides was retained automatically. Build/lint/tsc/test/`check:i18n` all green
after every merge step and on the final merged `main`; `seo-audit` showed 32
pre-existing title/meta-description length failures on stories/tours editorial copy,
confirmed unrelated to any of the 10 merges (zero diff vs. the pre-merge commit on
`pages/stories`, `pages/tours`, or SEO rendering code) — Luigi approved proceeding
past this pre-existing debt rather than blocking the push on it. Rollback target if
needed: `dpl_7HWkA3HcmsyZvRL3Kpe6DwajUkdG` (commit `ec8f13e`, the production
deployment immediately before this push). Post-deploy verification on
`explorebarbizon.com`: `/sitemap.xml` includes `/history` and `/stories`; `/en/map`
page-data shows the English short description for `auberge-ganne`; `/places` curated
cards render real content (not the new empty-state fallback). All 11 task rows set to
`done`; all 10 `overnight/*` branches deleted, local and origin. Fixed: `/en/map`
locale bug, missing sitemap routes, silent curated-cards catch, dead
`getLocationBySlug()`, 800w card images, `suggest.ts` RLS-blind-read, CCC Decisions/
Memory panel removal (pages deleted outright, 404 not redirect — Luigi approved),
`upload-media.mjs --only` flag, Claude-only tool model doc/code reconciliation, stale
strategy docs (`MAIN_BRAIN.md` counts, `architecture-summary.md`,
`brain/roadmap.md`) + `tasks.status`/`execution_status` orthogonality documentation.
11 follow-up tasks filed overnight (10 new + 1 addendum to pre-existing task
`5c3e4fcf`), highest-priority being a newly-found RLS-blind-read bug in the
task-automation HTTP contract itself (`dispatch.ts`/`run.ts`/`outputs.ts`) — not
fixed, deliberately kept out of scope. Full per-task detail in
`~/overnight-report-2026-10-05.md` (outside the repo). Decision 1 proposed in that
report (map-popup locale predicate reuse) needs no `brain/decisions.md` entry — it
only confirms the existing one-predicate rule, per Luigi.

`/places` payload trim + EN short_description fallback fix (task 8ec7a8fb) merged to main
(`511c2e2`, fast-forward from `feat/places-payload-trim`) and deployed to production. `/places`
page-data dropped from ~142-145 kB to ~85-88 kB (both locales) by trimming
`getPublishedLocations()`'s select to only the fields the list page actually renders. Investigation
also found a real bug exposed by the language switcher going live: `/en/places` was silently
showing French short descriptions on every card, even for locations with a published English
translation, because the query never selected anything from `translations`. Fixed via two
PostgREST JSON-path-aliased select columns, rendered through the existing shared `getLocalized()`
helper (same predicate as the hreflang gate — not reimplemented). Same fix folded into the "Where
to eat"/"Where to stay" curated cards on the same page. Verified on production: `/en/places` shows
English for `auberge-ganne` (published) and correctly falls back to French for `chene-sully`
(translation still `draft`). `/map`'s equivalent bug (Mapbox popups) is real but structurally
different — filed as its own task rather than folded in. Two cleanup items also filed from
release-check findings: a dead `getLocationBySlug()` using the forbidden `select("*")` pattern, and
a silent catch around the curated-cards query that should log/surface failures instead of quietly
rendering empty.

---
2026-10-04 afternoon content work (claude.ai, live DB, verbatim handoff):
- Art & History, 7 non-plaque records rewritten in French with English. v_translation_health locations: 97 current, 3 draft, 11 missing (7 Heritage Plaques + 4 unpublished).
- Major corrections: cimetiere-barbizon (Millet and Rousseau are buried in the Chailly-en-Bière cemetery, not Barbizon's; Barbizon became a commune in 1903 and its cemetery was created after that; L'Angélus was not bought by the State after Millet's death: sold 1889, bought back by Chauchard, bequeathed to the Louvre 1909). monument-farman (record conflated the Barbizon stele with the Issy-les-Moulineaux monument; the Barbizon stele is "Aux frères Farman", inaugurated 18 May 1985, on the plain where Maurice Farman landed to reach the family property).
- Minor corrections: chene-sully, caverne-des-brigands, allee-john-constable (unsourced claims removed). full_description cleared on 6 records where it repeated false claims. All logged in internal_notes with sources.
- Published EN: allee-john-constable, caverne-des-brigands, cimetiere-barbizon, monument-farman.
- Draft EN, pending: la-poste-barbizon and mairie-barbizon (facts confirmed by Luigi, awaiting publish approval); chene-sully (Luigi believes the tree may be dead; on-site check needed before publishing; the published French says it is standing).
- Domain: explorebarbizon.com is now primary, www redirects with 308 (task 06e9fec8 done). Search Console sitemap resubmission pending (Luigi).
- Possible new pin: Chailly-en-Bière cemetery (real graves of Millet and Rousseau), outside the commune; deferred with the multi-town question.
---

UI-chrome i18n strings (task cc6e5703) and the FR/EN language switcher (task ea615bf5) merged to
main (`5a86b67`, fast-forward from `feat/i18n-strings-switcher`) and deployed to production.
Nav/footer/bottomNav/microcopy/aria-labels now read from `public/locales/{fr,en}/common.json`
instead of hardcoded English leaking onto French pages; `pages/_document.tsx`'s `lang="en"`
hardcoded-on-every-page bug fixed; a `LanguageSwitcher` (`FR · EN`, URL-only state, no
cookie/localStorage) sits in the header and mobile drawer, disabled on the FR→EN direction only
when a record has no published translation (same `hasPublishedTranslation` predicate as the
hreflang gate — verified correct on the escape-hatch case: a visitor already on an EN page with no
real translation sees EN as active, not disabled). New `scripts/check-i18n-strings.mjs` /
`npm run check:i18n` enforces French typography (non-breaking space before `: ; ! ?` and inside
`« »`) in `fr/*.json` — this had been planned alongside the strings work but hadn't actually
landed until this merge. Scope was deliberately split: long-form editorial prose (homepage, about,
history, plan-your-visit, the 13 HistoryTimeline events) was carved out to a new queued task,
since mechanical/agent translation of narrative copy risks flat, non-native French — this branch
shipped only mechanical UI chrome + the switcher. Two rounds of Luigi copy review landed in two
follow-up commits before merge (stories "Histoires"→"Récits", several action-label rewordings,
opening-hours "default"-only-entry rendering with no row label, `places.metaDescription` rewritten
twice — last round fixed an EN typo and trimmed FR to 152 chars). Verified on public production:
`/places` and `/en/places` serve the final reviewed meta descriptions; the switcher on
`/places/auberge-ganne` is live (FR active, EN links to `/en/places/auberge-ganne`).

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
- [perf+i18n] `/places` payload trim + EN fallback fix shipped (task 8ec7a8fb; branch feat/places-payload-trim; merge 511c2e2, fast-forward to main; deployed 2026-10-04). `getPublishedLocations()` in `lib/supabase.ts` now has its own dedicated row type/mapper (`toLocalizedPlace`, not the shared `toPlace()`) selecting only the fields `pages/places/index.tsx` renders, plus two PostgREST JSON-path-aliased columns (`translations->en->>short_description`, `translations->en->_meta->>status`) resolved through the shared `getLocalized()` helper — fr/en page-data dropped from ~142-145 kB to ~85-88 kB. Same treatment applied to `getFeaturedEatStayCurated()` (the curated cards on the same page). Verified on production: `auberge-ganne` (published) shows English, `chene-sully` (draft) correctly falls back to French. `/map`'s equivalent popup bug filed separately (imperative Mapbox rendering, different fix shape). Two cleanup tasks filed from release-check findings: dead `getLocationBySlug()`/`select("*")` removal, silent-catch-to-logged-error on the curated query.
- [ops+i18n] UI-chrome strings + FR/EN language switcher shipped (tasks cc6e5703, ea615bf5; branch feat/i18n-strings-switcher; three commits — e1543ae strings, e6e6690 switcher, 25d300a+5a86b67 Luigi's copy review; fast-forward merge 5a86b67; deployed 2026-10-04). `components/LanguageSwitcher.tsx` new; `components/Layout.tsx` gained `hasEnglishVersion?: boolean` (default `true`); `pages/places/[slug].tsx` computes it via `hasPublishedTranslation()`. Found and fixed in passing: a duplicate top-level `"map"` key in both `common.json` files that was silently clobbering keys; a `MapGL.tsx` bug where `/en/map` pin popups linked to the French `/places/...` page; dead legacy code in `places/[slug].tsx` (~21 untranslated strings removed with it). Editorial prose (homepage/about/history/plan-your-visit/HistoryTimeline body copy) deliberately split out — new queued task for native French authorship, not a mechanical pass.
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
1. Editorial prose French translation — homepage, about, history, plan-your-visit, HistoryTimeline (split off cc6e5703; needs native authorship, not a mechanical pass)
2. Remaining French migration records (93 of 107 now have published English; ~14 still need translation + status stamp)
3. Map popups render French short_description on /en/map — same bug class as 8ec7a8fb, different fix shape (imperative Mapbox rendering)
4. suggest.ts anon blind-read follow-up (task 08309b0b) — swap getTasks() for getTasksAdmin(); small
5. Stories hreflang gating — same `translations`/`_meta.status` contract as locations, currently unconditional; queued follow-up from the eb5f1e3e branch
6. page_views retention/purge job (25-month cap per 2026-08-13 decision) — outstanding since the schema shipped
7. Replace silent catch around /places curated-cards query with logged error + visible empty state (release-check finding)
8. Remove dead getLocationBySlug() (uses forbidden select("*")) (release-check finding, P5)

## Next Session Starting Point
Tracker, hreflang gating, UI-chrome i18n strings, the FR/EN switcher, and the /places payload trim
are all live in production. Next priority: either the editorial-prose translation task or the
/map popup locale bug (same class as the /places fix just shipped), then continuing the French
migration (translations need both the content AND the `_meta.status=published` stamp to actually
surface via hreflang/getLocalized/the switcher/the places list).

## Operational lessons (salvaged from the retired task-queue.md)

- [x] [bug/prod] **`remotePatterns` production bug fixed** (same merge): `media.explorebarbizon.com` was missing from `next.config.mjs`, so `next/image` 400'd on every R2 hero — broken live on 2 locations, would have broken all 54. Invisible locally; proven preview-200 vs prod-400, then 200 live. Repairs `dormoir-de-lantara`.
- [x] [i18n/hotfix] `/en/` 500 production regression fixed (merge `812b144`, 2026-07-14, own worktree): next-i18next config passed explicitly at all 11 `serverSideTranslations` sites + `_app` + `outputFileTracingIncludes`. Verified live — all `/en/` routes 200; prod seo-audit 64/40/2, every hreflang/JSON-LD/sitemap check passes. Preview-audit process rule made executable (auth spot-fetch pre-merge; full audit post-merge on public prod).
- [ai-ops] [`source='loop'`, task `eb69de89`, `.claude/**`-gated] Extend the deployed-runtime verification class to `next.config.mjs` `images.remotePatterns`. Evidence (2026-07-17): the release-checker read CLAUDE.md's rule and **correctly** concluded the mandatory preview gate didn't apply — the class enumerates locale routing / runtime config / page data methods, and remotePatterns is none of them. But the change had the identical signature the rule exists to catch: `next build` passed with the hostname both present and absent, and the defect was only visible by querying production (`/_next/image?url=…` → 400 while the R2 origin → 200). `next.config.mjs` is now 2-for-2 on locally-invisible production defects (i18n bundling; image remotePatterns). Generalize the class to the shared property, add the `_next/image` → 200 preview check to the release-checker brief. (Third retrospective proposal.)
- [seo/infra] Thread a Vercel **Protection Bypass for Automation** token (`x-vercel-protection-bypass` header) into `scripts/seo-audit.mjs` so the full audit can run against SSO-protected Preview deployments — makes the pre-merge preview gate fully automated (currently pre-merge uses authenticated spot-fetches; full audit runs post-merge against public production). Follow-up from the 2026-07-14 /en/ 500 hotfix.
