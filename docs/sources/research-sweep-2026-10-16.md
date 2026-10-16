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
  Getty ULAN full record (client error), maryevans.com (empty page).
- Worked: Google Books *record* pages (`books/about/...`, bibliographic data
  and word cloud only, no snippets), Project Gutenberg, musee-orsay.fr artist
  catalogue, nationalgallery.org.uk artist page, learningonscreen.ac.uk (BUFVC
  newsreel database), en.wikipedia.
- WebSearch returns titles and URLs only; WebFetch opens only URLs a search
  returned. fr.wikipedia pages did not surface for any query tonight, so none
  could be opened.

Database writes this pass: 3 note updates (`3c1094cf`, `cf9399d4`, `28cb6e58`),
0 status changes, 0 inserts, 0 tasks filed. Heartbeats at 03:40, 03:58 and
04:25 Paris.

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

## 3. Hôtel de la Forêt, 10 rows, linked to `bobo-club` and `mairie-barbizon` (published)

**Checked.** Search for *La Nature* 1892 p.461 on the CNAM's Conservatoire
numérique (cnum.cnam.fr, which hosts the full run of *La Nature*): the search
engine did not surface any cnum page, only the techno-science.net mirror of
Wikipedia and unrelated PDFs. Not fetchable without a returned URL. Unchanged.
Darlington 1898, Billy 1947, Plancke 1991-92 and the Louis-versus-Jean-Baptiste
Masson question unchanged (same blockers as 10-15).

## 4. Villa Bernard, 6 rows, linked to `villa-bernard` (published)

**Checked.** Searches for Dr Auguste Giroux and the Villa Bernard restricted to
Wikipedia domains (to get the « Auguste Giroux » article into a result list so
it could be fetched): the French article did not surface; the English
« Barbizon » article did and was read: it has nothing on the Villa Bernard,
Giroux, Tumble Inn, Charmettes, Hôtel de la Forêt, the chapel, Hunt or Bodmer
(only « Leon Trotsky also lived here for a short time »). Unchanged.

## 5. Tumble Inn, 4 rows, linked to `tumble-inn` (published)

**Checked.** Search for period postcards or advertisements with an address
(delcampe-type hits): nothing for Barbizon; results are the Croton (NY) Tumble
Inn and the New York Barbizon hotel. Unchanged. The founder question (Alfred
Grand vs « an Englishman from New York ») still needs the mairie's Jazz Inn
programme PDF in a browser.

## 6. Hôtellerie du Bas-Bréau, 3 rows, linked to `hotellerie-bas-breau` (published)

**Checked.** Search for Hirohito at Barbizon in October 1971: only the British
leg of the 1971 tour (BFI, Royal Collection, Reuters) and ICRC material; the
CIA reading-room PDF that the search returned is the FOIA landing page, not a
document. Unchanged; « 1971 » stays « selon la commune ».

## 7. Villa Élisabeth, 7 rows, linked to `villa-elisabeth` (published)

**Checked.** Search for a Dorgelès chronology naming the Villa Élisabeth or
Hania at Barbizon: only estate-agent pages and two Région inventory sheets
(bot-walled). Unchanged.

## 8. Single-row subjects

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

None filed. Nothing read tonight flags published text as wrong. Duplicate check
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
- Subjects not opened tonight: Karl Bodmer archival rows, Marie Bodmer, Chêne
  Bodmer fall date, Landerer affair OCR rows, Rouveyre page views, Occupation,
  L'Ombrage, Coz Ker, Auberge Diaz, Auberge Ganne (1856 guide, 1834 deed,
  Mantes 1998), Manoir Saint-Hérem, Atelier Daubigny plaque, Ziem plaque, La
  Poste, Monument Farman, Villa des Artistes, Les Bosquets, Céramano,
  Vertefeuille, Le Relais, 39/52/79 Grande Rue, La Bastide, Tramway TSM,
  Médaillon Chapu, and the unlinked William Morris Hunt rows (9, created
  tonight by another job).
