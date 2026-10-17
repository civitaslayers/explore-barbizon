# Research sweep, 2026-10-17, pass 4

Standing job S2 (task 7820f08f). Branch `night/2026-10-17-research-sweep-4`,
research from about 01:49 to 02:55 UTC. Scope: pass 3's "Not reached" list in
its order (Landerer affair, Street names, Films, Celebrities, the remaining
barbizon.fr bulletins), then any open/lead row touched by no pass tonight.
Rows whose notes end in `[needs-local: ...]` were skipped (new facts for those
subjects went into new rows, not into the skipped rows), and no subject worked
in passes 1 to 3 was redone. Tier rules as in `docs/briefs/standing.md`.

## Reachability tonight (noted once, not retried)

Supabase MCP connected despite the session-start failure notice. Heartbeats
on task 7820f08f at 01:49, 02:08, 02:15, 02:28, 02:38, 02:52 UTC.

Pass 2's tooling map held (WebSearch first, then WebFetch on a returned URL).
Newly found blocked tonight: hls-dhs-dss.ch (both the `/textes/d/` and the
`legacy.` forms, client error / robots; it had opened on 2026-10-15), the
Archives 77 civil-register viewer (archives-en-ligne.seine-et-marne.fr, a
JavaScript viewer the fetcher cannot drive). Newly found working:
catalog.afi.com (AFI Catalog of Feature Films), reconcile.gnd.network (GND
person records), and the whole barbizon.fr bulletin archive page
(`/barbizon-village-les-magazines/`, 12 PDFs listed on page 1 of 3).

Database writes this pass: 14 inserts, 18 updates of pre-existing rows (notes
and updated_at only, no status change on an existing row), 1 task filed
(2e7c20d8). No write refused.

---

## Landerer affair (9 rows, nothing settled)

Checked: web searches on Landerer, Lacampagne, Binder, Bataille *Causes
criminelles et mondaines de 1894*, with and without domain filters
(criminocorpus, retronews, wikisource, Google Books, archive.org): no hit.
GND 121070689 (returned by search for Landerer) is Albert Pfister, a
homonym-free miss. HLS « Landerer, Albert » unreachable tonight. The Archives
77 état-civil page confirms the greffe registers 1885-1915 are digitised, but
only through a viewer the sandbox cannot use.

Outcome: no status change. The six lead rows citing a Gallica issue
(0fac22e3, d97d91d4, 4e26df7f, c18176c8, 31061645, ce09fdef) now end in
`[needs-local: <their Gallica URL>]` so S4 can read the page images; the
birthplace conflict row 165d5508 now points S4 at the Barbizon marriage
register of 1892 (acte Landerer-Binder) on archives-en-ligne.seine-et-marne.fr.
Row 284ceed3 (1891 vs January 1892 arrival) left untouched: the same marriage
record will answer it, and it has no source of its own to point at.

## Street names (2 rows, 2 new rows)

Checked: searches on Jules Bourdois and chemin de la Messe (nothing beyond
the booklet), then every bulletin listed below. No bulletin gives the origin
of the rue Jules Bourdois or the rue du Chemin de la Messe (N°20 p. 18 shows
a « chemin de la messe » on a road plan, no history). Row b7d0287c unchanged.

New rows (both Tier 2, commune):
- ea19d1bc / 3cc44156: rue du 23 Août 1944 named at the request of André
  Billy by decision of the Comité local de Libération on 16 September 1944
  (bulletin N°20, 2e trimestre 2024, pp. 8-10), which the commune says
  online sources wrongly date to 1945. Second source for the confirmed row
  8df1c234 (Billy article). Same dossier: blue enamel plaques replacing the
  plastic signs in 2024, the only surviving old « Grande Rue » sign on the
  façade of La Bohême, planned names André Billy, Gabriel Séailles, Marc
  Jacquet, and the rue de Fleury nicknamed « rue des fermes » (pp. 30-31).
- Place Dorothy Tartière at the corner of rue de Fleury and rue du Couvent,
  inaugurated 22 September 2024, plaque « Membre des Forces Françaises
  Combattantes » (N°22, 4e trimestre 2024, p. 36; N°21 pp. 26-27).

Proposal for Luigi: nothing to change on published text. If a street-names
story is written, the 16 September 1944 decision is quotable with the
commune as source; the Comité local de Libération register in the mairie
would make it Tier 1.

## Films shot in Barbizon (1 row, note added)

Checked: AFI Catalog, *The Young Lions* (1958, « Le Bal des maudits »):
filming began in France and Germany in June 1957, Struthof camp near
Strasbourg, desert at Borrego Springs, finale near Mt. Wilson. No Barbizon
or Fontainebleau in the production notes (Tier 1 for the film, silent on
Barbizon). Stavisky (1974) and Le Pacte des loups: searches returned only
catalogue pages, not read. Bulletin N°28 p. 29 mentions *Les Rayons et les
Ombres* (2026, on Jean Luchaire) without a Barbizon shoot. Row 123beebd
stays lead with the AFI note.

## Celebrities list (1 row, note added)

The bulletins support three names on the booklet list and add others:
Georges Chelon lives at Barbizon (N°28 pp. 36-37, « nous avons la chance de
le croiser tous les jours à Barbizon »), Jean Galtier-Boissière (N°27
pp. 30-31, see the Pommiers and Vieille Demeure rows), Picasso « qui
séjourna à Barbizon » (N°14, mars-avril 2023, p. 17, no date). Not on the
list: the gallerist Suzanne Tarasiève (gallery at Barbizon 1978, buried at
Barbizon, N°14 p. 2) and Jean-Michel Mahenc (settled 1976, audiovisual
studio in a former grocery, N°24 p. 30). Row 297c443e stays lead, names
only.

## barbizon.fr bulletins (the pass of their own that pass 3 asked for)

Read in full tonight (the fetcher reads these PDFs whole): N°14 mars-avril
2023, N°18 janv-fév 2024, N°20 2e trim. 2024, N°21 3e trim. 2024, N°22
4e trim. 2024, N°23 1er trim. 2025, N°24 2e trim. 2025, N°25 3e trim. 2025,
N°27 1er trim. 2026, N°28 2e trim. 2026, N°29 3e trim. 2026, plus the Parcs
et jardins 2026 booklet (festival guide, no history). Already read by pass 3:
Nov-déc 2023, 1T 2024 (N°19), 4T 2025 (N°26). Not yet read: pages 2 and 3
of the archive (issues before N°18), and the Jazz Inn programmes.

All bulletin facts are Tier 2 (commune, uncited) unless noted. What they gave:

### Maison-atelier Millet (2 new rows, one confirmed)
- a7845565, **confirmed**: Mérimée PA00086806 « Atelier du peintre
  Jean-François Millet », « 1947/10/01 : inscrit MH » by arrêté (Tier 1);
  bulletin N°14 p. 8 agrees (« octobre 1947 »).
- 09df1040, lead: the N°14 pp. 6-8 chronology: 1849 arrival with Jacque,
  first lodging where the terrace of L'Angelo is now, 1852 barn rented as
  studio, 1858 Sensier buys house and studio from Brézard, 1864 Jacque's
  studio sold to Martel then to Millet's widow then to Marguerite Sensier
  (coffered ceiling, Renaissance-style chimney in the 1890s), ruin, 1923
  Douin, 1950 Francis Meunier, Meunier family still owners. Ownership chain
  new to the table.

Proposal: the Maison Millet page can state the 1 October 1947 inscription
with the Mérimée reference.

### La Baraka (6 Grande Rue) and Les Bosquets (2 Grande Rue)
- 03762242, lead: N°28 pp. 26-28 gives a dated title chain for La Baraka:
  Jacque buys the land « le placiot » / « la porte aux vaches » in November
  1857, enlarges to 3,318 m² in September 1859, builds a slate-roofed villa,
  lives there to 1866 (zinc-roofed kiosk as artists' tea room); Ziem April
  1866 for four years; Camille Paris July 1872, dies there 17 April 1901;
  bornage April 1894 as « le Reposoir »; Émilie Vannaisse renames it « Le
  Souvenir », dies there 5 November 1934; Tavernier 1935; Luchaire and de
  Voisins-Lavernière October 1941; SCI La Baraka July 1944; seizure under the
  épuration and US requisition; Georges Lugan December 1948, family still
  owners.
- Notes added to 0cbbe219 (booklet row: « built in 1860 » roughly right,
  « lived there until 1941 » wrong, he bought in 1941) and to f1a2c3cb (the
  no. 2 vs no. 6 conflict: the dated chain weighs for La Baraka, the bulletin
  gives no street number). Sensitive (Luchaire), editorial review before use.

Proposal: for task 98951973 (history for Les Bosquets), do not attach the
Jacque-Ziem-Paris chain to no. 2 until the owner or the cadastre says so.

### Laure and Clarisse Henry, chapel
- c6ff206f, lead: N°28 pp. 30-32, the Cercle Laure-Henry: « Asile Laure
  Henry » until the 1970s, sisters retired to Barbizon in 1870, « donatrices
  de la chapelle, fondatrices de l'orphéon », monumental tombs in the
  Barbizon cemetery, building to the parish 1935 and to the association
  Laure-Henry 23 October 1937, uses (nursery, girls' school, library, leisure
  centre, WWI infirmary, WWII refugees). Supports the Cercle des amis claim
  (cbfb978f, skipped, needs-local) that the sisters gave the chapel barn.
  N°22 p. 19: the Bibliothèque Jeanne Gassies opened in 1932 « dans la salle
  paroissiale Laure Henry », now in the former mairie, 13 rue du 23 Août.

### Monument Farman and the Tacot station (2 new rows)
- b6978783: the aérostèle was rebuilt by FER-IMPACT (Montereau) and
  inaugurated on 11 April 2026 (N°28 p. 38), after N°27 p. 44 had planned
  the refection for after 21 May. Answers the Rotary row d3702b6b.
- ab25ad84: the commune restored and inaugurated the façade of the former
  Tacot station the same day, placing it at **no. 3 Grande Rue**, terminus
  « jusqu'aux années 1930 » (N°28 pp. 34, 38; TSM Melun-Barbizon via Chailly,
  1899-1938). Third address for the terminus (index: no. 1 Hôtel de la Forêt;
  booklet: no. 5). The inauguration was announced for 21 September 2025
  (N°24 p. 49, N°25 p. 31) and 21 May 2026 (N°27 p. 44) before N°28 reported
  it done on 11 April 2026. N°21 p. 6-9 adds that Henry Farman visited the
  pharmacist Gabriel Touillet (1922-1936).

Proposal: an on-site photo of the restored station façade and its plaque
would settle the terminus address for the tram story.

### Tumble Inn (published location, task filed)
- N°20 p. 14 reproduces a 1939 photograph of the bar, « Alf Grand's
  establishment », at the future site of the place Drue Tartière (corner rue
  de Fleury / rue du Couvent); N°28 p. 44 repeats that the name remains on a
  door in the rue Ménard. The commune thus supports the founder's name
  (Alfred Grand) and the street family of the circuit text, but the corner
  location has to be reconciled with the published « 4 rue René Ménard ».
  Note on 309e1d06; task **2e7c20d8** filed (priority 5, on-site check).

### Occupation (1 new row)
- 58d86418, lead: N°20 pp. 7-14: Drue Tartière moved into the Villa
  L'Écureuil, 71 Grande Rue, in October 1940; installed Jean Fraysse in an
  isolated house on the plain in March 1942 (Resistance centre); Germans
  withdrew from 21 August 1944, US troops arrived the morning of 23 August;
  new plaques unveiled 8 May 2024. With the Lorne Frame account (needs-local
  on d59a3f6f) this would give two independent Tier 2 sources for no. 71.

### Ernest Révillon, Daniel Rouvière
- 6e904380, lead: N°23 pp. 28-29: Ernest Auguste Revillon born Paris 24 April
  1854, bought La Rousselière, 4 rue Charles-Jacque, studio at no. 11, war
  memorial unveiled 1920 (N°18 and N°20 p. 43 agree: « le fameux Gaulois par
  Révillon en 1920 », pupil of Rodin), died 1937, Rouvière and Arribas took
  over in 1970. « Ernest Auguste » weighs against geneawiki's
  « Jean-Baptiste ». Note on 92f8bacd: 1970 vs the 1972 of two other rows.

### Grande Rue numbers (notes added)
- 33 Grande Rue (242e74c1): N°23 pp. 26-27 names the family the booklet left
  anonymous: the Villa Albertine keeps the look of the forge of Louis Albert
  and his wife, « la boutique en 1933 de Georgette Albert », mercerie-
  bonneterie-chaussures in the 1930s.
- 39 Grande Rue (e31031b3): N°20 pp. 26-27, Jacques Chabert born 1940 at
  no. 39, property acquired by his grandfather in 1905; to reconcile with
  the Wagner-Carol shop.
- La Bohème (ae79939c): old « Grande Rue » sign on its façade (N°20 p. 30);
  the Bouvard family « depuis plus d'un siècle sur Barbizon » (N°24 p. 4).
- La Vieille Demeure (25f64ec2): N°27 pp. 30-31 puts the Ménard house
  « La vieille demeure » at **no. 70**, the booklet at no. 80; grandfather
  Ménard a painter and friend of Millet. And N°23 p. 7 puts Marc Logé's
  mother at no. 70 from 1920. To settle on site (house name on the gate).
- Les Pommiers (0380dce7): N°27 agrees on no. 74 (bought by Galtier-
  Boissière's mother after the father's death at Barbizon in 1919).

### Other new rows
- a365d9e9, Les Charmettes: Sainte-Barbe dinner of the sapeurs-pompiers
  (society founded 13 November 1904) on 15 December 1906 at the Hôtel des
  Charmettes, 1910 at the Hôtel de l'Angélus (N°22 pp. 12-13).
- f52997d2, Marc Logé (new subject, cross-referenced to the Tier 1 row
  8f1c1fe1): N°23 pp. 6-9, mother at 70 Grande Rue from 1920, villa rue
  Théodore Rousseau on the site of today's Jardin des arts, « Sunny Corner »
  rue Antoine Barye, visits of François Millet's abandoned atelier and of
  Blasco Ibáñez, died Barbizon 2 April 1949, grave with expired concession.
- 3820ae33, Grotte des Barbizonnières (new subject): women of the village
  sheltered there during the Prussian invasion of 1814 (N°20 p. 27).
- ea1626fe, Source policy (pointer): the PNRGF inventoried the architectural
  heritage of Barbizon in 2024-2025, « 205 éléments patrimoniaux
  remarquables » (N°22 p. 37, N°28 p. 11, N°21 pp. 20-23: buildings before
  1950). Not online; `[needs-local]` to ask the mairie or the PNRGF for the
  fiches. This is the single most useful document for the Grande Rue rows.

## Checked without result (no row changed)

- Millet-Rousseau medallion: N°20 p. 41 repeats « Chapu, 1884 »; both rows
  (566c8558, 721c3764) end in needs-local, skipped.
- Ziem studio at 54 Grande Rue bought by the commune in 2023 (N°20 p. 39,
  N°22 p. 10): already in pass 3's Librairie Cyrano note.
- Chapel: bulletins add only the electrical works (2024) and the name
  « Notre-Dame-de-la-Persévérance » still in use for concerts (N°22, N°23).
- Les Bosquets: N°21 pp. 4-5 says the owner saved the house after a fire, no
  date; nothing for the pending owner question (5d1ae62b).
- Bulletin N°18 (janv-fév 2024) and N°29 (3T 2026): nothing beyond the
  Gaulois 1920 and the Tumble Inn 1920 already recorded.

## Not reached (for the next pass, in this order)

Still untouched: Albert Landerer years (Gaier 2017 / SIKART, HLS down
tonight), Caverne des Brigands (Gallica 1937 dailies), Les Charmettes (41
rows still open or lead, Gallica snippets), Villa des Artistes beyond the
plaque, the single-row subjects never worked (Mounet-Sully, Henri Matisse,
Pierre Thorel, Michel Lacoste, Gassies « Le vieux Barbizon », AD77 archives
request, Mairie village map, Renoir and Diaz, Narcisse Diaz 5 rows, Farms of
Barbizon, Grande Rue, 38 rue du Général de Gaulle, L'Abri, Le Hameau, Le
Houx, L'Aubépine, Les Ramages, Le Relais ×2, Café de l'Union, Le Royal,
L'Ermitage Saint-Antoine, La Belle-Idée, Maison Barye, Coz Ker 6 rows,
L'Ombrage 5 rows, Manoir Saint-Hérem 7 rows, Hôtel de la Forêt 10 rows,
52/61/64/67/68/72/79/81/96 Grande Rue). barbizon.fr: pages 2 and 3 of the
bulletin archive (issues before N°18) and the two Jazz Inn programmes. For
S4: the seven Landerer `[needs-local]` pointers (six Gallica issues, one
AD77 marriage act), the PNRGF inventory request, and on-site photos of the
Tacot station plaque, the rebuilt Farman stèle, the Tumble Inn door and the
place Drue Tartière plaque (task 2e7c20d8, and dc8011f4 for the Grande Rue
plaques).
