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

For the next pass, in this order:
- Villa Élisabeth (6 rows: Dorgelès; CCFr Belloni correspondence record)
- Villa Bernard (6 rows: Billy 1947 for the visitor list; L'Informateur de
  Fontainebleau 1932 image)
- L'Ombrage (5 rows: Whettnall concert programmes, RetroNews)
- Coz Ker (6 rows: Eiffel claim, Karampournis footnote; needs the book)
- Auberge Diaz, 11 Grande Rue (5 rows: La Dague vs La Folie, number check)
- Maison Diaz / Narcisse Diaz / Renoir and Diaz (many rows, mostly snippet
  leads needing full view on Internet Archive or Gallica)
- Tumble Inn (festival PDF, Bottin 1925-1935)
- Karl Bodmer archival rows; Delteil, L'Artiste 1894 pp. 134-42 (place of
  death, Luxembourg painting)
- Marie Bodmer (census re-reading), Les Bosquets numbering (cadastre / on
  site), Chêne Bodmer fall date (Denecourt-Colinet guides, AAFF bulletins)
- Hôtellerie du Bas-Bréau: 1934 rename, Hirohito Oct 1971 (Le Monde / Figaro)
- Occupation: Kirkpatrick 1944 article, *The House Near Paris* for the house
