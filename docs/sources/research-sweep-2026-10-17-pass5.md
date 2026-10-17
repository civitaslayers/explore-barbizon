# Research sweep, 2026-10-17, pass 5

Standing job S2 (task 7820f08f). Branch `night/2026-10-17-research-sweep-5`,
research from about 02:06 to 02:27 UTC (server clock). Scope: pass 4's "Not
reached" list in its order (Albert Landerer years, Caverne des Brigands, Les
Charmettes minus the Gallica-only rows, Villa des Artistes, the single-row
house subjects, barbizon.fr bulletin archive pages 2 and 3), then the two Jazz
Inn programmes and the mairie web map. Rows whose notes end in
`[needs-local: ...]` were skipped, no subject worked in passes 1 to 4 was
redone (new facts for those subjects went into new rows), and no existing row
changed status. Tier rules as in `docs/briefs/standing.md`.

## Reachability tonight (noted once, not retried)

Supabase MCP connected despite the session-start failure notice. Heartbeats
on task 7820f08f at 02:06, 02:14, 02:20, 02:24 and 02:27 UTC.

Pass 2's tooling map held. Still down: hls-dhs-dss.ch (both URL forms,
client error). Newly found blocked: archiv.ub.uni-heidelberg.de (Anubis
bot wall), paperspast.natlib.govt.nz (Incapsula), universalis.fr article
pages (robots; the chronology pages opened in pass 2), recherche.sik-isea.ch
(JavaScript-only, no text). WebSearch rejected two queries with
`allowed_domains` lists of French dailies (HTTP 400). Newly found working:
criminocorpus.org BILIPO scans (period *Détective* issues as PDF, read
whole), gutenberg.org (full book text, capped at about 100k characters per
URL), chairish.com listings, and the barbizon.fr map PDF
`carte-60X60-web.pdf`, whose text layer the fetcher now extracts.

Database writes this pass: 12 inserts (all with `dossier` = this file), 13
updates of pre-existing rows (notes, and on two rows method/source_url/
quote/source_date; no status change), 0 tasks filed (the one candidate was
already covered). No write refused.

---

## Albert Landerer, years in Barbizon (4 rows, nothing settled)

Checked: edoc.unibas.ch record of Gaier 2017 (no abstract, no text);
lehmanns.ch preview (table of contents only, chapter « Ein Basler
Historienmaler in Barbizon » p. 102, « Zwischen Basel und Paris » p. 97,
testament 1891 p. 175, correspondence 1857-1889 pp. 149-174, no Barbizon
sentence in the preview); a Heidelberg artdok record returned by search
(bot wall); HLS D22486 (down); SIK-ISEA (no text). Outcome: no row changed.
The 15-vs-18-vs-10 years conflict (a43290a1) still needs the Gaier chapter
or HLS; the Im Hof correspondence 1857-1889 in Gaier's appendix is the
best single document for the move to Barbizon.

## Caverne des Brigands, Weidmann 1937 (1 row, note added)

Checked: criminocorpus BILIPO scans of *Détective* (special issue, end of
1937, « Le Tueur »; and a 1938 issue, article by Noël Pricot), an actualitte
book extract (« L'Affaire Eugène Weidmann », episode 1), Papers Past
(blocked), Trove/Chronicling America (no hit). Outcome, row b3c608a7 (lead,
unchanged): *Détective* 1938 places the Keller outing « dans une forêt
sableuse (la forêt de Fontainebleau) » in early October 1937 and names
« la caverne des brigands » in a column, without detail; the book extract
has Keller taking her children to Montbéliard on 30 September 1937. Both
contradict Wikipedia's 3 September date. One Tier 2 source for the cave
itself, so still lead. If ever published: « début octobre 1937 », not
3 September, and only after editorial review (the row is marked sensitive).

## Les Charmettes (40 Grande Rue) (1 row improved, 1 new row)

Thirty-four open/lead rows are Google Books or Gallica snippets that no
reachable source can upgrade tonight (full text blocked everywhere). One
test: the Newnham-Davis *Gourmet's Guide to Europe* snippet (4cb436b2). The
1903 first edition (Grant Richards, Project Gutenberg 18854) was read in
full and has no Barbizon entry, so the snippet comes from the 1908 or 1911
edition (note added). New row 53c93756 (lead, Tier 3): a hand-coloured
etching by Eugène-Louis Veder (1876-1936), pencil-titled « Barbizon - Les
Charmettes », early 20th century, on a dealer site (chairish.com, Bradley
Fine Art): an iconography lead for the gallery page. The mairie web map
(below) still prints « un des premiers hôtels de Barbizon (1872) », the
date refuted in the dossier.

## Villa des Artistes (12 Grande Rue) (1 new row, 1 note)

Bulletin N°7 (nov-déc 2021) p. 10: the « villa des artistes » built after
1870 by Ganne's son-in-law Joseph-Bernard Luniot stood « en face de notre
mairie actuelle » and was demolished in the early 20th century to build
villas. New row bf2c86e9 (lead, Tier 2). It supports the booklet's no. 12
(the mairie is at 13, south side) and its « Ici s'élevait », but conflicts
with the museum's « let as flats » (1218ac1f) and the Mahenc « détruit par
la famille en 1959 » (3ad8060f). Proposal for Luigi: keep the site text
silent on the building's fate until a cadastre comparison settles it.

## barbizon.fr bulletins, pages 2 and 3 of the archive (14 issues read)

Read in full tonight: N°3 (janv-fév 2021), N°4, N°5, N°6, N°7, N°8, N°9,
N°10, N°11, N°12, N°13 (janv-fév 2023), N°15, N°16 (sept-oct 2023). Already
read by passes 3 and 4: N°14, N°17 to N°29. The whole archive is now read.
Also read: the Barbizon Jazz Inn 2024 programme (the 2023 one was not in
the search index) and the mairie map PDF. All bulletin facts are Tier 2
(commune, uncited) unless noted.

### Occupation 1940-1944 (2 new rows, 2 notes)

N°15 (mai-juin 2023) p. 10, dossier Résistance: Mme Schaller « recueillit
et hébergea secrètement l'épouse et les enfants d'André Citroën » at the
Charmettes (new row db763ce3, lead: first written statement of the oral
row 8727b091, probably from the same family tradition, so not independent;
note added to the negative-search row 3df2075e); « une Kommandantur à
l'hôtel du Bas Bréau » (new row cd2fff3a, lead, next to the confirmed
Rommel/Keitel row); the « ferme de l'écureuil, aujourd'hui atelier d'Erika
Gagé » as a transit point for hidden airmen and agents (note on e95c02df);
liberation 23 August 1944 by a Patton column (already confirmed, 8df1c234).

### Tramway TSM, le tacot (2 new rows)

N°6 (sept-oct 2021) pp. 8-9, citing René Housson, *Histoire du Tramway Sud
de Seine-et-Marne*: decree of 31 August 1898, works from July 1898,
inauguration Sunday 26 March 1899, service 29 March 1899, Melun-Barbizon
closed 30 September 1938; two Barbizon stations, the main one on the right
of the rue du 23 Août between rue Révillon and the plaine de l'Angélus
(sold 9 May 1941 to François Peignon), the small terminus one at the forest
entrance with a turning loop; three locomotives in 1899, two more in 1908,
no. 2 named « Barbizon » (new row 26067814). N°15 last page: the bell of
locomotive no. 2, in service from 21 November 1898, saved by a mechanic in
1938 and now at the mairie (new row 7e1c9f37). Implication for the
published tacot station text: the Grande Rue building (no. 1/3/5 in the
three local sources) is the *small* terminus station; the main station was
on the rue du 23 Août and is gone. The 31 Aug 1898 decree is a Tier 1
target (Journal officiel, Gallica, needs local).

### Manoir Saint-Hérem, Picasso (1 new row)

N°13 (janv-fév 2023), section « Picasso, 50 artistes à Barbizon »: « l'artiste
a séjourné en 1942 à plusieurs reprises à Barbizon, et plus précisément dans
la pension de famille Bouvard, devenue plus tard « Manoir Saint-Hérem » »
(new row c65d0539, lead). This is a different claim from the circuit text
(Picasso « et sa famille » at the Hôtel Bellevue, read so far as the 1921
summer): 1942, alone, under the Occupation, and a pension named after the
café Bouvard family (35 Grande Rue). The published manoir-saint-herem text
says « pension de famille où séjourna Picasso avec sa famille ». Task
44fc7fb6 (« Review Picasso claim on Manoir Saint-Hérem », ready, priority
4) already covers this; the 1942 evidence should be added to it when it is
picked up. No new task filed.

### Maison-atelier Millet, the forgery affair (1 new row)

N°9 (mars-avril 2022) pp. 10-11, after judge Éric Halphen's book:
Jean-Charles Millet (grandson) and the dealer André Douhin, who had turned
the Millet house into a small museum and commissioned copies there, sold
fakes for about seven years with the « JFM » studio stamp; the affair broke
over « Le Vanneur » declared burnt in the United States; arrest May 1930 by
Jules Belin; six months' prison at Fontainebleau; arrested at Avon under
the Occupation, deported to Dachau in 1944, died there five months later
(new row 372ef84a, lead, sensitive). Douhin is the dealer behind the 1923
private museum (confirmed row 909949e8). Editorial review before any
public mention.

### Auberge Ganne, Cuvelier wedding (1 new row)

N°16 (sept-oct 2023) pp. 9-10: Eugène Cuvelier « épousa Louise Ganne le
7 mars 1859 », Corot witness, Millet and Rousseau groomsmen (new row
dba8ef81, lead, beside the Olivier de Penne wedding painting row). The
1859 Chailly marriage register would make it Tier 1 (AD77 viewer, needs
local).

### Hôtellerie du Bas-Bréau (1 new row, 1 note)

N°7 p. 10: « Emmanuel Siron », timber merchant, « transforme sa maison en
1867 en hôtel », later Hôtel de l'Exposition then Bas-Bréau; the
Ferme-auberge Honoré (1836, south side of the Grande Rue, site unknown)
lodged American artists; 120 to 150 artists counted as residents 1860-1890
(new row 7cfca5ff). N°7 p. 14: Hirohito's private visit 2-5 October 1971
(note on ba0c2bf3).

### Barbizon commune history (1 new row)

N°12 (oct-nov 2022) pp. 5-6: commission of four chaired by the painter Paul
Comble in 1900, consultation of the inhabitants 9-11 July 1901, Chailly
council against 8 to 4, separate commune 20 November 1903; 120,000 visitors
claimed for 1900; line and Grande Rue inaugurated 1899 (new row 962842ee).
The consultation and the Chailly vote are an AD77 series O target.

### Tumble Inn (1 new row, 1 row improved)

N°4 (mars-avril 2021) pp. 9-10: « haut lieu du jazz régional entre 1925 et
1947, rue Ménard »; N°13 and the Jazz Inn 2024 programme: « créé en 1920
par un Anglais arrivé tout droit de New York », name « toujours sur la
porte de la rue Ménard », « pendant près de 30 ans » (new row a7e0d2fc;
row 67c4f9ff now has the programme URL and exact quote, replacing the
search-engine summary). The commune's own datings disagree (1920 Alfred
Grand per the map, an unnamed Englishman per the programme, jazz 1925-1947
per N°4). The published text's « dans les années 1920 » is safe.

### Other notes added

- Monument Farman: N°12 p. 6 repeats the 18 May 1985 aérostèle (b0d451f5).
- Hôtel de la Forêt: N°8 p. 9, the Basaventure/Bobo Club site was the
  restaurant of « l'antique Hôtel de la Forêt », then a bar-club for about
  fifty years (27c94279, 94e268d7).
- Mairie: N°5 p. 8, « l'achat d'un hôtel en 1950 » (f68d75a2), to set beside
  the 1954-57 fitting-out and 1957 inauguration.
- Karl Bodmer: N°6 p. 15 puts his house « dans l'ancien hôtel des
  Charmettes, aujourd'hui galerie Besharat, 40 Grande Rue » and his
  settling in 1849 with French nationality (dccbc918): a fourth local
  statement of the 38 / 38 bis / 40 address, none from a period record.
- Mairie village map (9341c838, method now `ocr`, URL and date set): the
  web PDF is the « ÉTÉ 2024 » edition (design Yoann Delahaye); its text
  matches Mahenc's transcriptions on every entry checked (list in the row).
  Whether it is byte-identical to Luigi's `carte_Barbizon_mairie.pdf` still
  needs his copy.

## Checked without result (no row changed)

- Bulletins N°3, N°10, N°11: only general Rousseau / forest-protection
  history (13 Aug 1861 decree, 1,097 ha série artistique, 1853: 624 ha), all
  in the needs-local « Forest reserve 1861 » row; N°3 p. 8 also says
  Rousseau chose Barbizon after the 1836 Salon rejection.
- N°16: Villa Bramefaon (1930s, meulière), Académie Boitiat 1962, Villa
  Cyrano / Ziem 54 Grande Rue (already in pass 3), the mayor's house with
  « Ci sta ben ! » (unnamed).
- N°8 p. 15: 71 Grande Rue called 18th-century; 45 Grande Rue (Chaumière
  des Arts) housed the painter Jacques Rouquier for 30 years, died 2017.
- Mounet-Sully (de8cab8e): search returned only the Veder etching above.
- Single-row booklet subjects tried with web search and no usable hit:
  Pelat / Mitterrand at 38 rue du Général de Gaulle (universalis chronology
  and elysee.fr only, no Barbizon), Apollinaire at L'Abri (CCFr letter
  transcriptions exist for 1915 but were not opened), Fernandel 1942-43,
  t'Serstevens at Les Ramages (universalis article blocked), Colonel de La
  Rocque at Les Tilleuls.
- Renoir and Diaz: Met Heilbrunn essay (Kang 2011) and the Orsay 2007
  Fontainebleau exhibition page mention Renoir at Fontainebleau c. 1860 but
  not the Diaz meeting; the Orsay page independently has Picasso in the
  forest in 1921 (already confirmed).

## Not reached (for the next pass, in this order)

Albert Landerer years (needs Gaier 2017 ch. 3 or HLS, both unreachable),
the Grande Rue single-row subjects not yet tried (52, 61, 64, 67, 68, 72,
79, 81, 96, Le Houx, Le Hameau, Le Royal, L'Ermitage Saint-Antoine, La
Belle-Idée, Maison Barye, Café de l'Union, Le Relais ×2, L'Aubépine, Pierre
Thorel, Michel Lacoste, Henri Matisse, Gassies index, AD77 request), Coz Ker
(6), L'Ombrage (5), Manoir Saint-Hérem (7, beyond the new Picasso row),
Narcisse Diaz (5), Maison Diaz (28), Farms of Barbizon, the Jazz Inn 2023
programme. For S4 / local: the AD77 viewer for the 1859 Cuvelier-Ganne and
1892 Landerer-Binder marriages, the 31 Aug 1898 TSM decree on Gallica, the
1930 Millet forgery trial in the Paris dailies, the tacot bell at the
mairie (photo), and Luigi's copy of the map against carte-60X60-web.pdf.
