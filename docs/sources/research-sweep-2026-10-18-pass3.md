# Research sweep, 2026-10-18, pass 3

Standing job S2 (task 7820f08f). Branch `night/2026-10-18-sweep-3`, from
`origin/main`. Passes 1 and 2 are in `docs/sources/research-sweep-2026-10-18.md`
(branch `night/2026-10-18-sweep`) and `docs/sources/research-sweep-2026-10-18-pass2.md`
(branch `night/2026-10-18-sweep-2`). This pass skipped every subject they
covered. It started from pass 2's « Not reached » list, then took open/lead
rows with short or empty notes. S3 `practical:*` rows were skipped. Tier
rules are those in `docs/briefs/standing.md`.

Reachability: Supabase MCP worked. WebSearch worked, and WebFetch worked for
gutenberg.org, dbnl.org, nli.org.il, museum-digital, nelson-atkins.org and
onlinebooks.library.upenn.edu. Not reachable tonight, noted once each:
- The fetch was not approved for catalog.hathitrust.org, d-nb.info (GND),
  vocab.getty.edu (ULAN) and the musée des peintres de Barbizon press-kit PDF.
- commons.wikimedia.org file pages gave a fetch error.
- Direct downloads (curl) are refused by the proxy (403).
- Not tried, since they were already known to be down: Tavily, hal.inrae.fr,
  Heidelberg, grappilles.fr, archive.org and the blogger image host.

Database writes: 1 insert (`748a7b2f`, lead) and 4 row updates (notes only,
no status change: `d0611aa6`, `7cfca5ff`, `9df8181a`, plus the new row). No
write was refused. 1 task filed (`6fee872a`). Heartbeats on 7820f08f at the
start, at about 20 minutes and at about 40 minutes.

Overall the yield was low. Most of the remaining subjects need Gallica,
archive.org, HathiTrust or the AD77 reading room. The one useful find was a
reachable period source, Will H. Low (1896), that bears on the Hôtel Siron.

---

## 1. Hôtellerie du Bas-Bréau: opening of the Hôtel Siron (`d0611aa6`, `7cfca5ff`), linked to `hotellerie-bas-breau` (published)

**Checked.** Will H. Low, « A Century of Painting », *McClure's Magazine*,
vol. VI, no. 6, May 1896 (Project Gutenberg e-text 13304). Low was an
American painter at Barbizon in 1873 and 1874.

**Outcome.** **Inserted `748a7b2f`, `lead`** (Tier 2, first-hand but written
22 years later). Low recalls painters talking « over our coffee in the garden
of Siron's inn », which means the Hôtel Siron was an artists' inn by 1873 at
the latest. That date fits both of the sources we already had:
- the commune bulletin N°7 (2021) gives 1867 (`7cfca5ff`);
- Billy gives « après 1870 » (`d0611aa6`).

So Low narrows the date but does not settle it. Notes were added to both rows,
and `d0611aa6` is marked `[needs-local: AD77 recensements Chailly-en-Bière
1866 et 1872, entry Siron]`. If Siron is listed as an innkeeper (aubergiste)
in 1866 rather than as a timber merchant (marchand de bois), the 1867 date
stands. Row `f44679db` (Grigorescu press kit) has him frequenting the hôtel
Siron. The press kit could not be re-read tonight to see whether that is in
the 1860s, which would rule out « après 1870 », or during his 1879-80 visits.

Low also places « the two Stevensons » at Barbizon in the summer of 1874.
That conflicts with the Napier RLS chronology, which puts RLS's first stay in
March-April 1875 (`41c0681f`, confirmed). Bob Stevenson may have been there
earlier, or Low may have mixed up the years. `41c0681f` was not changed.

The same article, which is outside the open rows, also gives the following.
All of it agrees with what `maison-millet` already says, so no row was
written:
- Millet's house stood about halfway down the street, on the right going
  towards the forest, behind a high wall with a little green door.
- Millet died on 20 January 1875 and was buried at Chailly.
- The household had nine children.

**Implication for published text (proposal only).** The `hotellerie-bas-breau`
narrative opens « Après 1870, Emmanuel Siron ... fait de sa maison de la
Grande Rue un hôtel ». That rests on Billy alone, and the commune gives 1867.
Until the censuses are read, the safer wording is « Vers 1870 » or « À la fin
des années 1860 ». This is filed as task `6fee872a`. Nothing was changed.

## 2. Renoir and Diaz (`9df8181a`, `bfd58020`), related to `maison-diaz` (published)

**Checked.**
- The Online Books Page shelf for Renoir. It shows that Vollard (Knopf 1925
  translation; Crès 1920) and Meier-Graefe (Floury 1912; Piper 1911, 1920)
  are on HathiTrust. The catalog fetch was not approved.
- The Paderborn PDF, which turned out to be only a 1920 Piper advertisement.
- The Nelson-Atkins French paintings catalogue (Renoir entry), which does not
  mention Diaz.
- *Elseviers Geïllustreerd Maandschrift*, jaargang 27 (1917), an unsigned
  Renoir profile (DBNL).

**Outcome.** Notes updated on `9df8181a`, status unchanged. The 1917 Dutch
profile repeats Meier-Graefe almost word for word: 1862, the summers spent
« naar Chailly in 't bosch van Fontainebleau », and Diaz telling him to paint
from nature. It is therefore derivative, not a second independent source.
Still no early text puts the meeting at Barbizon. The row is marked
`[needs-local:` with the HathiTrust record.

**Implication for published text.** None. The `maison-diaz` narrative says
Renoir told of meeting Diaz « dans la forêt de Fontainebleau, au début des
années 1860 », which matches every version found.

## 3. Tried, nothing new (rows not changed)

- **Henri Matisse, 1908 (`285ca00b`).** A gallery biography
  (galerie-institut.com) has Matisse at 33 boulevard des Invalides in 1908
  and says nothing about Barbizon. No chronology with the dates of the stay
  was reachable. The Schneider or Spurling chronology is still needed.
- **Pierre Thorel (`8a2eacef`).** No web footprint, and none for Roland
  Arribas either. An X-alumni art-group newsletter (ARPLASTIX n°10, 2013)
  mentions a Barbizon outing only.
- **Marius Roger (`0316a08c`).** Searches returned nothing beyond the
  Geneawiki mayors list already logged.
- **Laure and Clarisse Henry (`c6ff206f`, `cd23587a`).** No singer of that
  name was found in any spelling.
- **André Rouveyre, place of death (`0414d53f`).**
  - The NLI/LC authority record and museum-digital were re-read. Both give
    18 December 1962 with no place.
  - Earlier passes had already logged both, so nothing was added.
  - The fetches of GND and ULAN were not approved.
- **Narcisse Diaz rows (`b608bd05` studio luxury, `44529b46`, `1a735f4c`,
  `d50f5b1f`).**
  - The NGA artist page has a bibliography only.
  - The Gutenberg text of Muther's *History of Modern Painting* vol. 2 does
    not contain the Fontainebleau chapter body.
  - Hurll, *Jean François Millet* (1900, Gutenberg 13119) only lists Diaz
    among Millet's friends.
  - The full text of Mollett 1890 was not found online (the PAFA record is
    metadata only).
- **Villa Bernard 1939 (`8eca1c05`), Mounet-Sully (`de8cab8e`), Le Royal
  (`e6d12d4d`), Maison Barye (`45fa4b92`), Diaz as godfather (`423be8d8`).**
  Searches returned nothing usable. A Geneanet postcard published by « A.
  Siron édit, Barbizon » shows Fontainebleau, not Barbizon.
- **Hôtel des Charmettes postcard on Commons.** The file page was found but
  could not be fetched.

---

## Tasks

- `6fee872a` (backlog, priority 5, content): the Bas-Bréau page's « Après
  1870 » conflicts with the commune's 1867. Before filing, the open tasks
  were checked. The only open Bas-Bréau task is `d16ec0a9`, about the park
  area and the star rating, so this is not a duplicate.

## For S4 (local)

- `d0611aa6`: the Chailly-en-Bière censuses of 1866 and 1872 (AD77), the
  entry for Siron, Grande Rue: was he a timber merchant or an innkeeper?
- `9df8181a`: the Meier-Graefe 1912 Floury edition or Vollard 1920 on
  HathiTrust (catalog records 000417659 and 000417684): exact wording and
  page for the Diaz meeting.
- `f44679db`: re-read the Grigorescu press kit (musee-peintres-barbizon.fr)
  for the date of his time at the hôtel Siron.

## Not reached / still open

These subjects remain low-yield on the open web and are best left to S4 or
to the reading room:
- the booklet house names and the commercial numbers listed in pass 2;
- the Matisse chronology;
- the Charmettes snippet rows (Gallica press);
- the Bodmer *Moniteur universel* advertisement;
- the 1889 chapel inauguration (*Semaine religieuse de Meaux*).
