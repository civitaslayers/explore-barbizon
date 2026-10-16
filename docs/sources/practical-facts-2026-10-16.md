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
hours, so the run worked the 18 remaining businesses and public services,
starting with the 14 slugs yesterday's file listed as not reached, then the
mairie and the post office.

| Outcome | Count | Slugs |
|---|---|---|
| Found, rows inserted | 17 | see table below |
| of which hours found with times | 8 | librairie-cyrano, nunchi, maison-millet, epicerie-de-barbizon, mon-oeil, tabac-barbizon, la-poste-barbizon, mairie-barbizon |
| of which with a source conflict | 7 | maison-millet, muse-galerie, epicerie-de-barbizon, atelier-berangere, tabac-barbizon, les-pleiades (closure vs. live listing), l-imaginarium (phone) |
| Nothing found (no row) | 2 | dame-aux-coquelicots (Facebook page only), le-chic-barbizon (Airbnb only, as yesterday) |
| Not a business with regular hours (no row) | 3 | galerie-39 (artistescontemporains.org and jds.fr describe an event space, hours only per exhibition, last listed 2024), galerie-41 (nothing found), cercle-laure-henry (association, amislh.fr blocks the fetch tool) |

Rows inserted: 17. Tasks filed: 1 (`6e11010d`, Les Pléiades closure, p4).

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
- La Poste's own locator (`localiser.laposte.fr`) is Tier 1 for the post
  office. Pages Jaunes loaded once (épicerie) and failed once (Mon Oeil);
  Mappy, trouver-ouvert.fr, locale.online, bureautabac.fr, au-magasin.fr and
  annuaire-administration.com are Tier 3 aggregators, flagged in `notes`.
- Unreachable: `monoeil-barbizon.fr` (robots), `limaginariumboutique.fr`
  (robots, has a /horaires/ page), `barbizon.fr` mairie site including its
  commerces directory and the 2022 village map PDF (robots), `amislh.fr`
  (robots), `weboptic.fr` (robots), Tavily (403 all night). The mairie
  directory is the one source likely to have Rose, L'Imaginarium, La Dame aux
  Coquelicots and the tabac in one place:
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
| mon-oeil | Mon, Tue, Thu 9:30-12:30 / 14:30-19; Fri to 19:30; Sat to 18 (Mappy) | = DB | = DB | Tier 3; own site blocked |
| tabac-barbizon | Tue-Sat 07:30-19:30 (bureautabac.fr) | 01 64 38 65 26 | maisondelapresse.com shop page | Tier 3; au-magasin.fr gives Mon + Sun open, Tue closed, and contradicts itself on Sunday |
| l-imaginarium | Wed-Sun per gîte listing, no times | = DB (unverified) | limaginariumboutique.fr | website new; hours page blocked |
| la-poste-barbizon | Tue-Sat 09:00-12:00 | none shown | laposte.fr locator | Tier 1, outside S3 category list |
| mairie-barbizon | Mon 14-18; Tue-Sat 09-12 | 01 60 66 41 92 | barbizon.fr | Tier 3 directory, official site blocked, outside S3 category list |

## Follow-ups

- Task `6e11010d` (backlog, p4): Les Pléiades closure, confirm locally and
  decide closure note vs. unpublish.
- S4 (local): read `https://www.barbizon.fr/commerces-et-artisans/`,
  `https://www.barbizon.fr/contact/`, `https://www.monoeil-barbizon.fr/contact/`
  and `https://limaginariumboutique.fr/horaires/` to confirm Rose,
  L'Imaginarium, La Dame aux Coquelicots, Tabac, Mon Oeil and mairie hours
  (rows carry `[needs-local: ...]` markers).
- Next S3 run: every remaining eligible row is an open-air site without
  business hours (bus stops, parkings, trails, viewpoints, plaques, climbing
  areas), so S3 has nothing to work until the 30-day exclusion on yesterday's
  26 slugs lapses (2026-11-14) or the brief widens to public services and
  practical sites (toilets, EV charger, cemetery) with Tier 1 sources.
