# Civitas Layers — AI Operating System

Last updated: 2026-10-05

This repository uses a structured AI-assisted development workflow.
The goal is to run AI tools as a coordinated team, each doing only what it does best.

---

# Tool Roles

## Claude (claude.ai) — Lead & Planner

The starting point for every session and every decision.

Responsibilities:
- architecture planning and schema decisions
- workflow direction and task routing
- prompt generation for all other tools
- content review and editorial quality checks
- fact-checking direction and source verification
- design review before implementation
- brain file oversight

Claude (claude.ai) points to the right agent with the right plan. Code is
implemented by the Claude Code agent loop, not by claude.ai directly.

---

## Claude via Supabase MCP — SQL Executor

Claude (claude.ai) executes SQL directly against Supabase via the MCP connection.
No Claude Code CLI or worktree is required.

Responsibilities:
- SQL queries, inserts, updates, migrations
- schema inspection and verification
- live database state checks during sessions

All SQL is authored and executed by Claude directly. Luigi reviews results in the conversation.

---

## Agent loop (Claude Code) — Implementer

Implementation runs through the Claude Code agent loop (`/run-loop`), not a
separate editor. civitas-architect plans → civitas-implementer writes code (or
civitas-content-ops runs dev-branch SQL) → civitas-release-checker reviews →
STOP at the human gate.

Responsibilities:
- writing and editing code
- UI iteration and component-level changes
- scoped file edits from the architect's plan
- local build and lint checks (`npx tsc --noEmit`, `npm run lint`)

The implementer works from a scoped plan with named files and explicit
constraints. It does not redesign systems or touch unrelated files. The gate is
structural — enforced by each agent's `tools:` allowlist and `prod-write-guard.sh`.

---

## Claude Design

Claude (claude.ai) is lead for strategy, architecture, SQL, and content.
Claude Code's agent loop (`/run-loop`) is the sole implementer — there is no
other tool in the implementation path. Claude Design is adopted for design
work but **not yet wired into any workflow** — use it directly and ad hoc;
do not invent a formal operating-loop step for it until a repeatable pattern
emerges from actual use.

---

# Research Source Hierarchy

For all historical and cultural content, sources must be evaluated in order of authority.

## Tier 1 — Primary institutional sources (authoritative)
- Base Mérimée / POP (French heritage listings)
- Archives de Seine-et-Marne
- Gallica / BnF (Bibliothèque nationale de France)
- Musée d'Orsay collection records
- Musée des Peintres de Barbizon
- ONF (Office national des forêts) for trail and forest data

## Tier 2 — Verified secondary sources
- Peer-reviewed publications and exhibition catalogues
- Established museum collection notes
- Documented scholar attributions with named sources

## Tier 3 — Research starting points (must be verified)
- grappilles.fr — valuable local archive built by a knowledgeable researcher,
  but represents one person's work and must be cross-checked against Tier 1 sources
  before any claim is published
- Wikipedia — useful for leads, never as a primary citation

## Policy
- No historical claim enters Supabase without a Tier 1 or verified Tier 2 source
- grappilles.fr is credited as a research contribution, not as a primary authority
- If a claim cannot be verified, it is either held pending verification or
  flagged with appropriate uncertainty in the editorial text
- geo_confidence on visual_work_locations must reflect the actual source quality,
  not the desired outcome

---

# The Operating Loop

## Every session starts in claude.ai

1. State the goal
2. Claude reads current brain state (ask Claude to check if needed)
3. Claude proposes the task, the tool, and the prompt
4. Execute in the directed tool
5. Return to claude.ai to verify output and plan next step

## Code tasks
claude.ai plan → Claude Code agent loop (architect → implementer → release-checker) → human gate

## Content tasks
claude.ai → research direction → research (direct or Tavily) → claude.ai review
→ fact-check against Tier 1 sources → SQL generation → Claude executes via Supabase MCP

## Design tasks
No defined operating-loop step yet. Claude Design is adopted but not wired into
a workflow — do not invent one until a repeatable pattern emerges from use.

---

# Task Size System

### XS — micro task
Bug fix, UI tweak, SQL query. 1–2 files.

### S — small feature
Supabase query, page component. 2–5 files.

### M — subsystem
Stories layer, tours integration, dashboard module.
Claude plans → the agent loop implements in slices.

### L — architecture change
Multi-town migration, major schema redesign.
Must be decomposed into smaller tasks before any implementation begins.

---

# Validation Rules

These checks are mandatory before any commit.

**Code:**
- `npx tsc --noEmit` — no TypeScript errors
- `npm run lint` — no lint errors
- No placeholder strings in user-facing pages (TODO, "Coming soon", "Future…")
- No secrets or tokens in staged files

**Content:**
- Every published historical claim has a named Tier 1 or Tier 2 source
- geo_confidence is set on every visual_work_locations row
- No coordinates marked `exact` unless a primary documentary source confirms them

Use `/ship-feature` in Claude Code for code validation and commits.
Content validation is flagged by Claude (claude.ai) before SQL is generated.

---

# CCC Task-Automation HTTP Contract

The Command Center (`/command-center/tasks`) exposes a small HTTP contract for
dispatching and recording task execution programmatically, independent of the
UI. Verified against `pages/api/tasks/[id]/dispatch.ts`,
`pages/api/tasks/[id]/run.ts`, `pages/api/tasks/[id]/outputs.ts`, and
`scripts/run-task.js`.

- **`POST /api/tasks/[id]/dispatch`** — marks the task dispatched
  (`execution_status = "in_progress"`) and returns a brief (`brief` prose +
  `brief_json` structured payload) plus a `callback_url` pointing back at the
  `outputs` endpoint below. No `NODE_ENV` guard — callable in both
  development and production (contrast with `/run` below).
- **`POST /api/tasks/[id]/run`** — **development only**: returns 403 outside
  `NODE_ENV=development`. Only runs tasks whose `assigned_to` is `claude`.
  Spawns `claude --print`, piping the brief via stdin, captures stdout as the
  response, saves it as an `outputs` row, and syncs `task.latest_output` +
  `execution_status = "review"`.
- **`POST /api/tasks/[id]/outputs`** — ingestion callback. Body
  `{ agent, prompt?, response?, version? }`; saves an `outputs` row and, if
  `response` is present, syncs it to `task.latest_output`. This is the
  `callback_url` target returned by `dispatch`.
- **`npm run task <id>`** — CLI equivalent of the above: calls `dispatch`,
  pipes the returned brief into the `claude` CLI directly (not through
  `/run`), then `POST`s the result to the returned `callback_url`.
- **`npm run dev`** (port 3000, falling back to 3001 if occupied) must be
  running locally for `/run` specifically, since that route is guarded to
  development only. `dispatch` and `outputs` carry no such guard and can be
  called against a deployed instance as well as a local dev server.

Note: `dispatch`, `run`, and `outputs` all read/write the `tasks`/`outputs`
tables through `lib/commandCenter.ts`'s functions, which use the **anon**
Supabase client (`lib/supabase.ts`), not the service-role client
(`lib/supabaseAdmin.ts`). Given the 2026-08-13 decision that RLS is deny-all
for anon on `tasks`/`outputs`, this is a discrepancy worth checking at the
data layer before relying on these three routes in production — see the
implementer's handoff notes for this task (`ea050c3a`) for details. This note
does not assert a confirmed production failure, only an unverified-by-this-pass
discrepancy between the code path and the documented RLS posture.

---

# Token Efficiency

- Start new Claude Code sessions frequently
- Load only the brain files relevant to the current task
- The session-start hook loads the minimum required context automatically
- Avoid loading MAIN_BRAIN.md unless the task touches strategy or architecture