-- Structured “latest work” fields on tasks (no history table)
-- Run in Supabase after task-execution-fields.sql. Idempotent ADD IF NOT EXISTS.

alter table tasks add column if not exists source_prompt text;
alter table tasks add column if not exists artifact_links text;
alter table tasks add column if not exists implementation_notes text;
alter table tasks add column if not exists review_note text;

comment on column tasks.source_prompt is 'Latest meaningful prompt or instruction (human or agent)';
comment on column tasks.artifact_links is 'URLs or path-like refs; often one per line';
comment on column tasks.implementation_notes is 'Compact notes on what changed, was produced, or was decided';
comment on column tasks.review_note is 'Short reviewer note, approval, or requested changes';
