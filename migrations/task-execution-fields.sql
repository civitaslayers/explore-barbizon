-- Task execution metadata (agent-ready work units)
-- Run in Supabase SQL editor after command-center-v1 baseline.
-- Safe to run once; uses IF NOT EXISTS column checks via additive ALTER.

alter table tasks add column if not exists task_type text;
alter table tasks add column if not exists execution_status text;
alter table tasks add column if not exists assigned_to text;
alter table tasks add column if not exists latest_output text;
alter table tasks add column if not exists last_action_note text;
alter table tasks add column if not exists next_step text;

comment on column tasks.task_type is 'Work classification: content, code, map, data, ops, design, research, other';
comment on column tasks.execution_status is 'Execution posture: todo, in_progress, review, blocked, done';
comment on column tasks.assigned_to is 'Who/what should handle the task (free text or preset)';
comment on column tasks.latest_output is 'Latest useful result, draft, or implementation summary';
comment on column tasks.last_action_note is 'Short note on last meaningful action or handoff';
comment on column tasks.next_step is 'One-line instruction for the next actor (handoff)';
