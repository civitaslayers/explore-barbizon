-- Latest handoff / run record on tasks (single row, no history table).
-- Safe to run on existing CCC DB: columns are nullable additive.

alter table tasks
  add column if not exists last_run_target text,
  add column if not exists last_run_at timestamptz,
  add column if not exists last_run_note text;
