# Writing and translation guide

Last updated: 2026-10-18. Owner: Luigi. Applies to every visitor-facing text on
explorebarbizon.com: locations, stories, tours, tour stops, routes, location
functions, categories, UI strings, meta titles and descriptions.

Read this before drafting, translating or reviewing any copy. The glossary that
goes with it is `docs/content/glossary.md`. The workflow is packaged as the
`barbizon-writing` skill (`.claude/skills/barbizon-writing/SKILL.md`).

## Why this exists

The project decided on 2026-08 that French is the canonical language and is
written natively (`brain/decisions.md`, "French base content is written
natively"). In practice most stories were composed in English and rendered into
French almost word for word. The French reads as a translation:

| Published (translated) | What a French writer would say |
|---|---|
| Des pièces de lumière dans un village de forêt | Des pièces baignées de lumière dans un village forestier |
| Sur les intérieurs discrets et les ateliers de fortune qui ont façonné la manière de voir de Barbizon. | Sur les intérieurs paisibles et les ateliers improvisés qui ont façonné la manière de voir à Barbizon. |

Better models do not fix this on their own. The fix is the order of work:
facts first, then each language written as a language, then a native read.

## Two modes: correction and writing

Most work on existing pages is **correction**: the facts are already settled and
published, only the language is wrong. New pages and rewrites are **writing**.
Pick the mode before starting and say which one in the task or PR.

### Correction mode (default for any text already on the site)

The goal is French and English that read as written by a native, with nothing
else changed.

- **Facts are frozen.** Every name, label, trade name, address, date, number,
  price, opening hour, phone number and claim is copied exactly from the
  current row. The source of truth is what is published, plus
  `brain/decisions.md` and Luigi's settled place facts.
- **Language only.** Fix calques, grammar, register, typography and word order.
  Rephrase a sentence, never its content.
- **Nothing added for parity.** If FR and EN carry different details, do not add
  a detail to one language to match the other. List the difference as a fact
  flag.
- **No new questions to Luigi about facts.** Correction never asks whether a
  name is registered, a claim is sourced or a detail is true. It also never
  starts research.
- **Fact flags do not block.** If a fact looks wrong or inconsistent (for
  example L'Angélus at the Louvre instead of the musée d'Orsay), record it in a
  separate "Fact flags" list in the report with the field and the quote. Leave
  the text as it is. Luigi triages those flags later as their own tasks.
- **One record at a time.** Never carry wording, details or facts from one place,
  business or field into another. Two businesses at the same address stay two
  separate texts.
- **Keep length and structure.** Same number of sentences give or take one, same
  field, same order of information unless word order alone requires a change.
- **Text in the wrong language.** If a French field holds English, rewrite it in
  French with exactly the same content. This is still correction.

### Writing mode (new pages, new fields, rewrites Luigi asks for)

Follow the full rule and workflow below.

## The rule (writing mode)

1. **Never translate sentence by sentence.** Each language is written from the
   fact outline. The other language may be consulted for facts only, never as a
   sentence model. When adapting, close the source text before writing.
2. **French first.** French is drafted natively from the outline. English is an
   adaptation of the French: same facts, its own sentences.
3. **Same facts in every language.** No language adds, drops or softens a claim,
   a date or a number. Style may differ; content may not.
4. **Every claim is sourced** (Tier rules in CLAUDE.md and project instructions):
   no approximate GPS, no placeholder addresses, no unverified history.
5. **A native read before publishing.** Nothing goes to
   `_meta.status = 'published'` until a native reader has read it in context
   (see Review below).

## Voice (all languages)

- An informed neighbour, not a brochure. Concrete, calm, precise.
- Specific over general: a date, a street, a painting, a name.
- No superlatives without a source ("le plus beau", "unique au monde").
- No tourist clichés: "niché", "havre de paix", "incontournable", "hidden gem",
  "nestled", "must-see", "step back in time".
- First person is allowed in essays (`narrative`, stories), never in practical
  fields.

## French

### Register

Essai littéraire léger, comme un bon catalogue d'exposition ou un article du
*Monde des livres*: phrases nettes, vocabulaire juste, pas de jargon. On écrit
pour des Français qui lisent sur leur propre patrimoine.

### Calques to avoid (traduit de l'anglais)

| À éviter | Préférer | Pourquoi |
|---|---|---|
| des pièces de lumière | des pièces baignées de lumière | « of light » ne se calque pas |
| un village de forêt | un village forestier, un village en lisière de forêt | complément de nom anglais |
| la manière de voir de Barbizon | la manière de voir à Barbizon, le regard des peintres de Barbizon | génitif anglais |
| C'est la logique qui a façonné… | Toute la logique de Barbizon tient là : … | phrase clivée anglaise |
| ateliers de fortune (pour « improvised studios ») | ateliers improvisés | sens différent |
| faire sens | avoir du sens | anglicisme |
| réaliser que | se rendre compte que | anglicisme |
| opportunité | occasion | anglicisme |
| éventuellement (= finalement) | finalement, à terme | faux ami |
| définitivement (= certainement) | sans aucun doute | faux ami |
| supporter (= soutenir) | soutenir | faux ami |
| adresser un problème | traiter, aborder | anglicisme |
| basé à | installé à, établi à | anglicisme |
| en charge de | chargé de, responsable de | anglicisme |
| digital | numérique | anglicisme |
| peindre en plein air (pour l'École de Barbizon) | peindre sur le motif | terme d'histoire de l'art |

Also watch for: chains of « de … de … », adjectives piled before the noun,
passive voice where French uses « on », and every sentence starting with the
subject.

### Typography

- Guillemets français « » with a non-breaking space inside (U+00A0 or U+202F).
- Non-breaking space before ; : ! ?
- Capitalise only the first word of a title: « Comment la forêt devint un tableau ».
- École de Barbizon, la Grande Rue, la forêt de Fontainebleau.
- Centuries: XIXe siècle. Dates: 6 septembre 1893. Numbers: 1 000.
- Keep the apostrophe convention already stored in the database (straight ')
  unless a site-wide change is decided.
- Tense in history: passé simple or présent de narration, consistently within a
  text. Never mix with passé composé in the same narrative.

## English

- British spelling (recognise, colour, centre), as already published.
- Place names stay French: Grande Rue, Auberge Ganne, Plaine de l'Angélus,
  Gorges d'Apremont. Give a short English gloss the first time if needed.
- Paintings use their established English titles (The Gleaners, The Angelus).
- Adapt French syntax: split long French sentences, prefer active verbs, drop
  French connectors that read heavy in English (« ainsi », « en effet »).
- No Americanisms in a British text (fall, neighborhood).

## Future languages (Italian, Mandarin, Japanese)

- A locale is not added until it has: a glossary column filled and checked, a
  named native reviewer, and this section extended for it.
- **Italian**: Luigi reviews. Same rules as English: adapt from French.
- **Mandarin (zh-Hans)**: simplified characters, full-width punctuation, works in
  《 》. Names follow the glossary exactly; established art-history forms
  (米勒, 柯罗, 巴比松画派) over fresh transliterations. Every zh text needs a native
  reader before `published`; Claude drafts only. Meta length is set when the zh
  locale is scoped.

## Field lengths

| Field | Rule |
|---|---|
| `short_description` | one sentence, at most 20 words, present tense |
| story `subtitle` / meta description | 110 to 160 characters (FR and EN measured separately) |
| `full_description` | 2 to 4 paragraphs |
| `stop_narrative` | 1 to 3 paragraphs |

The story subtitle is also the meta description and renders under the title.

## Workflow (writing mode)

In correction mode, skip step 1 and the fact parity check of step 6 becomes a
check that nothing changed: every name, number and claim matches the current row.


1. **Outline**: list the claims with their sources (`research_findings` ids,
   Tier). Nothing unsourced goes in.
2. **French draft**, written natively from the outline. Use the strongest model
   available for prose (Opus or Fable), not Sonnet.
3. **French native edit**: the `civitas-native-editor` agent reads the French
   alone, without the outline or any other language, and returns edits.
4. **English adaptation** from the edited French, with the French closed after a
   first read. Length within about 15% of the French.
5. **English native edit**: `civitas-native-editor` on the English alone.
6. **Fact parity check**: same claims, names, dates and numbers in both. Any
   difference is a defect.
7. **Human read in context**: Luigi reads FR (and IT) as rendered, side by side
   with EN. zh needs its named reviewer.
8. **Write**: stamp `_meta {source_hash, translated_at, status}` in the same
   statement (decision 2026-10-04). `status = 'draft'` until step 7 is done.

## Review checklist (for editors and for Luigi)

- [ ] Would a native reader guess this was translated? If yes, rewrite.
- [ ] No item from the calque list.
- [ ] Glossary terms used exactly.
- [ ] Same facts in every language; no added or lost claim.
- [ ] Typography per language.
- [ ] Length within the field rule.
- [ ] Writing mode: no unsourced superlative or historical claim.
- [ ] Correction mode: every name, label, number and claim identical to the current row; fact doubts listed as flags, not edited.
