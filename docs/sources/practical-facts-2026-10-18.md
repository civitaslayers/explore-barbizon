# Practical facts research, 2026-10-18

Standing job S3 (task `19af6859`). Proposals only: nothing in `locations` was
touched. Every finding is a `research_findings` row with `subject =
'practical:<slug>'`, `status 'lead'`, `method 'secondary'`, `found_on
2026-10-18`, `dossier` = this file. Review query:

```sql
select subject, claim, source_title, notes
from research_findings
where dossier = 'docs/sources/practical-facts-2026-10-18.md'
order by subject;
```

## Coverage

Eligible: 50 published locations with `opening_hours` null or website/phone
missing and no `practical:` row from the last 30 days. The runs of 10-15,
10-16 and 10-17 have already covered every restaurant, hotel, chambre d'hôtes,
salon de thé, shop, museum, tourist-office and pharmacy row except two, so
this run finished the visitor-facing remainder and then moved to the
practical and forest categories (bus stops, EV charger, climbing areas),
which the brief does not list but which carry the same empty contact fields.

| Outcome | Count | Slugs |
|---|---|---|
| Found, rows inserted | 10 | galerie-41, ev-charger-marc-jacquet, escalade-apremont-bizons, escalade-apremont-butte-aux-dames, escalade-gorges-apremont, escalade-apremont-envers, bus-stop-3-poiriers, bus-stop-angelus, bus-stop-miss-greenough, bus-stop-cimetiere |
| of which with a source conflict | 1 | bus stops: bleau.info still cites pre-2024 line numbers 19/20/21/23 against the DB's 3421/3429 (renumbering, not a contradiction of the stop) |
| Nothing found (no row) | 7 | chapelle-barbizon, cimetiere-barbizon, toilettes-marc-jacquet, bus-stop-grande-rue, bus-stop-plante-rabot (line 3429 page unreachable), parcours-fb and sentier-des-peintres (OT brochure gives only the tourist-office phone, which is not the trail's), escalade-cuvier-chatillon (bleau.info treats Cuvier-Châtillon as a region, nearest area page is Bas Cuvier `bleau.info/cuvier`, ambiguous) |
| Owner-confirmable, no research needed (no row) | 1 | le-chic-barbizon (Luigi's own listing, Airbnb and Booking.com URLs already in `internal_notes`) |
| Out of scope for hours/contacts, not attempted | 32 | artist houses (2), heritage plaques (6), heritage sites (5), historic paint spot, open-air museum, parkings (6), points of interest (2), trails (3 of 5), viewpoints (4) |

Rows inserted: 10. Tasks filed: 0 (no published text is contradicted; the
hours backfill stays under `a0fea870`, the earlier contact conflicts under
`9f793766`).

## Sources and method

- Tavily (`tavily_search`) returned HTTP 403 for every call; all research ran
  through web search plus page fetch.
- Unreachable from the session, each noted once: `barbizon.fr` (mairie,
  needed for Galerie 41 programme, cemetery and chapel hours, public
  toilets), `ecocharge77.fr`, `bleau.info/envers`, Transit app page for line
  3429. Rows that depend on them carry `[needs-local: ...]` for S4.
- Tiers: the La Rochette communal leaflet on the Ecocharge77 network is
  Tier 2 (official document, but about the network, not the Barbizon
  station). bleau.info, Transit app, artistescontemporains.org and the
  exhibitor page are Tier 3 and flagged as such in `notes`.
- Claims use the same shape as the 10-15 run:
  `{"hours": ..., "hours_text": ..., "website": ..., "phone": ...}`. Every row
  this run has `"hours": null` because none of these places has business
  hours in the canonical sense (open-air areas, bus stops, a 24 h charger, a
  municipal space whose hours change per exhibition); `hours_text` carries
  what the source actually says.

## Ready-to-review rows

| Slug | Hours (proposal) | Phone | Website | Flag |
|---|---|---|---|---|
| galerie-41 | none standing; per-exhibition (2020 example: weekdays 14-19, weekends 10-19, closed Mon) | none found | none found | Tier 3, two exhibitor pages from 2019/2020; mairie site unreachable |
| ev-charger-marc-jacquet | network "accessible à tous", no hours stated | 01 87 52 13 19 (Ecocharge77 user line) | https://ecocharge77.fr | network-level only; CCS 25 kW / 24h claims in DB text unverified |
| escalade-apremont-bizons | n/a (open-air) | none | https://bleau.info/bizons | access text matches DB address |
| escalade-apremont-butte-aux-dames | n/a | none | https://bleau.info/butteauxdames | |
| escalade-gorges-apremont | n/a | none | https://bleau.info/apremont | access text matches DB address |
| escalade-apremont-envers | n/a | none | https://bleau.info/envers | URL from the bleau.info index only, page not opened |
| bus-stop-3-poiriers, bus-stop-angelus, bus-stop-miss-greenough, bus-stop-cimetiere | line 3421 to Gare de Fontainebleau-Avon, hourly on Sun 18 Oct 2026 | none | none official reached | Tier 3 aggregator; weekday frequency unknown; 3429 unverified |

## Follow-ups

- S4 (local): `[needs-local:]` markers on galerie-41 (barbizon.fr),
  ev-charger-marc-jacquet (ecocharge77.fr), escalade-apremont-envers
  (bleau.info/envers) and the four bus-stop rows (official IDFM line page for
  3421, plus 3429 for Plante Rabot / Grande Rue).
- Next S3 run: the visitor-facing categories are now fully covered for 30
  days (first rows expire on 2026-11-14). Remaining uncovered rows are
  heritage, parking and forest categories where hours and contacts do not
  apply, so the next run should mostly re-verify the earliest leads rather
  than hunt for new ones.
- Editorial question, not filed as a task: `escalade-cuvier-chatillon` links
  to Mountain Project while every other climbing row now has a bleau.info
  lead; bleau.info has no single "Cuvier-Châtillon" area page.
