-- story_locations: story <-> location join table (task 41f46d02).
-- NOT APPLIED. claude.ai applies after Luigi approves the merge, then seeds.
-- Until rows exist the app falls back to data/relatedStories.ts RELATED_SLUGS.

create table if not exists public.story_locations (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  display_order int not null default 0,
  created_at timestamptz default now(),
  unique (story_id, location_id)
);

create index if not exists story_locations_story_id_idx
  on public.story_locations (story_id);

alter table public.story_locations enable row level security;

create policy "Public read story_locations"
  on public.story_locations
  for select
  to anon, authenticated
  using (true);

-- Seed (commented out): one row per place in RELATED_SLUGS, map order.
-- Both sides resolved by slug subquery.
-- insert into public.story_locations (story_id, location_id, display_order)
-- select s.id, l.id, v.display_order
-- from (values
--   ('rooms-of-light', 'maison-millet', 0),
--   ('paths-to-the-forest', 'sentier-des-peintres', 0),
--   ('inn-paintings-dinner', 'auberge-ganne', 0),
--   ('the-gleaners', 'maison-millet', 0),
--   ('how-the-forest-became-a-picture', 'sentier-des-peintres', 0),
--   ('the-house-of-the-crime', 'besharat-gallery-barbizon', 0)
-- ) as v(story_slug, location_slug, display_order)
-- join public.stories s on s.slug = v.story_slug
-- join public.locations l on l.slug = v.location_slug
-- on conflict (story_id, location_id) do nothing;
