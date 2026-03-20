## Civitas Command Center (CCC) Schema

Last updated: 2026-03-20

Source: Supabase project `afqyrxtfbspghpfulvmy` (Civitas Layers, eu-west-2, Postgres 17)

---

### Scope

This document describes the **internal operating system tables** used by the Civitas Command Center (CCC).
They are separate from the public product/content tables documented in `docs/schema-reference.md`.

Current CCC tables:

- `tasks`
- `outputs`
- `decisions`
- `memory`
- `prompt_templates`
- `task_links`

These tables power the `/command-center` routes in the Next.js app via `lib/commandCenter.ts`.

---

## `tasks`

Execution queue for work across product, content, map, schema, and operations.

### Columns (expected by code)

| Column         | Type    | Nullable | Notes |
|----------------|---------|----------|-------|
| id             | uuid    | NO       | Primary key, assumed `uuid_generate_v4()` default |
| title          | text    | NO       | Short human-readable title |
| description    | text    | YES      | Longer free-form description |
| status         | text    | NO       | One of: `backlog`, `ready`, `in_progress`, `review`, `done` (enforced in app code) |
| priority       | integer | YES      | Sort key; DB default `3`; app treats it as numeric for ordering |
| assigned_agent | text    | YES      | One of: `chatgpt`, `claude`, `cursor`, `manual` (enforced in app code) |
| related_area   | text    | YES      | One of: `product`, `content`, `map`, `database`, `design`, `engineering`, `seo`, `ops` (enforced in app code) |
| task_type      | text    | YES      | Work class: `content`, `code`, `map`, `data`, `ops`, `design`, `research`, `other` (app-enforced on forms) |
| execution_status | text | YES   | Execution posture: `todo`, `in_progress`, `review`, `blocked`, `done` (distinct from queue `status`) |
| assigned_to    | text    | YES      | Assignee or tool label (free text; suggested presets in UI) |
| latest_output  | text    | YES      | Latest result / draft / implementation summary |
| last_action_note | text | YES     | Short note on last action or handoff |
| next_step      | text    | YES      | One-line instruction for the next actor (handoff readability) |
| created_at     | timestamptz | YES  | Creation timestamp; default `now()` |
| updated_at     | timestamptz | YES  | Last update timestamp; default `now()`; auto-updated by trigger |

### Usage in code

- Queried via `getTasks()` with:
  - `order("priority", { ascending: true })`
  - then `order("created_at", { ascending: false })`
- Single-task fetch via `getTask(id)`:
  - `.eq("id", id).single()`
- Create/update operations read and write:
  - `title`, `description`, `status`, `priority`, `assigned_agent`, `related_area`
  - `task_type`, `execution_status`, `assigned_to`, `latest_output`, `last_action_note`, `next_step` (added in migration `migrations/task-execution-fields.sql`)

Note: Although `priority` is nullable in the database, the application relies on the default value `3` and always treats it as a number when ordering.

#### Triggers

- `tasks_updated_at` (BEFORE UPDATE) calls `set_updated_at()` to bump `updated_at` on every update.

---

## `outputs`

Timeline of AI or manual outputs related to tasks.

### Columns (expected by code)

| Column     | Type    | Nullable | Notes |
|-----------|---------|----------|-------|
| id        | uuid    | NO       | Primary key, assumed `uuid_generate_v4()` default |
| task_id   | uuid    | YES      | Optional FK to `tasks.id`; can be `NULL` for orphaned outputs |
| agent     | text    | NO       | Name of the agent (`chatgpt`, `claude`, `cursor`, `manual`, etc.) |
| prompt    | text    | YES      | Prompt text (if any) |
| response  | text    | YES      | Output text (if any) |
| version   | integer | YES      | Version counter; DB default `1` |
| created_at | timestamptz | YES | Creation timestamp; default `now()`; used for ordering |

### Usage in code

- For a given task:
  - `getOutputsForTask(taskId)`:
    - `.eq("task_id", taskId)`
    - `.order("created_at", { ascending: false })`
- For overview:
  - `getRecentOutputs(limit)`:
    - `.order("created_at", { ascending: false }).limit(limit)`
- Deletion:
  - `deleteOutput(id)` deletes by primary key.

**Assumptions to verify in DB**

- `task_id` is nullable at the database level.
- There is a foreign key from `outputs.task_id` → `tasks.id` with `ON DELETE CASCADE`.

---

## `decisions`

Internal log of architecture, product, and operational decisions with context and reasoning.

### Columns (expected by code)

| Column     | Type    | Nullable | Notes |
|-----------|---------|----------|-------|
| id        | uuid    | NO       | Primary key, assumed `uuid_generate_v4()` default |
| title     | text    | NO       | Short decision title |
| context   | text    | YES      | Optional surrounding context |
| decision  | text    | NO       | The decision itself |
| reasoning | text    | YES      | Why this decision was made |
| created_at | timestamptz | YES | Creation timestamp; default `now()`; used for ordering |

### Usage in code

- Listing:
  - `getDecisions()`:
    - `.order("created_at", { ascending: false })`
- Create/update:
  - Writes `title`, `context`, `decision`, `reasoning`.

Note: There is no `updated_at` column or trigger on `decisions`; only `created_at` is tracked in the database.

---

## `memory`

Structured internal knowledge base for CCC.

### Columns (expected by code)

| Column     | Type    | Nullable | Notes |
|-----------|---------|----------|-------|
| id        | uuid    | NO       | Primary key, assumed `uuid_generate_v4()` default |
| key       | text    | NO       | **Logical identifier**, expected to be unique |
| content   | text    | NO       | Free-form content associated with the key |
| category  | text    | YES      | Category label (e.g. `stack`, `product`, `design`, `context`, `schema`, `ops`, `other`) |
| updated_at | timestamptz | YES | Last update timestamp; default `now()`; used for ordering in UI |
| created_at | timestamptz | YES | Creation timestamp; default `now()` |

### Usage in code

- Listing:
  - `getMemory()`:
    - `.order("updated_at", { ascending: false })`
- Upsert:
  - `upsertMemory(input)`:
    - `.upsert(input, { onConflict: "key" }).select().single()`
  - **Requires** a unique index/constraint on `key`.

#### Constraints and triggers

- Unique constraint `memory_key_key` enforces **one row per `key`**.
- Trigger `memory_updated_at` (BEFORE UPDATE) calls `set_updated_at()` to bump `updated_at` on every update.

---

## `prompt_templates`

Prompt template library per agent for CCC.

### Columns (expected by code)

| Column      | Type    | Nullable | Notes |
|------------|---------|----------|-------|
| id         | uuid    | NO       | Primary key, assumed `uuid_generate_v4()` default |
| name       | text    | NO       | Human-readable template name |
| target_agent | text  | NO       | Target agent label (e.g. `chatgpt`, `claude`, `cursor`) |
| description | text   | YES      | Optional description |
| template   | text    | NO       | Prompt template body |
| created_at | timestamptz | YES | Creation timestamp; default `now()` |
| updated_at | timestamptz | YES | Last update timestamp; default `now()`; auto-updated by trigger |

### Usage in code

- Listing:
  - `getPromptTemplates()`:
    - `.order("name")`
- Create/update:
  - Writes `name`, `target_agent`, `description`, `template`.

#### Triggers

- `prompt_templates_updated_at` (BEFORE UPDATE) calls `set_updated_at()` to bump `updated_at` on every update.

---

## `task_links`

Associates CCC tasks with real public entities (initially locations) so the Command Center can transition from a standalone tracker into an operating system.

This is a minimal additive linking layer:
- `entity_type` is constrained to `location`, `tour`, or `story` (no open-ended polymorphism).
- `entity_id` intentionally does **not** have DB-level foreign keys to the public tables; referential integrity is enforced in CCC app logic for now.

### Columns (expected by code)

| Column     | Type    | Nullable | Notes |
|------------|---------|----------|-------|
| id         | uuid    | NO       | Primary key |
| task_id    | uuid    | NO       | FK → `tasks.id` with `ON DELETE CASCADE` |
| entity_type| text    | NO       | One of: `location`, `tour`, `story` |
| entity_id  | uuid    | NO       | UUID of the linked public entity (no DB-level FK) |
| created_at | timestamptz | NO   | Default `now()` |

### Constraints

- `CHECK (entity_type IN ('location','tour','story'))`
- `UNIQUE (task_id, entity_type, entity_id)`

---

## Summary of code vs database expectations

- All CCC tables are assumed to use **UUID primary keys** and **timestamptz timestamps** with sensible defaults.
- The app enforces enum-like behavior in TypeScript for `status`, `assigned_agent`, and `related_area`, but the database is expected to store them as simple `text` fields.
- `memory.key` **must be unique** for upsert behavior to work correctly.
- `outputs.task_id` is modeled as nullable in TypeScript; the database should either allow `NULL` or the type definition should be tightened if `NOT NULL` is desired.
- `task_links` uses `UNIQUE (task_id, entity_type, entity_id)` to prevent duplicate attachments.

