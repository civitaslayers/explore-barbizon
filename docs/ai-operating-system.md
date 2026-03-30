# Civitas Layers — AI Operating System

Last updated: 2026-03-28

This repository uses a structured AI-assisted development workflow.

The goal is to run AI tools as a coordinated team — each doing what it does best.

---

# AI Roles

The development workflow uses three roles.

## Claude — Lead (Strategy + Architecture + Review)

Claude is the primary thinking partner for this project.

Responsibilities:

- defining what should be built next
- breaking large ideas into engineering tasks
- architecture planning and schema design
- identifying risks and impacted files
- reviewing Cursor's output
- updating brain files after significant work
- SQL, migrations, and content operations
- maintaining project clarity across sessions

Claude operates from the brain files and project knowledge.  
Claude plans before Cursor implements.  
Claude reviews after Cursor implements.  
Claude updates the brain at the end of each session.

---

## Cursor — Implementer

Cursor is responsible for code execution inside the repository.

Responsibilities:

- writing and editing files
- implementing scoped tasks from Claude's plans
- debugging
- running local builds and lint checks

Cursor should receive **precise instructions with clear file scope**.  
Cursor should not redesign systems or make architectural decisions.  
Cursor should not touch files outside its stated scope.

---

## GPT / Grok — Reviewer and Researcher

GPT and Grok are available as supplementary reviewers and research tools.

Responsibilities:

- second opinion on architecture or design decisions
- external research (history, APIs, libraries)
- reviewing diffs when a fresh set of eyes is useful
- generating alternative approaches for comparison

GPT and Grok do **not** drive the operating loop.  
They do **not** update brain files.  
They do **not** have authority over task ordering.

Use them selectively — they are extra sets of eyes, not the primary decision-makers.

---

# The Operating Loop

Each development session follows the same cycle.

---

## Step 1 — Orient (Claude)

Start each session by loading the brain.

Claude reads:

```
brain/current-state.md
brain/task-queue.md
brain/decisions.md
```

Claude returns:

- current project status (2 sentences)
- top 3 unblocked tasks
- active blockers
- recommended next step

This is the session start protocol. Follow `brain/session-start.md`.

---

## Step 2 — Plan (Claude)

Claude plans the implementation for the chosen task.

Claude returns:

- files involved
- smallest safe steps
- schema dependencies (if any)
- risks
- first implementation step

For XS tasks, planning and implementation may happen in the same Claude session.  
For S and M tasks, Claude hands a scoped implementation prompt to Cursor.

---

## Step 3 — Implement (Cursor)

Cursor executes one implementation step at a time.

Example instruction:

```
Implement step 1 only.

Files allowed:
pages/tours/[slug].tsx
lib/supabase/tours.ts

Constraints:
- no unrelated refactors
- preserve schema fields
- preserve styling
- stop after this step
```

---

## Step 4 — Review (Claude)

Claude reviews Cursor's output.

Checks include:

- schema field naming (layer / distance_meters / stop_narrative)
- architectural consistency with decisions.md
- unnecessary complexity or side effects
- potential regressions
- TypeScript and lint cleanliness

If changes are minor or purely editorial (SQL, content, config), Claude may handle them directly without routing through Cursor.

---

## Step 5 — Brain Update (Claude)

Claude updates the brain files at the end of each session.

```
brain/current-state.md  — move completed items, update blockers
brain/task-queue.md     — reflect new state (or trigger /sync-tasks)
```

Use the `update-brain` command or the CCC sync endpoint.

---

# Task Size System

Work must be broken into task sizes.

### XS — micro tasks

Examples:

- bug fix
- UI tweak
- SQL query
- content insert

Usually touches 1–2 files.  
Claude may handle directly without Cursor.

---

### S — small feature

Examples:

- wiring a Supabase query
- implementing a page component
- adding a new map layer

Usually touches 2–5 files.  
Claude plans → Cursor implements.

---

### M — subsystem

Examples:

- stories layer
- tours data integration
- dashboard module
- Edge Function proxy

Claude plans in slices → Cursor implements slice by slice.

---

### L — architecture change

Examples:

- multi-town migration
- major schema redesign

Must be broken into S and M tasks before any implementation begins.  
Claude architects → Claude reviews each slice → Cursor implements.

---

# Token Efficiency Rules

Start new Claude sessions frequently.

Avoid vague prompts — always specify the task and relevant files.

Load brain files at session start. Load strategy files only when needed.

Do not load `MAIN_BRAIN.md` for routine coding sessions.

Use agents for role separation — the `.claude/agents/` directory defines scoped behaviour for each role.

---

# Prompt Templates

## Claude Planning Prompt

```
Follow session-start protocol.

Task:
[paste task]

Return:
- understanding of task
- files to inspect
- smallest safe implementation plan
- schema dependencies
- risks
- first implementation step
```

---

## Cursor Implementation Prompt

```
Implement only this step:

[paste step]

Files allowed:
[list files]

Constraints:
- no unrelated refactors
- preserve styling
- preserve schema field names
- stop after this step
```

---

## Review / Research Prompt (GPT or Grok)

```
Review this implementation for Civitas Layers / ExploreBarbizon.

Context:
[paste relevant context]

What to check:
[paste specific concerns]

Return: findings only — no code changes.
```

---

# Recommended Repository Structure

```
.claude/        agents, commands, hooks, settings
brain/          operational memory (current-state, task-queue, decisions)
docs/           reference material (schema, design, workflow, tooling)
components/     UI components
pages/          Next.js pages and API routes
lib/            Supabase client, utilities, command center helpers
```

Brain files represent project memory.  
Docs contain reference material.  
`.claude/` contains agents and commands.

---

# Key Principle

Each tool does what it does best.

Claude leads — strategy, architecture, review, brain maintenance.  
Cursor implements — code, files, builds.  
GPT and Grok assist — research and second opinions.

This system creates a faster and safer development workflow.