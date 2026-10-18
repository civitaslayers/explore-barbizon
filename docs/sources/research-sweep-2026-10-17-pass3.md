# Research sweep, 2026-10-17, pass 3

Standing job S2 (task 7820f08f). Branch `night/2026-10-17-research-sweep-3`,
research from about 01:12 to 01:50 UTC. Scope: pass 2's "Not reached (for
pass 3, in this order)" list, then the subjects it named as untouched. Rows
whose notes end in `[needs-local: ...]` were skipped, and no subject worked in
passes 1 or 2 was redone (the rows touched below in those subjects are new
facts or new source pointers, not re-research). Tier rules as in
`docs/briefs/standing.md`.

## Reachability tonight (noted once, not retried)

Supabase MCP connected despite the session-start failure notice. Heartbeats on
task 7820f08f at about 01:12, 01:23, 01:32, 01:34, 01:37, 01:40 and 01:44 UTC
(one write timed out at 180 s because the string literal contained semicolons,
exactly as the brief warns, and was re-sent without them).

Pass 2's tooling map held: WebSearch first, then WebFetch on a returned URL.
Newly found blocked tonight: ina.fr programme pages (robots), bas-breau.com
(robots), journals.openedition.org (Anubis bot wall), cths.fr (robots),
gutenberg.org `/ebooks/<id>` landing pages (provenance), and any page longer
than about 100,000 characters is cut there by the fetcher (Gutenberg book
HTML, the Atout France CSV). Newly found working: marxists.org (Broué,
Rosmer, Trotsky Œuvres), musee-orsay.fr artist catalogue, mucem.org notices,
nobelprize.org facts pages, barbizon.fr bulletins (PDF, full text), the Site
patrimonial remarquable règlement PDF, criminocorpus.org period-press PDFs,
77000.canalblog.com (Mémoire de Seine-et-Marne, Tier 3 but photographic),
iledefrance.fr, kunstmuseumbasel.ch PDF work lists, lehmanns.ch previews.

Database writes this pass: 12 inserts, 12 updates of pre-existing rows (notes
and updated_at only, no status change on an existing row) plus one note on a
row inserted tonight, no task filed (all
three candidate follow-ups already exist: dc8011f4, d16ec0a9, ad85e061). No
write refused.

---

## Auberge Ganne, Palissy objects (pass 2 item 1)

Checked: Palissy PM77002073 (« Le Garde chasse et forêt », 33 x 24 cm),
PM77002081 (« Les Noces de la fille Ganne », 74 x 31 cm), PM77002089
(« Portrait du père Ganne », drawing, 27 x 21 cm), all « 19e siècle »,
« propriété de la commune », « 1985/04/09 : classé au titre objet », and the
Mérimée notice PA00086807 (inscrit 28 Dec 1984, façades, toitures and three
ground-floor rooms, cadastre AI 434, « Panneaux de murs et mobilier peints par
les artistes de Barbizon »). Outcome: **Palissy records no author field for
any Ganne object**, so it cannot name the painters of the panels; the Bodmer
and Ziem "figure of the inn" rows (52455ee2, 66d7a81a) gain nothing from POP.
The 9 April 1985 classement is now seen on five notices, which strengthens the
pass-4 reading that the 1998 catalogue's "9 April 1990" is a misprint or a
second act (row da4d1b85, unchanged).

New fact: the commune's Site patrimonial remarquable règlement (PDF, p. 5)
reproduces « La Noce de Louise Ganne et d'Eugène Cuvelier, Olivier de Penne,
huile sur toile, 1859 ». Inserted as lead c88e4e3f: it gives the Ganne
daughter's first name, her husband (the photographer Cuvelier) and the wedding
year, and is presumably the classé object PM77002081.

## Trotsky in Barbizon (confirmed)

Checked: Pierre Broué, *Trotsky* (1988), ch. XLIX « Séjour libre en France »
(marxists.org); Alfred Rosmer, « En France », appendix to *Ma Vie*
(marxists.org); British Movietone News no. 255, 23 April 1934, « Barbizon -
Trotsky's expulsion », shotlist « GV House. Trotsky seated speaking »
(learningonscreen.ac.uk story 4785). Outcome: **arrival 1 November 1933 in
the villa Ker-Monique (two storeys, on a lane along the forest, rented by
Henri Molinier); police check after Rudolf Klement was stopped on an unlit
vélomoteur by the Ponthierry gendarmes on the evening of 12 April 1934; press
alerted by André Billy; clandestine departure on the evening of 15 April
1934.** With the Œuvres vol. 3 editorial note already in the dossier, that is
three concordant sources. Inserted confirmed row 97860a7d. Booklet row 4f6bf982
annotated: « en 1935 » is wrong, « il fuit au Mexique » telescopes Norway
(1935-1936) and Mexico (January 1937); villa name corroborated, address
17 chemin du Bornage and later name « La Haute Futaie » still booklet-only.
Inserted lead f9867f53 (André Billy as the tip-off, single source, ends in
`[needs-local: ...]` for Billy 1947 and the April 1934 dailies).

Proposal for published text: none needed, no published location or story
mentions Trotsky (checked with a full-row text search).

## Louis Renault, jurist (confirmed)

Checked: NobelPrize.org facts page (born Autun 21 May 1843, died « 8 February
1918, Barbizon, France », prize share 1/2, motivation quoted); Académie des
sciences, arts et belles-lettres de Dijon (« Il décède à Barbizon le 8
février 1918 »); cths.fr blocked by robots. Outcome: **death at Barbizon on 8
February 1918 is Tier 1 plus Tier 2**, inserted confirmed row 55e369c4; the
booklet row 3261d118 annotated (13 rue Théodore Rousseau still booklet-only,
but a plaque at that address is photographed, see Heritage plaques).

## Marie Bodmer / Charles Bodmer (confirmed filiation)

Checked: Musée d'Orsay artist catalogue « Karl Bodmer (4232) » (« Père de Karl
Henri dit Charles Bodmer (né en 1854 en Seine-et-Marne) »); MUCEM notice
386214 (Charles Bodmer, 1922 glass plate: « né en 1854 à Barbizon, est l'aîné
d'une fratrie de trois enfants », father Karl Bodmer 1809-1893, animal
photographer, Chevalier du Mérite agricole 7 January 1895). Outcome: **the
photographer Charles Bodmer is Karl Bodmer's eldest son, Tier 1 on two
independent museum authority records**, inserted confirmed row d0f4e4d4, row
759c7872 annotated. Still a hypothesis: Charles as husband of Héloïse Debenne
and father of Marie (Chailly état civil). Side facts: Mémoire de
Seine-et-Marne's Barbizon cemetery survey lists Rodolphe Bodmer (1856-1923),
« fils du peintre et photographe suisse Karl Bodmer », matching the three sons
(Charles 1854, Rodolphe 1856, Henri). Discrepancy worth a line if ever
published: the Orsay catalogue gives Karl Bodmer's death as « 1893, Barbizon »
against the 1893 press and HLS (Paris, 30 October), already noted in row
b7cec28d as "many modern accounts say Barbizon".

## Parcours des mosaïques (confirmed, count and material)

Checked: barbizon.fr page « Histoire » (« un parcours de 20 grandes mosaïques
en verre de Venise, ont été installées dans la Grande Rue principalement »,
honouring Bodmer, Chaigneau, Corot, Daubigny, Dupré, Diaz de la Peña, Jacque,
Millet, Rousseau, Troyon, Veyrassat, Ziem); barbizon.fr parcours pages, the
Parcs et jardins 2026 booklet and three bulletins (no mosaic history).
Outcome: **the commune, which commissioned the trail, confirms 20 mosaics in
Venetian glass**, concordant with Visit Paris Region and Cirkwi; inserted
confirmed row d01648e4, row 7cb77f8b annotated. The mosaicists' names and the
17 April 2010 date still rest on tourism sites.

## Heritage plaques, Ziem, Bodmer, Daubigny, Villa des Artistes (source found)

Checked: Mémoire de Seine-et-Marne (J.-M. Saincierge), « Plaques
commémoratives dans le sud de la Seine-et-Marne », 27 August 2019, about fifty
Barbizon plaques photographed with captions. Outcome (Tier 3, captions, not
transcriptions): Ziem plaque at **54 Grande Rue** (street side, not behind
56 bis), Bodmer at 38 Grande Rue, Louis Renault at 13 rue Théodore Rousseau,
Grigorescu « en souvenir du passage » at 12 Grande Rue, Rouveyre at 14,
Jacque at 24, Daubigny at 21 « devenue l'hôtel-restaurant Les Pléïades en
1920 », Elizabeth and Philip at the Charmettes, the Farman monument « à la
sortie de Barbizon, direction de Chailly ». Rows 63475075, 79aeed57,
dccbc918, 20c2da63 and 3f270d7b annotated with the URL. This turns task
dc8011f4 (photograph the plaques) into a verification: the inscriptions can
be read from these photos before anyone walks the street.

Also from the mairie: bulletin 1T 2024 p. 33 says the Librairie Cyrano is
« dans l'ancien atelier de Félix Ziem » and the Région paid 45 % (about
150,000 €) of the acquisition; the Parcs et jardins 2026 booklet (p. 9)
repeats the Ziem studio. Inserted lead bae1c43d (same institution as the
booklet, so not independent), row 66d7a81a annotated.

## Monument Farman (new lead)

Checked: barbizon.fr bulletin 1T 2024 p. 6, tribute to Robert Décosse
(1922-2017): met at Barbizon « Léon Trotski, Maurice-Thorez, le Colonel De la
Rocque, Jean Mermoz et Maurice Farman », and « dans la plaine de l'Angélus,
aux Roches Moreau », « un camp d'aviation existait à la déclaration de guerre,
réunissant 5 avions Potez 63 ». Inserted lead 59f23c65: supports the
plaine-de-l'Angélus landing tradition, says nothing on where Farman lived.
Bulletins 4T 2025 and Nov-Dec 2023: nothing on the stèle or its restoration.

## La Clé d'Or / L'Esquisse (new leads)

Checked: Région Île-de-France page (tourism project voted 2022, deliberation
CP2022-153, « rénover intégralement l'Hôtel de la Clé d'Or », 16-room
3-star « hôtel-culturel »); bulletin Nov-Dec 2023 p. 6 (« cette renaissance
de l'ancienne Clef d'Or en un magnifique hôtel culturel, l'Esquisse »,
renovation by Pierre and Véronique Bedouelle). Inserted lead 298a3614 for the
published L'Esquisse location. The relais de poste claim (row 644db394) found
no source.

## Les Pléiades / Atelier Daubigny (new lead)

Checked: Journal des Palaces, 6 November 2012: five-star classification per
Atout France, « Il propose vingt chambres ». Inserted lead 82abfad4. Nothing
on Mme Baratin or the Daubigny studio beyond the booklet transcriptions.

## La Poste / Georges Krier and Daniel Rouvière (new leads)

Checked: Mémoire de Seine-et-Marne, « Le cimetière de Barbizon, cité des
artistes », 2 July 2020 (grave survey with photographs). Krier (1872-1946),
« compositeur, éditeur », chevalier de la Légion d'honneur, buried at
Barbizon: inserted lead 01885f83, the first Krier-Barbizon evidence outside
the booklet and Karampournis. Daniel Rouvière (1913-1985), painter-engraver,
founded « Art et Nature » with Roland Arribas in 1972: inserted lead 35cd8256,
concordant with the booklet rows 92f8bacd and 8a2eacef. Same page: Chaigneau
and his daughter Suzanne (1875-1946, violinist), plaque restored 2022.

## Circuit des Peintres, Bas-Bréau stars (pointer added)

Checked: Atout France open-data register `hebergements_classes.csv` (columns
DATE DE CLASSEMENT, TYPOLOGIE, CLASSEMENT, NOM COMMERCIAL, ADRESSE, COMMUNE,
CAPACITÉ) reachable but cut at 100,000 characters by the fetcher, no Barbizon
line in that slice; bas-breau.com robots-blocked but its page title now says
« 5 étoiles ». Row 8311b70c annotated with a `[needs-local: ...]` pointer so
S4 can download the CSV and settle the star rating of every Barbizon hotel in
one go (feeds task d16ec0a9).

## Source policy, Rambaud 2023 (pointer added)

Bulletin Nov-Dec 2023 pp. 14-15: the book was written « sous la
responsabilité éditoriale et rédactionnelle d'Isabelle Rambaud », who lives
at Barbizon, launched at the mairie on Saturday 2 December 2023; bulletin 4T
2025 p. 28 lists it on sale at the Office du Tourisme, L'Esquisse and the
Librairie Cyrano. Row ff9a9aeb annotated (feeds task ad85e061).

## Checked without result (no row changed)

- Albert Landerer: edoc.unibas.ch record 56401 (no abstract, no PDF) and the
  lehmanns.ch preview of Gaier 2017 (table of contents only: « Ein Basler
  Historienmaler in Barbizon », p. 102; testament 1891, p. 175; works list,
  p. 182) add nothing to row ca881ef4. Kunstmuseum Basel work list
  1933-1945: inv. 1708, Albert Landerer, « Nach der Schlacht », 1853, entered
  1938 (Bénézit's « Entrée à Bâle des envoyés » not in that list). SIKART
  not surfaced by search.
- Caverne des Brigands / Weidmann 1937: criminocorpus.org hosts the period
  *Détective* special « Le Tueur » (Janine Keller, « l'infortunée
  Strasbourgeoise », named among six victims) and *Police Magazine* 1937
  no. 369, but neither OCR text mentions Fontainebleau, Barbizon or a cave;
  the openedition article is behind a bot wall. Sensitive subject, row
  b3c608a7 unchanged.
- Newsreels (pass 2 item 3): ina.fr programme pages are robots-blocked;
  mediaclip.ina.fr search surfaces only Rosa Bonheur; learningonscreen has no
  Barbizon items beyond the Trotsky story. The 1967 post office and Hirohito
  1971 remain unsourced.
- Les Charmettes, Newnham-Davis row 4cb436b2: Project Gutenberg 18854 is the
  1903 first edition (Grant Richards); the fetcher reads only its first
  100,000 characters (to Nice in ch. II) and found no Barbizon there, so the
  quoted passage cannot be checked this way (likely the 1908 or 1911
  edition). Other Charmettes rows need Gallica page images.
- Maison Diaz row 9620538e (Inventaire IA77000938, Le Relais corner house):
  Tier 1 by the brief's rule but kept at lead by earlier passes because the
  notice cites no source; left unchanged for Luigi's judgement, since the
  inventory, the 1975 museum catalogue and Lemoyne de Forges may not be
  independent of each other.
- Matisse, Mounet-Sully, Michel Lacoste, Pierre Thorel, Clé d'Or relais de
  poste, chapel 1889/1904 (Semaine religieuse de Meaux is Gallica-only),
  Karl Bodmer as « figure of the Auberge Ganne » (no museum press kit on
  Bodmer exists on the museum's press page, which lists nine kits
  2006-2025), Joconde Millet letters (no open Maison Millet rows to serve).

## Not reached (for the next pass, in this order)

Still untouched from pass 2's list: Villa des Artistes beyond the plaque,
Landerer affair rows (need Gallica page images), Albert Landerer years
(needs Gaier 2017 or SIKART), Caverne des Brigands (needs Gallica 1937
dailies), Street names, Films, Celebrities list, Les Charmettes (41 rows
still open or lead, almost all Gallica snippets). New pointers worth a pass
of their own: the barbizon.fr bulletin archive (only three of the PDFs were
read tonight, the Mars-Avril 2023 and the 2022-2025 series remain) and the
Mémoire de Seine-et-Marne blog's other Barbizon posts (Chailly cemetery
read, nothing new; Barbizon cemetery read for five names only). For S4:
the two `[needs-local: ...]` pointers added tonight (Atout France CSV,
Billy 1947 / April 1934 dailies) and the plaque photos at
77000.canalblog.com to read the Ziem, Bodmer, Renault and Grigorescu
inscriptions.
