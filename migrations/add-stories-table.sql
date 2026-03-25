-- Migration: create public.stories (editorial essays)
-- Run in Supabase SQL editor against the Civitas project.
-- Matches docs/schema-reference.md proposed `stories` shape (MVP subset).
-- Prerequisite: public.towns exists (Barbizon row optional for town_id).

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  town_id uuid references public.towns (id) on delete set null,
  slug text not null,
  title text not null,
  subtitle text,
  body text,
  cover_image_url text,
  author text,
  published_at timestamptz,
  is_published boolean not null default false,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stories_slug_unique unique (slug)
);

create index if not exists stories_town_id_idx on public.stories (town_id);

create index if not exists stories_published_listing_idx
  on public.stories (published_at desc nulls last, created_at desc)
  where is_published = true;
