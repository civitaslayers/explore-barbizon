# Command: next-task

Purpose:
Identify the highest-priority unblocked task and route it to the correct agent.

---

## Step 1 — Read minimal project state

Read only these files:

- brain/current-state.md
- brain/task-queue.md
- brain/decisions.md

Do not scan the entire repository.

---

## Step 2 — Select the highest priority task

From `task-queue.md`:

1. Look in **Now**
2. Skip tasks that require **user-action**
3. Skip tasks in **Blocked**

Select the first remaining task.

---

## Step 3 — Determine task type

Infer the task category.

### Frontend / UI

Examples:
- page layout
- component changes
- wiring UI to data

Agent:
civitas-implementer

---

### Data / SQL / Seeding

Examples:
- inserting locations
- generating SQL
- content migrations

Agent:
civitas-content-ops

---

### Schema / Architecture

Examples:
- schema migrations
- database structure
- multi-town architecture
- Supabase table design

Agent:
civitas-architect

---

### Validation / Release

Examples:
- lint checks
- build verification
- diff review
- release readiness

Agent:
civitas-release-checker

---

## Step 4 — Output

Return:

Task  
Task type  
Recommended agent  
First implementation step

Example:

Task:
Replace `data/tours.ts` with live Supabase query

Task type:
frontend + data

Agent:
civitas-implementer

First step:
Create `lib/supabase/tours.ts` helper query.

---

## Step 5 — Execution guidance

To start implementation:

/agent civitas-implementer

Then execute the first step only.
Do not perform the full task at once.

Work in small safe increments.
