# Civitas Layers — AI Operating System

Last updated: 2026-03-14

This repository uses a structured AI-assisted development workflow.

The goal is to run AI tools as a coordinated team rather than relying on a single assistant.

---

# AI Roles

The development workflow uses three AI roles.

## ChatGPT — Strategist

ChatGPT is responsible for planning and direction.

Responsibilities:

- deciding what should be built next
- breaking large ideas into engineering tasks
- identifying risks
- reviewing outputs
- generating optimized prompts
- maintaining project clarity

ChatGPT does **not implement code in the repository**.

---

## Claude — Architect

Claude is responsible for architecture and safe implementation planning.

Responsibilities:

- understanding repository structure
- defining smallest safe implementation steps
- schema and migration planning
- identifying impacted files
- reviewing diffs
- maintaining project brain files

Claude should **not run long coding sessions**.

---

## Cursor — Implementer

Cursor is responsible for code execution.

Responsibilities:

- writing code
- editing files
- debugging
- implementing scoped tasks
- running local builds and lint checks

Cursor should receive **precise instructions with clear file scope**.

Cursor should not redesign systems.

---

# The Operating Loop

Each development session follows the same cycle.

---

## Step 1 — Strategy (ChatGPT)

Start by defining the goal.

Example:

"Refine place detail pages and wire tours to Supabase."

ChatGPT returns:

- task breakdown
- priorities
- risks
- optimized prompts

---

## Step 2 — Planning (Claude)

Claude plans the implementation.

Claude reads:

brain/current-state.md  
brain/task-queue.md  
brain/decisions.md  

Claude returns:

- files involved
- smallest safe steps
- schema dependencies
- risks

Claude does **not implement yet**.

---

## Step 3 — Implementation (Cursor)

Cursor executes one implementation step.

Example instruction:

Implement step 1 only.

Files allowed:

pages/tours/[slug].tsx  
lib/supabase/tours.ts  

Constraints:

- no unrelated refactors
- preserve schema fields
- preserve styling

---

## Step 4 — Architecture Review (Claude)

Claude reviews the changes.

Checks include:

- schema consistency
- architectural safety
- unnecessary complexity
- potential regressions

---

## Step 5 — Brain Update (ChatGPT)

ChatGPT updates:

brain/current-state.md  
brain/task-queue.md  

Then determines the next task.

---

# Task Size System

Work must be broken into task sizes.

### XS — micro tasks

Examples:

- bug fix
- UI tweak
- SQL query

Usually touches 1–2 files.

---

### S — small feature

Examples:

- wiring Supabase query
- implementing a page component

Usually touches 2–5 files.

---

### M — subsystem

Examples:

- stories layer
- tours data integration
- dashboard module

Claude plans → Cursor implements in slices.

---

### L — architecture change

Examples:

- multi-town migration
- major schema redesign

Must be broken down into smaller tasks.

---

# Token Efficiency Rules

To reduce Claude token usage:

Start new Claude sessions frequently.

Avoid vague prompts.

Always specify files.

Avoid loading strategic documents unnecessarily.

Use agents for role separation.

---

# Prompt Templates

## ChatGPT Strategy Prompt

Act as technical strategist for Civitas Layers.

Goal:
[paste goal]

Return:

1. task order
2. Claude vs Cursor responsibilities
3. risks
4. Claude planning prompt
5. Cursor implementation prompt

---

## Claude Planning Prompt

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

---

## Cursor Implementation Prompt

Implement only this step:

[paste step]

Files allowed:
[list]

Constraints:

- no unrelated refactors
- preserve styling
- preserve schema
- stop after this step

---

# Recommended Repository Structure

.claude/  
brain/  
docs/  
components/  
pages/  
lib/  

brain files represent project memory.

docs contain reference material.

.claude contains agents, commands, and hooks.

---

# Key Principle

Do not make one AI perform all roles.

ChatGPT provides direction.

Claude provides architecture.

Cursor performs implementation.

This system creates a faster and safer development workflow.
