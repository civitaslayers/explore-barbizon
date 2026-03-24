-- Migration: add show_in_editorial to locations
-- Adds per-location editorial visibility flag (distinct from categories.show_in_editorial).
-- Default false = opt-in. Existing published locations are backfilled to true
-- so current editorial listings are unaffected by this migration.

alter table locations
  add column if not exists show_in_editorial boolean not null default false;

-- Preserve current behaviour: all published locations remain editorially visible.
update locations
  set show_in_editorial = true
  where is_published = true;
