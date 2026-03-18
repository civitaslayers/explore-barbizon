-- ============================================================
-- Command Center v1 — Supabase Migration
-- Run this in the Supabase SQL editor (afqyrxtfbspghpfulvmy)
-- ============================================================

-- 1. tasks
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  status        text not null default 'backlog',
  priority      integer default 3,
  assigned_agent text,
  related_area  text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. outputs
create table if not exists outputs (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid references tasks(id) on delete cascade,
  agent      text not null,
  prompt     text,
  response   text,
  version    integer default 1,
  created_at timestamptz default now()
);

-- 3. decisions
create table if not exists decisions (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  context    text,
  decision   text not null,
  reasoning  text,
  created_at timestamptz default now()
);

-- 4. memory
create table if not exists memory (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  content    text not null,
  category   text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 5. prompt_templates
create table if not exists prompt_templates (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  target_agent text not null,
  description  text,
  template     text not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- updated_at trigger function
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- attach triggers
create trigger tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

create trigger memory_updated_at
  before update on memory
  for each row execute function set_updated_at();

create trigger prompt_templates_updated_at
  before update on prompt_templates
  for each row execute function set_updated_at();
