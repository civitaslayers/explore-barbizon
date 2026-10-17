# Research sweep, 2026-10-17, pass 1

Standing job S2 (task 7820f08f). Branch `night/2026-10-17-research-sweep`,
about 55 minutes of research (00:00-00:40 UTC). Scope: `research_findings`
rows in `open` / `lead`, published-linked first, one subject at a time, in the
order of the newest previous sweep's hand-over (`research-sweep-2026-10-15.md`,
passes 1-9). Tier rules as in `docs/briefs/standing.md`: Tier 1 or two
independent Tier 2 sources confirm; Tier 3 alone stays `lead`. Rows whose
notes already end in `[needs-local: ...]` were skipped (they belong to S4).

## Reachability tonight (noted once, not retried)

Supabase MCP connected (the session-start notice said it had failed; it had
not). Supabase writes: short `update` and `insert` statements applied at once.
Note for future passes: `research_findings.method` is constrained to
`page_image | ocr | snippet | census | secondary | oral | archive`; a free-text
method is refused.

Blocked from the sandbox: archive.org full text (`/stream/*_djvu.txt`,
provenance), the proxy for `curl` (CONNECT 403, so no Gutenberg plain-text
download either), Wikimedia Commons (every file and category page returned
"URL not found"), the Région Île-de-France inventory illustration PDFs
(haphash bot wall, as on 2026-10-15), the INSEE deaths-file API
(`deces.matchid.io`, provenance), `419squadron.com` (provenance),
`gillespudlowski.com` on a URL not returned by search. Gallica not attempted.
WebFetch reads at most the first ~100k characters of a page, so the Project
Gutenberg HTML of Newnham-Davis' *Gourmet's Guide to Europe* (1903) opened but
the Barbizon chapter, if any, lies beyond the cut. Sources that did work:
archive.org item metadata pages (not the text), gutenberg.org (first 100k
chars), en.wikipedia, cirkwi.com, chairish.com, njmastro.com,
lequotidiendumedecin.fr (paywalled after the first paragraphs),
hydroretro.net (PDF), zop.zb.uzh.ch (PDF), gillespudlowski.com (search URL).

Database writes this pass: 3 row updates (notes + `[needs-local]` tags), 1
insert, 0 tasks filed. No write was refused except the first insert attempt
(method constraint, corrected and re-run). Heartbeats at 00:00, 00:19 and
00:35 UTC.

---

## 1. Les Charmettes (40 Grande Rue), 43 rows, linked to `besharat-gallery-barbizon` (published) and its story

**Checked.** Newnham-Davis, *The Gourmet's Guide to Europe* (1903) on Project
Gutenberg (row `4cb436b2`): the page opened but only chapters I-II (Paris,
provincial towns to Nice) fit in the fetch window; no Barbizon passage in that
range. archive.org item for Thomson 1902 (metadata only; full text blocked).
Baedeker *Paris and Environs* (row `4db4be99`): only catalogue records
surfaced, no full view. Touring-Club *À la France* (row `d0ed3b55`): Google
Books did not surface through search. Wikimedia Commons: a file « Barbison -
Hôtel des Charmettes.jpg » exists (postcard, uploader Baidax) but Commons was
unreachable, so its date and caption could not be read.

**Outcome.**
- No existing row changed: none of the snippet leads could be read in page
  view.
- **Inserted** `8b389d12` (lead, Tier 3): a hand-coloured etching by
  Eugène-Louis Véder (1876-1936), titled in pencil « Barbizon - Les
  Charmettes », early 20th c., seen in a dealer listing (chairish.com). A
  public-domain period image of the hotel, worth locating in the BnF Estampes
  or the Musée de Barbizon; not evidence for any dated fact.
- The Commons postcard « Barbison - Hôtel des Charmettes » is the cheapest
  next Tier 2 anchor for row `56b873c3` (large building by c. 1900) and
  `62025a4d` (tram stop at the hotel): read its file page from a browser.

**Implication for published text.** None.

## 2. Hôtellerie du Bas-Bréau, 3 rows (+ `8311b70c` park size), linked to `hotellerie-bas-breau` (published)

**Checked.** Two searches for Hirohito's October 1971 state visit and
Barbizon (nothing: CIA reading-room PDFs, Royal Collection, ICRC images, none
about France); gillespudlowski.com, « Barbizon, le charme vintage du
Bas-Bréau » (1 Dec 2017); *Le Quotidien du médecin*, « Sur le chemin des
peintres » (20 Mar 2014, paywalled after the opening); search for the hotel's
own site (not surfaced); search for a 1934 rename (nothing).

**Outcome.** No row changed. Pudlowski names the owners as the Fava family
(Jean-Pierre, Dominique, Laurent) and repeats the Stevenson facade and
« Forest Notes » story; the *Quotidien du médecin* says Siron renamed the inn
« Hôtel de l'Exposition » because it hung its guests' pictures (consistent with
the booklet's « Hôtel des expositions », Tier 3). Neither gives 1934, 1971 or
the park size. Row `ba0c2bf3` stays `lead`; `8311b70c` (one vs two hectares)
still needs the hotel's own site or the Atout France classement.

**Implication for published text.** Unchanged from 2026-10-15: « 1934 » and
« 1971 » should carry « selon la commune » until sourced (task 029cccbf).

## 3. Occupation 1940-1944, 1 of 4 rows improved (`d59a3f6f`), linked to `galerie-erika-gage` (unpublished)

**Checked.** N.J. Mastro, « Drue Leyton, American actress and member of the
French Resistance » (njmastro.com, 24 May 2023, Tier 3), which cites the
Jacques Terrane Wikipedia page, the USHMM « Vittel » article and the RCAF
419 Squadron evaders site; the 419 Squadron pages themselves (blocked).

**Outcome.** The blog reproduces the account of RCAF 419 Squadron evader
Lorne Frame, which ends « Villa L'Ecureuil, home of Drue Tartiere », and says
the squadron site credits her with helping at least 150 airmen. This is the
first mention of the house name « L'Écureuil » outside the commune booklet,
and it comes from a first-hand evader account (Tier 2 once read at source).
**Updated** the row's notes and tagged it
`[needs-local: http://www.419squadron.com/Drue.html and
http://www.419squadron.com/Evaders-4.html]`. Status stays `lead` (the account
has not been read at source, and no street number appears). Rows `3df2075e`,
`9e1ced17`, `5455f332` untouched.

**Implication for published text.** None yet (no. 71 is unpublished). When
drafted, « Villa L'Écureuil » can be stated with the evader account as source
once S4 has read it; use « Drue Tartière » (née Leyton), not
« Parson-Tartière », unless the booklet's double name is explained.

## 4. Tramway TSM / le tacot (`4eb2b8fe`), linked to `la-folie-barbizon-hotel` (published)

**Checked.** en.wikipedia « Tramway from Verneuil-l'Étang to Melun » (Tier 3);
the three Région inventory illustration PDFs on the tram (`ivr1120017700080x`,
`116x`, `109x`, bot-walled again); search for the « Seine-et-Marne South
Tramway » article (not returned).

**Outcome.** **Updated** notes, status `lead`: the Wikipedia article records a
1927 proposal (Georges Roy) to connect the Verneuil tramway to the
« Melun–Barbizon line », and that in 1949 the department still listed a
« Melun to Barbizon and Milly » line among those to decommission, so the
formal déclassement may postdate the 1938 end of service and the 1946 rail
removal. Tagged `[needs-local: ...ivr1120017700080x.pdf (and 116x, 109x)]`
for S4, since the Région notices are the Tier 1 source for the dates and the
Barbizon terminus.

**Implication for published text.** None; the published text gives no dates
for the line (checked on 2026-10-15).

## 5. Charles Jacque / 24 Grande Rue (`9fb3c614`), linked to `maison-charles-jacque` (published)

**Checked.** Search for Jeanne Gassies (nothing but unrelated BnF and
genealogy hits); the INSEE deaths-file API (blocked).

**Outcome.** **Updated** notes, status `lead`: the booklet's « died in 2003 on
the eve of her 100th birthday » is checkable in the INSEE deaths file (Tier 1,
deaths after 1970), so the row is tagged
`[needs-local: https://deces.matchid.io/search?q=Gassies+Barbizon]`. The
purchase by Georges Gassies and the no. 24 attribution still rest on the
booklet.

**Implication for published text.** None.

## 6. Tried, nothing found (rows not changed)

- Mounet-Sully (`de8cab8e`): one search; Penesco 2005 did not surface; the DLA
  Marbach authority record and en.wikipedia have no Barbizon.
- Monument Farman (`b0d451f5`, `2c264fc2`, `77d9f008`): two searches for the
  family property at Barbizon; Gérard Hartmann, *Les premiers Farman*
  (hydroretro.net PDF) read for Barbizon / Fontainebleau / Chailly: nothing.
  Tier 1 for the 1985 date remains the council deliberation or the May 1985
  press.
- Parcours des mosaïques (`7cb77f8b`): the Cirkwi circuit (Fontainebleau
  Tourisme, updated 12 Jun 2025) repeats twenty mosaics in Venetian glass,
  Péreira / Barbara / Grangé, inaugurated Saturday 17 April 2010, commissioned
  by the commune; it lists nineteen works. Same publisher as the row's
  source, so not independent. Needs the mairie or the April 2010 press.
- Caverne des Brigands / Weidmann (`b3c608a7`): the search returned only the
  sources already on the row (en.wikipedia, criminocorpus, Spelunca 173).
- Chêne Bodmer fall date (`96caa5c3`): one search; the only new PDF
  (zop.zb.uzh.ch) is an obituary of Martin Bodmer, a Zurich merchant born
  1780, unrelated.

## Tasks

None filed. No published text was found wrong tonight; the open-task check
(`status <> 'done'`) was not needed for filing, and the existing offline tasks
(029cccbf unsupported published claims, dc8011f4 plaques, 60a6e3f7 Région
inventory in a browser, ce8efd66 / 103eb640 / 41b522df archives) still cover
the next steps named above.

## Not reached (for the next pass, in this order)

Everything in the 2026-10-15 consolidated hand-over still stands. Tonight
added nothing reachable from the sandbox for: Karl Bodmer (6 rows), Hôtel de
la Forêt (10), Auberge Ganne (12), Villa Bernard (6), Ziem plaque (3), La
Poste (2), Villa des Artistes (3), Roger Martin du Gard (3), Marcellin
Berthelot (1), André Rouveyre (11), Villa Élisabeth (7), Manoir Saint-Hérem
(7), Maison Diaz (28), Marie Bodmer (2), Coz Ker (6), Landerer (13), Atelier
Daubigny (3), L'Ombrage (5), Tumble Inn (4), Auberge Diaz (6), Narcisse Diaz
(5), La Clé d'Or, Gorges d'Apremont, and the single-row booklet subjects.
Start the next pass by testing whether Wikimedia Commons and archive.org full
text are reachable; if either is, the first targets are the Commons postcard
« Barbison - Hôtel des Charmettes » (rows `56b873c3`, `62025a4d`), Thomson
1902 on archive.org (`gri_33125008541878`, Diaz rows `b608bd05`, `44529b46`)
and the Newnham-Davis Barbizon passage (`4cb436b2`).
