# Research sweep, 2026-10-17, pass 2

Standing job S2 (task 7820f08f). Branch `night/2026-10-17-research-sweep-2`,
about 40 minutes of research (00:43-01:20 UTC). Scope: `research_findings`
rows in `open` / `lead`, starting from pass 1's "Not reached" list (Karl
Bodmer, Hôtel de la Forêt, Auberge Ganne, Villa Bernard, Ziem plaque, La
Poste, Villa des Artistes, Roger Martin du Gard, Marcellin Berthelot, André
Rouveyre, Villa Élisabeth, Manoir Saint-Hérem, Maison Diaz, Marie Bodmer, Coz
Ker, Landerer, Atelier Daubigny, L'Ombrage, Tumble Inn, Auberge Diaz,
Narcisse Diaz, La Clé d'Or, Gorges d'Apremont, single-row booklet subjects).
Rows whose notes already end in `[needs-local: ...]` were skipped. Tier rules
as in `docs/briefs/standing.md`.

## Reachability tonight (noted once, not retried)

Supabase MCP connected despite the session-start failure notice. Heartbeats
on task 7820f08f at 00:43, 01:03, 01:12 and 01:20 UTC.

The decisive constraint tonight: **WebFetch only opens URLs that a WebSearch
result (or a fetched page) returned**. Any URL typed from knowledge, and some
URLs built from a seen one, needs a provenance approval that nobody answers.
So the workflow was WebSearch with `allowed_domains` first, then WebFetch.
Re-tests at the start, both blocked (provenance): Wikimedia Commons
MediaSearch, archive.org `advancedsearch.php`. Also blocked: archive.org
`/stream/*_djvu.txt` (even when the link came from a fetched details page),
Google Books search-inside (`books?id=...&q=`, robots), Google Books feeds
and HathiTrust full-text search (provenance), Gallica (client error), Persée
(robots), catalogue.bnf.fr (robots), data.bnf.fr French notice pages
(provenance; the English summary page opens but carries only years),
inventaire.iledefrance.fr (haphash JavaScript wall), Getty ULAN (client
error), reuters.screenocean.com (invalid URL), fontainebleau-tourisme fiche
6000532 (now 404). WebSearch rejects some queries with accents plus `OR`
(HTTP 400); plain queries work.

Worked: pop.culture.gouv.fr (Mérimée, Palissy, Joconde, Muséofile),
musee-peintres-barbizon.fr (pages and PDFs), barbizon.fr (pages and PDFs),
archives.seine-et-marne.fr event pages, nobelprize.org, margaretthatcher.org,
learningonscreen.ac.uk (BUFVC newsreel records), mediaclip.ina.fr,
marxists.org, universalis.fr, nationalgallery.org.uk, metmuseum.org,
archive.org details pages (metadata only), Google Books "about" pages
(bibliographic data and the common-terms word list only).

Database writes this pass: 9 row updates, 3 inserts, 1 task filed. No write
refused (one update failed on a uuid/text cast and was re-run with
`id::text like`).

---

## Auberge Ganne (12 rows)

Checked: Mérimée PA00086807 (re-read: inscribed MH 28 Dec 1984, 92 Grande
Rue, cad. AI 434, 18th-19th c., "propriété privée" as of the 1993 notice);
Palissy PM77002081 « Les Noces de la fille Ganne » (commune property, classé
objet 9 April 1985, no provenance); the museum press kit PDF (nothing on the
inn's history beyond Millet's 1849 pension); the museum « Salle par salle »
page. The Mérimée facts were already confirmed (rows c8ac5ae7, fc89ac37) and
the 1985 / 1990 panel question was already analysed (da4d1b85), so nothing
changed there.

New from the museum page (Tier 2, uncited): the inn's police register was
« utilisé de 1848 à 1860 » and records Rousseau, Ziem, Daumier and Barye;
Couture stayed in August 1849; Félix Pigeory described the rooms after a 1854
visit; officers on the 1839 Chailly manoeuvres ate there.

- Row bbbe8425 (registers show Diaz-circle painters 1849-1861): note added,
  stays `lead` (the museum names no Diaz-circle painter).
- Inserted: 1 `lead` row (Auberge Ganne, register 1848-1860, with the four
  names and the 1839 / 1849 / 1854 dates), source URL and quote.

Implication for published text: none yet. The register itself is the Tier 1
anchor for any "Ziem stayed at the Ganne inn" sentence.

## Hôtel de la Forêt (10 rows)

Checked: POP (no Mérimée / Joconde notice for the hotel or for a painter
Masson at Barbizon; the Joconde hit "Paysage de Barbizon, plaine d'Apremont"
is a Diaz at Meudon, 2006-3-8), the mairie « Histoire » page (no Masson, no
Hôtel de la Forêt), fr.wikipedia « Tramway Sud de Seine-et-Marne » (dates
missing from the rendered page; cites Plancke t. 2 p. 134 and Housson 1985,
neither online). The Darlington advertisement and La Nature need full-text
search that is blocked. No row changed.

## Villa Bernard (6 rows)

Checked: the mairie « Histoire » page states Cocteau came « dans les années
30 » to the Villa Bernard, « la propriété du docteur Giroux », with
Giraudoux, Chanel and Diaghilev, and names neither Citroën nor Iribe. Both
facts were already recorded (confirmed row 151dd249, refuted row 1afa1c38 on
Diaghilev, d. 1929). Google Books record ovQQAQAAMAAJ (Billy 1947, 227 p.)
lists « Villa Bernard » in its word index but the page is unreadable from
here.

- Row e9ef5aa8: note added with the Google Books record, tagged
  `[needs-local: books.google.com ovQQAQAAMAAJ q="Villa Bernard"]`.

## Ziem plaque (3 rows)

No new source for the Villa Cyrano attribution. The museum register
(1848-1860) listing Ziem among the inn's travellers is now in the new Ganne
row and is the first institutional statement placing Ziem at the inn in that
period. No Ziem row changed.

## La Poste (2 rows)

Searched barbizon.fr, fontainebleau-tourisme, INA and the open web for the
1967 « plus jolie poste de France » and for Krier's villa « Les Roses ».
Nothing reachable. No row changed.

## Villa Élisabeth (7 rows)

Universalis « Dorgelès » (Paul Morelle) confirms « Le Château des brouillards
(1932) » but says nothing of Barbizon.

- Row c7bebc78: note added (date of the novel is Tier 2 confirmed, the
  rental and writing place still rest on Billy 1947). Stays `lead`.

## Hôtellerie du Bas-Bréau (3 rows)

Thatcher's engagement diary (margaretthatcher.org 147236-147237) was re-read:
dinner at « L'Hotellerie de Bas-Breau, Barbizon » on 25 June 1984, departure
from the hotel 08:15 on 26 June. Already confirmed (row 78705054). For
Hirohito 1971: INA clip i23016341 (2 Oct 1971) shows the imperial couple
received by Pompidou at the Élysée, so the French leg is early October 1971,
but no reachable source (INA, Getty, CIA reading room, Thatcher Foundation)
places them at Barbizon.

- Row ba0c2bf3: note added, tagged
  `[needs-local: RetroNews / Le Monde 1-7 Oct 1971, query Hirohito Barbizon]`.

## Tumble Inn (4 rows)

The mairie's Barbizon Jazz Inn 2024 programme PDF (barbizon.fr) was read in
full: the festival is held « en souvenir du célèbre club de jazz le Tumble
Inn créé en 1920 par un Anglais arrivé tout droit de New York », « l'un des
premiers bars américains en France », which « a réuni pendant près de 30 ans
des célébrités du monde entier »; « il reste un nom, toujours sur la porte de
la rue Ménard ». No founder name, no number, no guests.

- Row 67c4f9ff: quote, source_date and notes set (PDF read, not a summary
  any more). Stays `lead` (mairie promotional text). It neither confirms nor
  contradicts « Alfred Grand »; « près de 30 ans » implies the bar ran to
  about 1950.

Implication for published text: keep « bar américain » and 1920; do not name
the founder until a period source is read.

## Trotsky in Barbizon (2 rows)

BUFVC News on Screen record 4785: British Movietone News issue 255, released
23 April 1934, story « Picture Paragraphs in the Week's News: Barbizon -
Trotsky's expulsion », shotlist « GV House. Trotsky seated speaking ». The
Surrealist tract « Planète sans visa » (24 April 1934) was re-read and
matches the existing confirmed row.

- Row cce38ca8 (confirmed): note added with the newsreel as a third
  independent period source. Row 4f6bf982 (booklet, 1935 / Mexico) unchanged;
  its errors were already flagged.

## Louis Renault, jurist (2 rows)

NobelPrize.org « Louis Renault - Facts »: « Born: 21 May 1843, Autun,
France », « Died: 8 February 1918, Barbizon, France ». The 2026-10-16 sweep
had read the Facts page as giving dates only; it gives the place.

- Row e45891ee: `lead` → `confirmed` (Nobel Foundation registry, Tier 1,
  concordant with the Haberman biographical note « went to his villa in
  Barbizon »). The 13 rue Théodore Rousseau address stays booklet-only
  (row 3261d118).

Implication for published text: a sentence « le juriste Louis Renault, prix
Nobel de la paix 1907, mourut dans sa villa de Barbizon le 8 février 1918 »
is now supportable; « premier Français prix Nobel de la paix » stays refuted.

## André Rouveyre (11 rows)

data.bnf.fr person record 12152184 / catalogue.bnf.fr cb121521848 located
(the search result page), but only the English summary (1879-1962, no
places) opened; the French notice and catalogue.bnf.fr are blocked.

- Row 0414d53f (death at Barbizon, 18 Dec 1962): note added, tagged
  `[needs-local: https://catalogue.bnf.fr/ark:/12148/cb121521848]`.

## Ferdinand Chaigneau (1 row)

- Row 11dcd010: note added, the mairie « Histoire » page also says « Jacques
  Prévert qui fréquenta La Bergerie en 1929 » (same institution as the
  booklet, not independent, but it dates the link).

## Monument Farman (3 rows)

The mairie's Guide des associations 2024-2025 (Rotary Club entry) lists a
« don pour la restauration de l'avion Farman (plaine de l'Angélus », undated.

- Inserted: 1 `lead` row (Monument Farman): the memorial apparently carries an
  aircraft element that was restored with a Rotary donation; a check for a
  restoration plaque is added to the on-site photo task's scope.

## Source discovery: Rambaud 2023

AD77 event page (Rendez-vous de l'Histoire, 4 June 2024): « Barbizon, une
histoire à vivre », collective illustrated history from the Middle Ages to
today, written at the request of the Mairie de Barbizon by Isabelle Rambaud,
archiviste-paléographe and conservatrice générale honoraire of AD77,
published November 2023. Not in any finding or task before tonight. Written by
a professional archivist with AD77 access, it is the most likely single
source to settle the booklet-only house rows.

- Inserted: 1 `lead` row (subject « Source policy »).
- Task filed: ad85e061 « Acquire and read Rambaud 2023, Barbizon, une
  histoire à vivre » (backlog, todo, priority 4, source loop). Duplicate
  check: no open task or finding mentioned Rambaud or the title.

## Checked without result (no row changed)

Karl Bodmer (museum site and press kit do not mention him; HLS and the 1893
press already confirm the Paris death), Narcisse Diaz (National Gallery and
Met artist pages carry no leg / studio / broker detail; the Met gives
« Bordeaux 1808 » against Orsay and Joconde 1807, a discrepancy worth a line
if Diaz's dates are ever published), Roger Martin du Gard (Universalis
« Martin du Gard » blocked by robots; Google Books 7E9_0QEACAAJ is the 1922
NRF reprint and only restates « written in 1908 »), Maison Diaz / Auberge
Diaz / Coz Ker / Manoir Saint-Hérem / Marcellin Berthelot / L'Ombrage
(Whettnall: nothing on the open web) / Eugène Freyssinet (the Freyssinet
association's 2022 Brest talk does not mention Barbizon) / Gorges d'Apremont
(the AAFF 2026 fire Q&A has no history before July 2026) / Marius Roger (the
mairie site lists no former mayors) / Hôtel de la Forêt (above).

## Not reached (for pass 3, in this order)

Everything in the 2026-10-15 consolidated hand-over still stands. Tonight's
reachable-source map suggests pass 3 should lead with sources that answer
without full-text search: POP Palissy notices for the remaining Auberge
Ganne objects (painters of the panels, for Bodmer and Ziem), Joconde letters
of Millet « Barbizon » (50350511070, 50350510930) for Maison Millet rows,
BUFVC / INA newsreel records for 20th-century events (Hirohito 1971, the
1967 post office, Weidmann 1937, Trotsky April 1934 INA side), nobelprize.org
and universalis.fr biographies for the single-row celebrity subjects, and
barbizon.fr PDFs (bulletins) for recent plaque and monument dates (Farman
restoration, mosaics). Subjects still untouched: Marie Bodmer (2), Atelier
Daubigny (3), Villa des Artistes (3), Landerer affair (9), Albert Landerer
(4), La Clé d'Or (1), Caverne des Brigands (1), Mounet-Sully (1), Henri
Matisse (1), Pierre Thorel, Daniel Rouvière, Michel Lacoste, Street names,
Films, Celebrities list, Les Charmettes (44 rows, never in the not-reached
list because most are published-linked and worked by earlier passes; check
which of its rows are still `open`).
