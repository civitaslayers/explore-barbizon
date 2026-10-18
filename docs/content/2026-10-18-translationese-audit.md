# Translationese audit, French, 2026-10-18

Read-only audit under the `barbizon-writing` skill ("Reviewing existing text").
No database writes and no copy changes were made. Rewrites below are proposals only.

**Mode for the fixes: correction** (writing guide, "Two modes", PR #74). Facts are
frozen: every name, number and claim stays as published, only the language changes.
The audit's proposed rewrites were written before correction mode existed. Where one
changes, drops or adds content (listed under "Fact flags" below), correction keeps the
published claim and fixes only the language. Fact doubts never block a correction;
they are collected in one list below and triaged separately.

**Scope.** French base columns only, published rows only:
- the 10 published stories (`title`, `subtitle`, `body`);
- the 36 published locations whose category is in the Art & History layer
  (`full_description`, `narrative`).

**Method.** Text extracted byte-exact from production by SELECT (md5 checked per
section). Each item was read by the `civitas-native-editor` agent (Opus) in French
alone, with no English version and no source notes, against
`docs/content/writing-guide.md` and `docs/content/glossary.md`. Six editor runs:
two of five stories, three of twelve locations. The editor could not see whether
spaces before « ; : » and inside « » are non-breaking, so that rule is not audited.
The extraction showed no U+00A0 or U+202F anywhere in these columns, so the rule is
in practice unmet site-wide.

**Scale.** 0 natural, 1 a few calques, 2 reads translated, 3 rewrite needed.

## Summary

| Score | Stories | Locations | Total |
|---|---|---|---|
| 3 | 1 | 9 | 10 |
| 2 | 6 | 11 | 17 |
| 1 | 3 | 16 | 19 |
| 0 | 0 | 0 | 0 |

27 of 46 items score 2 or 3.

### Findings across items

1. **English in the French column.** 13 Art & History locations store English in the
   French base `full_description`, so French readers see English: cercle-laure-henry,
   chene-bodmer, dormoir-de-lantara, galaxie-des-arts, galerie-39, galerie-41,
   galerie-alfart-lbk, galerie-atelier-drochon, maison-de-rousseau, maison-diaz,
   maison-millet, medallion-millet-rousseau, plaine-angelus-site-peinture.
   galerie-39 has no French text at all (narrative empty).
2. **French without accents.** 5 `full_description` texts have no accents, and some
   use ASCII `--`: ferme-du-couvent, galerie-frederic-got, galerie-roz-in-winter,
   muse-galerie, parcours-des-mosaiques. The `name` « Monument des Freres Farman »
   is missing its accent too.
3. **English essay shapes.** Cleft sentences (« C'est X qui… », « Ce qui…, c'est… »),
   « Pas X. Mais Y. » fragments, rhetorical triples, short punchline sentences, and
   participial tags at the end of a sentence. This is the main pattern in the stories.
4. **Tense mixing.** Présent de narration, passé simple and passé composé inside one
   narrative, in about half the items (the guide forbids it).
5. **Glossary misses.** « l'école de Barbizon » for « l'École de Barbizon »,
   « auberge Ganne » for « l'Auberge Ganne », « Díaz » and « Diaz de la Pena » for
   « Diaz de la Peña », « Gorges d'Apremont » for « gorges d'Apremont », and
   « Les Glaneuses » for « Des glaneuses ». The Barbizon School practice is called
   « peinture en plein air » where the guide requires « sur le motif »
   (how-the-forest-became-a-picture, paths-to-the-forest).
6. **Story subtitles.** 7 of 10 fail. Four use the « Sur X, Y et Z » calque.
   rooms-of-light (102), the-gleaners (91), how-the-forest-became-a-picture (88),
   inn-paintings-dinner (96) and paths-to-the-forest (90) are under 110 characters.
   the-house-of-the-crime (205), where-to-stay-barbizon (177) and
   how-the-forest-was-saved (162) are over 160. Three of these already have drafts
   in `docs/content/2026-10-18-story-meta-descriptions.sql` (task 77e02c3f).
7. **Unsourced superlatives** (voice rule): « le tableau le plus dérangeant de
   Millet » (the-gleaners subtitle), « l'ouverture la plus enthousiasmante de la
   rue », « L'adresse la plus établie de Barbizon », « la présence la plus
   discrètement décisive de la Grande Rue », « deux des plus grands peintres du
   XIXe siècle », « l'une des galeries les plus actives », « le témoignage le plus
   complet ».

### Glossary gaps (non-blocking)

Correction keeps the form already published until Luigi settles these.

- Museum name: the texts say « musée départemental des Peintres de Barbizon »
  (likely the official name); the glossary has only « le musée de l'École de Barbizon ».
- « séries artistiques » (the historical term, used in the texts) against the
  glossary's « réserve artistique ».
- « Diaz »: the people table writes « Narcisse Diaz de la Peña »; editors read the
  texts' « Díaz » as a glossary miss.
- « L'Ermitage Saint Antoine »: French typography would hyphenate « Saint-Antoine »
  unless the business spells it otherwise.
- Robert Louis Stevenson and Jean-Jacques Rousseau are not in the glossary yet.

## Fact flags (one list, for triage; the text is not changed for any of these)

Triage task: "Triage fact flags from the translationese audit". Each flag gives the
record, the field and the quote. None of them blocks a correction.

**From the stories and Art & History locations**

| # | Record | Field | Quote | Flag |
|---|---|---|---|---|
| FF1 | maison-millet | narrative | « l'œuvre qui a fini au Louvre » | L'Angélus has been at the musée d'Orsay since 1986; Louvre may be meant historically (1910 bequest) |
| FF2 | parcours-des-mosaiques | full_description vs narrative | « reproductions en ceramique », « environ 1 km » / « verre de Venise », « 870 mètres » | material and length disagree between the two fields (see also open task 27ab32d1, 19 vs 20 mosaics) |
| FF3 | parcours-des-mosaiques | full_description | « Constable » in the École de Barbizon list; « placees aux endroits precis » | Constable is not a Barbizon painter; « exact spot » is unsourced (27ab32d1) |
| FF4 | galerie-atelier-drochon | narrative | « peintres américains comme Robert Bateman » | Bateman is usually described as Canadian |
| FF5 | galerie-frederic-got | narrative vs full_description | « trois continents » | the listed cities span two continents |
| FF6 | the-house-of-the-crime | subtitle | « un nom emprunté à Rousseau », « rouvre » | bare « Rousseau » reads as Théodore on this site but means Jean-Jacques; « rouvre » implies it was open before |
| FF7 | inn-paintings-dinner | subtitle vs body | « a fait naître, sans le vouloir, une école » | the body says Ganne founded no school |
| FF8 | where-to-stay-barbizon | subtitle; body | « une villa du XIXe siècle »; « Visit Barbizon est réalisé par… » | no address in the body is described as a 19th-century villa; disclosure names « Visit Barbizon » |
| FF9 | medallion-millet-rousseau | narrative | « ont choisi d'être associés dans la mémoire » | the medallion (1884) postdates both men |
| FF10 | coz-ker | narrative | « François Millet … puis … Eiffel »; « elle y demeure encore en 1921 » | order of residents unclear (Eiffel died 1923) |
| FF11 | maison-charles-jacque | narrative | « Jeanne, sa petite-fille » | Jacque's or Gassies's granddaughter? |
| FF12 | chene-bodmer | narrative | « près de quarante ans »; « Caravagio » | 1849 to 1893 is 44 years; tree name or misspelling |
| FF13 | dormoir-de-lantara | narrative | « jusqu'à vingt mille bêtes en une seule nuit » | the figure may be forest-wide (open task 4e848f3e) |
| FF14 | manoir-saint-herem | narrative | « qui hébergea entre autres Pablo Picasso » | open task 44fc7fb6 |
| FF15 | maison-diaz | narrative | « le peintre Paul Comble achète la maison, la peint » | « la peint »: painted a picture of it, or repainted it? |
| FF16 | atelier-daubigny-plaque | narrative | « c'est lui qui l'engage … et il peindra des panneaux pour l'entrée de sa maison » | who painted whose panels (Corot or Daubigny)? |
| FF17 | galerie-langelus | narrative | « dans le bâtiment même où beaucoup furent conçues » | which building is meant |
| FF18 | galerie-41 | narrative | « bimensuel » | twice a month or every two months? |
| FF19 | a-day-in-barbizon | body | « C'est ce pour quoi le village a été fait. » | claim unclear (built for this rhythm?) |
| FF20 | several | various | « le tableau le plus dérangeant de Millet » (the-gleaners subtitle), « l'ouverture la plus enthousiasmante de la rue », « L'adresse la plus établie de Barbizon », « la présence la plus discrètement décisive de la Grande Rue », « deux des plus grands peintres du XIXe siècle », « l'une des galeries les plus actives », « le témoignage le plus complet » | unsourced superlatives (voice rule); kept in correction |
| FF21 | several | proposed rewrites in this report | the-gleaners #1 (adds « la plaine de Chailly »), where-to-stay #3 (cuts the claim), the-house-of-the-crime subtitle (drops Rousseau), medallion #1 (drops the superlative), villa-bernard (implies a 1930s timing), where-to-stay #2 (« plus économique ») | these rewrites change content; in correction use the language fix only and keep the claim |

**From the location-functions correction (task 1a2205a7, current rows vs the 2026-10-15 approved text)**

| # | Record | Field | Quote (current row) | Flag |
|---|---|---|---|---|
| FF22 | auberge-ganne · Musée de l'École de Barbizon | description | "Municipal museum since 1993" | the 2026-10-15 approved text says departmental museum since 2004, opened 1995 |
| FF23 | auberge-ganne · Musée de l'École de Barbizon | description | "The most complete record of the movement that produced it." | unsourced superlative; absent from the 2026-10-15 approved text |
| FF24 | maison-millet · Musée Millet | description | "since 1923" | set to 1922 in the correction (Luigi, 2026-10-18, to match the location body) |
| FF25 | maison-millet · Musée Millet | description | "Open daily except Tuesday"; "and gallery L'Angélus" | the 2026-10-15 approved text has seasonal hours (also closed Wednesday November to March) and no « galerie L'Angélus » |
| FF26 | ermitage-saint-antoine · L'Autre Nuit | description | "The latest address in the village" | ambiguous (newest or latest open); Luigi notes newer openings since; rendered as « l'adresse qui ferme le plus tard » |
| FF27 | hotellerie-bas-breau · 4-star hotel and restaurant | label, description | "4-star", "2-hectare park" | open task d16ec0a9 |
| FF28 | all 15 | label, description | English in the French base columns | the correction writes French in the base columns and English in `translations.en` |
| FF29 | ermitage-saint-antoine · Coffee Shop | description | "Morning café open from 10h" | 10:00 is late for a « café du matin » |
| FF30 | ermitage-saint-antoine · L'Autre Nuit; Restaurant gastronomique | description | "open after dinner service ends upstairs … until midnight"; "dinner 19h30–00h00" | dinner and the bar both end at midnight, so "after dinner" and "latest" may not fit together |
| FF31 | lesquisse · Hotel and bar | description | "Nine rooms and suites … a Norwegian, a Hungarian, a Scot" | three nationalities for nine rooms: examples or the full list? |
| FF32 | lesquisse · Musée de l'Esquisse | description | "Permanent collection on loan" | a permanent collection on loan reads as a contradiction (long-term loans would explain it) |
| FF33 | lesquisse · Hotel and bar | description | "rooms with private garden access" | all rooms or some? |
| FF34 | lesquisse · Hotel and bar | description | "a specific European Impressionist artist" | whether the Barbizon-linked Nordic or Scottish painters count as Impressionists |
| FF35 | lesquisse · Musée de l'Esquisse | description | "including Museum Domburg (Netherlands), curated by Francisca van Vloten" | "curated by" can attach to the collection or to the Museum Domburg; Luigi says she curates L'Esquisse's exhibitions |
| FF36 | maison-millet · Musée Millet | description | "gallery L'Angélus" | room name or the painting (glossary English title "The Angelus")? |
| FF37 | auberge-ganne · Musée de l'École de Barbizon | description | "the movement that produced it" | unclear what "it" refers to (the inn, the collection); rendered « dont il est issu » |

## Ranking, worst first

| Rank | Item | Type | Score | Main defect |
|---|---|---|---|---|
| 1 | rooms-of-light | story | 3 | the guide's own calque examples in title and subtitle; clefts, triples, tense mix |
| 2 | maison-millet | location | 3 | FD in English; calqued narrative; Louvre/Orsay question |
| 3 | medallion-millet-rousseau | location | 3 | FD in English; English essay rhetoric, « establishment » |
| 4 | dormoir-de-lantara | location | 3 | FD in English (1 791 chars); narrative calqued, three tenses |
| 5 | parcours-des-mosaiques | location | 3 | FD without accents, `--`, « bale »; « humiliant »; FD and narrative disagree |
| 6 | galerie-39 | location | 3 | FD in English, narrative empty: no French at all |
| 7 | galaxie-des-arts | location | 3 | FD in English; narrative full of calques |
| 8 | galerie-atelier-drochon | location | 3 | FD in English; narrative reads translated |
| 9 | muse-galerie | location | 3 | FD without accents; brochure voice |
| 10 | galerie-frederic-got | location | 3 | FD without accents; stock English phrases |
| 11 | the-gleaners | story | 2 | English essay syntax throughout (close to 3) |
| 12 | where-to-eat-barbizon | story | 2 | English food-guide copy rendered literally |
| 13 | where-to-stay-barbizon | story | 2 | English hospitality copy; subtitle 177 |
| 14 | how-the-forest-became-a-picture | story | 2 | clefts; « en plein air »; banned claim in subtitle |
| 15 | a-day-in-barbizon | story | 2 | opening and closing in English shapes |
| 16 | inn-paintings-dinner | story | 2 | reflective sentences calqued; subtitle contradicts body |
| 17 | maison-de-rousseau | location | 2 | FD in English; tense mix |
| 18 | plaine-angelus-site-peinture | location | 2 | FD in English; « platitude » |
| 19 | maison-diaz | location | 2 | FD in English; glossary forms |
| 20 | chene-sully | location | 2 | personification, « must-see » calque, repetition |
| 21 | cercle-laure-henry | location | 2 | FD in English |
| 22 | chene-bodmer | location | 2 | FD in English |
| 23 | galerie-41 | location | 2 | FD in English; spatial calques |
| 24 | galerie-alfart-lbk | location | 2 | FD in English; « font du lieu le leur » |
| 25 | galerie-roz-in-winter | location | 2 | FD without accents, `--`; brochure fragments |
| 26 | ferme-du-couvent | location | 2 | FD without accents, `--`, « no.7 » |
| 27 | l-ombrage | location | 2 | verbless English sentence, « maison de rue » |
| 28 | how-the-forest-was-saved | story | 1 | tense mix in paragraph 1; subtitle 162 |
| 29 | paths-to-the-forest | story | 1 | « en plein air »; a few English rhythms |
| 30 | the-house-of-the-crime | story | 1 | one passé composé; subtitle 205 |
| 31 | maison-charles-jacque | location | 1 | présent and passé simple mixed |
| 32 | chapelle-barbizon | location | 1 | participial tag, « began as » ending |
| 33 | auberge-ganne | location | 1 | English essay hooks |
| 34 | besharat-gallery-barbizon | location | 1 | order of events, glossary capitals |
| 35 | caverne-des-brigands | location | 1 | « géographie narrative », tense switch |
| 36 | coz-ker | location | 1 | tense mix, order of residents |
| 37 | atelier-daubigny-plaque | location | 1 | unclear pronouns |
| 38 | galerie-langelus | location | 1 | tense mix, unsourced superlative |
| 39 | manoir-saint-herem | location | 1 | « ancienne famille », repetition |
| 40 | monument-farman | location | 1 | name without accent; « espace ouvert » |
| 41 | la-poste-barbizon | location | 1 | « était élu », « en dit autant sur » |
| 42 | cimetiere-barbizon | location | 1 | « un rappel utile » |
| 43 | mairie-barbizon | location | 1 | « presque chaque » |
| 44 | tumble-inn | location | 1 | one generic calque |
| 45 | villa-bernard | location | 1 | redundancy |
| 46 | villa-elisabeth | location | 1 | address typography |

FD = `full_description`. Within a score, rank follows the editor's severity notes and
how prominent the page is.

## Detail, worst first

For each item: the three worst sentences, verbatim, with a proposed rewrite. Where
`full_description` is in English, the sentences come from the French `narrative`.

### 1. rooms-of-light (story), score 3

About 10 of 20 sentences read translated. Title and subtitle are the two calques the
writing guide quotes. A draft fix for both is in task 77e02c3f.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | C'est la logique qui a façonné Barbizon. Pas de grands ateliers ni d'académies construites pour l'occasion, mais des bâtiments de village ordinaires, discrètement adaptés à un besoin précis : | Toute la logique de Barbizon tient là. Ni grands ateliers ni académies bâties exprès : de simples maisons de village, discrètement adaptées à un besoin précis : | cleft sentence (calque list); « pour l'occasion » means "for the event", not "purpose-built" |
| 2 | Cette proximité fait la singularité des tableaux : non pas des scènes rurales imaginées, mais des observations faites depuis une vie ordinaire, dans une lumière ordinaire, dans une pièce qui se dresse toujours dans une rue ordinaire. | De là vient la singularité de ces tableaux : non des scènes rurales imaginées, mais ce qu'on observe au fil d'une vie ordinaire, dans la lumière de tous les jours, depuis une pièce qui existe toujours, dans une rue comme les autres. | English triple; « se dresse » calques "still stands" |
| 3 | une archive discrète, de pierre et de verre, d'une manière de travailler, et de la qualité de lumière qui a fait de ce village un lieu où rester. | archives muettes, de pierre et de verre, d'une façon de travailler et de cette lumière qui donna aux peintres l'envie de se fixer au village. | chain of « de… de… »; « un lieu où rester » calques "a place to stay" |

### 2. maison-millet (location), score 3

FD is in English. The narrative uses English rhetorical patterns and mixes three tenses.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | La maison du 29 Grande Rue fut son atelier, son foyer, et finalement son héritage. | La maison du 29, Grande Rue fut son foyer, son atelier, puis son legs. | calque of "and ultimately his legacy"; address comma |
| 2 | Les deux institutions racontent des choses différentes. L'auberge Ganne raconte le groupe : | Les deux lieux ne racontent pas la même histoire. L'Auberge Ganne dit le groupe : | "tell different stories"; repetition; glossary capital |
| 3 | Un récit plus intime de ce qu'il en a coûté de faire l'œuvre qui a fini au Louvre. | On y mesure de plus près ce qu'a coûté une œuvre qui finit au Louvre. | verbless fragment; « a fini au » calques "ended up in"; see the Louvre/Orsay question |

### 3. medallion-millet-rousseau (location), score 3

FD is in English. The narrative is English essay prose: triples, a punchline, an
anglicism and a « vous » calque.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | un médaillon de bronze marque le lieu où deux des plus grands peintres du XIXe siècle ont choisi d'être associés dans la mémoire. | un médaillon de bronze réunit, à l'endroit même où ils travaillaient, Millet et Rousseau. | unsourced superlative; calque; see the question on « a choisi » |
| 2 | Entre-temps, le même establishment parisien qui avait passé des décennies à rejeter la peinture de Barbizon — de la boue, des paysans, des arbres indignes du regard — lui élevait des monuments de bronze. | Entre-temps, le monde officiel parisien, qui avait pendant des décennies rejeté la peinture de Barbizon (de la boue, des paysans, des arbres jugés indignes du regard), lui élevait désormais des monuments de bronze. | « establishment »; « passé des décennies à » calques "spent decades" |
| 3 | Ce médaillon est plus discret qu'un monument : il vous demande de regarder la forêt, non de le regarder lui. | Plus discret qu'un monument, ce médaillon ne retient pas le regard : il le renvoie vers la forêt. | calque of "it asks you to look at the forest" |

### 4. dormoir-de-lantara (location), score 3

FD is in English (1 791 characters). The narrative is calqued (« histoire en
couches », « qualité de lumière ») and uses three tenses.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Cette clairière du Bas-Bréau était leur étape : jusqu'à vingt mille bêtes en une seule nuit, avec le bruit et l'odeur qui emplissaient les arbres. | Cette clairière du Bas-Bréau était leur étape : jusqu'à vingt mille bêtes en une seule nuit, dans un vacarme et une odeur qui emplissaient la futaie. | English "with" construction; noise does not fill trees |
| 2 | Que Lantara ait réellement fréquenté cette forêt est une question que les chercheurs ont compliquée. | Les travaux des chercheurs ont brouillé la question de savoir si Lantara fréquenta réellement cette forêt. | calque of "a question researchers have complicated" |
| 3 | Díaz de la Peña l'a peinte. Rousseau a travaillé tout près. Corot a parcouru le Bas-Bréau. Gustave Le Gray a photographié le site en 1852. | Diaz de la Peña la peignit, Rousseau travailla tout près, Corot parcourut le Bas-Bréau, et Gustave Le Gray photographia le site en 1852. | English staccato; tense; glossary spelling |

### 5. parcours-des-mosaiques (location), score 3

FD has no accents and uses `--`. FD and narrative disagree on facts (see the
questions above).

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Le Parcours des Mosaiques est un itineraire bale qui suit la Grande Rue de Barbizon d'ouest en est, avec 19 reproductions en ceramique d'oeuvres de l'Ecole de Barbizon -- Millet, Rousseau, Corot, Diaz de la Pena, Daubigny, Troyon, Jacque, Constable -- placees aux endroits precis ou les peintres travaillerent sur le motif au XIXe siecle. | Le Parcours des mosaïques est un itinéraire balisé qui suit la Grande Rue d'ouest en est. Dix-neuf reproductions en céramique d'œuvres de l'École de Barbizon (Millet, Rousseau, Corot, Diaz de la Peña, Daubigny, Troyon, Jacque, Constable) y sont placées aux endroits précis où les peintres travaillèrent sur le motif au XIXe siècle. | accents, `--`, « bale »; sentence too long |
| 2 | Le résultat est parfois humiliant — la forêt a moins changé qu'on ne l'imagine — | La comparaison invite parfois à l'humilité : la forêt a moins changé qu'on ne l'imagine. | faux ami: « humiliant » is not "humbling" |
| 3 | Elles couvrent Millet, Rousseau, Corot, Díaz de la Peña et d'autres. | On y retrouve notamment Millet, Rousseau, Corot et Diaz de la Peña. | « couvrir » calques "cover"; glossary spelling |

### 6. galerie-39 (location), score 3

FD is in English (865 characters) and the narrative is empty. There is no French text
to quote; the whole item has to be written in French.

### 7. galaxie-des-arts (location), score 3

FD is in English.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Galerie qui a survécu à bien des consœurs de la Grande Rue, Galaxie des Arts occupe une place particulière dans la scène artistique de Barbizon : | Galaxie des Arts a survécu à bien des galeries de la Grande Rue et tient une place à part dans la vie artistique de Barbizon : | English apposition; « scène artistique » calques "art scene" |
| 2 | elle défend la création contemporaine dans un village qui pourrait aisément se reposer sur sa seule réputation du XIXe siècle. | elle défend la création contemporaine dans un village qui pourrait se contenter de son seul prestige du XIXe siècle. | calque of "rest on its reputation" |
| 3 | entretenant l'idée d'un village vivant pour l'art plutôt que d'un musée de l'art. | et fait vivre l'idée d'un village où l'art se crée encore, plutôt que d'un village-musée. | mirrors "living village / museum of art"; trailing participle |

### 8. galerie-atelier-drochon (location), score 3

FD is in English.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Christophe Drochon est peintre animalier professionnel depuis 1994, avec un tournant décisif vers l'hyperréalisme animalier en 1997, après sa découverte de peintres américains comme Robert Bateman. | Christophe Drochon est peintre animalier professionnel depuis 1994. En 1997, la découverte de peintres américains comme Robert Bateman l'oriente de façon décisive vers l'hyperréalisme. | « avec un tournant décisif » calques "with a decisive turn"; see the Bateman question |
| 2 | ses animaux ne sont pas de simples sujets mais, selon ses propres mots, les acteurs symboliques de quelque chose de plus profond — ses espoirs en l'humanité et en l'amour. | ses animaux, dit-il, ne sont pas de simples sujets mais les acteurs symboliques d'un propos plus profond : ses espoirs en l'humanité et en l'amour. | "in his own words", "something deeper" |
| 3 | Son installation à Barbizon, avec un atelier permanent, ajoute une présence créatrice vivante à la Grande Rue. | Son atelier permanent fait vivre la création sur la Grande Rue. | stacked English adjectives |

### 9. muse-galerie (location), score 3

FD has no accents, uses English-style title capitals and ends in verbless fragments.
The narrative is in brochure voice.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Son oeuvre explore les atmospheres des hangars, ports, ateliers et interieurs a travers une palette en gris d'une grande richesse tonale. | Hangars, ports, ateliers, intérieurs : il en restitue l'atmosphère avec une palette de gris d'une grande richesse de tons. | accents; « explore… à travers » calque |
| 2 | Medaille d'or au Salon des Artistes Francais, prix du Ministre de la Defense, prix Grace de Monaco. | Il a reçu la médaille d'or du Salon des artistes français, le prix du ministre de la Défense et le prix Grace de Monaco. | accents; verbless list; English capitals |
| 3 | À Barbizon, village qui a toujours su reconnaître les peintres de la lumière et du quotidien, sa présence permanente au 88 bis Grande Rue est une sorte d'évidence. | Sa présence permanente au 88 bis, Grande Rue, s'inscrit dans l'histoire d'un village attaché aux peintres de la lumière et du quotidien. | brochure voice |

### 10. galerie-frederic-got (location), score 3

FD has no accents and a broken opening-hours line. The narrative leans on English
stock phrases.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Ouvert mercredi au dimanche de 11h a 19h. | Ouverte du mercredi au dimanche, de 11 h à 19 h. | « du » missing, agreement, accent, « 11 h » |
| 2 | un choix qui dit beaucoup de ce que le village représente dans l'imaginaire de l'art français. | un choix qui en dit long sur la place du village dans l'imaginaire de l'art français. | "says a lot about" |
| 3 | Got a imposé une vision résolument contemporaine et internationale, prouvant que Barbizon n'est pas un musée mais un lieu vivant. | Got y a imposé une vision résolument contemporaine et internationale : Barbizon n'est pas un musée, c'est un lieu vivant. | trailing « prouvant que »; brochure kicker |

### 11. the-gleaners (story), score 2

About 14 of 28 sentences. The text never uses « la plaine de Chailly » (glossary).
The subtitle uses « Sur… », carries an unsourced superlative and is 91 characters.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Elle s'étend juste à la sortie du village, entre Barbizon et sa voisine plus grande, Chailly : la même vaste terre agricole que Jean-François Millet a parcourue tant de fois pendant les années où il a vécu ici. | C'est la plaine de Chailly, aux portes du village, entre Barbizon et Chailly, sa voisine plus peuplée : ces terres que Jean-François Millet a tant de fois parcourues durant les années où il a vécu ici. | "its larger neighbour"; glossary |
| 2 | Son argument, si c'en est un, est simplement que ce travail mérite la même échelle qu'une bataille ou un saint. | S'il défend une idée, c'est seulement que ce travail mérite d'être peint à la même échelle qu'une bataille ou un saint. | "his argument, if it is one"; faux ami |
| 3 | Ce qui avait changé, apparemment, c'est l'idée de savoir à qui elle appartenait, et qui méritait d'y être vu. | Ce qui avait changé, semble-t-il, c'était l'idée qu'on se faisait de ses propriétaires, et de ceux qui méritaient d'y figurer. | cleft; "the idea of who" |

### 12. where-to-eat-barbizon (story), score 2

About 15 of 45 sentences: English food-guide copy rendered literally.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | **La Bohème**, voisine de l'atelier de Millet, ce qui est soit un cliché touristique, soit l'un des faits discrètement extraordinaires de Barbizon, selon votre tempérament. | **La Bohème** est voisine de l'atelier de Millet : cliché pour touristes ou petit miracle de Barbizon, chacun en jugera. | "quietly extraordinary"; no main verb |
| 2 | **Le Gaulois** (64 bis Grande Rue) est une tout autre proposition : de la viande sérieuse, du vin sérieux, sans prétention. | **Le Gaulois** (64 bis Grande Rue) joue dans un autre registre : belles viandes, vins choisis, sans chichis. | "serious meat, serious wine" |
| 3 | Une maison qui se prête aux déjeuners qui se prolongent sans qu'on s'en excuse. | Une maison où l'on s'attarde volontiers à table. | "unapologetically long lunches" |

### 13. where-to-stay-barbizon (story), score 2

About 15 of 35 sentences of English hospitality copy. The subtitle is 177 characters.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | **L'Hôtellerie du Bas-Bréau** (22 Grande Rue) occupe l'ancien hôtel Siron, où Robert Louis Stevenson séjourna dans les années 1870 et dont il a écrit. | **L'Hôtellerie du Bas-Bréau** (22 Grande Rue) occupe l'ancien hôtel Siron, où Robert Louis Stevenson séjourna dans les années 1870 et qu'il évoqua dans ses écrits. | « dont il a écrit » ungrammatical; tense mix |
| 2 | Un autre rythme que l'hôtel et, pour les groupes ou les familles, une autre économie. | Un autre rythme qu'à l'hôtel et, pour les groupes ou les familles, un autre budget. | "a different economy" |
| 3 | L'adresse la plus établie de Barbizon, et celle qui a la plus longue histoire à ce niveau. | La plus ancienne grande maison de Barbizon. | calques; two unsourced superlatives (cut if unsourced) |

### 14. how-the-forest-became-a-picture (story), score 2

About 11 of 38 sentences. Corot's studies are called « études en plein air »; the
subtitle carries the banned « invention de la peinture en plein air » (fixed in the
77e02c3f draft).

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Ce qui change, peu à peu, au cours de la première moitié du XIXe siècle, c'est la conviction grandissante que cette construction est une fuite. Que la peinture pourrait plutôt regarder en face la lumière et le temps réels d'un lieu précis, et tenter de les saisir sans détour. | Au cours de la première moitié du XIXe siècle s'impose peu à peu l'idée que cette construction est une fuite, et que la peinture pourrait plutôt affronter la lumière et le temps réels d'un lieu précis pour tenter de les saisir sans détour. | cleft and « Que… » fragment |
| 2 | Il ne s'agit pas du paysage en général, mais de ce lieu-ci, dans ces conditions-ci, à ce moment-ci. | Il ne s'agit pas du paysage en général, mais de tel lieu, dans telles conditions, à tel moment. | triple « -ci » |
| 3 | Pas une école au sens formel : les peintres d'ici ne se sont jamais vraiment accordés sur des principes. Mais un engagement commun envers l'observation. | Non pas une école au sens strict, puisque ces peintres ne se sont jamais vraiment accordés sur des principes, mais un même attachement à l'observation. | « Pas… Mais… »; "commitment to" |

### 15. a-day-in-barbizon (story), score 2

About 9 of 55 sentences. The practical middle is natural; the opening and closing are
not.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Dans un village de cette taille, pousser leur porte fait partie de la façon dont il vit. | Dans un village de cette taille, pousser la porte d'une galerie fait partie de la vie du lieu. | "part of how it lives"; unclear « leur » |
| 2 | Cette forme n'a rien d'un hasard. C'est ce pour quoi le village a été fait. | Cette forme ne doit rien au hasard : c'est autour d'elle que le village s'est fait. | "what the village was made for" (claim to confirm) |
| 3 | Voici une façon de le parcourir. Pas la seule, mais un enchaînement qui donne du sens à ses différentes couches. | Voici un parcours possible, parmi d'autres, dont l'ordre aide à lire les strates successives du village. | « Pas la seule »; « couches » = "layers" |

### 16. inn-paintings-dinner (story), score 2

About 8 of 27 sentences. The subtitle (96) contradicts the body.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | L'auberge est devenue une sorte d'académie par accident : sans programme ni maître, mais fondée sur des préoccupations partagées et une proximité quotidienne, ce qui est sans doute plus utile. | L'auberge est devenue une sorte d'académie par accident : sans programme ni maître, mais nourrie de questions communes et d'une vie partagée au quotidien, ce qui valait sans doute mieux. | "shared concerns"; English tag |
| 2 | C'est, pour un musée, une archive d'une franchise rare : presque rien de ce qui subsiste là n'a été fait pour la postérité, tout est né du quotidien. | Peu de musées conservent des archives d'une telle sincérité : presque rien de ce qui subsiste là n'a été fait pour la postérité, tout est né du quotidien. | "an unusually honest archive" |
| 3 | L'histoire y paraît moins une histoire de l'art qu'une histoire de vie, ce que les peintres de Barbizon, au fond, défendaient aussi dans leur œuvre. | On y lit moins l'histoire de l'art qu'une histoire de vies, ce que les peintres de Barbizon, au fond, défendaient aussi dans leur œuvre. | "life story" (meaning to confirm) |

### 17. maison-de-rousseau (location), score 2

FD is in English. The narrative mixes tenses.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | La maison et la grange attenante, transformée en atelier, furent le centre de son monde pendant vingt ans, jusqu'à sa mort en 1867. | Vingt ans durant, jusqu'à sa mort en 1867, sa vie tient entre la maison et la grange attenante, qu'il transforme en atelier. | "centre of his world" |
| 2 | Vingt-deux ans plus tard, en 1889, la grange fut aménagée en chapelle — son clocher dessiné par Charles-Louis Millet, architecte et deuxième fils de Jean-François Millet — puis agrandie en 1920 et en 1965. | En 1889, vingt-deux ans après sa mort, la grange est aménagée en chapelle ; Charles-Louis Millet, architecte et deuxième fils de Jean-François Millet, en dessine le clocher. Elle est agrandie en 1920, puis en 1965. | English absolute construction |
| 3 | L'ancien atelier s'est ainsi mué en lieu de culte, trajectoire singulière et révélatrice de la manière dont la mémoire de Rousseau a façonné le village après sa disparition. | L'atelier devient ainsi un lieu de culte : curieux destin, qui montre combien la mémoire de Rousseau a marqué le village après sa mort. | abstract apposition; tense |

### 18. plaine-angelus-site-peinture (location), score 2

FD is in English. The narrative is mostly natural.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | cette étrange platitude qui rend le clocher de Chailly à la fois tout proche et inatteignable. | cette plaine étrangement plate, où le clocher de Chailly paraît à la fois tout proche et hors d'atteinte. | « platitude » reads as banality |
| 2 | Mais à la tombée du jour, ici, avec le même clocher sur le même horizon, la chose déborde la biographie. | Mais ici, à la tombée du jour, devant le même clocher sur le même horizon, le tableau dépasse la biographie. | vague « la chose »; « avec » calque |

### 19. maison-diaz (location), score 2

FD is in English. The narrative is natural apart from glossary forms.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Sa maison et son atelier de la Grande Rue gardent son nom après lui. | La maison et l'atelier qu'il occupait sur la Grande Rue ont gardé son nom. | stiff, reads translated |
| 2 | vingt ans plus tard, le peintre Paul Comble achète la maison, la peint, puis rebâtit l'atelier. | (keep until clarified) | « la peint »: painted it, or repainted it? |
| 3 | Díaz, lui, ne revient plus que rarement dans ses dernières années, et meurt à Menton en 1876. | Dans ses dernières années, Diaz ne revient plus guère à Barbizon ; il meurt à Menton en 1876. | glossary spelling; timeline |

### 20. chene-sully (location), score 2

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | La forêt de Fontainebleau donne des noms à ses arbres les plus remarquables, et le Sully compte parmi les plus anciennement célébrés : les guides du XIXe siècle le citaient déjà parmi la poignée d'arbres que tout visiteur devait voir. | En forêt de Fontainebleau, on donne un nom aux arbres remarquables, et le Sully est l'un des plus anciennement célèbres : les guides du XIXe siècle le rangeaient déjà parmi les quelques arbres que tout visiteur se devait d'aller voir. | personification; "must-see" |
| 2 | A-t-il été planté sur son ordre, ou a-t-il simplement reçu son nom en hommage ? On ne le sait pas, mais il le porte depuis des générations. | Fut-il planté sur son ordre, ou baptisé en son honneur ? On l'ignore ; il porte en tout cas ce nom depuis des générations. | tense; illogical « mais » |
| 3 | …en compagnie du chêne Henri IV, qui se dresse à une vingtaine de pas. Il se dresse dans les Gorges d'Apremont, à quelques centaines de mètres de la Caverne des Brigands, dans le massif où… | …à une vingtaine de pas du chêne Henri IV. L'arbre se trouve à quelques centaines de mètres de la Caverne des Brigands, dans ce massif où… | repetition; glossary lower case |

### 21. cercle-laure-henry (location), score 2

FD is in English. The narrative is acceptable.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | retirées de la Société des concerts en 1870, elles achetèrent avec le reliquat qui leur revenait une maisonnette à Barbizon, où elles s'installèrent définitivement. | retirées de la Société des concerts en 1870, elles achetèrent une maisonnette à Barbizon avec le reliquat qui leur revenait, et s'y installèrent définitivement. | heavy word order |
| 2 | L'adresse fonctionna longtemps comme « Bibliothèque pour tous », salle de lecture publique du village. | Le lieu abrita longtemps la « Bibliothèque pour tous », salle de lecture publique du village. | "functioned as" |
| 3 | Le Cercle Laure Henry est aujourd'hui animé par une association de laïcs chrétiens et accueille expositions et rencontres au cœur de la Grande Rue. | Le Cercle Laure Henry est aujourd'hui animé par une association de laïcs chrétiens et accueille, dans la Grande Rue, expositions et rencontres. | « au cœur de » brochure |

### 22. chene-bodmer (location), score 2

FD is in English.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | C'est le moins commenté des peintres de Barbizon, et peut-être le plus singulier : un homme qui avait vu le Missouri et les villages mandans, et qui choisit de consacrer quarante ans aux chênes de Fontainebleau. | De tous les peintres de Barbizon, c'est le moins commenté, et peut-être le plus singulier : lui qui avait vu le Missouri et les villages mandans choisit de consacrer quarante ans aux chênes de Fontainebleau. | English apposition |
| 2 | Ce qui subsiste, ce sont les tableaux — et l'endroit où il se tenait. | Restent les tableaux, et l'endroit où il se dressait. | "What remains is" |
| 3 | le motif est ensuite repris par d'autres, dont Claude Monet, qui le peint en 1865 — sa toile est aujourd'hui au Metropolitan Museum of Art de New York. | le motif est ensuite repris par d'autres, dont Claude Monet, qui le peint en 1865 ; sa toile est aujourd'hui conservée au Metropolitan Museum of Art de New York. | English dash aside |

### 23. galerie-41 (location), score 2

FD is in English.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Le village français a toujours eu besoin d'une salle comme celle-ci : un lieu neutre où un artiste peut accrocher son travail quinze jours sans les charges d'une galerie permanente, | Tout village français a besoin d'une salle comme celle-ci : un lieu neutre où un artiste peut accrocher ses œuvres quinze jours sans supporter les charges d'une galerie permanente, | generic article; "hang their work" |
| 2 | L'adresse la place à deux portes du Cercle Laure Henry, qui fonctionne sur une logique voisine sous une autre gestion. | Le Cercle Laure Henry, géré par d'autres mais sur un principe voisin, se trouve deux maisons plus loin. | "two doors from" |
| 3 | À eux deux, les 41 et 43 Grande Rue forment un discret corridor d'art contemporain en accès libre, | À eux deux, le 41 et le 43 Grande Rue forment un discret petit pôle d'art contemporain en accès libre, | « corridor » |

### 24. galerie-alfart-lbk (location), score 2

FD is in English.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | perpétuant une tradition que le village entretient depuis près de deux siècles : des artistes qui arrivent, restent, et font du lieu le leur. | et renoue avec une tradition vieille de près de deux siècles : des artistes qui arrivent, restent et finissent par faire du village leur maison. | "make the place their own" |
| 2 | relève d'un tout autre registre que celui des paysagistes du XIXe siècle qui ont fait la renommée de Barbizon, mais l'élan est le même. | n'a rien à voir avec celle des paysagistes du XIXe siècle qui ont fait la renommée de Barbizon ; l'élan, pourtant, est le même. | English « mais » pivot |
| 3 | est l'un des rares espaces du village consacrés à des artistes contemporains vivants plutôt qu'au canon historique. | est l'un des rares lieux du village consacrés à des artistes d'aujourd'hui plutôt qu'aux maîtres du passé. | "historical canon" |

### 25. galerie-roz-in-winter (location), score 2

FD has no accents and uses `--`.

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | elle propose une nouvelle exposition mensuelle avec une dizaine d'artistes aux horizons varies -- peintres, sculpteurs, photographes. | elle présente chaque mois une nouvelle exposition réunissant une dizaine d'artistes d'horizons variés : peintres, sculpteurs, photographes. | accents, `--`, calque |
| 2 | Trois salles d'exposition, des vernissages conviviaux ouverts a tous, et plus de 200 artistes exposes depuis sa creation. | La galerie compte trois salles ; ses vernissages sont ouverts à tous, et plus de 200 artistes y ont exposé depuis sa création. | verbless brochure list |
| 3 | dans la tradition d'un village qui a toujours été un lieu de passage et d'expérimentation pour les artistes en quête d'un regard neuf. | Barbizon a toujours été, pour les artistes en quête d'un regard neuf, un lieu de passage et d'expérimentation. | brochure tag |

### 26. ferme-du-couvent (location), score 2

FD has no accents, uses `--` and « no.7 », and writes « Les Glaneuses » and « rue
principale ».

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | La Plaine de l'Angelus est le paysage agricole qui s'etend a l'ouest de Barbizon, au-dela de la rue principale, vers Chailly-en-Biere. | La plaine de l'Angélus est l'étendue agricole qui s'ouvre à l'ouest de Barbizon, au-delà de la Grande Rue, vers Chailly-en-Bière. | accents; glossary |
| 2 | C'est ici, dans ces champs plats et lumineux, que Jean-Francois Millet peignit ses oeuvres les plus celebres -- L'Angelus (1857-1859), Les Glaneuses (1857), Le Semeur. | C'est dans ces champs plats et lumineux que Jean-François Millet peignit ses œuvres les plus célèbres : L'Angélus (1857-1859), Des glaneuses (1857), Le Semeur. | accents, `--`, glossary title |
| 3 | La mosaique no.7 du Parcours des Peintres (L'Angelus de Millet) est situee ici, a l'endroit meme ou Millet installa son chevalet. | La mosaïque n° 7 du Parcours des Peintres (L'Angélus de Millet) se trouve ici, à l'endroit même où Millet installa son chevalet. | accents; « n° 7 » |

### 27. l-ombrage (location), score 2

| # | Original | Proposed rewrite | Reason |
|---|---|---|---|
| 1 | Une maison de rue tranquille, et derrière ses murs, au XXe siècle, deux des grands pianistes de leur temps au travail. | Rien ne distingue cette paisible maison de ville ; c'est pourtant derrière ses murs qu'au XXe siècle deux des grands pianistes de leur temps travaillaient. | « maison de rue »; verbless English sentence |

### 28 to 46: score 1

One line each: the single worst sentence and its rewrite. Full editor notes for these
items are available on request; none needs more than a light pass.

| Item | Original | Proposed rewrite | Reason |
|---|---|---|---|
| how-the-forest-was-saved (story) | Mais à la fin des années 1850, les tableaux de forêt commencent à se vendre, et les collectionneurs qui les achètent ont l'oreille des bonnes personnes. | … et les collectionneurs qui les achètent ont leurs entrées là où il faut. | "the ear of the right people" |
| how-the-forest-was-saved | La forêt n'a pas beaucoup changé. C'est précisément tout l'enjeu. | La forêt a peu changé, et c'était bien là le but. | "that's precisely the point" |
| how-the-forest-was-saved | Il meurt à Barbizon en décembre 1867, bien avant que l'idée ne fasse son chemin, en France puis bien au-delà, jusqu'à tout l'édifice du droit de la protection de la nature qui couvre aujourd'hui une part considérable de la planète. | Il meurt à Barbizon en décembre 1867, bien avant que l'idée ne fasse son chemin, en France puis au-delà, jusqu'à l'édifice juridique qui protège aujourd'hui une part considérable de la planète. | chain of « de » |
| paths-to-the-forest (story) | Ils portaient des chevalets pliants et des boîtes de couleurs en bois, les outils de la peinture en plein air, encore assez nouveaux, … une clairière d'une certaine qualité de lumière, … | Ils emportaient chevalets pliants et boîtes de couleurs en bois, outils encore assez nouveaux de la peinture sur le motif, … une clairière pour la qualité de sa lumière, … | « sur le motif »; "a certain quality of light" |
| paths-to-the-forest | Les rochers sont les mêmes rochers. | Les rochers, eux, n'ont pas bougé. | English repetition |
| paths-to-the-forest | Le village s'arrête très nettement. | Le village s'arrête net. | "very sharply" |
| the-house-of-the-crime (story) | Au matin du 6 septembre 1893, … rouvre sous un nom emprunté à Rousseau : l'Hôtel des Charmettes. (subtitle) | Le 6 septembre 1893, un vieux peintre suisse est retrouvé mort chez lui, Grande Rue. Trois ans plus tard, sa maison devient l'Hôtel des Charmettes. | 205 characters; « rouvre »; which Rousseau |
| the-house-of-the-crime | Un artisan de Fontainebleau, Jean Lacampagne, est venu chez le peintre pour des travaux de plomberie. | … vient chez le peintre … | stray passé composé |
| the-house-of-the-crime | Prévenu par son fils, Lacampagne accourt … | Prévenu par son propre fils, … | ambiguous « son » (confirm whose son) |
| maison-charles-jacque | Charles Jacque arrive à Barbizon en 1849 avec Jean-François Millet, quand le choléra fait fuir Paris. | … quand le choléra pousse les Parisiens à quitter la ville. | reads as "makes Paris flee" |
| chapelle-barbizon | Le bâtiment qui commença comme grange, devint atelier, puis lieu de prière, est l'une des histoires les plus discrètes du village. | Grange, puis atelier, puis lieu de prière : l'histoire de ce bâtiment est l'une des plus discrètes du village. | "began as" |
| auberge-ganne | Ils ne pouvaient pas savoir que ce simple arrangement ferait de leur maison l'un des lieux fondateurs de la peinture française moderne. | Rien ne laissait prévoir que cet arrangement ordinaire ferait de leur maison l'un des lieux fondateurs de la peinture française moderne. | "they could not have known" |
| besharat-gallery-barbizon | Le peintre suisse Karl Bodmer, célèbre pour ses images de l'Ouest américain, acquiert ensuite la propriété, en 1856. | En 1856, la propriété passe au peintre suisse Karl Bodmer, célèbre pour ses vues de l'Ouest américain. | « ensuite » after 1872 and 1874 |
| caverne-des-brigands | il donna à la forêt une géographie narrative, … | il dota la forêt de tout un répertoire de récits, … | "narrative geography" |
| coz-ker | Deux noms que tout sépare se retrouvent ainsi sous un même toit, … | Deux noms que tout sépare se succèdent ainsi sous le même toit, … | implies they lived there together |
| atelier-daubigny-plaque | … c'est lui qui l'engage à passer une partie de l'année à Auvers, et il peindra des panneaux pour l'entrée de sa maison. | … c'est Corot qui l'engage à passer une partie de l'année à Auvers, et qui peindra des panneaux pour l'entrée de sa maison. | ambiguous pronouns (confirm) |
| galerie-langelus | … ce qui fait de cette famille la présence la plus discrètement décisive de la Grande Rue. | … : peu de familles comptent autant, et aussi discrètement, dans la vie de la Grande Rue. | unsourced superlative; "most quietly decisive" |
| manoir-saint-herem | une pension de famille tenue par une ancienne famille de Barbizon, qui hébergea entre autres Pablo Picasso et sa famille. | une pension de famille tenue par une vieille famille de Barbizon ; Pablo Picasso y séjourna notamment avec les siens. | « ancienne » ambiguous; « famille » three times |
| monument-farman | La plaine de l'Angélus a toujours attiré ceux qui voyaient une promesse dans l'espace ouvert : | … ceux pour qui ce grand espace dégagé était une promesse : | "open space"; name needs « Frères » |
| la-poste-barbizon | … en 1967, il était élu plus joli bureau de poste de France : une distinction qui en dit autant sur le bâtiment que sur le village. | En 1967, vingt ans plus tard, il a été élu plus joli bureau de poste de France, une distinction qui vaut pour le bâtiment autant que pour le village. | imparfait for a one-off event; "says as much about" |
| cimetiere-barbizon | Un lieu modeste et paisible, et un rappel utile : l'histoire de Barbizon déborde largement de ses limites communales. | Lieu modeste et paisible, il rappelle que l'histoire de Barbizon déborde largement ses limites communales. | "a useful reminder" |
| mairie-barbizon | presque chaque maison de la Grande Rue est passée, … | presque toutes les maisons de la Grande Rue sont passées, … | "almost every" |
| tumble-inn | et toute la société parisienne et américaine. | et le Tout-Paris comme la bonne société américaine. | "all of Parisian and American society" |
| villa-bernard | … la villa Bernard fut un lieu de rencontre où se croisèrent … Propriété du docteur Giroux, elle accueillit Jean Cocteau dans les années 1930. | … la villa Bernard appartenait au docteur Giroux. Jean Cocteau y séjourna dans les années 1930, et l'on y croisa … | redundancy (check that the timing is sourced) |
| villa-elisabeth | Au 30 Grande Rue, en face de l'atelier de Millet, | Au 30, Grande Rue, en face de l'atelier de Millet, | address typography |

## Next step

A rewrite programme for every item scored 2 or 3 is filed as a task ("Rewrite
programme: stories and locations scored 2-3 in the translationese audit"). It runs
in correction mode: language only, facts frozen. Suggested order: the 13 English
`full_description` rows and the 5 accentless ones first (French readers currently
get English or broken text), then the stories, then the other score-2 locations.
The fact flags above are triaged separately and never hold a correction back.
