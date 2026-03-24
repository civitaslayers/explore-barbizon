# Agent Tooling — Civitas Layers / ExploreBarbizon

Last updated: 2026-03-21

This document is the authoritative reference for approved MCP tools and external AI tooling in this project.

**Load this file only when needed** — it is not part of the mandatory session startup. See CLAUDE.md for when to load it.

---

## Guiding principle

External tooling supports the repo brain. It never replaces it.

`brain/current-state.md`, `brain/task-queue.md`, and `brain/decisions.md` remain the single source of truth for project state. MCPs provide real-time docs, research capability, and task decomposition help — not authoritative project memory.

---

## Approved tools

### Context7 (Upstash)

**Purpose:** Injects version-accurate documentation for Next.js, Supabase, Mapbox, React, and other libraries directly into AI responses. Prevents hallucinated or deprecated API usage.

**Status:** Active — configured in `.cursor/mcp.json` and `.claude/settings.json`

**When to use:**
- Writing any code that calls Next.js, Supabase JS, or Mapbox GL APIs
- Unsure whether an API is current for the versions in this repo
- Checking Tailwind utility availability

**How to invoke:** Append `use context7` to any prompt referencing a library.
Example: `use context7 — implement a Supabase realtime subscription for the tasks table`

**Config:**
```json
{
  "command": "npx",
  "args": ["-y", "@upstash/context7"]
}
```

**Security note:** Context7 had a publicly disclosed MCP-related vulnerability (February 2026). Upstash confirmed remediation on 2026-02-23. Always use the official `@upstash/context7` package only. Do not use third-party forks or alternative context7 implementations.

---

### Tavily (Official MCP)

**Purpose:** Clean structured web search with extract and crawl capability. Use for external research: historical content, library documentation, API references, Barbizon cultural context.

**Status:** Configured. Requires `TAVILY_API_KEY` in shell env to activate.

**When to use:**
- Researching Barbizon history, artists, or locations for content
- Looking up official docs for a library not covered by Context7
- Checking for current information beyond knowledge cutoff

**How to invoke:** Ask naturally. Tavily activates when the MCP is connected and a search is needed.
Example: `Search for Jean-François Millet's documented time in Barbizon — key dates and locations`

**Config:**
```json
{
  "command": "npx",
  "args": ["-y", "tavily-mcp"],
  "env": {
    "TAVILY_API_KEY": "${TAVILY_API_KEY}"
  }
}
```

**Setup:** Get a free API key at tavily.com, then add to shell:
```bash
export TAVILY_API_KEY=your_key_here
```

**Source:** Official repo at `tavily-ai/tavily-mcp`. Do not use older community implementations — they have been deprecated.

---

### Task Master AI (Pilot — evaluated March 2026)

**Status:** Evaluated. Use selectively — see verdict below.

**Pilot initiative:** "AI guide: conversational layer grounded in database content" — chosen as the most dependency-rich item in the backlog.

**What Task Master adds:**
- Dependency ordering and parallelism visibility across subtasks
- Machine-readable task state suitable for agent handoff
- A one-line `brain/` entry becomes an 8-step sequenced plan with explicit `dependsOn` relationships

**What it does not add:**
- Project context, schema conventions, or editorial direction — output is generic engineering tasks
- Awareness of the CCC task model or existing Supabase structure

**Verdict:**
- **Do NOT use as ongoing task management** — the CCC already serves that role, and parallel state causes drift
- **Use selectively as a one-shot PRD decomposition tool** for initiatives with more than ~6 interdependent tasks: run `parse-prd` once, promote results into the CCC, discard the `.taskmaster/` directory

**Workflow when applicable:**
1. Write a short PRD or initiative description
2. Run `npx -y task-master-ai` → `parse-prd`
3. Review the generated subtask list
4. Promote relevant tasks into CCC (with correct `assigned_to`, `task_type`, `related_area`)
5. Delete `.taskmaster/` — CCC is the source of truth from that point

**Source:** `eyaltoledano/claude-task-master` on GitHub.

---

## Deferred tools

### Codebase Memory MCP

**Status:** Deferred.

**Reason:** The repo is currently well-understood via `docs/repo-map.md`, `docs/ai-operating-system.md`, and the branch structure. Introduce only if token cost or context-recall pain becomes a real problem at scale.

---

## What is NOT supported

- `claude plugin install` — this command does not exist in Claude Code CLI
- Superpowers plugin — no verified official Claude Code CLI implementation; project already has equivalent structure via CLAUDE.md, `.claude/commands/`, and `.cursor/rules/`
- Codebase Memory MCP — deferred (see above)
- gstack / deer-flow / CrewAI — not actionable at current stage

---

## How this interacts with existing workflow

```
brain/task-queue.md      → source of truth for what to work on
/next-task               → routes to the right task and agent
Context7                 → use when writing library code
Tavily                   → use for research
Task Master (pilot)      → use only for large multi-step decomposition
```

Skill Creator is already available as a built-in skill — no install needed. Use it to generate new `.claude/skills/SKILL.md` files when a new repeatable workflow is needed.
