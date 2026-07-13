-- ============================================================================
-- PROPOSAL — human-gated. Run manually. Recommended before heavy hours
-- editing, but NOT required for correctness — the OpeningHoursEditor and the
-- public renderer both display-normalize legacy keys, so the app is correct
-- pre- or post-migration.
--
-- Source: docs/ccc-v3-fiche-plan.md §3.4 (gate decision, 2026-07-12);
-- docs/ccc-v3-phase2-implementation-plan.md item 14.
--
-- Scope: 16 rows currently have non-null `opening_hours`. Of those, only the
-- rows containing full-word English day keys (monday…sunday) actually need a
-- key rename; rows already using 3-letter keys, or using only non-day keys,
-- are left untouched by the WHERE clause (idempotent by construction, not
-- just "safe to re-run because nothing changes").
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BEFORE (captured <no live date — leave a placeholder for the human to
-- timestamp at run>) — full dump of all 16 rows with non-null opening_hours,
-- via: SELECT id, slug, opening_hours FROM public.locations
--      WHERE opening_hours IS NOT NULL ORDER BY slug;
-- This is the rollback reference — to revert, re-apply these exact values by
-- id.
--
-- id                                    | slug                     | opening_hours
-- --------------------------------------+--------------------------+------------------------------------------------------------------
-- 1c717c95-d36b-408c-baf7-af773c010401  | arte-milenario           | {"default":"Ven–Dim 11h–13h / 14h30–19h"}
-- f6bf5304-50e3-4f0f-bba3-4168f9e45554  | bobo-club                | {"fri":"from 23:00","mon":"closed","sat":"from 23:00","sun":"closed","thu":"closed","tue":"closed","wed":"closed","eve_of_holidays":"from 23:00"}
-- fd9758b4-b6b6-4a3c-b10f-80ca8b6a8679  | chalet-de-la-caverne     | {"fri":"10:00-19:00","mon":"10:00-19:00","sat":"10:00-19:00","sun":"10:00-19:00","thu":"10:00-19:00","tue":"10:00-19:00","wed":"10:00-19:00"}
-- 2f6b28aa-c8c3-46f9-857c-a61172684046  | cottage-barbizonnais     | {"check_in":"flexible","check_out":"flexible"}
-- 8f92ae7f-73e1-4543-9a4a-73751dd4d39f  | epicerie-de-barbizon     | {"friday":{"open":"10:00","close":"13:00","open2":"15:00","close2":"20:00"},"monday":{...},"sunday":{...},"tuesday":{...},"saturday":{...},"thursday":{...},"wednesday":{...}}
-- 81c14a4d-3b6a-488b-bf4f-a76caab67bc5  | galaxie-des-arts         | {"fri":"11:00-12:30, 14:30-18:30","mon":"closed","sat":"11:00-12:30, 14:30-18:30","sun":"11:00-12:30, 14:30-18:30","thu":"11:00-12:30, 14:30-18:30","tue":"closed","wed":"11:00-12:30, 14:30-18:30"}
-- 770cd6dc-344a-44c2-bf7d-8b7f8fc78132  | galerie-alfart-lbk       | {"fri":"09:00-18:00","mon":"09:00-12:00","sat":"09:00-18:00","sun":"09:00-18:00","thu":"closed","tue":"closed","wed":"closed"}
-- 14270f1c-2794-4589-8720-416fc92e9712  | galerie-des-pains        | {"friday":{"open":"06:30","close":"20:00"},"monday":{"open":"06:30","close":"20:00"},"sunday":{"open":"06:30","close":"20:00"},"tuesday":{"open":"06:30","close":"20:00"},"saturday":{"open":"06:30","close":"20:00"},"thursday":{"open":"06:30","close":"20:00"},"wednesday":{"closed":true}}
-- dc0094eb-f893-4167-bed1-f369cdb3907e  | galerie-frederic-got     | {"default":"Tous les jours 11h–19h"}
-- e4cfe555-2f6e-403e-bc63-77abe9445080  | la-boheme                | {"friday":"12:00-14:00, 19:30-22:00","monday":"closed","sunday":"12:00-14:30","tuesday":"12:00-14:00, 19:00-22:00","saturday":"12:00-14:00, 19:30-22:00","thursday":"18:00-22:00","wednesday":"12:00-14:00, 19:00-22:00"}
-- 1ea8515b-16ba-4ebd-a1f4-336c9eb507f6  | la-juxtaposition         | {"default":"Mer–Dim 11h30–19h"}
-- c5e34e35-eb7b-49b5-8c70-156a7e9fc8ef  | le-relais-barbizon       | {"fri":"12:00-13:15, 19:30-20:45","mon":"12:00-13:15, 19:30-20:45","sat":"12:00-13:15, 19:30-20:45","sun":"12:00-13:15, 19:30-20:45","thu":"12:00-13:15, 19:30-20:45","tue":"closed","wed":"closed"}
-- d48846c4-c7a8-4968-bdfe-37f9c4587250  | maison-morin             | {"fri":"08h15–13h / 14h30–19h30","mon":"08h15–13h / 14h30–19h30","sat":"08h15–13h / 14h30–19h30","sun":"08h15–13h30","thu":"08h15–13h / 14h30–19h30","tue":"fermé","wed":"fermé"}
-- 23e23bab-8723-4dce-ac1c-6f55373b60b1  | muse-galerie             | {"friday":{"open":"14:00","close":"18:00"},"sunday":{"open":"13:00","close":"19:00"},"tuesday":{"open":"14:00","close":"18:00"},"saturday":{"open":"13:00","close":"19:00"},"thursday":{"open":"14:00","close":"18:00"}}  -- NB: only 5 of 7 days present (no monday/wednesday key at all)
-- f489227d-d70d-49eb-af14-10bbd7e1d8c7  | o-bout                   | {"fri":"12:00-14:00, 19:00-21:30","mon":"12:00-14:00, 19:00-21:30","sat":"12:00-15:00, 19:00-22:00","sun":"12:00-15:00, 19:00-22:00","thu":"12:00-14:00, 19:00-21:30","tue":"closed","wed":"closed"}
-- 1901eb6c-e192-43a9-a417-f81985b991cc  | ptit-angelus             | {"check_in":"17:00-19:00","check_out":"by 12:00"}
--
-- DISCREPANCIES FOUND — flagged, not silently fixed by this migration:
--
-- 1. Object-shaped values. `epicerie-de-barbizon`, `galerie-des-pains`, and
--    `muse-galerie` store their full-word day keys with OBJECT values
--    (e.g. {"open":"10:00","close":"13:00"} or {"closed":true}), not plain
--    strings. The fiche-plan's stored-shape spec (§3.4) documents
--    `Record<string,string>` — a flat string map. This migration renames ONLY
--    the top-level keys and leaves every value byte-for-byte as-is (per the
--    task's non-negotiable "never drop a value"), so these three rows will
--    still hold nested-object values after the rename — just under `mon`…`sun`
--    keys instead of `monday`…`sunday`. Reshaping those values into strings is
--    OUT OF SCOPE here (would require inventing a display convention for
--    "open/close/open2/close2" and is a content decision, not a key-rename) —
--    flagged for Luigi/architect follow-up, not silently normalized.
-- 2. `eve_of_holidays` (on `bobo-club`) is a non-day key that is NOT in the
--    fiche-plan's named preserve-list (`check_in`, `check_out`, `default`).
--    Per the general "any key outside mon…sun is preserved unchanged" rule
--    (fiche-plan §3.4, the OpeningHoursEditor's "Autres entrées" safety
--    valve), this migration leaves it untouched — but the post-migration
--    verification SELECT below will surface it as a key outside the
--    documented {mon..sun, check_in, check_out, default} closed set. That is
--    expected and correct, not a bug in this migration.
-- ----------------------------------------------------------------------------

begin;

-- Idempotent key-rename. Only rows that actually contain a full-word day key
-- are touched (the `?|` existence check) — rows already using 3-letter keys,
-- or using only non-day keys (default / check_in / check_out /
-- eve_of_holidays), are excluded and never rewritten. Re-running this
-- statement after a successful run is a no-op: once `monday`..`sunday` are
-- gone, `?|` is false and the WHERE excludes the row.
--
-- Transform: jsonb_each() unnests the object to (key, value) pairs;
-- jsonb_object_agg() rebuilds it, renaming exactly the 7 known full-word day
-- keys to their 3-letter canonical form via CASE and passing every other key
-- (3-letter day keys already canonical, check_in/check_out/default,
-- eve_of_holidays, or any future unknown key) through UNCHANGED — key AND
-- value. No value is ever reshaped, dropped, or defaulted.
update public.locations
set opening_hours = (
  select jsonb_object_agg(
    case lower(kv.key)
      when 'monday'    then 'mon'
      when 'tuesday'   then 'tue'
      when 'wednesday' then 'wed'
      when 'thursday'  then 'thu'
      when 'friday'    then 'fri'
      when 'saturday'  then 'sat'
      when 'sunday'    then 'sun'
      else kv.key
    end,
    kv.value
  )
  from jsonb_each(opening_hours) as kv(key, value)
)
where opening_hours is not null
  and opening_hours ?| array['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

commit;

-- ----------------------------------------------------------------------------
-- VERIFICATION (run by hand after the UPDATE) — confirm every key across all
-- rows with non-null opening_hours is now within the closed set below. Per
-- discrepancy #2 above, `eve_of_holidays` is EXPECTED to still appear — it is
-- a legitimate non-day key this migration was told to preserve, just not one
-- named in the fiche-plan's original three-key list.
--
-- SELECT DISTINCT jsonb_object_keys(opening_hours) AS key
-- FROM public.locations
-- WHERE opening_hours IS NOT NULL
-- ORDER BY key;
-- -- expected (closed set, modulo the eve_of_holidays caveat above):
-- -- {mon, tue, wed, thu, fri, sat, sun, check_in, check_out, default}
--
-- Row-count sanity check — should still be 16 (this migration never adds or
-- removes rows, only rewrites the opening_hours value in place):
--
-- SELECT count(*) FROM public.locations WHERE opening_hours IS NOT NULL;
-- ----------------------------------------------------------------------------
