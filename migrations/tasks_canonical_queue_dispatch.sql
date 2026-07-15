-- Migration: tasks table as the canonical loop work-queue (dispatch conventions)
-- Status: HUMAN-GATED. Luigi approves; claude.ai executes via Supabase MCP
--         (apply_migration). DO NOT run from the loop.
--
-- Design (introspected 2026-07-15 against project afqyrxtfbspghpfulvmy — no
-- invented columns):
--   * tasks.status          — UNCHANGED human kanban lane
--                             (backlog|ready|in_progress|review|done); still the
--                             sole input to the brain/task-queue.md mirror
--                             (pages/api/brain/sync-tasks.ts) and getOverviewStats.
--   * tasks.execution_status — becomes the canonical LOOP DISPATCH lifecycle.
--                             Vocabulary: queued -> in_progress -> at_gate
--                             -> done | blocked. Legacy values (todo, review)
--                             stay valid so the existing CCC UI + /api/tasks/*
--                             writes never break; the loop uses the new terms.
--   * tasks.source_prompt   — REUSED as the full markdown task spec ("brief").
--                             Already text, already the "agent brief" column;
--                             no new column added.
--   * tasks.source          — NEW origin axis (distinct from assigned_to, which
--                             is the executor). Who put the task on the queue.
--   * outputs.commit_hash   — NEW nullable column so a gate summary row carries
--                             (task_id, agent='loop', response=summary, commit_hash).
--
-- All three changes are additive and non-breaking (new nullable columns; the
-- execution_status CHECK is a strict SUPERSET of every value any current code
-- path writes: todo|in_progress|review|blocked|done, editForm-null tolerated).

begin;

-- 1. Origin of a task (dispatch provenance). NULL for pre-migration rows.
alter table public.tasks
  add column if not exists source text;

alter table public.tasks
  add constraint tasks_source_check
  check (source is null or source in ('claude-ai', 'luigi', 'loop'));

-- 2. Dispatch-status integrity on execution_status. Superset of legacy + loop
--    vocabulary, so no existing write is rejected. NULL still allowed.
alter table public.tasks
  add constraint tasks_execution_status_check
  check (
    execution_status is null
    or execution_status in (
      'todo',        -- legacy (pre-loop); tolerated
      'queued',      -- loop: ready to be picked up
      'in_progress', -- loop + legacy: being executed
      'review',      -- legacy (CCC UI); tolerated
      'at_gate',     -- loop: stopped at the human gate
      'blocked',     -- loop + legacy: unresolvable HOLD
      'done'         -- loop + legacy: complete
    )
  );

-- 3. Gate-summary provenance on outputs (commit hash for the at_gate summary row).
alter table public.outputs
  add column if not exists commit_hash text;

commit;

-- Verification (run after apply):
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--     where conrelid = 'public.tasks'::regclass and contype='c';
--   select column_name from information_schema.columns
--     where table_name='outputs' and column_name='commit_hash';
