# Research sweep, 2026-10-17, pass 6

Standing job S2 (task 7820f08f). Branch `night/2026-10-17-research-sweep-6`,
research from about 02:30 to 03:02 UTC (server clock). Scope: pass 5's "Not
reached" list in its order, minus Albert Landerer (needs Gaier 2017 / HLS,
both unreachable): the Grande Rue single-row booklet subjects, Coz Ker,
L'Ombrage, Maison Diaz (28 rows), Narcisse Diaz de la Peña (5), Renoir and
Diaz (2), Farms of Barbizon, the Jazz Inn 2023 programme, then Manoir
Saint-Hérem (7 rows beyond the Picasso row). The barbizon.fr
bulletin archive was not reopened (fully read in passes 4 and 5). Rows whose
notes end in `[needs-local: ...]` were skipped, no subject worked in passes 1
to 5 was redone, and no existing row changed status. Tier rules as in
`docs/briefs/standing.md`.

## Reachability tonight (noted once, not retried)

Supabase MCP connected despite the session-start failure notice. Heartbeats
on task 7820f08f at 02:31, 02:36, 02:40, 02:44 and 02:58 UTC.

Pass 2's tooling map held. Newly tried and blocked: archive.org
`/download/<item>/<item>_hocr.html` (provenance, even when the link came from
the fetched details page, so every archive.org text format is now known
blocked), ccfr.bnf.fr notice pages (robots), evous.fr (robots), the
en.wikiquote.org Diaz page (404; the Barbizon-school page opens),
en.wikisource.org page and article URLs (404 on every try, so the 1911
Britannica Diaz article is out of reach there), and the gutenberg.org
`.txt.utf-8` variant of an ebook whose HTML was fetched (provenance). Gutenberg
HTML files are cut at about 100k characters and `offset` returns only the
tail, so a Diaz chapter sitting past p. 300 of Muther's *History of Modern
Painting* vol. 2 (ebook 43894) and the DIAZ article in the 1911 Britannica
slice "Diameter to Dinarchus" (ebook 32607, cut at "Diarbekr") cannot be
reached. Newly found working:
pafaarchives.org (catalogue metadata only), fr.geneawiki.com commune pages,
christies.com.cn lot pages, musee-orsay.fr artwork pages with their
commentary, bibliotheques-numeriques.defense.gouv.fr (catalogue records
only). Museum object pages at nga.gov, metmuseum.org and artic.edu carry no
artist biography text at all (only dates and places), so they settle nothing
beyond what pass 4 took from the Orsay artist record.

Database writes this pass: 1 insert (Tier 1, `confirmed`, `dossier` = this
file), 3 updates of pre-existing rows (notes only, no status change), 0 tasks
filed (the one candidate is covered by task a5e1b62a). No write refused.

---

## Narcisse Diaz de la Peña (1 new row, Tier 1)

Checked: Musée d'Orsay artwork pages for the three Diaz forest paintings the
search returned. *Les Hauteurs du Jean-de-Paris* (1867, RF 1819, Chauchard
bequest accepted 1910) carries a commentary: Diaz "regularly worked in
Fontainebleau forest where he excelled in creating the effects of light",
"he joined his friends Jules Dupré and Théodore Rousseau at Barbizon", and
his technique "influenced artists including Monticelli and Renoir". *Le
Bas-Bréau, forêt de Fontainebleau* (1846, RF 1816) and *Lisière de forêt*
carry catalogue data only.

Outcome: new row (confirmed, Tier 1, method `secondary`): Orsay places Diaz
at Barbizon with Rousseau and Dupré and names the Diaz-to-Renoir influence.
It does not settle the five open rows (luxury studio, viper bite, generosity,
broker role for Millet and Rousseau, collectors fighting over his works): the
Orsay text is uncited and says nothing about his house, his leg, prices or
his dealings. Those rows are unchanged.

Also tried for the Mollett and Thomson rows: Mollett, *The Painters of
Barbizon: Millet, Rousseau, Diaz* (1890) is on archive.org
(paintersofbarbiz00moll, 186 pp.) and in the PAFA rare-books catalogue
(RB.0024), but no text format opens from here; Thomson 1890 is not on
gutenberg.org (the self.gutenberg.org hit is the World Library, a different
site). Estelle Hurll's *Jean François Millet* (1900, gutenberg 13119) names
Diaz only as a Paris and Barbizon friend. The Musée des peintres de Barbizon
teachers' dossier (PDF) has Diaz only for the Auberge Ganne décor (rose
garlands, the 1854 Pigeory quote on his "libéralités artistiques", a
*Fête galante* attributed to him). The wikiquote Barbizon-school page has one
Diaz quote (Sensier via Mollett p. 96, Diaz "conquered immediately by
Rousseau"), not relevant to the open claims.

Implication for published text: the Diaz location text can cite the Orsay
commentary for "worked regularly in the forest, joined Rousseau and Dupré at
Barbizon, influenced Renoir". The viper-bite, luxury-studio and
patron-of-Millet sentences still rest on secondary sources only.

## Maison Diaz (28 rows: 2 improved, status unchanged)

Checked: fr.geneawiki.com « 77022 - Barbizon » (Tier 3, mayors list, used
in pass 3 for Marius Roger) for the open question on row 51bb895a, whether
the first mayor J.-B. Comble is the painter Paul Comble who bought and
rebuilt Diaz's house. The list names the first mayor **« Jean Batiste Paul
Nicolas COMBLE »**, mandate 01/1904 to 05/1904, then André Lamirault
05/1904-05/1908. The full name carries both « Jean-Baptiste » and « Paul »,
so the painter and the mayor are very probably one man, which also fits
bulletin row 962842ee (the 1900 separation commission chaired by "the
painter Paul Comble") and the 1991 "ancien notaire, artiste de talent".

The same page captions a plaque photo **« Narcisse DIAZ, 40 grande rue »**,
whereas the commune booklet puts the Diaz plaque and « Le Petit Manoir » at
no. 28 (row 03dcc44e) and no. 40 is Les Charmettes. Either the caption is
wrong or the plaque is not where the booklet says; an on-site check settles
it in a minute.

Outcome: notes added to rows 51bb895a and 03dcc44e (Tier 3 only, status
stays `lead`). No task filed: task a5e1b62a (review Maison Diaz 28 GR
location against Lemoyne de Forges and the mairie map) already covers the
on-site check, and this note should be read with it.

Not found: any museum holding Paul Comble's *La maison abandonnée* (Salon
1892) or *La maison de Diaz* (Fontainebleau 1893); the web search returns
only dealer pages for Diaz himself. POP Joconde was not queried directly
(no search hit to open).

## Renoir and Diaz (2 rows, no change)

The Orsay commentary above (Diaz's technique influenced Renoir) is the first
Tier 1 text found on the pair, but it concerns influence, not the Chailly
1862 meeting (Meier-Graefe) or the forest anecdote (Vollard). Both rows
unchanged; the new Diaz row's notes cross-reference them.

## Manoir Saint-Hérem (7 rows, 1 note added)

Checked the 1942 Picasso claim (row c65d0539, bulletin N°13). sortiraparis.com
(11 April 2023, on the "50 artistes" exhibition of 8 April to 10 June 2023)
repeats the commune wording word for word, « a séjourné en 1942 à plusieurs
reprises dans la pension de famille Bouvard », so it is press-release copy,
not an independent source. The Picasso Administration biography page for
1941-1942 (picasso.fr, "60 years old") lists the play *Le désir attrapé par
la queue*, the Dora Maar bronze, Gonzalez's death and the Vlaminck article,
and no stay outside Paris. Note added to c65d0539; the 1921 rows and the
Bellevue press rows are unchanged. The Picasso sentence should stay off the
site until the mairie says which year and which pension it means.

## Coz Ker (34 Grande Rue) (6 rows, no change)

Web search « Gustave Eiffel » + Barbizon + « Coz Ker »: only the Crozon
"villa Eiffel" (Finistère) and Orsay works. Search on Théodore Duhamel as
mayor of the XIe arrondissement 1902-1904: the evous.fr page on the mairie du
11e refuses robots, and geneawiki's Conseil municipal de Paris page (read)
lists only council presidents and an 1869 decree, no Duhamel. Nothing
improved.

## L'Ombrage (5 rows, no change)

Two web searches on Maximilienne Whettnall (with and without Rubinstein and
Samson François) return nothing about her: no concert notice, no obituary,
no Barbizon page. Consistent with the two negative rows already recorded
(data.bnf.fr, Gallica press). Nothing improved.

## Grande Rue single-row booklet subjects (no change)

Tried with web search and no usable hit: Roland Arribas / Art et Nature
(51 Grande Rue, Pierre Thorel rows), Bernard Sauvat at the Bistrot du Musée
(86 Grande Rue), General Voruz receiving Patton at L'Aubépine in 1945 (only
a library record for Blumenson, *Les carnets secrets du général Patton*,
Plon 1975), Georges Richard as curator of the Atelier Millet (25 Grande
Rue; one CCFr record came up but ccfr.bnf.fr refuses robots), Francis Carco
and Colette at Le Houx (only general Carco biographies, no Barbizon), Michel
Lacoste / Ombres et Lumières, Henri Matisse at Barbizon after Dorgelès
(Champigneulle row: only tourist pages). The mairie's *Guide des associations 2023-2024* (PDF,
read in full) lists no "Ombres et Lumières", "Art et Nature" or "Cercle
sportif et culturel"; it does give the Jeanne Gassies library as dating from
1932 and the Cercle Laure Henry as in the village since 1935 (both outside
this pass's subjects, not recorded). Not tried for lack of time: 52, 61,
64, 67, 68, 72, 79, 81, 96 Grande Rue, Le
Hameau, Le Royal, La Belle-Idée, Maison Barye, Café de l'Union, both Le
Relais rows, Henri Matisse (Champigneulle), the Gassies index row, the AD77
request row. These are shop and resident histories from the commune booklet
and need the mairie, the AD77 matrices or local memory rather than the web.

## Farms of Barbizon (1 row, no change)

POP Mérimée search for « ferme du Couvent » returns only the Veules-les-Roses
farm (PA00101086, Seine-Maritime) and the Montaigu farm (IA77000579, another
commune); no Barbizon or Chailly farm notice. A Christie's lot titled *la
ferme du Lieu-Bailly* (Millet pastel, Sensier provenance) concerns Gruchy,
not the plain of Chailly. The mairie's 2023 treasure-map PDF has no farm or
rue des Fermes text. Nothing improved.

## Jazz Inn 2023 programme (no row, nothing found)

A barbizon.fr-restricted search returns the 2024 programme (read in pass 5),
bulletin N°15 (May-June 2023), the Barbizon Classique 2023-2024 season, the
Japan week programme and the summer-2023 treasure map, but no 2023 Jazz Inn
programme PDF. The treasure map (read in full) repeats the tacot's arrival in
1899 and the Père Ganne pine-seedling anecdote, both already in the dossiers.

## Checked without result (no row changed)

- nga.gov object 195825 (*In the Forest*, 1874), metmuseum.org 436196 (*The
  Forest of Fontainebleau*, 1874, Huntington bequest 1900), artic.edu artist
  30911: no biography text on any of them.
- Muther, *History of Modern Painting* vol. 2 (gutenberg 43894): Diaz is in
  the chapter "Landscape from 1830" (p. 294 ff., portrait p. 328) but the
  text is beyond the fetch cap.
- Hurll 1900 (gutenberg 13119): Diaz only as "Friends at Barbizon".
- POP Joconde hit « 24 janvier 1869, Barbizon, à Alfred Sensier » (Louvre,
  Arts graphiques, A 2243): Millet letter on destroying a plate, no Diaz.
- Web search for the 1911 Britannica Diaz article text: dealer and
  aggregator pages only (Tier 3), not used.

## Not reached (for the next pass, in this order)

Albert Landerer years (unchanged: needs Gaier 2017 ch. 3 or HLS), the
Grande Rue single-row subjects listed above as not tried, Maison Diaz rows
that need Google Books page views (Lemoyne de Forges, Miquel 2006, the 1975
catalogue), the Mollett and Thomson 1890 chapters (archive.org only). For S4 / local: the Diaz plaque address on site (28 vs 40
Grande Rue), the AD77 état civil for Jean-Baptiste Paul Nicolas Comble (to
close the painter / mayor identity), the Fonds Eiffel at Orsay for any
Barbizon address, and a Gallica press search for « Whettnall ».
