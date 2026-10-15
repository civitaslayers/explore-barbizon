# Research sweep, 2026-10-15, pass 1

Standing job S2 (task 7820f08f). Branch `night/2026-10-15-research-sweep`.
Scope this pass: `research_findings` rows in `open` / `lead`, published-linked
first, one subject at a time, about 60 minutes. Tier rules as in
`docs/briefs/standing.md`: Tier 1 or two independent Tier 2 sources confirm;
Tier 3 alone stays `lead`.

Reachability this session: Supabase MCP fine. WebSearch returns titles and
URLs only; WebFetch opens only URLs a search returned. The archive.org
full-text search endpoint was provenance-blocked (noted once, not retried),
Gallica not attempted for the same reason, Gassies' *Le vieux Barbizon* exists
on Google Books as a record only (no text). Sources that did work: Met
collection record, data.bnf.fr and catalogue.bnf.fr, musee-orsay.fr artist
catalogue, Musée départemental des peintres de Barbizon (site and 2006 press
kit), Musée de Grenoble (navigart), Petit Palais press kit (PDF), fr/en
Wikipedia (Tier 3), aerosteles.net (Tier 3).

Database writes this pass: 9 row updates (notes / status / source fields on
rows verified), 4 inserts, 0 tasks filed (see each subject). No write was
refused.

---

## 1. Ziem plaque (56 bis Grande Rue), 2 rows, linked to `librairie-cyrano` (published)

**Checked.** Petit Palais, *Dossier de presse, Félix Ziem, « J'ai rêvé le
beau »* (2013 retrospective; PDF on petitpalais.paris.fr), pp. 5 and 9. Web
search for any source placing Ziem at 54–56 Grande Rue (none found).
fontainebleau-tourisme.com *Sentier des peintres* leaflet (no addresses for
Ziem).

**Outcome.**
- The Petit Palais text knows one Barbizon house only: « il achète en 1866 la
  maison de Charles Jacques à l'entrée du village de Barbizon » (p. 5,
  repeated p. 9). That is the Gassies chain already `confirmed` on the
  Les Bosquets row (Jacque → Ziem 1866 → Harrisson → Camille Paris), at the
  forest edge, and it agrees with Ziem's 1904 statement that he had owned
  one Barbizon house and sold it.
- No source read puts Ziem at 54–56 (« Villa Cyrano »). That attribution
  still rests on the commune booklet alone (Tier 3-ish local secondary).
- Row 66d7a81a (Villa Cyrano) stays `lead`, notes updated with the above.
- Row 79aeed57 (plaque text needed) untouched: human action, covered by task
  dc8011f4 (photograph plaques, incl. the one behind 56 bis).
- **Inserted** one `lead` row: Petit Palais 2013 statement, Tier 2 secondary,
  as independent corroboration of the Gassies chain.

**Implication for published text (proposal only).** `librairie-cyrano`
currently says « un ancien atelier d'artiste fréquenté par le peintre Félix
Ziem » / « a building that served as a studio for the painter Félix Ziem ».
Nothing read supports it; the only documented Ziem house in Barbizon is the
Jacque house at the forest edge. Suggested wording until the plaque is read:
drop the Ziem sentence, or soften to « que la tradition locale associe au
peintre Félix Ziem ». Already covered by task 029cccbf (Parcours de Mémoire,
draft fixes for unsupported published claims); no new task filed.

## 2. Chêne Bodmer, 3 rows, linked to `chene-bodmer` (published)

**Checked.** The Met collection record 64.210; Musée d'Orsay artist catalogue
(Karl Bodmer, 4232); Musée de Grenoble navigart notice 60000000180997 (a
Bodmer drawing of the oak); data.bnf.fr 11892517; en.wikipedia (Tier 3);
cirkwi.com stop « Intérieur de forêt en hiver » (Tier 3); web search for the
tree's fall or death.

**Outcome.**
- Row 5646187a (Monet painted the oak in 1865, Met) → **`confirmed`**, Tier 1.
  Record: *The Bodmer Oak, Fontainebleau Forest*, Claude Monet, 1865, oil on
  canvas, 96.2 × 129.2 cm, accession 64.210, Gift of Sam Salz and Bequest of
  Julia W. Emmons, by exchange, 1964, on view Gallery 818. The label also
  states that Bodmer exhibited a painting of the tree at the Salon of 1850.
- Row 0abee91a (title and location of Bodmer's Luxembourg painting) stays
  `open`, notes improved: the Salon 1850 title is « Intérieur d'une forêt en
  hiver », oil on wood, second-class medal (Grenoble notice). Current holding
  not found: no Bodmer painting on the Orsay artist page, no Joconde notice
  surfaced. Next: POP Joconde direct search, CNAP/FNAC inventory, Delteil in
  *L'Artiste*, August 1894, pp. 134-42 (cited by the British Museum).
- Row 96caa5c3 (when the tree died or fell) untouched: nothing found.

**Implication for published text.** None; the Monet sentence can now be
stated with the Met as source.

## 3. Karl Bodmer, 1 of 8 rows touched (death place), linked to `chene-bodmer`

**Checked.** Orsay artist record; data.bnf.fr; en.wikipedia; British Museum
biography term BIOG20022.

**Outcome.** Row b7cec28d (Paris vs Barbizon) stays `open`, notes improved:
Orsay gives « 1893, Barbizon, Seine-et-Marne »; data.bnf.fr gives 30-10-1893
with no place; en.wikipedia says Paris; the 1893 press (already indexed) says
Paris. Tier 1 authority and period press conflict, so the standing rule
(« 1893 » without a place in public text) holds. Decisive source: the acte de
décès. The remaining seven Karl Bodmer rows (Moniteur advertisement, Galerie
contemporaine last page, Gassies « sédentaires », 38 bis address, 1906
census, Auberge Ganne figure) need AD77, Forney or Gallica and were not
attempted; tasks ce8efd66 and 103eb640 already cover the archival ones.

## 4. La Poste (20 Grande Rue), 2 rows, linked to `la-poste-barbizon` (published)

**Checked.** data.bnf.fr atelier 14016973 (Georges Krier, 1872-1946) and work
record ark:/12148/cb13864285x (« Valse brune », 1909); catalogue.bnf.fr notice
cb140169732 (fetch failed); fr.wikipedia Georges Krier (Tier 3, cites the
Paris 2e death record no. 188, 1946); Comité pour l'histoire de La Poste PDF
« Les bureaux de poste » (statistics only); web search for a 1967 « plus joli
bureau de poste de France » contest (nothing).

**Outcome.**
- Krier the person and the song are Tier 1 confirmed (BnF): Georges Krier
  (1872-1946), « Valse brune », 1909, lyrics Georges Villard. fr.wikipedia
  adds SACEM president (no years), admitted composer 1898, publisher 1909,
  died Paris 2e, 1946.
- The Barbizon link (villa « Les Roses », no. 20) rests on Karampournis and
  the commune booklet only, and the « prettiest post office in France, 1967 »
  claim did not surface anywhere. Both rows (8cd5c951, 252b531f) stay `lead`,
  notes updated.

**Implication for published text (proposal only).** `la-poste-barbizon` states
both the Krier residence and the 1967 distinction as fact. Suggest « selon la
tradition locale » / « d'après la commune » until a 1967 press item or the
cadastre is read. Covered by task 029cccbf; no new task filed.

## 5. Villa des Artistes (12 Grande Rue), 2 rows, linked to `auberge-ganne` (published)

**Checked.** Musée départemental des peintres de Barbizon, « Deux bâtiments
pour un musée » (museum site); the museum's 2006 Grigorescu exhibition press
kit (*Nicolae Grigorescu (1838-1907), l'itinéraire d'un peintre roumain*,
Agen / Barbizon 2006, pp. 4, 10-12, 16-17, 30).

**Outcome.**
- The Luniot / Villa des Artistes / Ganne decor story is now two-source:
  Gassies (period, first hand) and the museum. Museum text: Victoire and
  Joseph-Bernard Luniot left the inn « sans doute peu avant 1870 » for a more
  comfortable hotel nearer the forest, the Villa des Artistes; « Ils y font
  transporter les meubles et décors peints »; the house was later let as
  flats; c. 1930 Pierre-Léon Gauthier bought the inn, bought the decor back
  from the heirs and opened the rooms in 1936; after 1939 the rooms housed an
  art business but the decor never left. **Inserted** as a `confirmed` row.
- Neither source gives the street number. « 12 Grande Rue » still rests on
  the booklet. Rows 3f270d7b and 186304ae stay `lead`, notes updated.
- Grigorescu: the museum's 2006 scholarship (Caille, Mateescu) places him in
  Barbizon from summer 1862, settled July 1863, regular until 1868/1870,
  later visits 1879-80, frequenting and exhibiting at the hôtel Siron; the
  Ganne lodging is only supposed (« on peut penser que le jeune Roumain y
  soit descendu »); the kit describes the Villa des Artistes without linking
  him to it. **Inserted** as a `lead` row. This weakens the booklet's
  « Grigorescu stayed at the Maison des Artistes ».
- Note the booklet's « Ici s'élevait » (building gone) versus the museum's
  « louée en appartements » (building survived as flats): to settle on site.

**Implication for published text.** `auberge-ganne` mentions Grigorescu only
in its editorial change log, not as a Villa des Artistes guest, so nothing to
change. For task 98951973 (draft Villa des Artistes place): do not say
Grigorescu stayed there; say the Luniots moved the Ganne decor there shortly
before 1870 and the house was later let as flats.

## 6. Monument Farman, 2 rows, linked to `monument-farman` (published)

**Checked.** aerosteles.net record « Aux frères Farman - Barbizon » (Tier 3,
2007, updated 2015); web search for a 1985 press or municipal source (none
reachable).

**Outcome.**
- Row b0d451f5 (inaugurated 18 May 1985): aerosteles.net independently gives
  18 May 1985, erected on the initiative of Louis Shoonwater with the Comité
  des frères Farman and the lycée Saint-Lambert, at the Chemin de la Messe /
  Chemin de Samois crossroads on the D64; removed c. 1990, back 2002, metal
  aircraft gone by 2011, trompe-l'œil aircraft by 2015. Two Tier 3 sources
  (Karampournis, aerosteles) agree: stays `lead`, source_url and notes added.
- Row 2c264fc2 (20 rue du Chemin de la Messe, plaine de l'Angélus) untouched.
- **Inserted** a `lead` row with the inscription as transcribed online:
  « A la mémoire des frères Farman, Dick, Henry, Maurice, pionniers de
  l'aviation française, érigée sur la plaine où Maurice se posait afin de
  rejoindre la propriété familiale ». A photograph on site (plaque-photo
  task dc8011f4 could absorb it) would make this Tier 1.

**Implication for published text.** `monument-farman` already carries 1985;
no change proposed. Tier 1 for the date would be the 1985 council
deliberation or *La République de Seine-et-Marne*, May 1985.

## 7. Les Bosquets (2 Grande Rue), 3 rows, unpublished location

Looked at only through the Ziem work above. The Petit Palais « à l'entrée du
village » is compatible with no. 2 (forest end) and does not decide between
no. 2 and the booklet's no. 6 « La Baraka ». Rows e0980945, 5d1ae62b,
f1a2c3cb untouched (owner interview and cadastre are human actions, already
noted on the rows).

---

## Tasks

None filed. Duplicate check done against open tasks: 029cccbf covers the
unsupported published claims (Ziem at Cyrano, Krier and 1967 at La Poste),
dc8011f4 the plaque photographs, 98951973 the Villa des Artistes draft,
ce8efd66 and 103eb640 the Bodmer archival follow-ups.

## Not reached this pass

In the suggested order, for the next pass to continue:
- Roger Martin du Gard (3 rows)
- Occupation 1940-1944 (4 rows)
- Hôtellerie du Bas-Bréau (4 rows)
- Tumble Inn (4 rows)
- Atelier Daubigny plaque (4 rows)
- Karl Bodmer, remaining 7 rows (archival: AD77, Forney, Gallica)
- Marie Bodmer (1 row, census reading)
- Chêne Bodmer: Luxembourg painting holding (POP Joconde direct search,
  CNAP inventory, Delteil 1894) and date the tree fell
- Les Bosquets numbering (2 vs 6): cadastre / on site
