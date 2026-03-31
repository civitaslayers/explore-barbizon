# Civitas Layers — AI Operating System

Last updated: 2026-03-31

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
- design review before Cursor implementation
- brain file oversight

Claude points you to the right tool with the right prompt.
Claude does not implement code directly.

---

## Claude Code (Cursor terminal) — Executor

Runs inside Cursor's terminal. Shares the same working directory.

Responsibilities:
- brain file updates (`/update-brain`)
- commit and push sequences (`/ship-feature`)
- typecheck and lint validation
- shell commands and repo maintenance

Claude Code operates on explicit prompts from Claude (claude.ai).
It does not plan — it executes.

---

## Cursor — Implementer

Responsibilities:
- writing and editing code
- UI iteration and component-level changes
- scoped file edits based on Claude's prompts
- local build and lint checks

Cursor receives precise prompts with named files and explicit constraints.
Cursor does not redesign systems or touch unrelated files.

---

## Stitch — Design

Responsibilities:
- UI mockups and design exploration
- visual direction proposals

All Stitch output must be reviewed by Claude against the Tailwind token system
before being briefed to Cursor. Mismatches (off-token colours, spacing) are caught here.

---

## Perplexity — Sourced Research

Primary tool for historical and cultural research requiring cited sources.

Responsibilities:
- Barbizon history, artists, locations, archival context
- heritage listings and institutional records
- fact-checking content before it enters Supabase

Stronger than GPT/Grok for traceable citations.
Use when the factual integrity policy requires a verifiable source.

---

## GPT — Strategy & Structured Thinking

Responsibilities:
- task decomposition and planning
- risk analysis
- reviewing Claude outputs from a second perspective

---

## Grok — Live Web Search

Responsibilities:
- current web search (news, recent publications, updated records)
- quick lookups that don't require citation depth

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
- GPT, Grok, Perplexity outputs — useful for orientation, never for final facts
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
claude.ai → Cursor prompt → Cursor implements → Claude Code validates + commits

## Content tasks
claude.ai → research direction → Perplexity/Grok research → claude.ai review
→ fact-check against Tier 1 sources → SQL generation → Supabase SQL editor

## Design tasks
Stitch mockup → claude.ai design review against token system → Cursor prompt → implementation

---

# Task Size System

### XS — micro task
Bug fix, UI tweak, SQL query. 1–2 files.

### S — small feature
Supabase query, page component. 2–5 files.

### M — subsystem
Stories layer, tours integration, dashboard module.
Claude plans → Cursor implements in slices.

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

# Token Efficiency

- Start new Claude Code sessions frequently
- Load only the brain files relevant to the current task
- The session-start hook loads the minimum required context automatically
- Avoid loading MAIN_BRAIN.md unless the task touches strategy or architecture