# Claude Code — Civitas Layers / ExploreBarbizon

Last updated: 2026-04-06

This repository uses a structured AI-assisted development workflow.

Claude is the **primary thinking partner** — responsible for strategy, architecture, planning, schema design, review, and brain maintenance.

Implementation is executed through the **agent loop** (`/run-loop`): civitas-implementer for code and civitas-content-ops for dev-branch SQL. There is no separate hand-off tool.

GPT and Grok are available as supplementary reviewers and researchers.

---

# Autonomous Loop (Claude Code)

For tasks run in Claude Code, implementation is no longer hand-stepped through Cursor.
The lead session runs an autonomous loop via `/run-loop`:

**civitas-architect** (plan) → **civitas-implementer** (code) or **civitas-content-ops**
(SQL on a dev branch) → **civitas-release-checker** (review) → **STOP at the human gate**.

Autonomous: code, commits, and dev-branch SQL.
Gated (human only): merging a Supabase branch to production, publishing content
(`is_published = true`), and production deploys.

The gate is structural — enforced by each agent's `tools:` allowlist and the
`prod-write-guard.sh` hook, not by prompt wording.

---

# Session Start Protocol

At the beginning of each session, follow the session start hook.

Read in this order:

1. `brain/current-state.md`
2. `brain/task-queue.md`
3. `brain/decisions.md`

These files represent the **operational brain** of the project.

---

## Conditional Context

Only load additional documents if the task requires them.

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

Read `docs/agent-tooling.md` if the task involves:

- writing code against Next.js, Supabase, or Mapbox APIs (use Context7)
- external research on history, libraries, or APIs (use Tavily)
- decomposing a large multi-step initiative (pilot Task Master)

Avoid loading unnecessary documents.

Read `docs/repo-map.md` for a structural overview of the codebase.

Read `docs/design-direction.md` for visual principles, typography, and palette rules.

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

**Status**
2 concise sentences describing the current project state.

**Top 3 Next Tasks**
Highest-priority unblocked tasks from task-queue.md.

**Blockers**
Anything preventing implementation.

**Recommended Next Step**
One small concrete action.

---

# Stack (fixed)

Do not change stack architecture without explicit instruction.

| Layer | Technology |
|---|---|
| Frontend | Next.js — Pages Router |
| Database | Supabase |
| Map | Mapbox GL JS |
| Styling | Tailwind CSS |
| Editorial layer | Next.js (Stories, About — all surfaces on Vercel) |

---

# Claude's Responsibilities

Claude handles:

- strategy and task ordering
- architecture decisions and schema planning
- smallest-safe-step implementation plans for the agent loop (civitas-implementer / civitas-content-ops)
- post-implementation review
- SQL queries and migrations — executed directly via Supabase MCP connection
- content narrative writing
- brain file updates at end of session

Claude may implement directly (without routing through Cursor) for:

- XS tasks (1–2 files, bug fixes, SQL, content)
- Tasks where the change is purely additive and low-risk
- Schema review and validation

Claude routes to the agent loop (civitas-implementer) for:

- multi-file UI work
- component iteration and visual refinement
- debugging local build or lint issues
- any larger code task best executed and reviewed through plan → implement → release-check

---

# Implementation Principles

Prefer **refinement over rebuilds**.

Make the **smallest safe change**.

Limit file scope when implementing.

Avoid refactoring unrelated code.

Preserve the existing design direction and UI hierarchy.

Do not introduce new dependencies without clear justification.

---

# Schema Field Rules

These fields are locked conventions.

| Use | Not |
|---|---|
| `layer` | `map_layer` |
| `distance_meters` | `distance_km` |
| `stop_narrative` | `notes` |
| `locations` | `places` |
| `location_functions` | `place_functions` |
| `location_functions` | Multi-service venues only — one business, multiple services. Never for independent businesses sharing an address |
| `Artist House` category | Historical Barbizon School painters' homes only (19th century) — use `Galerie d'Art` for living/contemporary artist studios |

Always verify field names before writing SQL or referencing schema fields in code.

---

# Brain Update Responsibility

Claude updates the brain files after every significant session.

After completing work:

1. Update `brain/current-state.md` — move completed items to Done, update blockers
2. Trigger brain sync via `/api/brain/sync-tasks` or update `brain/task-queue.md` directly
3. Commit brain updates with a clear message

Use the `ship-feature` command after a completed feature.  
Use the `update-brain` command after any significant state change.

---

## Session discipline

- One working tree, one active loop. A single repo checkout runs one `/run-loop`
  at a time — do not start a parallel implementation pass in the same tree.
- Parallel Claude Code sessions require a **git worktree on their own branch**.
  Never run two concurrent sessions against the same working directory.
- Strategy decided in any claude.ai chat lands in `brain/decisions.md` **before**
  another session acts on it. An undocumented decision does not exist for the
  next session.
- Gate instructions must name their executor unambiguously — e.g.
  "Luigi approves, claude.ai executes via MCP". "Claude" alone is ambiguous in a
  two-Claude system (claude.ai lead vs Claude Code loop); always say which one.
- **Canonical queue.** The `tasks` table (Supabase) is the canonical work queue;
  `brain/task-queue.md` is a generated display-only mirror
  (`pages/api/brain/sync-tasks.ts`). Dispatch and status (`execution_status`:
  `queued → in_progress → at_gate → done | blocked`) live in `tasks` / `outputs`,
  never in the mirror — see `.claude/commands/run-loop.md`.
- **Governance.** claude.ai dispatches and reviews; agents execute; irreversible
  actions (merge/deploy, prod SQL, publish, spend) are approved by Luigi. The
  dispatcher never approves its own irreversible actions. The system may *propose*
  changes to its own guardrails (`.claude/**`); it may never *enact* them — any
  task touching `.claude/**` is always human-gated, and no agent applies a
  `.claude/**` change in the same run that proposed it.
- **Permission fatigue is a bug signal.** A permission prompt the human doesn't
  understand is an allowlist bug — report it, don't approve it. Mechanical,
  reviewed-safe patterns belong in `.claude/settings.json` `permissions.allow`.
- Any change touching **locale routing, runtime config loading, or page data
  methods** (`getStaticProps`, `getServerSideProps`, `serverSideTranslations`)
  must be verified against a **deployed Vercel serverless runtime**, not only a
  local build. A green local build is necessary but not sufficient: file-tracing
  / serverless-bundling failures (confirmed root cause of the production
  `/en/...` 500 regression, fix/en-500-i18n-config, 2026-07 —
  `next-i18next.config.js` was not reliably bundled by Vercel's file tracer,
  invisible locally because the config sits in the local CWD) only appear in the
  deployed serverless runtime. The executable gate:
  - **Pre-merge:** authenticated spot-fetches of the highest-risk routes on the
    branch's **Vercel Preview** (previews are SSO-gated, so the raw
    `seo-audit.mjs` can't score them) — confirm the on-demand `/en/...` routes
    return 200 with real content, via `web_fetch_vercel_url`.
  - **Post-merge:** run `scripts/seo-audit.mjs` against **public production**
    immediately, and note the prior production deployment ID for instant
    rollback.
  - Follow-up: thread a Vercel Protection Bypass token into `seo-audit.mjs` to
    make the preview gate fully automated.
  Mandatory release-checker gate for this change class (see
  `.claude/agents/civitas-release-checker.md`, SEO audit check).

---

# Hard Constraints

- Do not convert Pages Router to App Router
- Do not rename existing slugs or IDs without a migration plan
- Do not run `git push --force`
- Do not expose secrets in committed files — `.env.local` is gitignored
- Do not modify `MAIN_BRAIN.md` — it is the master reference document
- Supabase project ref: `afqyrxtfbspghpfulvmy`