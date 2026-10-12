-- ============================================================================
-- PROPOSAL -- human-gated. NOT applied. Production DDL is Luigi's; apply after
-- merge. Not auto-executed by any agent.
--
-- Cookieless, anonymous counters for the My day feature (task 068cfc3d): no
-- slugs, no identifiers, no query strings. The app's insert
-- (pages/api/track.ts) is non-fatal; a missing table is only logged.
-- ============================================================================

create table if not exists public.product_events (
  id           uuid primary key default uuid_generate_v4(),
  event        text not null,
  locale       text,
  device       text,
  occurred_at  timestamptz not null default now()
);

create index if not exists product_events_event_idx
  on public.product_events (event, occurred_at desc);

-- RLS deny-all: enabled with no policies, so only service_role can read/write.
alter table public.product_events enable row level security;
