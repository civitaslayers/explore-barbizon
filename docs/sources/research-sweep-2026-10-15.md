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

## Not reached in pass 1

Worked in pass 2 below, in this order: Roger Martin du Gard, Occupation
1940-1944, Hôtellerie du Bas-Bréau, Tumble Inn, Atelier Daubigny plaque, Karl
Bodmer / Chêne Bodmer. The list of what remains is at the end of pass 2.

---

# Pass 2 (same night, about 60 minutes)

Reachability: Supabase MCP fine (the session-start notice said it had failed
to connect; it had not). WebSearch and WebFetch as in pass 1. Newly
provenance-blocked this pass (noted once, not retried): the mairie's Barbizon
Jazz Inn 2024 programme PDF on barbizon.fr, archive.org *L'Artiste* 1894,
collections.louvre.fr, britishmuseum.org object pages, catalogue.bnf.fr
(server error). Sources that did work: universalis.fr, larousse.fr, data.bnf.fr
(PDF), nobelprize.org, standardebooks.org (Stevenson's essays),
robert-louis-stevenson.org (Edinburgh Napier University), margaretthatcher.org
(Thatcher MSS transcriptions), museothyssen.org, philbrook.emuseum.com,
en.wikipedia, USHMM finding aid, aaff.fr, fontainebleau-tourisme.com leaflets.

Database writes this pass: 8 row updates, 2 inserts, 0 tasks filed. No write
was refused. Heartbeats sent at start, ~20, ~40 and ~55 minutes.

## 8. Roger Martin du Gard, 3 rows, linked to `besharat-gallery-barbizon` (published, Les Charmettes)

**Checked.** Encyclopædia Universalis, art. « Martin du Gard Roger »;
Larousse encyclopédie; data.bnf.fr author PDF (11914776); Nobel Prize
bibliography; web search for the BnF archives et manuscrits record of the
*Devenir!* autograph (not surfaced); Google Books for Sicard (record only).

**Outcome.**
- Row f58c1e51 (autograph headed « FANTOCHE. Barbizon, 15 mai 1908 », BnF
  1981 catalogue) → **`confirmed`**: the 1981 catalogue is the BnF describing
  its own manuscript (holding institution), and Sicard 1976 (p. 461)
  independently dates the first draft from 15 May 1908 at Barbizon.
- Row 872c3cab (Brenner 1961: inn at Barbizon, written in one go, Ollendorff)
  stays `lead`, notes improved: Universalis independently says « il écrit d'un
  seul jet, à Barbizon, son premier roman, Devenir » (1908). Caveat: the
  Ollendorff edition is dated **1909** in data.bnf.fr, the Nobel bibliography
  and Larousse; Brenner's « that autumn » (1908) describes a book bearing the
  date 1909.
- Row 7c2b69b2 (Sicard: Hôtel des Charmettes) stays `lead`: Barbizon and 1908
  are now four-source, but the **hotel name** rests on Sicard p. 33 alone.
  Universalis and Brenner say only « à Barbizon » / « an inn ». Next: RMG
  *Correspondance générale* vol. 1 (1896-1913, Gallimard 1980), letters dated
  Barbizon May-July 1908.
- **Inserted** one `lead` row for the Universalis statement (Tier 2 secondary).

**Implication for published text (proposal only).** Safe wording: « c'est à
Barbizon, en 1908, que Roger Martin du Gard écrit d'un seul jet son premier
roman, *Devenir!* (Ollendorff, 1909) ». Naming the Charmettes as the inn should
be attributed (« selon Claude Sicard ») until a second source names it.

## 9. Occupation 1940-1944, 4 rows (1 worked)

**Checked.** USHMM Tartière family papers finding aid (1988.93);
en.wikipedia « Drue Leyton » and its citations; web search for « L'Écureuil »
/ Tartière / 71 Grande Rue; Helen Kirkpatrick article (not reachable).

**Outcome.**
- Row d59a3f6f (booklet: Mme Parson-Tartière sheltered airmen at no. 71,
  « L'Écureuil ») stays `lead`, notes improved. The identification with Drue
  Tartière (Drue Leyton) holds: en.wikipedia cites the *Los Angeles Times*
  obituary (11 Feb 1997, p. 24: returned to her home in Barbizon in 1942,
  joined the resistance, hid airmen, helped at times by Sylvia Beach) and
  Helen Kirkpatrick, *Pittsburgh Press*, 22 Oct 1944, p. 14, « Daring American
  Actress Sheltered Allied Fliers 2 Doors From Gestapo ». Neither was read
  directly and none found gives a house name or number; the USHMM finding aid
  has no Barbizon address. « L'Écureuil » / no. 71 still rests on the booklet.
- Rows 3df2075e (negative Citroën result), 9e1ced17 (letter to H.-J. Citroën,
  human action) and 5455f332 (booklet's « occupation très discrète », a
  characterisation) untouched.

**Implication for published text.** None yet (no. 71 is `galerie-erika-gage`,
unpublished). When drafted: « Drue Tartière » rather than « Parson-Tartière »
unless the booklet's double name is explained; cite *The House Near Paris*
(1946).

## 10. Hôtellerie du Bas-Bréau, 4 rows, linked to `hotellerie-bas-breau` (published)

**Checked.** Stevenson, « Fontainebleau: Village Communities of Painters »
(1884; standardebooks.org text); The RLS Website, Edinburgh Napier University,
page « Barbizon & Grez »; Margaret Thatcher Foundation transcriptions of the
Thatcher engagement diary, 25 and 26 June 1984 (Thatcher MSS, Churchill
Archive Centre, THCR 6/1/2/6); web search for Hirohito 1971 at Barbizon and
for the 1934 rename (nothing).

**Outcome.**
- Row 41c0681f (Stevenson at the Hôtel Siron, 1875) → **`confirmed`**, two
  independent Tier 2 sources on top of Champigneulle: Stevenson's own essay
  (« Siron's inn, that excellent artists' barrack, was managed upon easy
  principles ») and the Napier site (first stay 29 March to 19 April 1875 with
  Bob Stevenson, « While at Barbizon, RLS stayed at Hotel Siron »; further stays
  Aug 1875, Apr-May 1876, July 1878, April 1881). Note « came to live »
  overstates it: repeated stays, not residence.
- **Inserted** a **`confirmed`** Tier 1 row: Thatcher's engagement diary,
  25 June 1984, 20:15: « Dinner hosted by the President of the Council at
  L'Hotellerie de Bas-Breau, Barbizon »; 26 June, 08:15: « Leave Hotellerie du
  Bas-Breau ». The 1984 half of the booklet's no. 22 text is settled (received
  and lodged the heads of state and government of the Fontainebleau European
  Council).
- Row ba0c2bf3 (booklet compound claim) stays `lead`, notes updated: 1934
  rename and Hirohito 1971 still unsupported. Next: *Le Monde* / *Le Figaro*
  2-6 Oct 1971; a 1934 advertisement or the registre du commerce.
- Rows d0611aa6 (Siron timber merchant, Billy) and 79165410 (plaque, room
  no. 3) untouched; the Napier page does not mention a room number.

**Implication for published text (proposal only).** The published text is
right on 1875 and 1984. Two touches: « Robert Louis Stevenson y séjourne à
plusieurs reprises à partir de 1875 » (not a single stay), and for 1984 the
precise form « en juin 1984, il hébergea les chefs d'État et de gouvernement du
Conseil européen de Fontainebleau » can now be sourced to the Thatcher papers.
« 1934 » and « 1971 » should carry « selon la commune » until sourced. Covered
by task 029cccbf (unsupported published claims); no new task filed.

## 11. Tumble Inn, 4 rows, linked to `tumble-inn` (published)

**Checked.** The mairie's Barbizon Jazz Inn 2024 programme PDF
(provenance-blocked), the Fontainebleau Tourisme festival fiche (404), web
searches for « Tumble Inn » with Barbizon / Alfred Grand / 1920s guidebooks
(nothing but the known Tier 3 pages).

**Outcome.** No row changed. The founder question (Alfred Grand vs « an
Englishman from New York ») and the address stay as they were. Next: the
festival PDF from a browser session; Bottin / annuaire du commerce 1925-1935
(Gallica) for « Tumble Inn, Barbizon, tél. 37 ».

## 12. Atelier Daubigny plaque, 4 rows, linked to `atelier-daubigny-plaque` and `les-pleiades` (both published)

**Checked.** Museo Thyssen-Bornemisza artist biography (Mar Borobia);
Philbrook Museum of Art artist record; web search for Les Pléiades / Mme
Baratin history (hotel booking pages only).

**Outcome.**
- Row 7e57f1c2 (Corot as Daubigny's friend) → **`confirmed`**, two
  independent museum texts: Thyssen « He met Corot, with whom he became
  friends and often painted in the open air in the forest of Fontainebleau »;
  Philbrook « Even more important was his meeting with Camille Corot in 1852
  in Optevoz (Isère) ». Neither says « mentor ».
- Rows 20c2da63 and 91d5cf06 (Les Pléiades = Daubigny's former studio, Mme
  Baratin) untouched: nothing independent found. Row 5012a789 (west façade) is
  an on-site check.

**Implication for published text.** `atelier-daubigny-plaque` says « En 1852,
il se lie avec Corot ... qui devient un ami proche »: supported as written;
keep « ami », do not upgrade to « mentor ».

## 13. Karl Bodmer (7 rows) and Chêne Bodmer (2 rows)

**Checked.** Web search for POP Joconde / FNAC holding of « Intérieur d'une
forêt en hiver » (nothing); printsandprinciples.com entry on the 1851
lithograph after the painting, with its citations; franco.wiki mirror of the
fr.wikipedia article on Monet's *Un chêne au Bas-Bréau, le Bodmer* (Tier 3, no
date for the tree's fall); AAFF compte-rendu « Curiosités sylvestres » 10 Dec
2022 (no Bodmer); Fontainebleau Tourisme « Sentier des peintres » leaflet
(reproduces « Intérieur de forêt en hiver » as panel no. 1, no credit line);
search for Bodmer at the Auberge Ganne (nothing beyond the museum's general
artist list).

**Outcome.**
- Row 0abee91a (Luxembourg painting holding) stays `open`, notes improved: a
  lithograph after the painting exists, Bertauts after Bodmer, « Intérieur de
  forêt », 1851 (publ. 1853), pl. 65 of *Les Artistes anciens et modernes*,
  British Museum P_1936-0302-15-18, catalogued Delteil, *L'Artiste* vol. 8
  (1894) p. 141 no. 87 and Laran-Adhémar, *Inventaire du fonds français après
  1800*, vol. 3 (1942) p. 20 no. 21. BM, archive.org and Louvre pages were
  blocked; the Delteil page (which may also give the place of death) is the
  single most useful next read for both Bodmer subjects.
- Row 96caa5c3 (when the tree fell) untouched: nothing found.
- The seven Karl Bodmer rows untouched: all need AD77, Forney, Gallica or the
  Delteil page (tasks ce8efd66 and 103eb640 cover the archival ones).

**Implication for published text.** None. The Sentier des peintres panel no. 1
shows that a reproduction of the Luxembourg painting circulates locally; the
village panel itself could be photographed for its credit line.

## 14. Villa Élisabeth (started, not finished)

One search and two fetches only: actualitte.com review of Dorgelès' *Bouquet
de bohème* (no Barbizon); the CCFr record of the Belloni-Dorgelès
correspondence (server error). No row changed.

---

## Tasks (pass 2)

None filed. Duplicate check done: 029cccbf still covers the softening of
unsupported published claims (now also Bas-Bréau 1934 / 1971), dc8011f4 the
plaque and panel photographs, ce8efd66 / 103eb640 the Bodmer archives.

## Not reached (after pass 2)

Worked in pass 3 below: Villa Élisabeth, Villa Bernard, L'Ombrage, Coz Ker,
Auberge Diaz, Manoir Saint-Hérem, Landerer, Rouveyre, Hôtel de la Forêt. The
list of what remains is at the end of pass 3.

---

# Pass 3 (same night, 01:58 to 02:35 UTC; all listed subjects reached)

Reachability: Supabase MCP fine for reads, inserts and short updates, but two
longer `update` statements timed out after 180 s without applying (checked by
re-select); per the standing rules they were not retried further and the exact
SQL is in the fenced block at the end of this pass. WebSearch and WebFetch as
before. Blocked this pass (noted once, not retried): the 1978 BnF Dorgelès
exhibition catalogue on Gallica (`bpt6k65346721.texteBrut`, server error), the
CCFr Belloni-Dorgelès record (provenance), fr.wikipedia « Auguste Giroux »
(provenance, page not returned by a search), polmoresie.over-blog.fr (robots),
fontainebleau-photo.fr (http/https redirect loop). Sources that did work:
universalis.fr, horizon14-18.eu, wikitimbres.fr (La Poste 1985 notice),
fr.wikipedia « Le Château des brouillards », audetourdunlivre.com,
musee-picasso-paris press kit (PDF), asllinea.org (MoMA 2023 review),
fontainebleau-tourisme.com, yonder.fr, abcsalles.com, gralon.net, pop.culture.gouv.fr
(Joconde), nli.org.il authority file, en.wikipedia, sik-isea.ch (1893 Basel
exhibition catalogue PDF), edoc.unibas.ch, lehmanns.ch (book preview),
helveticarchives.ch.

Database writes this pass: 3 inserts (`b32b5a52` Auberge Diaz, `ca881ef4`
Albert Landerer, `9856404a` Villa Élisabeth), 3 row updates applied
(`bab04c7d`, `e7c6b02f`, `0414d53f`), 2 updates timed out (`32a3b742`,
`ca881ef4`, SQL below), 1 task filed (`41b522df`). Heartbeats at 01:58, 02:18,
02:27 and 02:33 UTC.

## 15. Villa Élisabeth (30 Grande Rue), 6 rows, linked to `villa-elisabeth` (published)

**Checked.** universalis.fr Dorgelès entry; horizon14-18.eu biography; La
Poste 1985 stamp notice (wikitimbres PDF); fr.wikipedia *Le Château des
brouillards*; audetourdunlivre.com (2015); searches for Billy 1947 p.160 and
Champigneulle 1965 p.257 on Google Books (records only, no text returned by
search); the 1978 BnF exhibition catalogue *Roland Dorgelès : de Montmartre à
l'Académie Goncourt* on Gallica (server error, not retried); CCFr Belloni
record (provenance-blocked, not retried).

**Outcome.**
- No reference work read (Universalis, horizon14-18, La Poste notice,
  Wikipedia) mentions Barbizon at all; they give Montmartre, Amiens, Cassis
  (1940), Montsaunès (from 1942), and the 1923 marriage to Hania Routchine.
  Wikipedia places the novel's *setting* in Montmartre, which is not in
  tension with its having been *written* at Barbizon.
- The only new Barbizon mention is a Tier 3 book blog: « Il louera à Barbizon,
  la maison "la villa d'Elizabeth" qui appartenait au peintre, Diaz de la
  Penà ». The rental agrees with Billy; the Diaz ownership is unsupported
  anywhere and sits oddly with Diaz's documented house at 28 Grande Rue.
  **Inserted** as `lead` (`9856404a`) with a « do not use » note, so it is not
  researched twice.
- The six existing rows stay as they were: the Billy and Champigneulle
  snippets remain the two Tier 2 anchors for the rental and the writing of
  *Le Château des brouillards*; neither could be read in page view this pass,
  so no status change (the rule is Tier 1 or two *read* Tier 2 sources).
- The 1978 BnF catalogue is the best next source: an exhibition chronology
  from the Arsenal's Dorgelès papers would be Tier 1 for dates and addresses.

**Implication for published text.** None. The live text (« loua la villa
Élisabeth … y écrivit Le Château des brouillards … sa femme, Hania ») matches
the Billy lead and claims nothing more. Do not add the Diaz ownership.

## 16. Villa Bernard (rue Jean-Baptiste Comble), 6 rows, linked to `villa-bernard` (published)

**Checked.** Searches for Giroux / villa Bernard / Cocteau / Giraudoux in
general web, Google Books, Gallica, RetroNews and archive.org domains; the
polmoresie.over-blog.fr article (robots-blocked); fr.wikipedia « Auguste
Giroux » (provenance-blocked); barbizon.fr/histoire (not returned by search).

**Outcome.** Nothing new reachable. The visitor list (Citroën, Cocteau,
Giraudoux, Diaghilev, Chanel, Iribe) still rests on the circuit text plus
two Tier 3 pages that both point to Billy 1947 for their substance. The 1932
classified (L'Informateur de Fontainebleau, Gallica) remains the one period
anchor for the children's rest home, unread on the image. No row changed.

**Implication for published text.** Unchanged from pass 2: « se croisèrent »
is the right hedge; Citroën and Iribe remain the two unsupported names, and
the Diaghilev / 1930s tension is already handled in the text. Covered by
029cccbf; no new task.

## 17. L'Ombrage (18 Grande Rue), 5 rows, linked to `l-ombrage` (published)

**Checked.** Searches for « Maximilienne Whettnall », « Whettnall » +
conservatoire / Marguerite Long / Yves Nat, « Maximilienne Ruffin »,
« Whettnall-Ruffin », and the musiciens77 blog.

**Outcome.** Zero hits for the pianist under any spelling outside the two
Tier 3 pages already on file; the name also returns nothing in library
authority files reached through search. The data.bnf.fr negative (row
61131132) stands. No row changed. Next realistic anchors are offline: the
Conservatoire prize lists (AN AJ/37) and the Barbizon census 1931-1936.

**Implication for published text.** None new; the page already omits the
George Sand line and keeps the Rubinstein / Samson François sentence at the
level of the mairie circuit (Tier 1 by policy).

## 18. Coz Ker (34 Grande Rue), 6 rows, linked to `coz-ker` (published)

**Checked.** Searches for Gustave Eiffel + Barbizon / Grande Rue / Coz Ker;
« Coz Ker » Barbizon; François Millet fils + Géraldine (Rhode Island);
Théodore Duhamel + Villa Marguerite + Sensier. Two POP/Joconde notices
returned by the Duhamel search were read (Louvre, Millet letters to Sensier,
3 March 1872 and 12 March 1869, Moreau-Nélaton bequest): they concern Sensier
only, not Duhamel or the villa.

**Outcome.** Still no source of any tier for Eiffel at Barbizon beyond the
circuit text; the web returns only the Crozon « villa Eiffel » and the
Aiguilles « maison Eiffel ». No row changed. The Karampournis footnote
(« Actuellement villa Coz Ker 34, Grande rue ») still needs the physical
book, and the Eiffel question needs AD77 matrices cadastrales for no. 34
(or the Fonds Eiffel at Orsay), both offline.

**Implication for published text.** Unchanged: the Eiffel sentence should be
attributed to the commune circuit (« selon le parcours de la mairie ») or
moved to `internal_notes` until a document surfaces. Covered by 029cccbf.

## 19. Auberge Diaz (11 Grande Rue), 5 rows, linked to `la-folie-barbizon-hotel` (published)

**Checked.** The number check flagged in pass 2 (booklet « N°11 » vs the
linked location at 5 Grande Rue). fontainebleau-tourisme.com and yonder.fr
pages on La Folie Barbizon (address, no building history); three directory
listings for the Hostellerie de la Dague (abcsalles.com, gralon.net, yelp.com
title); searches for « Auberge Diaz » on Google Books, archive.org, Gallica,
Commons (nothing new).

**Outcome.**
- All three directories give the Hostellerie de la Dague at **5 Grande Rue,
  77630 Barbizon**, the address of today's La Folie. So the chain Auberge
  Diaz → Hostellerie de la Dague → La Folie sits on one plot, and the
  booklet's « N°11 » is a numbering error or an older numbering, not a
  different house. **Inserted** `b32b5a52` (lead, three concordant Tier 3
  listings) and **updated** the notes of `bab04c7d` and `e7c6b02f` to close
  the number check.
- The 1949 press placing the Auberge Diaz « rue du Bas-Bréau, à l'entrée de
  la forêt » is consistent: nos. 1-11 are the forest end of the Grande Rue.
- No source read links La Folie's own presentation to Diaz or the Dague; the
  1954-55 « ancien atelier Diaz » claim remains a business claim.

**Implication for published text.** None required: `la-folie-barbizon-hotel`
says nothing about Diaz or the Dague. If Luigi wants a heritage line, the
safe one is « à l'emplacement de l'ancienne Auberge Diaz, devenue Hostellerie
de la Dague » (Karampournis 1990 + booklet + directories), without the
« atelier de Diaz » claim.

## 20. Manoir Saint-Hérem (ex Hôtel Bellevue), 9 rows, linked to `manoir-saint-herem` and `l-angelo` (published)

**Checked.** Musée national Picasso-Paris press kit *Olga Picasso* (PDF, read
in full for Fontainebleau / Barbizon / 1921); asllinea.org review of MoMA's
*Picasso in Fontainebleau* (2023); searches for Picasso + Barbizon + Bellevue
/ pension (nothing).

**Outcome.**
- The museum press kit confirms the 1921 summer at Fontainebleau three times
  (« Été 1921 : Séjour à Fontainebleau », p. 6; also pp. 3 and 12) and never
  names Barbizon; the MoMA review gives the lease as 1 July to 1 October 1921
  with a garage converted into a studio. This is Tier 1 for the Fontainebleau
  stay. Row `32a3b742` (L'Œil 2007) qualifies for `confirmed` with the press
  kit as second, independent source: the update **timed out twice** and is in
  the fenced block below for claude.ai to apply.
- Nothing new for Picasso at Barbizon. The negative stands, now against a
  museum chronology too.

**Implication for published text.** Unchanged: move the Picasso sentence to
`internal_notes` or attribute it explicitly to the commune circuit. Task
44fc7fb6 (« Review Picasso claim on Manoir Saint-Hérem ») already covers it;
no new task.

## 21. Landerer affair (12 rows) and Albert Landerer (2 rows), linked to `besharat-gallery-barbizon` (published)

**Checked.** Searches for Landerer / Länderer + Basel / Barbizon / 1893;
SIK-ISEA digitised *Catalog der Schweizerischen Kunst-Ausstellung in Basel*
1893 (PDF, no Landerer entry); edoc.unibas.ch record 56401; lehmanns.ch
preview of the same book (table of contents only); a HelveticArchives hit
(unrelated, Albrecht Mayer).

**Outcome.**
- **New Tier 2 source found:** Martin Gaier, *Bilder Basler Bändelherren. Der
  Historienmaler Albert Länderer (1816-1893) und seine Auftraggeber*, Schwabe,
  Basel, 2017 (DNB 113189040X). Chapter 3 (by Laura Catania, pp. 86-105) has
  sections « Der junge Länderer » (p. 90), « Zwischen Basel und Paris »
  (p. 97) and **« Ein Basler Historienmaler in Barbizon » (p. 102)**; the
  appendix holds his correspondence 1857-1889, his **testament of 1891**
  (p. 175), an oeuvre list and a Länderer-Wieland-Bischoff family tree. It
  gives the birth year 1816, which fits the press ages (76-78 in 1892-93) and
  narrows the age conflict (row 72582044) without settling it.
- **Inserted** `ca881ef4` (lead; record and table of contents seen, body not
  read). A follow-up note correcting the spelling (« Länderer ») and the
  chapter author **timed out**; SQL below.
- **Task filed** `41b522df` (backlog, p5, source loop): obtain and read the
  book, then update the residence-length, age and house rows. Duplicate check
  done: ce8efd66 is the AD77 property chain, not this book.
- The twelve affair rows (Abeille, Nouvelliste, Bataille, Bénézit) are all
  Gallica-anchored and could not be re-read; unchanged.

**Implication for published text.** None yet. If the book's Barbizon chapter
confirms the house, it will be the citation to put behind the Landerer
paragraph on the Les Charmettes page, replacing OCR press snippets.

## 22. André Rouveyre, 11 rows, linked to `besharat-gallery-barbizon` (published)

**Checked.** National Library of Israel authority record (Rouveyre, André,
1879-1962); en.wikipedia; data.bnf.fr (1962 deaths list returned without
content; his person page not returned by search); searches for « Ma
Coquille » / Charmettes.

**Outcome.** The NLI authority file gives death on 18 December 1962 at
Barbizon, citing Gide, *Correspondance (1909-1951)*, 1967 and Wikipedia; it
is built on the same Gide edition as the existing row, so one Tier 2 source,
not two. **Updated** `0414d53f` (source_url + note), status stays `lead`. The
nine letter-heading and chronology snippets (Charmettes 1919-1928, settled
1933) are unchanged; they need page view of the Gide-Rouveyre and Brandes
editions.

**Implication for published text.** None.

## 23. Hôtel de la Forêt, 10 rows, linked to `bobo-club` and `mairie-barbizon` (published)

**Checked.** Searches for the hotel + Masson + postcards; Darlington 1898 on
Google Books / archive.org / HathiTrust (not returned); the Office de
Tourisme's *circuit des peintres* English text (PDF: no Hôtel de la Forêt,
Masson or mairie entry).

**Outcome.** Nothing reachable improves the ten rows; the 1898 advertisement,
*La Nature* 1892 and the two Plancke books remain snippet leads. The « Louis »
Masson question (booklet) vs Jean-Baptiste Masson (1891 census) is still
open. No row changed.

**Implication for published text.** None new.

## Tasks (pass 3)

- **Filed** `41b522df` « Read Gaier 2017 (Schwabe) on Albert Landerer:
  chapter “Ein Basler Historienmaler in Barbizon” » (backlog, p5, research).
- Not filed (already covered): Picasso at Bellevue (44fc7fb6), Eiffel / Coz
  Ker and Villa Bernard names (029cccbf), plaques (dc8011f4).

## Writes that timed out (applied by the loop lead at 04:36 Paris)

Both statements timed out after 180 s and a re-select showed them not
applied. Root cause found by the loop lead: a `;` inside a string literal
makes the Supabase MCP `execute_sql` call hang until its 180 s timeout
(the same thing stalled the S1 and S3 status writes tonight). The lead
re-ran both statements with the in-literal semicolons replaced by periods
and both applied (`32a3b742` now `confirmed`, `ca881ef4` note appended).
Kept below for the record; nothing left for claude.ai to apply.

```sql
update research_findings
set status = 'confirmed',
    source_title = 'Musée national Picasso-Paris, dossier de presse « Olga Picasso » (PDF); L''Œil, April 2007',
    source_page = 'press kit p. 6 (repères chronologiques), also pp. 3 and 12; L''Œil p.47',
    source_url = 'https://www.museepicassoparis.fr/sites/default/files/2020-05/DP_Olga_web_FR.pdf',
    quote = 'Été 1921 : Séjour à Fontainebleau.',
    notes = coalesce(notes, '') || ' 2026-10-15 pass 3: Musée Picasso-Paris press kit (museum document, Tier 1) read in full: three mentions of the 1921 summer at Fontainebleau, none of Barbizon, no street address. With L''Œil 2007 this settles the Fontainebleau stay. It does not by itself exclude a visit to Barbizon.',
    updated_at = now()
where id = '32a3b742-4edd-44ac-b2a9-fcb4542654af'
```

```sql
update research_findings
set notes = notes || ' Correction from the full table of contents: the book spells the name « Länderer »; chapter 3 (pp. 86-105, incl. « Ein Basler Historienmaler in Barbizon », p. 102) is by Laura Catania; the oeuvre list (pp. 182-195) and a Länderer-Wieland-Bischoff family tree (p. 199) are in the appendix.',
    updated_at = now()
where id = 'ca881ef4-fbd6-4402-b99d-8e867f854e94'
```

## Not reached (after pass 3, kept for the record)

For the next pass, in this order:
- Villa Élisabeth: 1978 BnF Arsenal exhibition catalogue (Gallica
  `bpt6k65346721`, retry when reachable), Billy 1947 p.160 and Champigneulle
  1965 p.257 in page view
- Villa Bernard: Billy 1947 for the visitor list; L'Informateur de
  Fontainebleau 19 July 1932 p.8 on the image; other years of the classified
- L'Ombrage: Conservatoire prize lists, census 1931-1936 (offline)
- Coz Ker: AD77 matrices cadastrales for 34 Grande Rue; Karampournis 1990
  physical copy (p. 136-137 footnote)
- Landerer: Gaier / Catania 2017 (task 41b522df); Abeille rows on the images
- Rouveyre: Gide-Rouveyre 1967 p.62, Brandes 1952 p.395, Coquio 1995 p.31 in
  page view
- Hôtel de la Forêt: Darlington 1898 full view; Louis vs Jean-Baptiste Masson
- Maison Diaz / Narcisse Diaz / Renoir and Diaz (many rows, mostly snippet
  leads needing full view on Internet Archive or Gallica)
- Tumble Inn (festival PDF, Bottin 1925-1935)
- Karl Bodmer archival rows; Delteil, L'Artiste 1894 pp. 134-42 (place of
  death, Luxembourg painting)
- Marie Bodmer (census re-reading), Les Bosquets numbering (cadastre / on
  site), Chêne Bodmer fall date (Denecourt-Colinet guides, AAFF bulletins)
- Hôtellerie du Bas-Bréau: 1934 rename, Hirohito Oct 1971 (Le Monde / Figaro)
- Occupation: Kirkpatrick 1944 article, *The House Near Paris* for the house

## Pass 4 (05:00-06:05 Paris)

Tooling tonight: Gallica, archive.org full text and the Louvre/British Museum
catalogues blocked (noted once). `pop.culture.gouv.fr/notice/merimee/*` pages
needed a provenance approval that was not answered, so the Mérimée notice was
read through its monumentum.fr mirror; Palissy and Muséofile notices on
pop.culture.gouv.fr opened normally. Google Books did not surface through
WebSearch tonight.

## 24. Auberge Ganne, 14 rows (+1 practical row left to S3), linked to `auberge-ganne` (published)

Checked: POP Mérimée PA00086807 (via monumentum.fr), Palissy PM77000088,
PM77002094, PM77002088, Muséofile M0370, the museum's own pages « A l'origine
du musée » and « Le musée aujourd'hui », the Département's 2019 museums
programme, Fontainebleau Tourisme « Sentier des peintres » (FR and GB PDFs).

Outcome:
- `97c84b67` (museum since 1995) → **confirmed**: museum site « Depuis 1995,
  l'auberge Ganne abrite la collection permanente du musée », Muséofile M0370
  « 1995 : le nouveau musée municipal ouvre au public ».
- `9309aa09` and `75dc0cc3` (Luniot carried the painted decor to the new
  hotel) → **confirmed**: the museum's history page says the furniture and
  painted decor had been « transférés dans la Villa des Artistes à l'autre
  extrémité de la Grande rue » and were bought back from the Ganne-Luniot
  descendants by Pierre-Léon Gauthier, owner of the former inn from the
  1930s. The marriage detail (Edmond Luniot, Victoire Ganne) still rests on
  Lemoyne de Forges 1962 alone. The museum writes « Villa des Artistes », not
  « Hôtel des Artistes ».
- `08d99f1e` (opening date, open) and `225688a2` (c.1824): notes improved,
  status unchanged. Muséofile opens its history « 1824-1870 : l'auberge Ganne
  accueille les artistes », the museum site says « entre les années 1820 et
  les années 1860 », Fontainebleau Tourisme and Pomarède 2002 give 1834 for
  the present house. Working reading: painters from about 1824, present house
  from 1834. Needs a period source.
- `da4d1b85` (panels acquired by the commune 9 April 1990): **conflict
  noted**, status unchanged. The Palissy notices record the objects as
  « propriété de la commune », « 1985/04/09 : classé au titre objet ». Same
  day and month, year 1985 not 1990, and the commune already owned them at
  classement. Catalogue page needed in full view.
- Not improved: `08137e98` (1856 guide), `f25afef6` (1834 purchase, Tier 3
  only), `3b1c470b`, `bbbe8425`, `6a507036`, `3ad8060f`, `5dfd4631`,
  `6552f20e`.

Inserted (all `confirmed`, Tier 1):
- Mérimée PA00086807: inscription by arrêté of 28 December 1984, « façades et
  toitures, trois salles d'expositions du rez-de-chaussée (cad. AI 434) »,
  building dated 18th-19th c.
- Palissy: the painted furniture and works (armoire with six oil-painted
  panels, O. de Penne's print « L'Auberge Ganne en 1830 », the Ganne
  portraits, « Les Noces de la fille Ganne ») classified objets, property of
  the commune, 9 April 1985.
- Museum chronology: let as apartments from the 1870s, first municipal museum
  1927-1930 in Rousseau's studio (inaugurated by Painlevé), Gauthier owner
  from the 1930s and opening three ground-floor rooms, second museum 1977
  (agrément 1981), commune buys the inn 1987, early-1990s works uncover the
  first-floor paintings and graffiti, opening 1995, Conseil général 2004,
  Musée de France 17 Sept 2003.

Proposal for Luigi (not applied): the `auberge-ganne` text can state the
monument-historique inscription (1984, « inscrite » not « classée »), the
classified painted furniture (1985), the commune's purchase (1987) and the
Conseil départemental's management (2004) with Tier 1 backing. Keep the
opening date as « vers 1824-1834 » until a period source is read.

## 25. Narcisse Diaz de la Peña, person rows (6), linked to `maison-diaz` (published)

Checked: DMA blog (museum's own), MFA/DIA/RISD search hits, archive.org PDF of
Mollett (Cornell copy, redirect to a dn*.archive.org host refused), general
search for the « luxurious studio » claim.

Outcome:
- `17236e24` (Dallas Museum of Art) → **confirmed**: the DMA's own blog
  (Stacey Lizotte, 21 Oct 2021) captions « Narcisse Diaz de la Peña, Forest
  of Fontainebleau, 1868, oil on canvas, Dallas Museum of Art, Munger Fund,
  1991.14.M ». One work found, so the live text should say « une œuvre » or
  name it, not « des œuvres », unless a second object turns up.
- `b608bd05` (studio of rare luxury), `44529b46` (Mollett p.104 broker),
  `1a735f4c`, `78051d17`, `d50f5b1f`: not improved. Mollett and Thomson full
  view blocked (archive.org redirect host refused).

## 26. Céramano (Charles Ferdinand Sermain), 5 rows, two linked to `maison-sermain-plaque` (unpublished)

Checked: data.bnf.fr (no hit via search), dbnl.org, dealer biographies (not
used), search for Pierre Bordas at Barbizon (nothing usable).

Outcome: `a5533690` (origin of the name, open) gained a third lead: « De
vergeten Tieltse schilder Ceramano of Ch. F. Sermain », *Biekorf* 86 (1986),
on dbnl.org, text withheld for copyright, only the title and the dates Tielt
1831, Barbizon 1909 visible. Other four rows unchanged (état civil Tielt and
Barbizon still the way to confirm `99015944`).

## 27. William Morris Hunt, 1 row, linked to `besharat-gallery-barbizon` (published)

Checked: MFA Boston collection record for Millet's *The Sower* (acc. 17.1485),
en.wikipedia (for its Britannica 1911 citation only).

Outcome: `d14c5174` → **refuted** for *The Sower*. MFA provenance: Millet to
Hunt c.1851-52, Hunt to Quincy Adams Shaw through Doll and Richards 1874, Shaw
to the MFA 1917 (« Gift of Quincy Adams Shaw through Quincy Adams Shaw, Jr.,
and Mrs. Marian Shaw Haughton »). The painting survived the 1872 fire. What
Hunt lost, per Encyclopaedia Britannica 1911 (vol. 27, pp. 964-965, via
en.wikipedia): « many of Hunt's paintings and sketches, together with five
large Millets ».

Published text affected: `besharat-gallery-barbizon` says « les toiles qu'il
avait rapportées, dont Le Semeur de Millet, brûleront dans le grand incendie
de Boston en 1872 ». Proposed wording: « Hunt perd nombre de ses œuvres et
plusieurs Millet dans le grand incendie de Boston de 1872, mais *Le Semeur*,
acheté à Millet, lui survit et est aujourd'hui au MFA de Boston. » Task filed
(below).

## 28. Plaine de l'Angélus, 1 row, linked to `plaine-angelus-site-peinture` (published)

Checked: DRIEAT Île-de-France, SPR de Barbizon case-by-case dossier (I.
Rivière, S. Letellier), DRIEAT atlas of sites classés de Seine-et-Marne.

Outcome: `d14a3d90` → **confirmed** with correction. The plain is not a site
classé. It lies in the site inscrit « Abords de la forêt de Fontainebleau »
(inscription 2 June 1974, whole commune). The atlas of sites classés has no
Plaine de l'Angélus entry (only the Forêt domaniale, arrêté 2 July 1965, and
the Rû du Rebais / Fleury-en-Bière site, décret 5 Dec 2002). The booklet's
« classée à l'inventaire des sites » is the old phrase for an inscription.
Published text does not claim « classée », so no task. Also from the SPR
dossier: Atelier Millet listed 1947, ZPPAUP by arrêté 6 Nov 2000, 500 m
perimeters around the two listed buildings.

## 29. Médaillon Millet et Rousseau, 1 row, linked to `medallion-millet-rousseau` (published), note only

`566c8558`: Fontainebleau Tourisme (Tier 3) dates the inauguration to 19 April
1884 by subscription of the Barbizon painters, consistent with the booklet's
1984 centenary. A Karl Bodmer albumen print of the monument is at the Musée
Nicéphore Niépce (Google Arts and Culture). Status unchanged.

## Tasks (pass 4)

- **Filed** `9c04fe27` « Besharat page: fix the Hunt / Le Semeur 1872 fire
  sentence » (backlog, p4, content), after checking open tasks (76d7a163 and
  ce8efd66 cover other Besharat/Hunt matters).

## Not reached (after pass 4)

For the next pass, in this order:
- Single-row subjects not opened tonight: Mounet-Sully (Penesco 2005 p.525),
  Marcellin Berthelot (Billy 1947 p.122), Chapelle de Barbizon (Karampournis
  p.1945, Fontainebleau Tourisme gives « chapelle en 1889, église 1950 »),
  Maison Barye (26 Grande Rue), Le Relais / Hôtel Toulouse (2 av. du Général
  de Gaulle), Vertefeuille (Bordas), 39, 52 and 79 Grande Rue, La Bastide
  (Vitry cure d'air, « maire Maurice Thorez » to check)
- Auberge Ganne: 1856 guide, 1834 deed, the 1998 Mantes catalogue p.116 in
  full view (1985 vs 1990), Bellier 1868 p.764
- Diaz person rows: Mollett and Thomson 1890 full view (archive.org host
  refused), « luxurious studio » claim
- Céramano: Biekorf 1986 article (physical or DBNL login), Tielt and Barbizon
  état civil, Ostyn monograph
- Médaillon Chapu: period press April 1884 (Gallica)
