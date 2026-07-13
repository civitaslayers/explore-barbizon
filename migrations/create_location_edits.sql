-- ============================================================================
-- PROPOSAL — human-gated. Run manually via the direct-migration path (no dev
-- branch on free-tier Supabase). Not auto-executed by any agent.
--
-- Ordering note: the app's audit insert (pages/api/locations/[id].ts) degrades
-- gracefully if this table is absent — the insert is wrapped in try/catch and
-- a missing-relation error never fails the committed write (see
-- docs/ccc-v3-phase2-implementation-plan.md §3.5). So running this migration
-- before or after the corresponding code deploy is NOT load-bearing; it is
-- safe to run at any time relative to the implementer's ship.
--
-- Source: docs/ccc-v3-fiche-plan.md §3.9 (verbatim DDL), confirmed at the
-- 2026-07-12 human gate. Referenced by docs/ccc-v3-phase2-implementation-plan.md
-- item 13.
--
-- uuid generator verified against live house style before drafting this file:
-- `locations`, `media`, `categories`, `towns`, `tour_stops`, and
-- `location_functions` all default their `id` column to `uuid_generate_v4()`
-- (checked via information_schema.columns on 2026-07-13) — so this table
-- follows the same convention rather than `gen_random_uuid()`.
-- ============================================================================

create table if not exists public.location_edits (
  id           uuid primary key default uuid_generate_v4(),
  location_id  uuid not null references public.locations(id) on delete cascade,
  field        text not null,            -- e.g. 'latitude', 'short_description', 'is_published'
  before_value text,                     -- stringified previous value (null-safe)
  after_value  text,                     -- stringified new value
  source_page  text,                     -- e.g. '/command-center/atlas/[id]' (fiche) or '/command-center/atlas#card' (quick-edit)
  created_at   timestamptz not null default now()
);

create index if not exists location_edits_location_id_idx
  on public.location_edits (location_id, created_at desc);

comment on table public.location_edits is
  'Append-only audit of admin edits to locations. One row per changed field per write.
   Written by the authed /api/locations write path only. Never publicly exposed.';
