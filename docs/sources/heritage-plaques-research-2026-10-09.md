# Heritage Plaques — research dossier (2026-10-09)

Tasks: d566f33e (Heritage Plaque verification pass, 7 records) and d074fa2e
(Auberge Ganne museum opening date, 1987 vs 1995; 1861 forest-reserve superlative).

Scope and method. Research only; no database or content change was made. Every
published location in category `heritage-plaque` was queried on 2026-10-08
(`slug, name, short_description, internal_notes`; `is_published = true`). For each
claim the sources were searched Tier 1 first (Base Mérimée / POP, Gallica / BnF,
Archives départementales de Seine-et-Marne, Musée départemental des peintres de
Barbizon, Musée d'Orsay), then Tier 2, per `docs/sources.md`. Tier 3 sources
(grappilles.fr, barbizonvillagedespeintres.wordpress.com and similar blogs) are
quoted for orientation only and never confirm a claim on their own. Verdicts use
three values: **confirmed** (Tier 1, or Tier 2 with a named author/institution),
**contradicted** (a Tier 1 or Tier 2 source says otherwise), **unsupported** (nothing
above Tier 3 found tonight). Quotes are verbatim from the page as fetched; where a
page could not be read, this is stated and nothing is reconstructed.

Luigi decides what gets published. Nothing here was written into `locations`.

---

## 0. Access log — what could and could not be read tonight

Read successfully (quoted below):

| Source | Tier | URL |
|---|---|---|
| POP — Muséofile notice M0370 (musée de l'école de Barbizon – auberge Ganne) | 1 | https://pop.culture.gouv.fr/notice/museo/M0370 |
| POP — Mérimée notice PA00086807 (Auberge Ganne) | 1 | https://pop.culture.gouv.fr/notice/merimee/PA00086807 |
| BnF, Les Essentiels — « La forêt de Fontainebleau et les artistes en 30 dates » | 1 | https://essentiels.bnf.fr/fr/focus/060b51a7-3261-4970-b2c0-dbaa0442c450-foret-fontainebleau-et-artistes-en-30-dates |
| Archives départementales de Seine-et-Marne — « Exploiter et protéger une ressource "naturelle" : la forêt de Fontainebleau depuis Colbert » | 1 | https://archives.seine-et-marne.fr/en/node/1326 |
| data.bnf.fr — author search « Maximilienne Whettnall » | 1 | https://data.bnf.fr/search?term=Maximilienne+Whettnall |
| Mairie de Barbizon — page « Histoire » | institutional (municipal) | https://www.barbizon.fr/histoire/ |
| Mairie de Barbizon — page « Commerces et artisans » | institutional (municipal) | https://www.barbizon.fr/commerces-et-artisans/ |
| National Gallery, London — artist page Charles-François Daubigny | 2 | https://www.nationalgallery.org.uk/artists/charles-francois-daubigny |
| societe.com — registry record « MANOIR DE SAINT HEREM » (SIREN 331843789) | 2 (registry data via an aggregator; verify on Infogreffe/BODACC before publishing) | https://www.societe.com/societe/manoir-de-saint-herem-331843789.html |
| fr.wikipedia.org — « Forêt de Fontainebleau » (with its footnotes) | lead only | https://fr.wikipedia.org/wiki/For%C3%AAt_de_Fontainebleau |
| fr.wikipedia.org — « Musée des Peintres de Barbizon » | lead only | https://fr.wikipedia.org/wiki/Mus%C3%A9e_des_Peintres_de_Barbizon |
| Fontainebleau Tourisme — « The forest » | 3 (tourism office) | https://www.fontainebleau-tourisme.com/en/the-forest/the-forest-2/ |
| La Radio du Goût — « L'auberge Ganne et les peintres de Barbizon » (2021, interview with Frédérique Bourdeau, régisseur des collections, Musée départemental) | 3 (press; quotes a museum staff member) | http://www.laradiodugout.fr/dossiers/2021/12/lauberge-ganne-et-les-peintres-de-barbizon/ |
| barbizonvillagedespeintres.wordpress.com — « Barbizon pas à pas… » (2015-08-23, Jean-Michel Mahenc) | 3 | https://barbizonvillagedespeintres.wordpress.com/2015/08/23/barbizon-pas-a-pas-les-sourires-et-les-secrets-du-passe-dans-chaque-maison/ |
| polmoresie.over-blog.fr — « Auguste Giroux, médecin des enfants et royaliste (2/2) » (2020) | 3 | http://polmoresie.over-blog.fr/2020/11/auguste-giroux-medecin-des-enfants-et-royaliste-2/2.html |
| musiciens77.canalblog.com — « Musiciens aux environs de Fontainebleau » | 3 | https://musiciens77.canalblog.com/ |
| terresdecrivains.org — « Roland Dorgelès à Amiens, Paris, Longvic, Chanteloup, Cassis » (2003) | 3 | https://terresdecrivains.org/index.php/2003/08/14/roland-dorgeles/ |
| Photo of the Daubigny plaque taken by Luigi (repo `media-staging/atelier-daubigny-plaque/atelier-daubigny-plaque.jpg`, 2026-07-16) | primary object | local file |

Could NOT be read (listed for Luigi; not routed around):

| Source | What happened | Why it matters |
|---|---|---|
| Musée départemental des peintres de Barbizon — « À l'origine du musée », « Deux bâtiments pour un musée » (https://www.musee-peintres-barbizon.fr/fr/lorigine-du-musee, …/deux-batiments-pour-un-musee) | TLS error: the certificate served is for `authent.cd-seine-et-marne.fr`, so the fetch tool refused the connection | The museum's own chronology of 1987 / 1990s works / 1995 / 2004. Muséofile (same ministry data) was used instead. |
| Gallica SRU full-text search (5 queries: « Tumble Inn » + Barbizon; « Villa Bernard » + Barbizon; « Hôtel Bellevue » + Barbizon; Dorgelès + Barbizon; Whettnall + Barbizon; Eiffel + Barbizon + Millet) | HTTP 403 from gallica.bnf.fr for the search API | The 1920s–30s press is the obvious Tier 1 path for the celebrity claims (Tumble Inn guests, Villa Bernard visitors, Rubinstein at L'Ombrage, Dorgelès). To be run by hand in Gallica / RetroNews. |
| Inventaire général du patrimoine culturel, Île-de-France — dossier IA95000506 (maison-atelier Daubigny, Auvers) | Bot-protection page only | Would give the Auvers dates (land bought 1860, studio 1861) from a Tier 1 inventory. |
| HAL-INRAE paper on Fontainebleau forest management (hal-02821414) | Bot-protection page only | Academic (Tier 2) treatment of the 1853/1861 reserves and the "first reserve" claim. |
| MoMA — « Picasso in Fontainebleau » exhibition page (https://www.moma.org/calendar/exhibitions/5530) | HTTP 403 | Documents Picasso's summer 1921 at Fontainebleau (search-engine summaries say a rented villa at 33 boulevard Leclerc, July–September 1921); not read directly, so not quoted. |
| Mairie de Barbizon village map, `carte-60X60-web.pdf` (https://www.barbizon.fr/wp-content/uploads/2022/12/carte-60X60-web.pdf) | Downloaded (2 MB) but its text layer could not be extracted with the tools available tonight (no poppler on the machine; a stdlib decode of the content streams yielded nothing) | This is the document that `brain/decisions.md` (2026-04-02) classifies as **Tier 1** for street-by-street attributions ("all Circuit des Lieux Célèbres attributions"). The Mahenc blog post reproduces, house by house, text that matches the mairie circuit entries; those transcriptions are quoted below as Tier 3 and should be checked against Luigi's copy of the map. |
| wikimonde.com mirror of the « Auguste Giroux » article | HTTP 410 Gone | Would have listed the article's references. |
| Association des Amis de la Forêt de Fontainebleau — timeline PDF | Image-only PDF, no text layer | Secondary chronology of the reserves. |

Policy note for Luigi (decision needed, not taken here). Decision 2026-04-02 makes the
mairie map a Tier 1 source for "former occupants" claims. Task d566f33e, filed later,
treats exactly these celebrity-residence claims as Tier-2-type claims to be parked
unless an archival Tier 1 source exists. Both cannot hold at once for the six
celebrity plaques below. The verdicts therefore give two lines: "by policy
2026-04-02" (mairie map counts as Tier 1) and "by independent archival evidence"
(what tonight's search found above Tier 3). Luigi picks which standard applies.

---

## 1. atelier-daubigny-plaque — « Atelier Daubigny — Plaque »

Published text: "A plaque on the west facade of Hôtel Les Pléiades marks Daubigny's
original studio, where he worked from 1835 to 1865."

**Claim 1a — the plaque exists on Les Pléiades (21 Grande Rue).** Verdict: **confirmed** (primary object).
- Luigi's photo (`media-staging/atelier-daubigny-plaque/atelier-daubigny-plaque.jpg`): a small rectangular plaque on the stone street façade of the Pléiades building, next to the hotel's oval sign. Zoomed crop read tonight: « CHARLES-FRANÇOIS DAUBIGNY — 1817 - 1878 — PEINTRE PAYSAGISTE — HABITA CETTE MAISON ». The plaque gives **no residence dates** and says *habita cette maison* (lived in this house), not "atelier".
- Mairie circuit text as transcribed by the Mahenc blog (Tier 3, see §0): « Grande rue N°21 — ancien atelier du peintre François DAUBIGNY. Agrandi il devint sous la main de fer de « Mme Baratin » un hôtel restaurant réputé ». No dates.

**Claim 1b — "from 1835 to 1865".** Verdict: **contradicted** (Tier 1 + Tier 2).
- BnF, Les Essentiels, « La forêt de Fontainebleau et les artistes en 30 dates » (Tier 1), entry 1843: « Premiers passages des peintres Charles-François Daubigny et de Constant Troyon à Barbizon. » — first visits in 1843, not 1835.
- National Gallery, London, artist page (Tier 2): « He settled in Auvers-sur-Oise in 1860 but continued to travel around France. » Also: travelled to Italy in 1835; Salon debut 1838; « In 1857 he acquired his studio boat, nicknamed 'Le Botin' ». An 1865 end date for a Barbizon studio is not supported anywhere read tonight; the plaque does not carry it.
- Recommendation: remove the dates and the word "original studio" from the public text; "lived in this house" (the plaque's own wording) is the only safe formulation. If a dated source for the Barbizon house exists, it will be in the museum's or Mahenc's files, not online.

**Claim 1c — "west facade".** Verdict: **unsupported** (orientation not checked; the photo shows the street-side façade). Minor; verify on site.

**Narrative check** (narrative, first paragraphs): "link between the Barbizon School and the Impressionists", "studio boat he called the Botin", "Oise and the Seine", "Corot was his friend and mentor" — the Botin and the rivers are **confirmed** (National Gallery, above: « explored the rivers Seine, Marne and Oise »). The "link to the Impressionists" characterisation is standard art-historical framing (National Gallery: « closely associated with the Barbizon group »); Corot as mentor is not covered by anything read tonight (**unsupported** at Tier 1/2 tonight; widely stated in Tier 2 biographies — a museum catalogue cite would settle it).

---

## 2. coz-ker — « Coz Ker — Maison de François Millet et Gustave Eiffel »

Published text: "A modest Grande Rue house where François Millet — son of the painter — and later Gustave Eiffel both lived."

Verdict: **confirmed by policy** (decision 2026-04-02 explicitly lists Coz Ker, 34 Grande Rue, as a Tier 1 attribution from the mairie map); **unsupported by independent archival evidence tonight** (Gallica search blocked; no POP, Archives 77 or museum record found).
- Mairie circuit text as transcribed by the Mahenc blog (Tier 3): « Grande rue N°34 — François MILLET un des fils de J.F MILLET habita cette maison avant Gustave EIFFEL. »
- Web search found no other source for either occupancy; Musée Millet pages describe no. 27 only.
- No change recommended beyond what decision 2026-04-02 already settled. If Luigi wants an archival anchor: Archives 77 cadastral/matrice records for 34 Grande Rue, or Eiffel family correspondence (Fonds Eiffel, Musée d'Orsay archives) — not searched online tonight.

---

## 3. manoir-saint-herem — « Hôtel Le Manoir Saint-Hérem »

Published text: "A long-abandoned hotel on the rue Jean-François Millet, formerly the Hôtel Bellevue, where Picasso and his family once stayed."

**Claim 3a — closed / "long-abandoned".** Verdict: **confirmed (closed since 2016)**, wording to soften.
- societe.com registry record (Tier 2, aggregator): company « MANOIR DE SAINT HEREM », « 14 RUE JEAN FRANCOIS MILLET, 77630 BARBIZON », activity « Hôtels et hébergement similaire - 5510Z », created « 5 février 1985 », status « Fermée definitivement Radiée », judicial liquidation closed for insufficient assets on 14 November 2016.
- Mairie « Commerces et artisans » page (municipal, read 2026-10-08): the Manoir Saint-Hérem is **not listed** among Barbizon businesses (nor are Les Pléiades or L'Ombrage, so absence is weak evidence).
- "Abandoned" is an editorial judgement about the building's state; the registry supports "closed since 2016". Note that several booking aggregators still list it as open — expect visitor confusion.

**Claim 3b — "formerly the Hôtel Bellevue".** Verdict: **confirmed by policy** (mairie map), **unsupported independently**.
- Mairie circuit text as transcribed by the Mahenc blog (Tier 3): « Rue Jean-François Millet N°14 — Autrefois « Hôtel Bellevue » pension de famille, tenu par une ancienne famille de Barbizon, hébergea entre autres PICASSO et sa famille. »

**Claim 3c — "where Picasso and his family once stayed".** Verdict: **confirmed by policy**, **unsupported by independent evidence**, and in tension with the documented record.
- Only source: the mairie circuit entry above (no date, no family name of the hosts).
- Picasso's documented summer with Olga and the infant Paulo in this area is Fontainebleau, 1921 (MoMA exhibition « Picasso in Fontainebleau »; page returned 403, so not quoted; search-engine summaries give a rented villa at 33 boulevard Leclerc, July–September 1921). No Tier 1/2 source read tonight places the family at a Barbizon pension. A Barbizon stay is not impossible (Barbizon is 10 km from Fontainebleau) but it is unverified.
- Recommendation under the d566f33e standard: move the Picasso sentence to `internal_notes` tagged unverified, keep "formerly the Hôtel Bellevue" (policy Tier 1), and replace "long-abandoned" with "closed since 2016".

---

## 4. l-ombrage — « L'Ombrage »

Published text: "A Grande Rue house where Arthur Rubinstein and Samson François came to prepare concerts, possibly once belonging to George Sand."

**Claim 4a — Rubinstein and Samson François prepared concerts there (with the pianist Maximilienne Whettnall).** Verdict: **confirmed by policy** (mairie map), **unsupported independently**.
- Mairie circuit text as transcribed by the Mahenc blog (Tier 3): « Villa L'OMBRAGEUX de George Sand à Maximilienne Whettnall - Arthur RUBINSTEIN, Samson François, venaient préparer leurs concerts en compagnie de Maximilienne WHETTNALL pianiste virtuose, 1er prix de conservatoire - Cette maison aurait appartenu à George SAND à la fin du 19ème siècle » (entry numbered N°18). Note the map spells the house « L'Ombrageux ».
- musiciens77.canalblog.com (Tier 3): « la pianiste virtuose Maximilienne WHETTNALL (ancienne élève de Marguerite Long et d'Yves Nat), a accueilli plusieurs fois dans sa villa L'Ombrage 18 Grande rue à Barbizon … Arthur RUBINSTEIN et Samson FRANCOIS qui venaient y préparer leurs concerts. » The blog lists the Mahenc site among its sources, so this is not independent.
- data.bnf.fr (Tier 1): « Pas de résultat dans data.bnf.fr pour la recherche 'Maximilienne Whettnall' ». A web search for the name returns nothing else. The hostess herself is undocumented online; a concert programme or press notice (Gallica/RetroNews) would be the Tier 1 anchor.

**Claim 4b — "possibly once belonging to George Sand".** Verdict: **unsupported**, and the map's own wording makes it implausible as dated.
- The only source is the map's conditional « aurait appartenu à George SAND à la fin du 19ème siècle ». George Sand died in 1876; "fin du 19e siècle" cannot be literally true. Nothing read tonight connects Sand to a Barbizon property (her documented links are Nohant, Gargilesse, and her 1872–73 writing on the forest — fr.wikipedia « Forêt de Fontainebleau » cites George Sand, *Impressions et souvenirs*, Michel-Lévy, 1873, pp. 315–330).
- Recommendation: drop the Sand clause from the public text; park it in `internal_notes` as "local tradition, undated, unverified".

**Address.** DB says Grande Rue; the two Tier 3 transcriptions give « 18 Grande rue » (musiciens77) and an entry « N°18 » whose street name is not clear in the Mahenc transcription. Check on site.

---

## 5. tumble-inn — « Le Tumble Inn »

Published text: "A legendary American jazz bar opened in 1920 that welcomed King Albert I of Belgium, the future Duke of Windsor, Charlie Chaplin, and Jean Cocteau."

Verdict: **confirmed by policy** (mairie map), **unsupported by independent archival evidence tonight** (Gallica blocked). The 1920 date and the guest list all trace to one municipal text.
- Mairie circuit text as transcribed by the Mahenc blog (Tier 3): « Rue RENE MENARD N°4 — Ouvert en 1920 par Alfred GRAND, figure emblématique, ce célèbre Bar américain reçu des hôtes illustres parmi lesquels Albert 1èr Roi des Belges, André de Grèce, le prince de Galles futur Duc de Windsor, Charlie CHAPLIN, Jean COCTEAU etc .. »
- A search-engine summary of the mairie's « Barbizon Jazz Inn 2024 » festival programme (https://www.barbizon.fr/wp-content/uploads/2023/08/DEPLIANT-PROGRAMME-FESTIVAL-BARBIZON-JAZZ-INN-2024.pdf, not read directly) describes the Tumble Inn as a jazz club created in 1920 "by an Englishman who came directly from New York", one of the first American bars in France where jazz was played, and says a sign with its name remains on rue Ménard. If accurate, this conflicts with « Alfred GRAND » as founder, or describes the same person differently. Read the PDF before publishing any founder claim.
- "Jazz": the circuit text says « Bar américain »; "jazz" appears only in the festival material (which has an interest in the association). Keep "American bar" as the safe noun; "jazz" is plausible but secondhand.
- Recommendation: keep the sentence only if the mairie map standard is accepted; otherwise reduce to "American bar opened in 1920, famous for its illustrious guests" and move the names to `internal_notes` pending a press source (Le Figaro / Comœdia society columns of the 1920s via Gallica).

---

## 6. villa-bernard — « Villa Bernard »

Published text: "A Barbizon villa where André Citroën, Coco Chanel, Jean Cocteau, Diaghilev, Giraudoux, and Paul Iribe all met."

Verdict: **confirmed by policy** (mairie map); **partly supported** independently (municipal history page + one unsourced biography of the owner); **unsupported** for Iribe and for "all met".
- Mairie circuit text as transcribed by the Mahenc blog (Tier 3): « Au bout de celle-ci [allée des Tilleuls, now rue Jean-Baptiste Comble] se trouve la « Villa BERNARD » ou se rencontrèrent André CITROËN, Jean COCTEAU, Jean GIRAUDOUX, DIAGUILLEV, Coco CHANEL, Paul IRIBE .. »
- Mairie de Barbizon, « Histoire » page (municipal, read): mentions « Villa Bernard, la propriété du docteur Giroux » in connection with Jean Cocteau's visits in the 1930s. (Only Cocteau is named on this page.)
- polmoresie.over-blog.fr, « Auguste Giroux… (2/2) » (Tier 3, no sources cited): « Quittant la proche banlieue, Auguste Giroux installe à Barbizon (Seine-et-Marne) une Maison de repos et de convalescence pour enfants de moins de quinze ans. Il loue d'abord la villa Bernard puis, devant l'extension des jeunes accueillis, la villa Serge. » and « La villa Bernard accueillit de nombreux visiteurs, dont l'industriel André Citroën, le poète Jean Cocteau, l'écrivain Jean Giraudoux, le fondateur des Ballets russes Diaghilev, la créatrice de mode Coco Chanel ou le prince Constantin Andronikoff ». Iribe is absent here; Andronikoff is added.
- Chronology problem: Diaghilev died in August 1929 and Iribe in September 1935; Citroën died in July 1935. If Giroux's lease dates from about 1932 (search-engine summary, not verified), Diaghilev could not have visited the Giroux-era villa. "All met" (one gathering) is not claimed by any source; the map says « se rencontrèrent » loosely.
- Recommendation: rewrite as "the villa of Dr Auguste Giroux's children's convalescent home in the 1930s, visited by Jean Cocteau (municipal history) and, by local tradition, by Citroën, Chanel, Giraudoux and Diaghilev"; park Iribe and the "all met" phrasing in `internal_notes`.

---

## 7. villa-elisabeth — « Villa Élisabeth »

Published text: "Former residence of Roland Dorgelès, author of Les Croix de Bois."

Verdict: **confirmed by policy** (mairie map), **supported by one independent Tier 3 source**, **unsupported at Tier 1/2** (Gallica blocked; the BnF CCFr lists Dorgelès correspondence fonds that may contain Barbizon letters — not consulted).
- Mairie circuit text as transcribed by the Mahenc blog (Tier 3): « « Villa ELISABETH » - L'écrivain Roland DORGELÈS auteur de « Les Croix de Bois» en fit sa résidence avant que la directrice des « Pléiades» n'en fit la sienne. » (entry N°30).
- terresdecrivains.org (Tier 3, photo caption): « La Villa Elisabeth, 30 Grande rue à Barbizon, maison des Dorgelès. »
- Les Croix de bois: published 1919, Prix Femina 1919 (standard reference data; not a claim under review).
- Address discrepancy to check on site: terresdecrivains says 30 Grande Rue; one transcription of the map entry places N°30 on rue Théodore-Rousseau. The DB record carries no address in the published text.
- Recommendation: the claim can stand under the policy standard; add the source to the record's `source` field. Leads for a Tier 1 anchor: CCFr fonds « Correspondance du peintre Serge Belloni avec Roland et Mme Dorgelès » (https://ccfr.bnf.fr/portailccfr/ark:/16871/004b1822041) — not read.

---

## 8. Not covered

- `maison-sermain-plaque` (17 Grande Rue) is **unpublished** (`is_published = false`) with an explicit internal note requiring Tier 1 verification before any biographical claim; out of scope for a published-only pass. Nothing new found.
- The task mentions photographing each plaque: only the Daubigny plaque has a photo in `media-staging`. The other six have no plaque photo on disk; a dated plaque would be its own evidence for Tumble Inn (the festival programme says a sign survives on rue Ménard).

---

## 9. Auberge Ganne dates (task d074fa2e)

Current copy (DB `short_description`, FR): « Elle abrite depuis 1995 le musée des Peintres de Barbizon ». Narrative: « Acquis par la commune en 1987, il est restauré ; … Le musée ouvre en 1995 et devient départemental en 2004. » Timeline strings (`public/locales/*/pages.json`, key `musee1995`): acquisition 1987, opening 1995.

**1987 — commune decides to acquire the former inn.** Verdict: **confirmed** (Tier 1).
- POP Muséofile M0370: « La commune de Barbizon décide en 1987 l'acquisition de l'ancienne auberge Ganne. »

**Early 1990s — rehabilitation works reveal the painters' wall paintings and graffiti.** Verdict: **confirmed** (Tier 1, no precise year).
- POP Muséofile M0370: during the early-1990s rehabilitation, « peintures et graffitis réalisés au XIXe siècle par les artistes ayant séjourné à l'auberge » were discovered. (The notice gives "début des années 1990", not a year.)

**1995 — museum opens in the Auberge Ganne.** Verdict: **confirmed** (Tier 1).
- POP Muséofile M0370: « Le nouveau musée municipal ouvre au public en 1995. »
- La Radio du Goût (Tier 3, quoting the museum's régisseur des collections): « Depuis 1995, l'auberge Ganne abrite la collection permanente du musée départemental des peintres de Barbizon. »

**2004 — management transferred to the Département.** Verdict: **confirmed** (Tier 1).
- POP Muséofile M0370: « Sa gestion est reprise par le Conseil général de Seine-et-Marne en 2004. »

**Earlier museum history (context).** Muséofile gives creation dates « 1927 ; 1977 »: a first museum in Théodore Rousseau's studio in 1927, closed 1930; a new institution opened in 1977 with limited works before relocating. So "the museum" has three birth dates depending on which institution is meant; the copy should keep saying the Auberge Ganne *houses the museum since 1995*.

**Monument historique.** POP Mérimée PA00086807: « Auberge Ganne », « Grande-Rue () 92 », « 18e siècle ; 19e siècle », « Millet Jean-François (habitant célèbre, peintre) », « Rousseau Théodore (habitant célèbre ; peintre) »; protection « 1984/12/28 : inscrit MH » by arrêté, covering « Façades et toitures ; trois salles d'expositions du rez-de-chaussée ».

**Answer to "1987 vs 1995".** Both are right and refer to different events: 1987 is the acquisition decision, 1995 the opening. Any design copy that puts the museum *opening* in 1987 is wrong. The fr.wikipedia article is unreliable here: it says « le rachat de l'ancienne auberge Ganne par la commune en 1995 » (uncited) and its infobox says « Ouverture : 2004 » (uncited); both conflict with Muséofile. The "Barbizon Mobile Rethink" design itself was not opened (the design tool is off-limits tonight); the live `HistoryTimeline` strings are already consistent with Muséofile.

---

## 10. The 1861 forest-reserve superlative (task d074fa2e, second part)

Current copy (`pages.json`, key `reserve1861`, FR): « un décret du 13 août 1861 soustrait aux coupes 1 097 hectares de la forêt de Fontainebleau, au nom de leur valeur artistique. On y voit souvent la première réserve naturelle au monde. »

**Date and area.** Verdict: **confirmed in substance, with two 1861 dates and three area figures in circulation**.
- BnF, Les Essentiels (Tier 1), entry 1861: « La Commission d'aménagement de la forêt remet un rapport dans lequel elle propose d'épargner les futaies et les sites les plus pittoresques pour les artistes et les promeneurs ; répondant à ce vœu, un décret du 13 avril crée la Série artistique : 1100 hectares mis hors exploitation. »
- Archives départementales de Seine-et-Marne (Tier 1): « 1861 : décret de l'Empereur Napoléon III instituant officiellement la première réserve artistique. » and « Créée en 1953, elle succède aux réserves artistiques protégées dès 1853, sous Napoléon III, à la demande des peintres de l'École de Barbizon. » (no day/month, no hectares).
- fr.wikipedia « Forêt de Fontainebleau » (lead; its footnote 12 is ONF, « Courte histoire de la gestion forestière à Fontainebleau », May 2013 — the ONF note itself was not read): « Puis par le décret impérial du 13 août 1861, la « réserve artistique » (21e série) est portée à 1 094 ha et enfin à 1 693 ha de 1892 à 1904 ».
- So: 13 April 1861 (creation of the série artistique, ~1 100 ha, BnF) and 13 August 1861 (imperial decree, 1 094 ha per ONF via Wikipedia). The copy's "13 août 1861" is consistent with the ONF-sourced line; "1 097 ha" matches the tourism office and the Mairie bulletin rather than BnF (1 100) or ONF (1 094). Recommendation: say "un décret impérial d'août 1861" and "près de 1 100 hectares", or cite ONF's 1 094 explicitly.

**"First nature reserve in the world".** Verdict: **unsupported at Tier 1 as read tonight; the hedge is correct**.
- Neither Tier 1 page read tonight (BnF Essentiels, Archives 77) makes the world-first claim; Archives 77 says only « la première réserve artistique ».
- fr.wikipedia states « elle constitue la première réserve naturelle au monde » citing the ONF Fontainebleau site (footnote 13, not read) and adds a caveat footnote 14 about the Hot Springs Reservation (USA, 1832). Fontainebleau Tourisme (Tier 3): « the forest of Fontainebleau became the first natural conservation area in the world! ».
- The current wording « On y voit souvent la première réserve naturelle au monde » states the claim as a reputation, not a fact, which is the right register given the sources. Keep it; do not upgrade to a flat superlative unless the ONF note is read and quoted.

---

## 11. Summary table

| Record / claim | Verdict | Best source read |
|---|---|---|
| Daubigny plaque exists, text « habita cette maison » | confirmed | plaque photo |
| Daubigny worked here 1835–1865 | contradicted | BnF Essentiels (1843 first visit); National Gallery (Auvers 1860) |
| Coz Ker — Millet son then Eiffel | confirmed by policy (map); unsupported independently | mairie map (decision 2026-04-02) |
| Manoir Saint-Hérem closed / abandoned | confirmed as closed since 2016 | societe.com registry |
| … formerly Hôtel Bellevue | confirmed by policy; unsupported independently | mairie map via Mahenc |
| … Picasso and family stayed | confirmed by policy; unsupported independently; documented 1921 stay is Fontainebleau | mairie map via Mahenc; MoMA (not read) |
| L'Ombrage — Rubinstein, Samson François | confirmed by policy; unsupported independently | mairie map via Mahenc; musiciens77 |
| L'Ombrage — George Sand owned it | unsupported (and mis-dated by the source itself) | mairie map via Mahenc |
| Tumble Inn — 1920, Albert I, Duke of Windsor, Chaplin, Cocteau | confirmed by policy; unsupported independently | mairie map via Mahenc |
| Villa Bernard — six names "all met" | confirmed by policy; Cocteau supported by barbizon.fr; Iribe and "all met" unsupported; Diaghilev chronology doubtful | barbizon.fr/histoire; polmoresie |
| Villa Élisabeth — Dorgelès residence | confirmed by policy; one independent Tier 3 | terresdecrivains |
| Auberge Ganne — 1987 acquisition decision | confirmed | POP Muséofile M0370 |
| Auberge Ganne — 1995 museum opening | confirmed | POP Muséofile M0370 |
| Auberge Ganne — 2004 departmental | confirmed | POP Muséofile M0370 |
| Auberge Ganne — MH 28 Dec 1984 | confirmed | POP Mérimée PA00086807 |
| 1861 decree, 13 août, ~1 100 ha | confirmed (two dates exist: 13 avril and 13 août) | BnF Essentiels; ONF via Wikipedia |
| "first nature reserve in the world" | unsupported at Tier 1 tonight; hedge appropriate | Archives 77 (no superlative) |

Prepared by the overnight session of 2026-10-08/09 (Claude Code, Fable 5.1). No
database or content change was made; `tasks` d566f33e and d074fa2e were set to
`at_gate` with this file as the deliverable.
