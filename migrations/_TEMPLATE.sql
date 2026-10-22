-- ============================================================================
-- MIGRATION TEMPLATE. Do not apply this file. Copy it to
-- migrations/<verb>_<table>.sql and replace every <table>; the placeholders
-- make this file fail if run as-is.
--
-- Rule: docs/schema-reference.md, "Migration rule: explicit grants on every
-- new public table" (decided 2026-10-20). From 2026-10-30 Supabase no longer
-- grants anon, authenticated or service_role on new public tables. Every
-- CREATE TABLE in public is followed, in the same migration, by: RLS on, a
-- revoke, explicit grants, and policies matching the grants.
-- Keep exactly ONE of block A or block B; remove the other.
-- ============================================================================

create table if not exists public.<table> (
  id          uuid primary key default gen_random_uuid(),  -- house style; a uuid key needs no sequence grant
  created_at  timestamptz not null default now()
);

alter table public.<table> enable row level security;

-- Start from no Data API access, so this migration means the same thing
-- before and after 2026-10-30.
revoke all on table public.<table> from anon, authenticated, service_role;

-- ---- Block A: public-read table --------------------------------------------
grant select on table public.<table> to anon, authenticated;
grant select, insert, update, delete on table public.<table> to service_role;

create policy "Public read <table>"
  on public.<table>
  for select
  to anon, authenticated
  using (true);  -- or (is_published = true) when the table has a publish flag

-- ---- Block B: internal table (logs, analytics, ops) ------------------------
-- No anon or authenticated grant; service_role only, like page_views.
-- RLS on with no policy denies anon and authenticated; service_role bypasses RLS.
grant select, insert, update, delete on table public.<table> to service_role;

-- ---- Only if a column is serial or bigserial (avoid; use uuid) -------------
-- grant usage, select on sequence public.<table>_id_seq to service_role;
