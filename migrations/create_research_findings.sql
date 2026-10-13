-- ============================================================================
-- research_findings: one row per historical finding, lead, open question or
-- refuted claim, tied to its source. Requested by Luigi on 2026-10-13 so that
-- research is never done twice. Applied by claude.ai via MCP on Luigi's
-- request (direct-migration path; no dev branch on this Supabase plan).
--
-- Narrative dossiers stay in docs/sources/*.md; this table is the searchable
-- index of what they found. Internal only: deny-all RLS like location_edits,
-- read and written with the service role. Never exposed on the public site.
--
-- id default follows house style (uuid_generate_v4()).
-- ============================================================================

create table if not exists public.research_findings (
  id            uuid primary key default uuid_generate_v4(),
  subject       text not null,                                   -- e.g. 'Les Charmettes (40 Grande Rue)', 'Karl Bodmer'
  location_id   uuid references public.locations(id) on delete set null,
  story_id      uuid references public.stories(id) on delete set null,
  claim         text not null,                                   -- the finding in one or two sentences
  status        text not null
                check (status in ('confirmed','lead','oral','open','refuted')),
  method        text
                check (method in ('page_image','ocr','snippet','census','secondary','oral','archive')),
  source_title  text,                                            -- periodical or book
  source_date   text,                                            -- the source's own date, as written
  source_page   text,                                            -- page, folio, viewer page, census line
  source_ref    text,                                            -- archive call number, e.g. 'AD77 10M391'
  source_url    text,                                            -- Gallica ark link, etc.
  quote         text,                                            -- verbatim, original language
  notes         text,                                            -- conflicts, caveats, editorial decisions
  dossier       text,                                            -- repo path of the narrative dossier
  found_on      date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists research_findings_location_idx on public.research_findings (location_id);
create index if not exists research_findings_story_idx    on public.research_findings (story_id);
create index if not exists research_findings_subject_idx  on public.research_findings (subject);
create index if not exists research_findings_status_idx   on public.research_findings (status);
create index if not exists research_findings_fts_idx on public.research_findings
  using gin (to_tsvector('simple', coalesce(subject,'') || ' ' || coalesce(claim,'') || ' ' || coalesce(quote,'') || ' ' || coalesce(source_title,'') || ' ' || coalesce(notes,'')));

alter table public.research_findings enable row level security;
create policy "Deny all" on public.research_findings for all to public using (false);

comment on table public.research_findings is
  'Internal research index (2026-10-13). One row per finding, lead, open question or refuted claim, with its source. Search before researching a subject again. status: confirmed (period source read) | lead (OCR, snippet, secondary, single source) | oral (testimony) | open (unanswered or pending check) | refuted (shown wrong or unsupported). Narrative dossiers in docs/sources. Never exposed publicly.';
