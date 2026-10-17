# Practical facts research, 2026-10-17

Standing job S3 (task `19af6859`), night of 16–17 October. Proposals only:
nothing in `locations` was touched. Every finding is a `research_findings`
row with `subject = 'practical:<slug>'`, `status 'lead'`, `method
'secondary'`, `found_on 2026-10-17`, `dossier` = this file. Review query:

```sql
select subject, claim, source_title, notes
from research_findings
where dossier = 'docs/sources/practical-facts-2026-10-17.md'
order by subject;
```

## Coverage

Eligible pool: 55 published locations with `opening_hours` null or
website/phone missing and no `practical:` row in the last 30 days. The 14
slugs left unreached on 2026-10-15 were all covered by a run on 2026-10-16, so
the remaining pool is mostly non-business rows (bus stops, parkings, climbing
areas, viewpoints, trails, plaques), which carry no hours or contacts by
nature and were not researched. Eight rows were real candidates.

| Outcome | Count | Slugs |
|---|---|---|
| Found, rows inserted | 5 | maison-de-rousseau, manoir-saint-herem (negative: business closed), cercle-laure-henry, galerie-39, parcours-des-mosaiques |
| of which with a source conflict | 2 | maison-de-rousseau (who runs it / event hours), galerie-39 (phone from an undated Mairie page) |
| Nothing found, row inserted with `[needs-local]` | 1 | dame-aux-coquelicots (Facebook page blocks robots) |
| Nothing found, no row | 2 | galerie-41 (no trace after a Feb 2019 show), le-chic-barbizon (Airbnb listing only, already the DB website) |
| Not researched (no business hours by nature) | 47 | artist houses (private), bus stops, parkings, EV charger, public toilets, cemetery, chapel, climbing areas, trails, viewpoints, plaques, forest sites |

Rows inserted: 6. Tasks filed: 1 (`27ee375a`, confirm the Rousseau house
operating model and hours; the hours backfill itself stays under `a0fea870`).

## Sources and method

- Business own sites where they exist: `musee-peintres-barbizon.fr` (reached
  this time via search results: access page node/62 and hours page node/63).
- Mairie de Barbizon: galleries page `barbizon.fr/musee-2/` (undated) and the
  "Été 2024" village map PDF (Tier 1 for addresses, dated).
- Registries (Tier 1 for existence and address): societe.com for the Manoir
  Saint-Hérem company, Pappers / RNA for the Cercle Laure Henry association.
- PanneauPocket (official commune channel) for the current Rousseau-house
  exhibition notice (modified 2026-10-13).
- Aggregators used only for corroboration and flagged in `notes`:
  officiel-galeries-musees.fr, Michelin Guide Vert, artistescontemporains.org,
  jds.fr, csc-maximin.fr, horaires-commerces.fr.
- Unreachable in session, noted once: Tavily (403 on search and extract),
  `amislh.fr` (http-only host, the fetcher loops on the HTTPS upgrade, events
  page blocks robots), `facebook.com` (robots). No workarounds attempted.
- Incidental corroboration for task `9f793766`: the Pages Jaunes listing for
  the Office de Tourisme de Barbizon (`pagesjaunes.fr/pros/07546947`) gives
  phone 01 60 66 41 87 (the current DB value) and Wed–Sun 10:00–12:00 /
  14:00–17:00, closed Mon–Tue. No row written (slug covered on 10-15).

## Ready-to-review rows

| Slug | Hours (proposal) | Phone | Website | Flag |
|---|---|---|---|---|
| maison-de-rousseau | museum hours: Mon, Wed–Sun 10:00–12:30 / 14:00–17:30, afternoons to 18:00 Apr–Oct; closed Tue, 1 Jan, 1 May, 24–25 Dec | 01 60 66 22 38 (site line), 01 60 66 22 27 (museum) | musee-peintres-barbizon.fr | conflict: commune notice shows a free show 24 Oct–8 Nov 2026 at 10–12 / 14–18 closed Mon+Tue; Michelin says closed for works (undated). Call before publishing (task 27ee375a) |
| manoir-saint-herem | none: company closed 2011, liquidated 2014, radiée 2016 | none | none | negative finding, keep as heritage plaque, publish no contact |
| cercle-laure-henry | exhibition-only, no regular hours | none found | amislh.fr (unreadable in session) | address 43 Grande Rue confirmed by register; `[needs-local]` |
| galerie-39 | per show (last seen Apr 2024, 11–19) | 01 75 18 12 00 | none | phone from undated Mairie page, verify |
| parcours-des-mosaiques | open-air, all year, free | 01 60 74 99 99 (OT) | visitparisregion.com page | keep `opening_hours` null |
| dame-aux-coquelicots | nothing found | none | none | `[needs-local: facebook.com/ladameauxcoquelicots]` |

## Follow-ups

- Task `27ee375a` (backlog, p5): confirm who runs the Maison-atelier Rousseau
  now and whether its hours are exhibition-dependent.
- Next S3 run: the visitor-facing pool is exhausted for 30 days. Remaining
  candidates are galerie-41 and le-chic-barbizon (both need a local or phone
  check) and the Cercle Laure Henry site for S4. Consider widening S3 to
  locations whose `opening_hours` is set but unsourced, or pausing S3 until
  the 10-15 and 10-16 rows have been reviewed.
