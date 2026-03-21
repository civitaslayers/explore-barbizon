-- Completed CCC development tasks — session 2026-03-21 to 2026-03-22
-- Run once in Supabase SQL editor to record the CCC automation work in task history.
-- All tasks are inserted as status=done, execution_status=done.

INSERT INTO tasks (title, description, status, priority, task_type, related_area, execution_status, assigned_to) VALUES

-- Brain ↔ CCC drift fix
(
  'Fix brain ↔ CCC drift: → brain sync button',
  'Added POST /api/brain/sync-tasks — dev-only route that queries all Supabase tasks, partitions by status, and writes brain/task-queue.md. Added → brain button to CCC task list. Added Step 0 to update-brain.md command.',
  'done', 1, 'ops', 'ops', 'done', 'claude'
),

-- Roadmap seeded into CCC
(
  'Seed full roadmap into CCC as structured tasks',
  'Created migrations/seed-ccc-roadmap-tasks.sql with 30+ tasks covering all phases: Now, Next, Schema Queue, Dashboard v1, Later, Deferred. Tasks include title, description, status, priority, task_type, related_area, execution_status, assigned_to.',
  'done', 1, 'ops', 'ops', 'done', 'claude'
),

-- Inline agent assignment in task list
(
  'Add inline agent assignment to CCC task list',
  'Converted read-only assignee badge to an editable <select> dropdown in the task list. Uses optimistic updates with same pattern as status dropdown. Calls updateTask(id, { assigned_to }).',
  'done', 1, 'code', 'engineering', 'done', 'claude'
),

-- Quick brief copy from task list
(
  'Add quick brief copy to CCC task list',
  'Added ▶ button on row hover that calls buildAgentTaskBrief(task, [], {}, {}, mode) and copies to clipboard. Added copiedId state for ✓ feedback. Imports defaultAgentBriefModeFromAssignee to infer mode from assignee.',
  'done', 1, 'code', 'engineering', 'done', 'claude'
),

-- Done button in task list
(
  'Add Done button to CCC task list row actions',
  'Added Done button in task list row hover actions. Calls handleStatusChange(id, "done"). Hidden when task is already done. Provides quick status close-out without navigating to detail page.',
  'done', 1, 'code', 'engineering', 'done', 'claude'
),

-- Dispatch API endpoint
(
  'Build POST /api/tasks/[id]/dispatch endpoint',
  'New API route. Sets execution_status=in_progress and returns brief (text), brief_json (machine-readable structured payload with task fields + callback_url), dispatched_at. Foundation for programmatic agent orchestration.',
  'done', 1, 'code', 'engineering', 'done', 'claude'
),

-- Outputs ingestion API endpoint
(
  'Build POST /api/tasks/[id]/outputs endpoint',
  'New API route — output ingestion callback. Accepts { agent, prompt, response, version }. Creates output row in Supabase. Syncs latest_output on the task if response is provided. Any automation layer can POST here without touching the UI.',
  'done', 1, 'code', 'engineering', 'done', 'claude'
),

-- run-task.js CLI script
(
  'Build scripts/run-task.js CLI automation script',
  'Node.js script: calls /dispatch → runs claude --print via stdin → POSTs output to callback_url. No new dependencies (uses built-in fetch + child_process). Added npm run task <task-id> alias.',
  'done', 1, 'code', 'ops', 'done', 'claude'
),

-- Run API endpoint
(
  'Build POST /api/tasks/[id]/run endpoint',
  'Dev-only API route that orchestrates the full automated loop: builds brief, spawns claude --print via stdin, captures stdout, saves output row, updates latest_output, sets execution_status=review. Reverts to todo on failure.',
  'done', 1, 'code', 'engineering', 'done', 'claude'
),

-- Run button in task list
(
  'Add Run button to CCC task list',
  'Always-visible green chip button on claude-assigned task rows. Calls /api/tasks/[id]/run. Shows "Running…" with wait cursor during execution. Disables other Run buttons while one is in flight. Updates execution_status inline on completion.',
  'done', 1, 'code', 'engineering', 'done', 'claude'
),

-- Run automatically button on detail page
(
  'Add Run automatically button to CCC task detail page',
  'Added to AgentBriefBlock below existing Run with… tool buttons. Only visible for claude-assigned tasks that are not done. Calls /api/tasks/[id]/run, shows feedback, reloads Output history via onRun callback after completion.',
  'done', 1, 'code', 'engineering', 'done', 'claude'
);
