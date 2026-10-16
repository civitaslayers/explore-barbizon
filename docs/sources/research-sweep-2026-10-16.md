# Research sweep, 2026-10-16

Standing job S2 (task 7820f08f). Branch `night/2026-10-16-research-sweep`.
Pass 1, 03:38 to about 04:50 Paris (hard stop 05:05). Scope: `research_findings`
rows in `open` / `lead`, published-linked first, one subject at a time, starting
with the two large subjects never swept before (Les Charmettes, 42 rows; Maison
Diaz, 28 rows) and then the published-linked leftovers of 2026-10-15. Tier
rules as in `docs/briefs/standing.md`: Tier 1 or two independent Tier 2 sources
confirm; Tier 3 alone stays `lead`.

## Reachability tonight (each blocked site tried once, not retried)

- Supabase MCP: fine despite the session-start notice that it had failed to
  connect (same as every night). Every write applied on first try. No `;` in
  any literal.
- Not attempted, known down tonight: Tavily, archive.org full text, HathiTrust,
  Gallica, loc.gov, mfa.org.
- Blocked when tried: `pop.culture.gouv.fr/notice/merimee/IA77000938`
  (provenance approval not answered), Wikimedia Commons (`URL_NOT_FOUND` on
  both a file page and a category page, encoded and unencoded), Google Books
  in-book search `books?id=...&q=` (robots), the Région Île-de-France
  inventory PDFs (`inventaire.iledefrance.fr`, JavaScript bot wall « haphash »,
  as on 10-15), Persée (article not surfaced by search, so not fetchable),
  Getty ULAN full record (client error), maryevans.com (empty page), the
  Gutenberg plain-text file `18854.txt.utf-8` (provenance approval not
  answered; the HTML version did open but the fetch truncates it),
  `419squadron.com/Evaders-4.html` (https to http redirect loop), the CIA
  reading-room PDF returned by search (landing page only).
- Worked: Google Books *record* pages (`books/about/...`, bibliographic data
  and word cloud only, no snippets), Project Gutenberg HTML, musee-orsay.fr
  artist catalogue, nationalgallery.org.uk artist page, nga.gov object page,
  learningonscreen.ac.uk (BUFVC newsreel database), en.wikipedia and
  fr.wikipedia (only when a domain-restricted search returned the page),
  thecanadianencyclopedia.ca (Memory Project veteran testimonies),
  aircrewremembered.com, 419squadron.com (Drue page), njmastro.com,
  journaldespalaces.com.
- WebSearch returns titles and URLs only; WebFetch opens only URLs a search
  returned. Restricting a search to `fr.wikipedia.org` / `en.wikipedia.org`
  with `allowed_domains` is the reliable way to get a Wikipedia page into a
  result list so that it can be fetched (worked for the tramway, Chailly and
  Karl Bodmer pages; did not surface « Auguste Giroux »).

Database writes this pass: 1 insert (`a0a5acda`, Occupation, `confirmed`),
7 note updates (`3c1094cf`, `cf9399d4`, `28cb6e58`, `759c7872`, `90b48832`,
`d59a3f6f`, `4eb2b8fe`), 0 other status changes, 0 tasks filed. One insert was
refused once by the `method` check constraint (allowed values: `page_image`,
`ocr`, `snippet`, `census`, `secondary`, `oral`, `archive`) and re-sent with
`secondary`; no write timed out. Heartbeats at 03:40, 03:58, 04:08 and 04:40
Paris.

---

## 1. Les Charmettes (40 Grande Rue), 42 rows, linked to `besharat-gallery-barbizon` (published)

First sweep of this subject. The 42 open/lead rows fall into four groups:

1. **Gallica snippet rows** (13: République de Seine-et-Marne 1896-1953,
   Gaulois 1918, Archives commerciales 1897, hotel-trade bulletin 1910, the
   1903 Fontainebleau guide, Touring-Club revues 1896-1908, Locomotion
   automobile 1904, Association des chimistes 1908-09). Gallica is down
   tonight; nothing attempted. These need the page images, and the 1910
   bulletin row (`dc4f6fff`) explicitly must not be used before the image is
   read.
2. **Google Books snippet rows** (12: Aristide Marie, *Vient de paraître* 1928,
   Léautaud 1989 and the *Journal littéraire* index, Perret-Dormoy 2009, Société
   de géographie de Lille 1912, *Revue culinaire* 1936, *Monde hôtelier* 1933,
   *Génie rural* and *Gazette apicole* 1974, Dorian 1956, Baedeker 1924, *Time
   and Tide* 1929, Joanne 1903, Newnham-Davis 1911, Touring-Club *À la France*
   1901-03). Google Books in-book search is robots-blocked tonight; only the
   bibliographic record pages open. Checked instead:
   - **Newnham-Davis, *The Gourmet's Guide to Europe*** (row `4cb436b2`, cited
     as 1911 p.53): the Project Gutenberg text (no. 18854) is the **1903 first
     edition** (Grant Richards), and its environs-of-Paris matter has no
     Barbizon or Charmettes in the portion the fetch returned (about 100,000
     characters, the Paris chapters; the tail is Beaulieu and Monte Carlo).
     Either the Barbizon paragraph was added in the 1908 or 1911 editions, or
     it sits in a part of the file the fetch truncated. Not conclusive, row
     unchanged. Next: the 1911 edition on HathiTrust / Google Books full view.
   - **Baedeker, *Paris and its Environs*, 1924** (row `4db4be99`): search
     surfaced only library catalogue records (Osher, Wellcome, NLI, CCA) and a
     dealer listing; no full view reachable. Unchanged.
   - **Karampournis 1990** (row `a9a3b7bd`, the « GRAND HOTEL DES CHARMETTES
     ... Maison SCHALLER » advertisement): the Google Books record page for the
     1990 Amatteis edition (id `I8hPAAAAYAAJ`, 303 pp., digitised 2010 from the
     University of Virginia copy) opens and shows « Charmettes » and « Diaz » in
     its word cloud, no snippets; the preview edition (`khkBEQAAQBAJ`) is the
     one with limited preview but its search endpoint is robots-blocked.
     Unchanged.
3. **Archive / on-site rows** (7: the 1908 alignment plan, the 2008 deed and
   certificat d'urbanisme, the 1925 Morlat deed, the Schaller interview, the
   cadastre). Human or AD77 actions, untouched.
4. **Interpretation rows** (`2be17e62`, `7945b400`, `28cb6e58`, `56b873c3`,
   `90b48832`, `897849f4`). One improved:
   - `28cb6e58` (« M. Comble », 1902 telephone, « presumably the mayor »):
     **notes added** by cross-reference to the subject's own confirmed and lead
     rows: Jean-Baptiste Comble was a Chailly councillor in 1903 and became
     Barbizon's first mayor in January 1904 (`51bb895a`), and lived at no. 28
     (`03dcc44e`). In 1902 he was a councillor, not a mayor. The 1902 item
     itself still needs its page image.
   - `2be17e62` (who bought the house in 1895) is already answered by the
     confirmed rows `46d2dec8` (Duhamel, surenchère, August 1895) and
     `9c448948` (Duhamel opened the hotel, 1896); its notes say so. Left as is.
   - `897849f4` (booklet: « un des premiers hôtels de Barbizon (1872) »,
     convalescents 1914-18, Princess Elizabeth 1948): the 1948 lunch is already
     `confirmed` on `c99f7089` (Le Figaro, 18 May 1948, gérante Mme Delsidini).
     Tonight's attempt to add an independent newsreel record found only the
     British Paramount News issue 1797 of 20 May 1948, « Elizabeth Finds Entente
     Very Cordiale » (BUFVC News on Screen, story 41054), whose synopsis covers
     Paris only, no shot list. Row unchanged; 1872 stays refuted.

**Implication for published text (proposal only).** None new. The Charmettes
chronology on the Besharat page (Landerer house, Duhamel 1895-96, Schaller, 1948
royal lunch) rests on confirmed rows; the 42 open rows are colour, not
structure. If a date for the hotel's opening is ever printed, it is
September 1896, never 1872.

## 2. Maison Diaz (28 rows) and Narcisse Diaz de la Peña (5 rows), linked to `maison-diaz` and `le-relais-barbizon` (published)

First sweep of the Maison Diaz subject. The rows are of three kinds: Gallica
OCR snippets (Journal des artistes 1909, République 1903, L'Événement and Petit
courrier 1892, Gaulois 1922, Journal du Loiret 1868, Petit Parisien 1904,
Gassies 1907 on Gallica), Google Books snippets (Moreau-Nélaton 1921, Miquel
2006, Lemoyne de Forges 1971, the 1975 catalogue, Leprohon 1985, Karampournis
1990, Pomarède 2002, Ménard 1881, *La Vie à la campagne* 1911, the 1892 Salon
livret) and archive.org OCR (Herbet 1903). All three sources are down or
snippet-only tonight, so the house question (no. 28 « Le Petit Manoir » versus
the farm at the corner of the route de Macherin, now Le Relais) could not be
advanced. What was reachable and read:

- **POP / Mérimée IA77000938** (row `9620538e`, Région inventory 2019, Diaz
  settling in the Macherin-corner house): the notice itself is
  provenance-blocked tonight and the Région inventory PDFs that search returned
  (`ivr1120197701237`, `...241`, `...245`, `...00193` to `...00220`) sit behind
  the JavaScript bot wall. Unchanged. Still the single best reachable-in-a-
  browser source for the Diaz house, covered by task `60a6e3f7`.
- **Musée d'Orsay artist record 35856** (Tier 1): « Diaz de la Pena, Narcisse
  Virgile », born 1807 Bordeaux, died **1876 Menton, Alpes-Maritimes**; eight
  works held, among them *Le Bas-Bréau, forêt de Fontainebleau* (1846) and
  *Lisière de forêt* (1871); no biography text. Row `3c1094cf` (Karampournis:
  bought a fine house, left for the Riviera, died at Menton 1876): **notes and
  source_url added**, status stays `lead` because the « bought a fine house »
  clause is still Karampournis-only.
- **National Gallery, London, artist page** (Tier 2 museum text): « From the
  mid-1830s he frequently stayed in the Forest of Fontainebleau, and was
  greatly influenced by Théodore Rousseau »; Barbizon is not named (the
  *Common with Stormy Sunset* caption says « almost certainly near the village
  of Barbizon »). Row `cf9399d4` (Lyon 2002: from 1836 every summer): **notes
  added**; « mid-1830s » is compatible with both 1836 (Lyon) and 1837 (Salon
  view of Apremont, Herbet), so the 1836-vs-1837 question stays open.
- Taine at Barbizon (rows `c1e49541`, `03c08e74`, `e4e438fc`, `8c4abf59`):
  searched for Taine's *Vie et correspondance* in a reachable full text
  (Wikisource, Europeana, bibliothèques numériques de la Défense); only
  catalogue records came back. Unchanged.
- Wikimedia Commons (for the postcard « Ancienne Maison de Narcisse Diaz »,
  row `e324ebc4`): unreachable tonight (see above). Unchanged.

**Implication for published text (proposal only).** `maison-diaz` can cite the
Orsay record for « mort à Menton en 1876 » and the Dallas work (confirmed
10-15). The « lived there until his death » form, already flagged against
Gassies' épilogue (`bdaf66ca`), should stay out of the text; « la maison qu'il
possédait à Barbizon » is as far as the sources go, and which house it was
(no. 28 or the Macherin corner) is still a two-source conflict (Lemoyne de
Forges and the Région inventory versus the 1903 plaque and the 1911
advertisement).

## 3. Occupation 1940-1944, 4 rows (1 worked) + 1 new row, linked to `galerie-erika-gage` (unpublished) and `besharat-gallery-barbizon` (published)

**Checked.** The RCAF side of the Drue Tartière story, which no earlier pass
had opened: The Memory Project (Canadian Encyclopedia) veteran testimony of
Fg Off Lorne « Red » Frame, 419 Sqn; aircrewremembered.com pages « Frame,
Lorne » (crew of Lancaster X KB718, crashed at Fay near Chailly-en-Bière at
01:45 on 5 July 1944) and « Steepe, Charles » (which transcribes Flt Sgt Daniel
Murphy's Escape and Evasion Report); 419squadron.com « Drue Tartiere and 419
Squadron »; njmastro.com (2020s blog post relaying the 419squadron « Evaders-4 »
page, itself unreachable tonight); the 429 Sqn evaders list (nothing); the
American Scholar piece on Helen Kirkpatrick (no Barbizon). A search for
*The House Near Paris* in full text found library records only.

**Outcome.**
- **Inserted `a0a5acda`, `confirmed`**: three concordant first-hand accounts
  now place the sheltering of the KB718 crew at Drue Tartière's Barbizon
  property in July-August 1944. Frame (Memory Project, Tier 2): « I stayed at
  Drue's small house in Barbizon, six houses away from the local French
  Commander » for seven weeks, until the American liberation late in August.
  Murphy (E&E report as transcribed on aircrewremembered.com): « They then took
  us into Barbizon to an American woman », « She moved to Barbizon where she
  purchased a small farm », a week « in the house of a friend of the Mme.
  Tartiére », then « on 12th July we went over to the farm of the Mme.
  Tartiére where we stayed until 26th August ». Tartière's own memoir is
  already `confirmed` on `6aefbec8`. Both airmen's accounts are independent of
  the booklet and of each other.
- Row `d59a3f6f` (booklet: « Mme Parson-Tartière » sheltered airmen at no. 71,
  « L'Écureuil ») stays `lead`, **notes improved twice**: (a) the house name
  « Villa L'Ecureuil, home of Drue Tartiere » also appears on the 419 Squadron
  association's Evaders page (as quoted by njmastro.com; the page itself
  redirect-looped), a second Tier 3 witness independent of the commune; (b)
  Murphy describes the property as « a small farm » she had bought, and says the
  airmen spent their first week in a friend's house before moving to the farm,
  so if no. 71 Grande Rue is a village house the booklet may be naming the
  friend's house or merging two addresses. No source but the booklet gives a
  street number.
- Rows `3df2075e`, `9e1ced17`, `5455f332` untouched.

**Implication for published text.** None: no published page names Tartière's
house or no. 71 (checked by text search on `locations`). For the future
`galerie-erika-gage` draft: the sheltering is now solid (three first-hand
accounts); say « Drue Tartière (the actress Drue Leyton) », « sa petite
maison / sa ferme de Barbizon », and keep « L'Écureuil » and « no 71 » as
« selon la commune » until the friend's-house question is settled. Frame's
« six houses away from the local French Commander » is a lead for placing the
house once the 1944 Kommandantur or FFI post is located.

## 4. Tramway TSM (`4eb2b8fe`), linked to `la-folie-barbizon-hotel` (published)

**Checked.** fr.wikipedia « Tramway Sud de Seine-et-Marne » (surfaced by a
domain-restricted search, read in full) and « Chailly-en-Bière ».

**Outcome.** Notes improved, status unchanged (Tier 3 read, Tier 1-2 cited but
not read). The article settles the initials in the booklet's favour: Société
anonyme des **Tramways sud de Seine-et-Marne, TSM** (the techno-science mirror's
« TSSM » is wrong), nickname « Tacot de Barbizon », metre gauge, concession to
M. Nabias, Melun to Barbizon along the CGC 64 (today's RD 64), terminus « Gare
de Barbizon » with a « Barbizon-Centre » stop, service 1899-1938, Baert et
Verney 1921, SCFE 1927. It cites the concession decree (Duvergier, *Collection
des lois*, vol. 98, 1898, p. 471), the déclassement decree (JO 8 March 1952,
p. 2818) and the monograph René Housson, *Histoire du Tramway Sud de
Seine-et-Marne : Melun, Barbizon, Milly, 1899-1938*, Amatteis, 1985, 111 p.,
which is the book to read for the exact dates and the Barbizon terminus
layout (no. 1 vs no. 5 Grande Rue, turntable, goods station).

**Implication for published text.** `la-folie-barbizon-hotel` does not mention
the tram. If a tram line is ever written, « TSM » and « 1899-1938 » are safe;
the station's street number is not.

## 5. Karl Bodmer's sons: Marie Bodmer (`759c7872`) and Les Charmettes (`90b48832`)

**Checked.** en.wikipedia « Karl Bodmer » (fetched after a search returned it).

**Outcome.** The article states that « his three sons, Charles, Rodolphe and
Henri » were figures of the Barbizon community of artists and poachers, citing
Didier Lévêque, *Peindre les Indiens : l'art de Karl Bodmer, Rosa Bonheur,
Antoine Tzapoff* (Barbizon exhibition, 2021), p. 12 (Tier 2, not read). It also
says he was registered as Jean-Charles Bodmer and went by « Charles », which is
why a « Charles Bodmer » signature needs care. Two rows gain a pointer, no
status change:
- `759c7872` (the Orsay photographer Charles Bodmer, born Chailly 1854, as
  candidate father of Marie): a son Charles is now attested, so the hypothesis
  is strengthened; Lévêque p. 12 or the Chailly état civil would settle it.
- `90b48832` (Charmettes tradition: « Rodolphe Bodmer » left an aperitif debt
  at the Schallers'): Rodolphe is corroborated as a real son; the Hunt and 1856
  clauses remain unsourced.
- Aside, for the Chêne Bodmer rows: the National Gallery of Art, Washington,
  holds a Karl Bodmer lithograph *Au Bas Breau. Foret de Fontainebleau*
  (1975.34.22, Ailsa Mellon Bruce Fund, no date, not on view). Not recorded as
  a row (no new fact about the oak).

**Implication for published text.** None yet; if Lévêque 2021 is read, the
Chêne Bodmer page can gain the sons.

## 6. Hôtel de la Forêt, 10 rows, linked to `bobo-club` and `mairie-barbizon` (published)

**Checked.** Search for *La Nature* 1892 p.461 on the CNAM's Conservatoire
numérique (cnum.cnam.fr, which hosts the full run of *La Nature*): the search
engine did not surface any cnum page, only the techno-science.net mirror of
Wikipedia and unrelated PDFs. Not fetchable without a returned URL. Unchanged.
Darlington 1898, Billy 1947, Plancke 1991-92 and the Louis-versus-Jean-Baptiste
Masson question unchanged (same blockers as 10-15).

## 7. Villa Bernard, 6 rows, linked to `villa-bernard` (published)

**Checked.** Searches for Dr Auguste Giroux and the Villa Bernard restricted to
Wikipedia domains (to get the « Auguste Giroux » article into a result list so
it could be fetched): the French article did not surface; the English
« Barbizon » article did and was read: it has nothing on the Villa Bernard,
Giroux, Tumble Inn, Charmettes, Hôtel de la Forêt, the chapel, Hunt or Bodmer
(only « Leon Trotsky also lived here for a short time »). Unchanged.

## 8. Tumble Inn, 4 rows, linked to `tumble-inn` (published)

**Checked.** Search for period postcards or advertisements with an address
(delcampe-type hits): nothing for Barbizon; results are the Croton (NY) Tumble
Inn and the New York Barbizon hotel. Unchanged. The founder question (Alfred
Grand vs « an Englishman from New York ») still needs the mairie's Jazz Inn
programme PDF in a browser.

## 9. Hôtellerie du Bas-Bréau, 3 rows, linked to `hotellerie-bas-breau` (published)

**Checked.** Search for Hirohito at Barbizon in October 1971: only the British
leg of the 1971 tour (BFI, Royal Collection, Reuters) and ICRC material; the
CIA reading-room PDF that the search returned is the FOIA landing page, not a
document. Unchanged; « 1971 » stays « selon la commune ».

## 10. Villa Élisabeth, 7 rows, linked to `villa-elisabeth` (published)

**Checked.** Search for a Dorgelès chronology naming the Villa Élisabeth or
Hania at Barbizon: only estate-agent pages and two Région inventory sheets
(bot-walled). Unchanged.

## 11. Single-row subjects

- **Charles Jacque / 24 Grande Rue** (`9fb3c614`, Jeanne Gassies lived there
  until 2003, died on the eve of her 100th birthday): search returned only the
  Georges Gassies dealer biography (proantic, Tier 3) and museum pages; nothing
  on Jeanne. The INSEE deaths file (matchID) would be Tier 1 for her dates but
  is not reachable through a search result. Unchanged.
- **Ermitage Saint-Antoine / Roland Arribas** (`b1d7f7ff`): no web footprint
  for a painter of that name at Barbizon. Unchanged.
- **Marcellin Berthelot** (`d9cda705`): the Persée article « A Barbizon » (1949)
  identified on 10-15 did not surface in any search tonight, so it could not be
  fetched. Unchanged.
- **Mounet-Sully** (`de8cab8e`), **La Bohème**, **Le Royal**, **La Clé d'Or**,
  **61 / 64 / 68 / 81 / 96 Grande Rue**: booklet-only commercial rows, no source
  outside the booklet expected online; not searched (as on 10-15).
- **Parcours des mosaïques** (`7cb77f8b`): already carries the negative on
  « Murano »; the mairie site is robots-blocked. Unchanged.

---

## Tasks

None filed. Nothing read tonight flags published text as wrong (the one
`confirmed` insert, Tartière's airmen, concerns an unpublished location; the
Besharat page cites Tartière's memoir only in its internal notes, not in
published text). Duplicate check
done against open tasks: `029cccbf` (booklet-only claims), `60a6e3f7` (Région
inventory in a browser, which now also covers the Diaz house notice
IA77000938), `dc8011f4` (plaques), `41b522df` (Gaier 2017), `ce8efd66` /
`103eb640` (AD77 / Forney).

## Not reached, for a second pass

Everything in the 10-15 consolidated hand-over still stands. Added tonight:

- Les Charmettes: all 25 snippet rows need Gallica or Google Books / HathiTrust
  full view; Newnham-Davis must be checked in the **1911** edition (Gutenberg
  has 1903 only, no Barbizon found in the readable part); Baedeker 1924 p.425
  in full view.
- Maison Diaz: POP IA77000938 and the Région sheets in a browser (task
  `60a6e3f7`); Taine, *Sa vie et sa correspondance* vol. 3-4 (Hachette
  1905-07) for the Barbizon summers; Wikimedia Commons postcard metadata when
  Commons is reachable.
- Hôtel de la Forêt: *La Nature* 1892 p.461 on cnum.cnam.fr (needs a direct
  URL from a search result or a browser).
- Chapelle: the 1904 date on the mairie map (`f60e4f65`) is unexplained; a
  Semaine religieuse de Meaux item would settle 1889 vs 1904.
- Occupation: 419squadron.com « Evaders-4 » page in a browser (names « Villa
  L'Ecureuil »); *The House Near Paris* (1946) for the house and the friend's
  house; which plot at 71 Grande Rue had farm buildings in the 1940s.
- Tramway: Housson 1985 (Amatteis) for the Barbizon terminus layout; Duvergier
  1898 p. 471 for the concession decree.
- Karl Bodmer's sons: Lévêque, *Peindre les Indiens* (Barbizon 2021), p. 12;
  Chailly état civil 1854 (Charles) for the Marie Bodmer link.
- Subjects opened tonight with no change (same blockers as 10-15): Hôtel de
  la Forêt, Villa Bernard, Tumble Inn, Hôtellerie du Bas-Bréau (Hirohito),
  Villa Élisabeth, Charles Jacque / 24 Grande Rue, Ermitage Saint-Antoine,
  Marcellin Berthelot, Monument Farman (Maurice Farman's Wikipedia biography
  has no Barbizon property), Landerer (Schwabe sample PDF returned by search was
  another book), Atelier Daubigny / Les Pléiades (the 2012 five-star article
  has no history), La Poste (no Krier hit).
- Subjects not opened tonight: Karl Bodmer archival rows, Chêne Bodmer fall
  date, Landerer affair OCR rows, Rouveyre page views, L'Ombrage, Coz Ker,
  Auberge Diaz, Auberge Ganne (1856 guide, 1834 deed, Mantes 1998), Manoir
  Saint-Hérem (Picasso rows re-read, nothing new to try without the MoMA 2023
  catalogue), Ziem plaque, Villa des Artistes, Les Bosquets, Céramano,
  Vertefeuille, Le Relais, 39/52/79 Grande Rue, La Bastide, Médaillon Chapu,
  Parcours des mosaïques, and the unlinked William Morris Hunt rows (created
  tonight by the Hunt dossier job, 2f8efdc5, left to it).
