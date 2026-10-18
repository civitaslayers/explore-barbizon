---
name: barbizon-writing
description: Write, translate, adapt or review any visitor-facing text for ExploreBarbizon (locations, stories, tours, stops, routes, location functions, subtitles, meta descriptions, UI strings) in French, English or any future locale. Use before drafting copy, before writing translations JSON, and before approving content SQL.
---

# Barbizon writing

French is written natively, other languages are adapted from it, and nothing is
translated sentence by sentence. This skill is the workflow; the rules live in
the repo so every session and agent reads the same ones.

## Before you write

Read, in full:
1. `docs/content/writing-guide.md` (voice, calques, typography, field lengths, workflow)
2. `docs/content/glossary.md` (exact forms for names, places, works)

## Pick the mode first

- **Correction** (default for anything already on the site, including
  translation fixes): facts are frozen. Copy every name, label, number, hour,
  price, phone and claim exactly from the current row. Change only the
  language. Add nothing for parity. Ask Luigi no fact questions and start no
  research. Anything that looks factually wrong goes in a "Fact flags" list in
  the report and stays untouched in the text. Never move wording or details
  between records, even two businesses at one address.
- **Writing** (new pages, new fields, rewrites Luigi explicitly asks for): the
  full workflow below.

## Correction workflow

1. Read the current FR and EN of the record (and only that record).
2. French native edit with `civitas-native-editor` in correction mode.
3. English: adapt from the corrected French, keeping exactly the same content.
4. English native edit, correction mode.
5. Check against the current row: every name, label, number and claim
   unchanged. Any drift is undone.
6. Write as draft SQL, show Luigi FR and EN side by side with the fact flags
   listed apart.

## Writing workflow

1. **Outline the facts.** List each claim with its source (`research_findings`
   id or document, Tier). Drop anything unsourced.
2. **Draft the French from the outline.** Do not open an existing English text
   while drafting. Use Opus or Fable for prose.
3. **French native edit.** Delegate to the `civitas-native-editor` agent with the
   French text only (no outline, no other language). Apply its edits or explain
   why not.
4. **Adapt to English** from the edited French: read it, close it, write. Same
   facts, English sentences, British spelling, place names in French.
5. **English native edit** with `civitas-native-editor`, English only.
6. **Fact parity check.** Put both versions side by side and list every claim,
   name, date and number. Any mismatch is fixed before going on.
7. **Write as draft.** SQL stamps `translations.<locale>._meta {source_hash,
   translated_at, status: 'draft'}` in the same statement, hash from
   `v_translation_health`. Updates to published rows are shown to Luigi, never
   run (content-ops gate).
8. **Human read in context.** Give Luigi a side-by-side FR / EN view of the text
   as it renders (title, subtitle, body). Only his approval sets `published`.

## Reviewing existing text

For an audit, run step 3 and step 5 on the published text and score each item:
- 0 natural, 1 a few calques, 2 reads translated, 3 rewrite.
Report the score, the worst three sentences and a proposed rewrite for each.
Never write to the database during an audit.

## New locales

Do not draft a new locale (it, zh, ja) until `docs/content/glossary.md` has its
column checked and `docs/content/writing-guide.md` has a section for it with a
named native reviewer.
