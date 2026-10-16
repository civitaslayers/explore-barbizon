# Practical facts research, 2026-10-16

Standing job S3 (task `19af6859`), second night. Proposals only: nothing in
`locations` was touched. Every finding is a `research_findings` row with
`subject = 'practical:<slug>'`, `status 'lead'`, `method 'secondary'`,
`found_on 2026-10-16`, `dossier` = this file. Review query:

```sql
select subject, claim, source_title, notes
from research_findings
where dossier = 'docs/sources/practical-facts-2026-10-16.md'
order by subject;
```

## Coverage

Eligible after the 30-day `practical:` exclusion: 72 published locations with
`opening_hours` null or website/phone missing. Most are open-air sites (bus
stops, parkings, trails, viewpoints, plaques, climbing areas) with no business
hours, so the run worked the 16 remaining businesses, starting with the 14
slugs yesterday's file listed as not reached.

| Outcome | Count | Slugs |
|---|---|---|
| Found, rows inserted | 12 | see table below |
| of which hours found with times | 4 | librairie-cyrano, nunchi, maison-millet, epicerie-de-barbizon |
| of which with a source conflict | 5 | maison-millet, muse-galerie, epicerie-de-barbizon, atelier-berangere, les-pleiades (closure vs. live listing) |
| Nothing found (no row) | 4 | mon-oeil (own site blocks the fetch tool, no other listing), l-imaginarium (only the gîte fiche at the same address, which gives the Gîtes de France line 01 60 39 60 54, not the shop), dame-aux-coquelicots (Facebook page only), le-chic-barbizon (Airbnb only, as yesterday) |
| Skipped, nothing new since yesterday | 4 | tabac-barbizon, galerie-39, galerie-41, cercle-laure-henry (searches again return nothing) |

Rows inserted: 12. Tasks filed: 1 (`6e11010d`, Les Pléiades closure, p4).

## Headline finding

**Les Pléiades is closed.** The hotel's own site has replaced its restaurant
page and news archive with a notice: *"l'hôtel a fermé ses portes pour une
durée de 2 ans afin de réaliser d'importants travaux d'embellissement"*. No
start or reopening date. lesrestos.com independently says the hotel no longer
has a restaurant. The published listing (21 Grande Rue, hotel + spa +
restaurant) currently shows it as open. Task `6e11010d` asks Luigi to confirm
on the ground and decide between a closure note and unpublishing.

## Sources and method

- Primary source this run: the businesses' own websites, reached by searching
  with the domain restricted so the fetch tool would accept the URL. This
  worked for Cyrano, Nunchi, Musée Millet, Maison 45, Drochon, Atelier de
  Bérengère, Muse Galerie, P'tit Angélus and Les Pléiades.
- Fontainebleau Tourisme fiches (Apidae) for the butcher and as a cross-check
  for Musée Millet and Atelier de Bérengère.
- Pages Jaunes loaded this time (one fiche) and is Tier 3; trouver-ouvert.fr
  and locale.online are Tier 3 aggregators, flagged as such in `notes`.
- Unreachable: `monoeil-barbizon.fr` (robots), `barbizon.fr` mairie site
  including its commerces directory (robots), Tavily (403 all night). The
  mairie directory is the one source likely to have Rose, L'Imaginarium,
  La Dame aux Coquelicots and the tabac in one place:
  `[needs-local: https://www.barbizon.fr/commerces-et-artisans/]`.
- Claim shape as yesterday: `{"hours":{"mon":[["10:00","18:00"]],...},
  "website":..., "phone":...}`; `"hours": null` plus `"hours_text"` when the
  source gave days but no times. Musée Millet carries `hours` (Apr-Oct) and
  `hours_winter` (Nov-Mar).

## Ready-to-review rows

Phone and website columns show the sourced value; "= DB" means it matches the
current `locations` row.

| Slug | Hours (proposal) | Phone | Website | Flag |
|---|---|---|---|---|
| les-pleiades | closed for ~2 years of works (own site, undated) | = DB | = DB | see task `6e11010d` |
| librairie-cyrano | Wed-Sat 10-12:30 / 14-18:30; Sun 10-12:30 / 14-17:30 | = DB | = DB | own site, clean |
| nunchi | Thu-Mon 14-19 | = DB (+ 06 22 28 05 27) | = DB | own site, clean |
| maison-millet | Apr-Oct: Mon 10-12:30 / 14-17:30, Wed-Sun 10-12:30 / 14-18; Nov-Mar: same, Wed also closed | 01 60 66 21 55 (+ 06 22 28 05 27) | = DB | conflict: OT fiche says daily all year |
| epicerie-de-barbizon | Mon, Wed-Sun 08-13:30 / 15-20:30 (Pages Jaunes) | = DB | none | Tier 3; trouver-ouvert differs on times; both conflict with DB daily 10-13 / 15-20; Tue closure is consistent |
| boucherie-angelus | Tue-Sun, closed Mon, no times | 01 60 66 40 27 | none | OT fiche |
| muse-galerie | Thu-Sun or by appointment, no times | none found | = DB | conflict: DB hours include Tue and Fri; site says 82 bis |
| ptit-angelus | n/a (DB has check-in) | 01 60 66 24 92 | = DB | own site |
| galerie-atelier-drochon | none published | = DB | = DB | email only |
| maison-45 | none published | = DB | = DB | email only |
| atelier-berangere | none published | = DB | = DB | OT lists 5 Résidence Les Charbonnières as address |
| rose-barbizon | none published | = DB | none | Tier 3 aggregator only |

## Follow-ups

- Task `6e11010d` (backlog, p4): Les Pléiades closure, confirm locally and
  decide closure note vs. unpublish.
- S4 (local): read `https://www.barbizon.fr/commerces-et-artisans/` and
  `https://www.monoeil-barbizon.fr/contact/` for Rose, L'Imaginarium, La Dame
  aux Coquelicots, Tabac, Mon Oeil hours.
- Next S3 run: the remaining eligible rows are open-air sites without business
  hours, plus mairie-barbizon and la-poste-barbizon (public services, outside
  the S3 category list, but both have null phone and hours). Consider widening
  S3 to public services once the mairie site is readable locally.
