# Research sweep, 2026-10-18, pass 2

Standing job S2 (task 7820f08f). Branch `night/2026-10-18-sweep-2`, from
`origin/main`. Pass 1 (`night/2026-10-18-sweep`, commit 115f119,
`docs/sources/research-sweep-2026-10-18.md`) covered Maison-atelier Millet,
Les Pléiades, Maison Diaz (`51bb895a`), Ernest Révillon (`83a2eb7b`), Hunt,
Marc Logé, the Millet-Rousseau medallion, the mosaics, Les Charmettes
(housekeeping), Charles Jacque, the TSM tramway and the Grotte des
Barbizonnières. This pass skipped all of those and worked the subjects pass 1
did not reach, starting with the ones that had never been searched or whose
rows could be tested against a reachable source. Tier rules as in
`docs/briefs/standing.md`.

Reachability: Supabase MCP fine. Tavily refused (403), not retried.
WebSearch and WebFetch worked. Blocked tonight, noted once: hal.inrae.fr and
books.ub.uni-heidelberg.de (Anubis bot wall), grappilles.fr (fetch error),
blogger image host (proxy refused the download of the 1861 decree scans), the
Paris 1 Moodle PDF (login). Gallica, archive.org and Google Books page view
were not tried, since pass 1 found them blocked.

Database writes: 10 row updates (notes only, no status change), 4 inserts
(`b6fef555` confirmed, `883b7e9a` confirmed, `080f70cb` confirmed, `264ba96f`
lead). No write was refused. No task filed. Heartbeats on 7820f08f at the start
and mid-run (the pass took under 30 minutes).

---

## 1. Henri Matisse (`285ca00b`), no location linked. Never searched before

**Checked.** Kunsthaus Zürich online collection: item 2673 and its PDF sheet;
Centre Pompidou Matisse chronology PDF (no Barbizon); artfritz.ch (Kunsthaus
2019 exhibition, no Barbizon); a Christie's 1908 lot (no Barbizon).

**Outcome.** **Inserted `b6fef555`, `confirmed`.** Kunsthaus Zürich holds
Matisse's *Barbizon*, 1908, oil on canvas, 73 x 60 cm, inv. 2001/0001, signed
lower right « Barbizon H. Matisse ». Provenance: Matisse family estate,
Galerie Beyeler, Vereinigung Zürcher Kunstfreunde (2001). The collection
record and the signature are a Tier 1 source for Matisse working at Barbizon
in 1908. Row `285ca00b` (Champigneulle 1965: « after Dorgelès, Matisse spent
several months in Barbizon ») stays `lead`, with notes updated. Dorgelès is at
the Villa Élisabeth around 1932 (row `c7bebc78`), so « after Dorgelès » is the
order of Champigneulle's list, not a date. Nothing tonight gives the length of
the stay. That needs a Matisse chronology for 1908 (Schneider 1984, cited in
the Kunsthaus literature, or Spurling).

**Implication for published text (proposal only).** No published location or
story mentions Matisse. If one is written: « Henri Matisse peint à Barbizon
en 1908 (*Barbizon*, Kunsthaus Zürich) ». Do not say « plusieurs mois ».

## 2. Auberge Ganne: Cuvelier marriage (`dba8ef81`), linked to `auberge-ganne` (published)

**Checked.** International Center of Photography constituent biography of
Eugène Cuvelier; NGA *Carrefour de l'Épine* page (no biography).

**Outcome.** **Inserted `883b7e9a`, `confirmed`.** ICP: « When he married to
Louise Ganne in 1859, they moved to Barbizon ». It also has Cuvelier meeting
Corot around 1852-53 and first visiting Barbizon in 1856. ICP is independent
of the commune bulletin N°16 (2023) on `dba8ef81`, so the year is now backed
by two Tier 2 sources, plus the 1859 Olivier de Penne wedding painting (row
`c88e4e3f`). Only the bulletin gives the day (7 March) and the witnesses
(Corot as witness, Millet and Rousseau as groomsmen), so `dba8ef81` stays
`lead`, notes updated with `[needs-local: AD77 état civil ... mariages 1859]`.

**Implication for published text (proposal only).** The `auberge-ganne` page
could add: « En 1859, Louise Ganne, fille des aubergistes, épouse le
photographe Eugène Cuvelier, qui s'installe à Barbizon. » Leave out the day
and the witnesses until the marriage record is read.

## 3. Forest reserve 1861 (`bef0f0cb`), no location. Related to story `how-the-forest-was-saved` (published)

**Checked.** Langlois, *Histoire &c.*, « La querelle des deux puissances de
la forêt de Fontainebleau (1872-1876) » (published 9 Aug 2022, revised 14 Aug
2026). It transcribes the Foucher de Careil bill (*Journal officiel*, 15
April 1876) and the 1876 Senate and Chamber debates. Also the Société de
sauvegarde de la forêt de Fontainebleau blog post « Décret impérial relatif à
l'aménagement de la forêt de Fontainebleau du 13 août 1861 », which carries
two scans of the decree. The HAL INRAE PDF was bot-walled.

**Outcome.** Notes updated, status unchanged. 13 August is now the
better-supported day: three sources against en.wikipedia's 13 April. For the
area, the 1876 record as transcribed gives « 1,097 hectares 29 ares », not
the 1,094 ha of fr.wikipedia and the row. The decree scans could not be
downloaded (image host refused). Marked `[needs-local:` with the blog URL.

**Implication for published text.** None. The published story already says
« Le 13 août 1861 ... 1 097 hectares », which matches the better-supported
figures.

## 4. Gorges d'Apremont (`f6713669`), linked to `point-de-vue-apremont` (published)

**Checked.** AAFF, « Les questions que vous vous posez sur les incendies de
juillet 2026 dans le massif de Fontainebleau » (PDF, July 2026).

**Outcome.** No history: nothing on 1959 or on the 1960 tornado, so
`f6713669` is unchanged. **Inserted `264ba96f`, `lead`.** In the July 2026
fires, two fires at Apremont (9 July in parcelle 713, and 11 July) burned 9
ha. The main losses were at the Trois Pignons (about 1,600 ha) and in the
Faisanderie sector (over 600 ha). This is an association text (Tier 2), and
an ONF communiqué would make it Tier 1.

**Implication for published text (proposal only).** If any Apremont page
talks about fire or about the state of the trails, it should take July 2026
into account. Nothing was changed.

## 5. Occupation / Street names: Dorothy Tartière (`ea19d1bc`)

**Checked.** USHMM Archives, Tartière family papers 1920-1950 (accession
1988.93), finding aid; State Library of New South Wales catalogue record and
a dealer listing for *The House Near Paris*.

**Outcome.** **Inserted `080f70cb`, `confirmed`** (Tier 1 archival finding
aid). Drue (Dorothy) Leyton Tartière, 1903-1997, American actress, widow of
Jacques Tartière (1915-1941, screen name Jacques Terrane), a Free French
officer killed at Damascus in 1941. She « joined the French resistance
following his death ». Memoir: *The House Near Paris*, with M. R. Werner
(London, Gollancz, 1947, 207 p.; the `hotellerie-bas-breau` notes cite a 1946
edition, presumably the American one). The finding aid does not mention
Barbizon, but her Barbizon activity is already confirmed (`6aefbec8`,
`a0a5acda`, `58d86418`). Notes on `ea19d1bc` updated so the dates can be
checked against the plaque on site. Row `d59a3f6f` (« Madame
Parson-Tartière ») gets no support for « Parson » from USHMM. Not changed.

## 6. Ferdinand Chaigneau (`11dcd010`), no location

**Checked.** Inventaire général Hauts-de-France, dossier IM62000504 (Michèle
Rougier, 1990, republished 2024), on Chaigneau's *Berger gardant son
troupeau*. The Heidelberg arthistoricum hit was bot-walled.

**Outcome.** Notes updated. The inventory dates his arrival at Barbizon to
1860 and his death to 1906. The commune dates the Prévert visits to La
Bergerie to 1929 (same row), so the Préverts were received by Chaigneau's
heirs, not by the painter. The house name and address are still
booklet-only. No published page mentions Chaigneau or Prévert.

## 7. Céramano (`99015944`), linked to `maison-sermain-plaque` (unpublished)

This was a cross-check only. DBNL confirms the title of the 1986 Biekorf
article, « De vergeten Tieltse schilder Ceramano of Ch. F. Sermain (Tielt
1831 - Barbizon, Fr. 1909) ». The text is withheld. Together with the 1999
Tielt exhibition catalogue (already on `a5533690`), that makes two Tier 2
sources for the years 1831 and 1909, against the dealers' 1829. Notes
updated. The parents and the day of death (22 April 1909) are still Tier 3,
so the row stays `lead`.

## 8. Rows checked with negative results (notes added so the searches are not repeated)

- **Monument Farman (`2c264fc2`)**: The ANAH copropriété register lists 20
  rue du Chemin de la Messe as a 9-lot copropriété built 2006-2012. That fits
  the commune's statement that the property was subdivided, but the register
  does not mention Farman. G. Hartmann, « Les premiers Farman », does not
  mention Barbizon.
- **Eugène Freyssinet (`07d151aa`)**: The Association Eugène Freyssinet
  homage PDF (2023) names Objat, Paris and Moulins, not Barbizon.
- **Karl Bodmer at the Ganne inn (`52455ee2`)**: The Palissy notice
  PM77002066 (painted buffet, classé 9 April 1985) names no painter, only
  « Barbizon (école) ». Palissy cannot attribute any of the Ganne decor.
- **Films shot in Barbizon (`123beebd`)**: The AFI Catalog for *The Young
  Lions* (*Le Bal des maudits*) names the Struthof camp as the only French
  location. NRJ.fr (2025) names no French location for *Mission Cléopâtre*.
  Neither supports the claim and neither refutes it.

## 9. Tried, nothing found (rows not changed)

- Michel Lacoste / « Ombres et Lumières » (`b187d60c`): no web footprint.
- Roger Martin du Gard at the Charmettes (`7c2b69b2`): searches returned only
  the encyclopaedia pages already used.
- Maximilienne Whettnall (L'Ombrage): no hit, in any spelling.
- Tumble Inn: only unrelated US venues.
- Sultan of Morocco 1927 (`2b30fe67`): the Archives diplomatiques Nantes
  photo finding aid (57 prints, 1912-1935) has no Barbizon item. The Paris 1
  course PDF needs a login.
- Weidmann / Caverne des Brigands (`b3c608a7`): the ActuaLitté excerpt
  (« L'Affaire Eugène Weidmann », episode 1) names Jeanine Keller and the
  forest, but no cave.
- Chapelle 1889, Daniel Rouvière / Art et Nature, Louis Renault's address,
  Ernest Révillon (monumentsmorts), Georges Krier at no. 20: searches
  returned only sources already logged on the rows.

---

## Tasks

None filed. No published text was found to be wrong. The 1861 story already
matches the better-supported figures, no published page mentions Matisse,
Chaigneau or Prévert, and the Cuvelier and Apremont items are additions, not
corrections.

## For S4 (local)

- `bef0f0cb`: read the two decree scans on the Société de sauvegarde blog
  post, or the *Journal officiel* of 15 April 1876.
- `dba8ef81`: the 1859 marriage of Eugène Cuvelier and Louise Ganne, Barbizon
  (Chailly-en-Bière) état civil, AD77.
- `99015944`: the 1909 death record of Charles Ferdinand Sermain, Barbizon.

## Not reached (for a later pass)

- Matisse's 1908 stay: a chronology (Schneider 1984 or Spurling) for its
  dates and length.
- Booklet house-name subjects (Les Tilleuls, Les Ramages, Les Pommiers, Les
  Glaneuses, Les Alouettes, Le Houx, Le Hameau, Le Chaperon Rouge, La Vieille
  Demeure, La Belle-Idée, La Baraka, L'Aubépine, L'Abri, Café de l'Union) and
  the commercial numbers (52, 61, 64, 68, 79, 81, 96 Grande Rue). These are
  low-yield on the open web.
- Pierre Thorel, Marius Roger's residence, Henry sisters / Asile Laure Henry,
  Renoir and Diaz (Vollard / Meier-Graefe full text, archive.org blocked).
