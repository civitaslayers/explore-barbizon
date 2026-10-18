# Research sweep, 2026-10-18, pass 1

Standing job S2 (task 7820f08f). Branch `night/2026-10-18-sweep`.
Scope this pass: `research_findings` rows in `open` / `lead`, published-linked
first, one subject at a time, about 60 minutes. Tier rules as in
`docs/briefs/standing.md`: Tier 1 or two independent Tier 2 sources confirm;
Tier 3 alone stays `lead`.

Previous sweep file: `docs/sources/research-sweep-2026-10-15.md` (passes 1-9).
The 2026-10-16 and 2026-10-17 sweeps left their results in the `notes` column
of the rows (dated entries) but no file reached `main`; this pass relied on
those notes to avoid repeating searches.

Reachability this session: Supabase MCP fine (the session-start notice said it
had failed to connect; it had not). WebSearch returns titles and URLs only;
WebFetch opens only URLs a search returned. Blocked tonight, noted once and not
retried: archive.org full text (Knowlton 1899 `artlifeofwilliam00know`), the
Région Île-de-France inventory PDFs (`inventaire.iledefrance.fr`, bot wall),
data.bnf.fr HTML pages (the PDF export opens but carries only the header),
Gallica (no gallica URL surfaced through search, so not fetchable). Tavily not
used (403 earlier tonight). Sources that worked: getty.edu (news), livreshebdo.fr,
monumentum.fr (Mérimée mirror), pop.culture.gouv.fr (Palissy), journaldespalaces.com,
gillespudlowski.com, fr.geneawiki.com, onlinebooks.library.upenn.edu,
americanart.si.edu, aaff.fr (PDF), pariszigzag.fr, en.wikipedia.

Database writes this pass: 7 row updates (notes on rows verified, no status
change), 2 inserts (`d4424565` confirmed, `1cf611a4` lead), 1 task filed
(`1a79cb40`). No write was refused. Heartbeats on 7820f08f at start, ~20 and
~40 minutes.

---

## 1. Maison-atelier Millet, 2 rows, linked to `maison-millet` (published)

**Checked.** Getty Museum news, Erin Migdol, « The Forgery That Shocked the
Art World » (20 Sept 2023, written for the exhibition *Reckoning with Millet's
Man with a Hoe*, Getty Center, 12 Sept-10 Dec 2023); Livres Hebdo, Jean-Claude
Perrier, « Éric Halphen, Le faussaire de la famille » (11 Feb 2022; Buchet
Chastel, 240 p., ISBN 9782283035504); Mérimée PA00086806 via monumentum.fr;
Palissy PM77002062; the Musée de la Résistance en ligne record returned by
search (unrelated person, « Jean Charles », b. 1923); searches for Sensier's
*Vie et l'œuvre de J.-F. Millet* in text (records only).

**Outcome.**
- Row `372ef84a` (forgery affair, from mairie bulletin N°9, 2022) stays `lead`
  for its specifics, notes updated. **Inserted** `d4424565` as **`confirmed`**:
  the core narrative is now three-source and two of the sources are
  independent of the commune. Getty: Jean-Charles Millet, grandson, with the
  painter Paul Cazot produced « some 40 fake Millet paintings and around 200
  fake Millet drawings », authenticated with the inherited JFM studio stamp and
  certificates on family stationery; Douhin, a businessman, « bought
  Millet's old house in Barbizon and turned it into a museum » and bought
  drawings and fakes from him (incl. a second *Man with a Hoe*); trial 1935,
  « short prison terms » and fines; the London dealer David Croal Thomson
  (d. 1930) sold many of the fakes. Livres Hebdo (on Halphen): three trials
  1930-1936, death at Dachau on 24 December 1944.
- Discrepancies to keep in mind: the bulletin says arrested May 1930 by Jules
  Belin and sentenced by the tribunal correctionnel de Fontainebleau to six
  months; Getty dates the trial to 1935; Livres Hebdo speaks of three trials
  1930-1936. Those specifics remain single-source each.
- Row `a7845565` (ownership chain Brézard, Sensier 1858, Martel 1864,
  Marguerite Sensier, Douin 1923, Meunier 1950) untouched: needs Sensier 1881
  or the cadastre, both unreachable tonight. Mérimée PA00086806 (via
  monumentum.fr) gives only « inscription par arrêté du 1er octobre 1947 », no
  historique.

**Implication for published text (proposal only).** The `maison-millet` page
does not mention the forgery affair; nothing to change. If Luigi wants it in
the story layer, the safe wording is « dans les années 1920, le petit-fils du
peintre, Jean-Charles Millet, écoula de faux Millet, certains par
l'intermédiaire du musée privé ouvert dans la maison par le marchand Douhin ;
l'affaire fut jugée dans les années 1930 » with Getty 2023 and Halphen 2022 as
sources. Sensitive subject (a deportee's biography): editorial review first.

## 2. Les Pléiades (21 Grande Rue), new subject, linked to `les-pleiades` (published) — also Circuit des Peintres row `8311b70c`

**Checked.** Le Journal des Palaces, Sylvie Leroy, « L'hôtel Les Pléiades de
Barbizon classé cinq étoiles » (6 Nov 2012); gillespudlowski.com on the
Bas-Bréau (1 Dec 2017: history as Stevenson's inn and « relais de poste », Fava
family, no stars, no park size); search for the Bas-Bréau star rating.

**Outcome.**
- **Inserted** `1cf611a4` (`lead`, Tier 2 trade press citing Atout France):
  Les Pléiades « vient d'obtenir son classement en établissement cinq
  étoiles » in November 2012, twenty rooms. The published page says « Hôtel 4
  étoiles » and 22 rooms. A classification lasts five years and the hotel is
  closed for renovation, so the current rank is unknown.
- Bas-Bréau (`8311b70c`): nothing new; Pudlowski gives no rating. Unchanged.

**Implication for published text (proposal only).** `les-pleiades`: write
« hôtel de luxe » or « classé 5 étoiles (2012) » instead of « 4 étoiles » until
the Atout France register is read. **Task filed** `1a79cb40` (backlog, p5,
content) after the duplicate check: `6e11010d` covers the closed-for-renovation
listing, `d16ec0a9` the Bas-Bréau figures; neither covers the Pléiades star
count. The one download that settles both hotels is the Atout France open-data
CSV (`[needs-local:` on both rows).

## 3. Maison Diaz, 1 of 28 rows touched (`51bb895a`, J.-B. Comble first mayor), linked to `maison-diaz` (published)

**Checked.** fr.geneawiki.com « 77022 - Barbizon » (Tier 3, mayor table citing
Mairesgenweb).

**Outcome.** Geneawiki lists « Jean Batiste Paul Nicolas COMBLE, 01/1904 -
05/1904 » as first mayor, then André Lamirault (05/1904-05/1908), Félix Binet,
Louis Tourteaux, Georges Caron (1912-1929), Marius Roger (1929-1935), Louis
Pochard (1935-1943), and dates the commune's creation from Chailly-en-Bière to
1903. Agrees with the 1904 press snippet already on the row. One Tier 2 snippet
plus Tier 3: stays `lead`, notes updated. The other 27 Maison Diaz rows are
Gallica / Google Books snippets or archive steps (censuses, cadastre) and were
not attempted; none is reachable from the sandbox.

**Implication for published text.** None.

## 4. Ernest Révillon, 1 of 3 rows touched (`83a2eb7b`), no location linked

The same Geneawiki commune page says the war memorial in front of the church
was inaugurated in 1920, « sculpteur Ernest Révillon », Franco-American
subscription. Geneawiki therefore gives both first names (Ernest on the
commune page, Jean-Baptiste on its « Morts aux guerres » page, pass 9 of
2026-10-15). Notes updated, status unchanged; POP / monumentsmorts or the AD77
deliberation still needed.

## 5. Hunt / Boston fire 1872 (`82e508d6`) and William Morris Hunt (9 rows), linked to `besharat-gallery-barbizon` (published)

**Checked.** Smithsonian American Art Museum artist page (biography credited to
Peter Bermingham, *American Art in the Barbizon Mood*, 1975); the Online Books
Page author listing for Hunt (25 HathiTrust records: Angell 1881 `000369151`,
Knowlton 1899 `006125782`, Shannon 1923 `000369156`, MFA memorial exhibition
1879/1880 `100439544` / `100440768`, Paul Hunt sale 1898 `010363068`, Albright
centennial 1924 `103233541`); archive.org Knowlton full text (blocked).

**Outcome.**
- `82e508d6` stays `lead`, notes updated: SAAM / Bermingham is a second,
  independent Tier 2 for the studio loss (« destroyed Hunt's Summer Street
  studio and with it his collection of French paintings ») but does not count
  the Millets, so « five » remains Knowlton-only.
- SAAM gives Hunt « died Appledore, NH 1879 » (Appledore Island is in Kittery,
  Maine; the row already carries the Met's Isles of Shoals). Not written to the
  row; the civil record is still the decisive source.
- The nine William Morris Hunt rows otherwise unchanged; all tagged
  `[needs-local:` for Knowlton / Angell / NYT 1879, and the HathiTrust record
  numbers above are now the shortest path for the local job.

**Implication for published text (proposal only).** Unchanged from task
`9c04fe27`: the Besharat page's Hunt sentence should say that the 1872 fire
destroyed his studio and his collection of French paintings, among them
several Millets (five according to Knowlton), and that *Le Semeur* survived.

## 6. Marc Logé (`f52997d2`), no location linked

**Checked.** data.bnf.fr PDF export 11913224 (header only); the HTML authority
page (provenance-blocked).

**Outcome.** BnF authority « Marc Logé (1887-1949) », ark:/12148/cb11913224b,
updated 28-04-2026: Tier 1 for the years, which match the mairie bulletin
(London 24 Sept 1887, Barbizon 2 April 1949). Real name, sex and places not
read. Notes updated with `[needs-local:` for the HTML page. Status unchanged.

## 7. Médaillon Millet et Rousseau (`566c8558`), linked to `medallion-millet-rousseau` (published)

The AAFF leaflet « Sentier des peintres, l'Éléphant de Barbizon » (Version
2023, aaff.fr PDF) also gives « Œuvre d'Henri Chapu, il fut inauguré le 19
avril 1884 », by public subscription of the Barbizon artists. Same leaflet
family as the Fontainebleau Tourisme text, so not an independent second
source. Notes updated, status unchanged. The same PDF has nothing on the
Grotte des Barbizonnières, the Caverne des Brigands, the Dormoir de Lantara or
the Chêne Bodmer (checked, so those subjects need not retry it).

## 8. Parcours des mosaïques (`7cb77f8b`), linked to `parcours-des-mosaiques` (published)

Three searches for the 2010 inauguration and the mosaicists (Péreira, Barbara,
Grangé) returned only the known tourism pages plus pariszigzag.fr (Tier 3:
« 20 mosaïques magnifiques », « verre de Venise », no date, no makers) and
three Région inventory PDFs that were bot-walled. No row changed. Next: the
mairie bulletin or *Le Parisien* 77, April 2010, from a browser.

## 9. Les Charmettes (46 rows), housekeeping only

The whole subject was listed to pick reachable rows: all 46 are Gallica /
Google Books snippets, deed and cadastre steps, or oral actions, so none was
attempted. One duplicate pair found: `6e89c5bb` and `53c93756` are the same
Chairish listing of the Véder etching, created on different nights; a note on
`6e89c5bb` marks `53c93756` as canonical (no row deleted, the standing rules
allow notes only).

## 10. Tried, nothing found (rows not changed)

- Charles Jacque / Jeanne Gassies (`9fb3c614`): one search for « Jeanne
  Gassies » Barbizon, no web footprint; the INSEE deaths file stays the way
  (`[needs-local:` already on the row).
- Tramway TSM (`4eb2b8fe`): en.wikipedia « Tramway from Verneuil-l'Étang to
  Melun » mentions a « Melun–Barbizon line » in 1927 and 1949 contexts but
  gives no dates or operator; the Région inventory PDFs on the tram are still
  bot-walled.
- Grotte des Barbizonnières (`3820ae33`): search returned only leaflets and
  museum object pages, none naming the grotto.
- Maison-atelier Millet ownership chain (`a7845565`): see 1.

---

## Tasks

- **Filed** `1a79cb40` « Les Pléiades page: « 4 étoiles » on the site,
  classified 5 étoiles by Atout France in 2012 » (backlog, p5, content, source
  loop).
- Not filed (already covered): Hunt / Le Semeur sentence (`9c04fe27`), Bas-Bréau
  park and stars (`d16ec0a9`), Pléiades closed listing (`6e11010d`), unsupported
  booklet claims (`029cccbf`).

## Not reached in pass 1 (for pass 2, in this order)

- Subjects linked to published locations whose remaining rows all need a
  blocked source (test reachability first, then work the first that opens):
  Karl Bodmer, Chêne Bodmer, Marie Bodmer (Delteil 1894, Denecourt guides);
  Landerer affair, Albert Landerer, André Rouveyre, Roger Martin du Gard,
  Mounet-Sully, Marcellin Berthelot (Gallica, Google Books page view, Gaier
  2017); Villa Élisabeth, Villa Bernard, L'Ombrage, Coz Ker (Billy 1947,
  Champigneulle 1965, AD77); Hôtel de la Forêt, Manoir Saint-Hérem (Région
  inventory); Tumble Inn (mairie Jazz Inn PDF, Bottin); Occupation 1940-1944
  (Kirkpatrick 1944); Hôtellerie du Bas-Bréau 1934 / 1971 (Le Monde, Figaro).
- Booklet single-row subjects never searched: Farms of Barbizon
  (`ferme-du-couvent`), Le Royal, 61 / 64 / 68 / 81 / 96 Grande Rue, 52 and 79
  Grande Rue (commercial history, low expectation).
- Unlinked subjects not opened tonight: Michel Lacoste, Daniel Rouvière,
  Trotsky in Barbizon, Films shot in Barbizon, Eugène Freyssinet, Louis
  Renault (jurist), Marius Roger, André Billy, Street names of Barbizon, the
  booklet house-name rows (Les Tilleuls, Les Ramages, Les Pommiers, Les
  Glaneuses, Les Alouettes, Le Houx, Le Hameau, Le Chaperon Rouge, La Vieille
  Demeure, La Belle-Idée, La Baraka, L'Aubépine, L'Abri, Café de l'Union).
- Hunt rows: the HathiTrust record numbers listed in section 5 are ready for
  the local job (viewer blocked from the sandbox).
