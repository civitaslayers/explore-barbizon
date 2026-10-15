# Practical facts research, 2026-10-15

Standing job S3 (task `19af6859`). Proposals only: nothing in `locations` was
touched. Every finding is a `research_findings` row with `subject =
'practical:<slug>'`, `status 'lead'`, `method 'secondary'`, `found_on
2026-10-15`, `dossier` = this file. Review query:

```sql
select subject, claim, source_title, notes
from research_findings
where dossier = 'docs/sources/practical-facts-2026-10-15.md'
order by subject;
```

## Coverage

Eligible: 48 published locations in visitor-facing categories with
`opening_hours` null or website/phone missing (query in the task brief,
widened to all shop categories). None had a `practical:` row from the last
30 days.

| Outcome | Count | Slugs |
|---|---|---|
| Found, rows inserted | 26 | see table below |
| of which with a source conflict | 7 | l-angelo, galerie-langelus, galerie-roz-in-winter, office-tourisme-barbizon, via-veneto-glaces, galerie-alfart-lbk, pharmacie-barbizon |
| Nothing found (no row) | 7 | cercle-laure-henry, galerie-39, galerie-41, tabac-barbizon, le-chic-barbizon (Airbnb listing only, already the DB website), parcours-des-mosaiques, plaine-angelus-site-peinture (open-air site, no business hours) |
| Source found but unreadable in session (no row) | 1 | boucherie-angelus: OT fiche `https://www.fontainebleau-tourisme.com/en/file/5671860/boucherie-de-le28099angelus/` returned HTTP 429 |
| Not reached within the 60-minute budget | 14 | les-pleiades (hours only missing), galerie-atelier-drochon, muse-galerie, ptit-angelus, atelier-berangere, l-imaginarium, dame-aux-coquelicots, librairie-cyrano, maison-45, mon-oeil, nunchi, rose-barbizon, epicerie-de-barbizon, (Besharat suites function row) |

Rows inserted: 26. Tasks filed: 1 (`9f793766`, verify three contact-field
conflicts; the hours backfill itself stays under `a0fea870`).

## Sources and method

- Primary source this run: Fontainebleau Tourisme / Office de Tourisme de
  Barbizon fiches (Apidae records). Seine-et-Marne Attractivité republishes the
  same Apidae records, so it is not an independent confirmation.
- Businesses' own websites could not be fetched: the session's fetch tool only
  opens URLs returned by a web search, and the own-site URLs came from the OT
  pages. Blocked: `restaurant-le-gaulois-barbizon.fr`,
  `musee-peintres-barbizon.fr`, `lesquissebarbizon.fr`,
  `lafoliebarbizon.com/le-restaurant`, `cyralermitagegroup.com`. Each row's
  `notes` says so where it matters.
- Pages Jaunes and 118712 returned fetch errors; `tourisme-seine-et-marne.fr`
  detail pages returned server errors (only the Via Veneto page loaded).
- HappyCow and pharmao.fr are Tier 3 and are flagged as such in `notes`.
- Hours are stored in the claim as `{"hours":{"mon":[["10:00","18:00"]],...},
  "website":..., "phone":...}`; when the source gave days but no times the
  claim has `"hours": null` and an `"hours_text"` string instead. Auberge Ganne
  carries `hours` (1 Apr to 31 Oct) and `hours_winter` (1 Nov to 31 Mar).

## Ready-to-review rows

Phone and website columns show the sourced value; "= DB" means it matches the
current `locations` row. Times are from the OT fiche unless noted.

| Slug | Hours (proposal) | Phone | Website | Flag |
|---|---|---|---|---|
| barjole | daily, all year, no times | 01 60 66 41 29 | none found | |
| epicerie-vegetale | closed Mon + Wed, no times | = DB | none (Facebook) | |
| l-angelo | Mon-Thu 12-14 / 19-21:30; Fri 12-14 / 19-22; Sat 12-15 / 19-22; Sun 12-15 / 19-21:30 (HappyCow) | 01 60 68 93 18 | none (Facebook) | conflict: OT says only "weekends from 14:30" |
| ermitage-saint-antoine | Mon, Thu-Sun 12-14:30 / 19:30-00:00 | 01 64 71 00 25 | cyralermitagegroup.com | sub-function hours in notes |
| la-boheme | Mon-Fri, no times (DB already has hours) | = DB | none | cross-check DB hours |
| le-gaulois | Tue-Sat 12-14:30 / 19-21:30; Sun 12-14:30 | 01 64 52 35 04 | restaurant-le-gaulois-barbizon.fr | |
| le-royal | Tue-Sun 07:30-20:30 | = DB | none | |
| hotellerie-bas-breau | restaurant Tue-Sun 12-14 / 19:30-21 | 01 64 64 06 24 | hotelleriedubasbreau.fr | hours belong to the restaurant function |
| lesquisse | museum daily 11-18 | 01 85 45 01 00 | lesquissebarbizon.fr | |
| la-bastide-de-barbizon | all year, n/a | 06 84 95 14 54 / 06 89 15 02 26 | labastidebarbizon.fr | |
| la-folie-barbizon-hotel | restaurant Fri + weekends, no times | 01 89 56 67 00 | lafoliebarbizon.com | |
| petit-chateau-barbizon | all year, n/a | 01 87 58 11 12 | = DB | |
| villa-albertine | all year, n/a | 01 60 39 60 54 | none (Gîtes de France) | phone may be the booking line |
| artemis-suite-barbizon | check-in 16:30-19:00, out 11:00 | none found | none found | Tier 3; Luigi can confirm |
| besharat-gallery-barbizon | daily 10-19 | 09 67 18 24 65 | besharatgallery.com | owner-confirmable |
| galerie-langelus | Fine Art closed Mon-Tue; New Art closed Tue; no times | none on OT (DB has one) | = DB | conflict: address 34 vs OT 27 / 36 bis |
| galerie-roz-in-winter | daily, closed 1 Jan, no times | = DB | galerierozinwinter.com | conflict: DB has winterin.fr |
| auberge-ganne | Mon, Wed-Sun 10-12:30 / 14-18 (Apr-Oct), 14-17:30 (Nov-Mar) | 01 60 66 22 27 | musee-peintres-barbizon.fr | seasonal; closed Tue, 1 Jan, 1 May, 25 Dec |
| office-tourisme-barbizon | Wed-Sun, no times; closed 1 Jan, 25 Dec | 01 60 74 99 99 | = DB | conflict: DB 01 60 66 41 87 also on the page |
| la-patisserie-kg | Wed-Sat 10-19; Sun 10-18:30 | 01 60 68 10 06 | lapatisserie-kg.com | |
| via-veneto-glaces | Mon-Thu 14-18; Fri 14-19:30; Sat 11-19:30; Sun 11-18 | 06 17 38 56 78 | = DB | conflict: DB phone 06 19 81 33 98 |
| pharmacie-barbizon | Mon-Fri 08:30-12:30 / 14:30-20:00 (pharmao.fr, closing time unclear) | none usable | none | weak Tier 3 |
| valet-des-fromages | Mon-Wed 9-17; Thu-Sat 9-20; Sun 9-18 | 01 60 68 86 43 / 06 33 71 34 21 | none | |
| galerie-alfart-lbk | OT fiche self-contradictory (DB already has hours) | 06 23 09 19 24 / 09 54 67 17 03 | = DB | use for phone only |
| galerie-des-pains | Mon, Tue, Thu-Sun 06:30-20:00 (DB already has hours) | = DB | none (Facebook) | cross-check DB hours |
| la-juxtaposition | Wed-Sun 11:30-19:30 (HappyCow; DB already has hours) | none found | none found | Tier 3 |

## Follow-ups

- Task `9f793766` (backlog, p5): verify the three contact-field conflicts
  (galerie-langelus address, via-veneto-glaces phone, galerie-roz-in-winter
  website) plus the tourist-office phone.
- Next S3 run: start with the 14 unreached slugs above and the Boucherie de
  l'Angélus fiche; the 26 covered slugs are excluded for 30 days by the
  `practical:` subject rule.
