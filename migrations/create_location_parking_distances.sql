-- location_parking_distances: walking time/distance from each location to
-- each car park (task 7233da57). Feeds the "minutes from the car park" fact
-- on place pages and the My day planner v1 (fed18dd4).
-- NOT APPLIED. claude.ai applies after Luigi approves the merge; rows are
-- then filled by scripts/compute-parking-distances.mjs (Mapbox Matrix,
-- walking profile — never a straight-line fallback).

create table if not exists public.location_parking_distances (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  parking_location_id uuid not null references public.locations(id) on delete cascade,
  walking_seconds int not null check (walking_seconds >= 0),
  distance_meters int not null check (distance_meters >= 0),
  method text not null default 'mapbox_walking' check (method in ('mapbox_walking')),
  computed_at timestamptz not null default now(),
  unique (location_id, parking_location_id)
);

create index if not exists location_parking_distances_location_id_idx
  on public.location_parking_distances (location_id);

alter table public.location_parking_distances enable row level security;

create policy "Public read location_parking_distances"
  on public.location_parking_distances
  for select
  to anon, authenticated
  using (true);
