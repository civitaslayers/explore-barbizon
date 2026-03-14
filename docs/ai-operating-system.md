# Civitas Layers — AI Operating System

Last updated: 2026-03-14

This document explains how AI tools are used to develop the Civitas Layers / ExploreBarbizon project.

The goal is to run AI as a coordinated team rather than relying on a single assistant for everything.

When used correctly, this workflow dramatically improves development speed and reduces token usage.

---

# AI Roles

The project uses three AI roles.

## ChatGPT — Strategist

ChatGPT is responsible for direction and planning.

Responsibilities:

- deciding what should be built next
- breaking large ideas into small engineering tasks
- prioritising work
- identifying risks
- reviewing outputs or screenshots
- writing handoff files
- generating optimized prompts for Claude and Cursor

ChatGPT should **not implement code directly in the repository**.

It acts as the **planning and synthesis layer**.

---

## Claude — Architect

Claude is responsible for architecture and safe implementation planning.

Responsibilities:

- repo-aware planning
- defining the smallest safe implementation path
- schema and migration planning
- identifying required files
- validating architectural decisions
- reviewing diffs after implementation
- updating project brain files

Claude should **not be used for long coding sessions**.

Use Claude primarily for **planning and architecture validation**.

---

## Cursor — Implementer

Cursor is responsible for actual coding work.

Responsibilities:

- writing code
- editing files
- debugging
- implementing small scoped tasks
- running lint and build locally
- iterating quickly on UI or data wiring

Cursor should receive **very specific scoped tasks**.

Cursor should **not make architectural decisions**.

---

# The Operating Loop

Each development session should follow the same loop.

## Step 1 — Strategy (ChatGPT)

Start by describing the goal.

Example:

"Refine place detail pages and wire tours to Supabase."

ChatGPT returns:

- the best task order
- which tasks belong to Claude vs Cursor
- risks or dependencies
- optimized prompts

---

## Step 2 — Planning (Claude)

Claude defines the smallest safe implementation plan.

Claude reads:

- brain/session-start.md
- brain/current-state.md
- brain/task-queue.md
- brain/decisions.md

Claude outputs:

- files that must be inspected
- smallest implementation steps
- schema dependencies
- risks
- the exact first step to implement

Claude **does not implement the code yet**.

---

## Step 3 — Implementation (Cursor)

Cursor performs the actual coding work.

Cursor receives only the **first implementation step**.

Example instruction:

Implement step 1 only.

Touch only these files:

- pages/tours/[slug].tsx
- lib/supabase/tours.ts

Constraints:

- do not refactor unrelated code
- preserve styling
- preserve schema fields
- stop after this step

---

## Step 4 — Architecture Review (Claude)

After Cursor finishes coding, Claude reviews the result.

Claude checks:

- schema correctness
- architectural consistency
- minimal diff discipline
- potential future risks

Claude may propose small follow-up improvements if necessary.

---

## Step 5 — Project Brain Update (ChatGPT)

ChatGPT then:

- updates brain/current-state.md
- updates brain/task-queue.md
- determines the next task

This completes the loop.

---

# Task Size System

All work should be classified before starting.

## XS — micro tasks

Examples:

- one bug fix
- one UI tweak
- one SQL query
- one migration draft

Usually touches **1–2 files**.

Best handled directly by Cursor.

---

## S — small feature slice

Examples:

- wiring a Supabase query
- implementing a single component
- adding a schema field

Usually touches **2–5 files**.

Cursor implements, Claude reviews.

---

## M — subsystem change

Examples:

- replacing local data with Supabase
- implementing the stories layer
- dashboard module

Claude plans → Cursor implements in slices.

---

## L — architecture change

Examples:

- multi-town migration
- major schema redesign
- map architecture changes

Claude must break this into smaller tasks before implementation.

Cursor should **never receive an L task directly**.

---

# Token Efficiency Rules

To keep Claude usage manageable:

### Start new Claude sessions frequently

Avoid keeping one long conversation for the entire project.

---

### Avoid vague prompts

Never ask:

"Improve this code."

Ask:

"Adjust the place page layout spacing for screens wider than 1400px."

---

### Limit file scope

Always specify files.

Example:

Inspect only:

- pages/places/[slug].tsx
- components/PlaceHeader.tsx

---

### Avoid unnecessary document loading

Files that should **not be loaded automatically**:

- MAIN_BRAIN.md
- roadmap files
- design essays

Load them only when the task clearly requires them.

---

# Prompt Templates

These templates help keep prompts short and consistent.

---

# ChatGPT Strategy Prompt

Use this when the task is still unclear.

Act as technical strategist for Civitas Layers.

Goal:
[paste goal]

Return:

1. best task order
2. what belongs to Claude vs Cursor
3. hidden risks
4. optimized Claude planning prompt
5. optimized Cursor implementation prompt

---

# Claude Planning Prompt

Follow brain/session-start.md.

Task:
[paste task]

Do not implement yet.

Return:

1. understanding of task
2. files to inspect
3. smallest safe implementation plan
4. schema dependencies
5. risks
6. exact first implementation step

---

# Cursor Implementation Prompt

Implement only this step:

[paste step]

Constraints:

- touch only these files: [list]
- do not refactor unrelated code
- preserve styling
- preserve schema exactly
- stop after this step

---

# Recommended Repo Structure

.claude/
brain/
    session-start.md
    current-state.md
    task-queue.md
    decisions.md
docs/
    ai-operating-system.md
    schema-reference.md
    design-direction.md
MAIN_BRAIN.md

---

# Key Principle

Do not make one AI do everything.

ChatGPT provides **direction**

Claude provides **architecture**

Cursor provides **implementation**

This creates a fast and stable development workflow for Civitas Layers.
