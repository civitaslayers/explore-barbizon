# Claude Code — Civitas Layers / ExploreBarbizon

This repository uses a structured AI-assisted development workflow.

Claude is responsible primarily for **architecture planning, safe implementation guidance, and validation**.

Routine coding is typically executed through **Cursor** using scoped implementation prompts.

---

# Session Start Protocol

At the beginning of each session follow the session start hook instructions.

Read:

1. brain/current-state.md  
2. brain/task-queue.md  
3. brain/decisions.md  

These files represent the **operational brain** of the project.

---

## Conditional Context

Only read additional documents if the task requires them.

Read `docs/schema-reference.md` if the task touches:

- Supabase
- SQL
- migrations
- schema fields
- content models

Read `MAIN_BRAIN.md` if the task touches:

- product strategy
- design philosophy
- roadmap
- dashboard architecture
- multi-town architecture

Avoid loading unnecessary documents.

Read `docs/agent-tooling.md` if the task involves:

- writing code against Next.js, Supabase, or Mapbox APIs (use Context7)
- external research on history, libraries, or APIs (use Tavily)
- decomposing a large multi-step initiative (pilot Task Master)

---

## Optional Tooling

External MCP tools are available but not mandatory. They support the brain — they do not replace it.

- **Context7** — version-accurate library docs. Invoke by appending `use context7` to any library-related prompt.
- **Tavily** — structured external research. Requires `TAVILY_API_KEY` in shell env.
- **Task Master** — task decomposition pilot. Use only for large, multi-step initiatives.

Full setup and usage guidance: `docs/agent-tooling.md`

---

# After Reading Startup Files

Return only:

Status  
2 concise sentences describing the current project state.

Top 3 Next Tasks  
Highest-priority unblocked tasks from task-queue.md.

Blockers  
Anything preventing implementation.

Recommended Next Step  
One small concrete action.

---

# Stack (fixed)

Do not change stack architecture without explicit instruction.

Frontend  
Next.js — Pages Router

Database  
Supabase

Map  
Mapbox GL JS

Styling  
Tailwind CSS

Editorial layer  
Webflow (temporary shell)

---

# Implementation Principles

Always follow these rules:

Prefer **refinement over rebuilds**.

Make the **smallest safe change**.

Limit file scope when implementing.

Avoid refactoring unrelated code.

Preserve the existing design direction and UI hierarchy.

Do not introduce new dependencies without clear justification.

---

# Schema Field Rules

These fields are locked conventions.

Use:

layer  
distance_meters  
stop_narrative  

Do not use:

map_layer  
distance_km  
notes  

Always verify field names before writing SQL.

---

# Slash Commands

| Command | Purpose |
|--------|--------|
| `/next-task` | Identify the next highest-priority task and route it to the correct agent |
| `/session-summary` | Summarize completed work, remaining work, and the next recommended task |
| `/update-brain` | Update brain/current-state.md and brain/task-queue.md |
| `/schema-check` | Audit schema state and propose migrations |
| `/ship-feature` | Validate implementation, commit, push, and update brain |

---

# Agents

Agents divide responsibilities clearly.

### civitas-architect

Responsibilities:

- architecture planning
- schema evolution
- migration sequencing
- identifying impacted files
- planning implementation steps

Does **not implement code**.

---

### civitas-implementer

Responsibilities:

- writing code
- implementing scoped tasks
- editing files
- wiring UI to data

Should operate on **small isolated steps only**.

---

### civitas-content-ops

Responsibilities:

- SQL generation
- content seeding
- location inserts
- media metadata
- database population tasks

---

### civitas-release-checker

Responsibilities:

- diff review
- lint and build validation
- schema consistency checks
- release safety verification

---

# Execution Workflow

Typical session flow:

1. `/next-task`  
2. `/agent civitas-architect` (planning)  
3. `/agent civitas-implementer` (implementation)  
4. `/agent civitas-release-checker` (validation)  
5. `/session-summary`  
6. `/update-brain`

Work in **small increments**.

Never attempt large refactors in a single step.

---

# Key Project Principle

Do not make one AI do everything.

ChatGPT provides **strategy**  
Claude provides **architecture**  
Cursor provides **implementation**

This separation keeps the system stable and efficient.
