-- ============================================================================
-- PROPOSAL -- human-gated. Apply by civitas-content-ops on a Supabase DEV
-- BRANCH only. Merge to production requires Luigi's approval. Not auto-executed
-- by any agent.
--
-- Ordering note: the app's pin_moves insert (pages/api/locations/[id].ts) is
-- wrapped in try/catch and never fails the committed move; a missing-relation
-- error is logged via console.error. Running this before or after the code
-- deploy is not load-bearing.
--
-- uuid generator follows house style: uuid_generate_v4().
-- ============================================================================

create table if not exists public.pin_moves (
  id             uuid primary key default uuid_generate_v4(),
  location_id    uuid not null references public.locations(id) on delete cascade,
  old_latitude   double precision,
  old_longitude  double precision,
  new_latitude   double precision,
  new_longitude  double precision,
  moved_at       timestamptz not null default now(),
  moved_by       text
);

create index if not exists pin_moves_location_id_idx
  on public.pin_moves (location_id, moved_at desc);

-- RLS deny-all: enabled with no policies, so only service_role (which bypasses
-- RLS) can read or write.
alter table public.pin_moves enable row level security;

comment on table public.pin_moves is
  'Append-only audit of pin coordinate moves from the CCC pins editor. Written by the authed /api/locations write path only. Never publicly exposed.';
