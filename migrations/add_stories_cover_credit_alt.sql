-- Task 46b54e68 (2026-10-05): story cover images.
-- Approved by Luigi 2026-10-05 (see tasks.description for task 46b54e68).
--
-- cover_credit: artist/museum attribution caption for painting covers
--   ("Artist, Title, date. Museum. Domaine public."), null for own-photo
--   covers (no credit needed for site photography).
-- cover_alt: accessibility alt text for the cover image, always present.
--
-- FR lives in these base columns (canonical). EN lives in
-- translations.en.{cover_credit,cover_alt}, gated by the same
-- _meta.status === 'published' predicate as every other translated field
-- (see lib/getLocalized.ts, docs/schema-reference.md "Internationalization").
-- These two fields are NOT covered by v_translation_health's stories
-- source_hash (md5(title|subtitle|body) only) — cover metadata staleness is
-- intentionally untracked by that view, same as today for every other table.

alter table stories
  add column if not exists cover_credit text,
  add column if not exists cover_alt text;
