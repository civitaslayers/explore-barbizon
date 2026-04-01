# Brain File Format Reference

Last updated: 2026-04-01

This document defines the correct format for all files in `brain/`.
Read this before editing any brain file. Keep formats consistent — AI sessions depend on predictable structure.

---

## brain/current-state.md

> **Format guide:** Status = one sentence present tense. Last Completed = newest first, max 15, area tag in brackets. Blockers = real blockers only. Next Tasks = max 5, priority order, actionable verbs. Update after every significant work block.
>
> # Current State
>
> Last updated: YYYY-MM-DD
>
> ## Status
> [One sentence. Present tense.]
>
> ## Last Completed
> - [area] What was done — newest first, max 15 items
>
> ## Blockers
> - What is blocked and why, or "(none)"
>
> ## Next Tasks
> 1. Action verb + what + why if not obvious
>
> ## Next Session Starting Point
> [One sentence.]

**Rules:**
- `Last Completed` uses past tense, area tag in brackets: `[schema]`, `[frontend]`, `[content]`, `[map]`, `[ai-ops]`, `[data]`, `[infra]`
- Never delete completed items — trim to max 15, keeping most recent
- `Next Tasks` are actionable, not vague ("Write Maison de Millet narrative" not "Content work")

---

## brain/task-queue.md

> ⚠️ **Generated file — do not edit manually.**  
> Use the **→ brain** button in CCC, or `POST /api/brain/sync-tasks`, to regenerate from live Supabase task state.  
> Manual edits will be overwritten on next sync.

Format is auto-generated. Structure: Now / Next / Later / Blocked sections with task lines.

---

## brain/decisions.md

> **Format guide:** Newest entry at top. Format per entry below. Never delete old entries. Migration risk only for schema/data decisions.
>
> ## YYYY-MM-DD
> **Decision:** What was decided  
> **Reason:** Why  
> **Consequence:** What changes  
> **Migration risk:** none | low | breaking

**Rules:**
- Newest decision at the top
- Never delete old decisions — permanent log
- Every architectural, schema, or workflow decision gets an entry
- Tag `**Migration risk:**` only for decisions touching database or data

---

## brain/session-start.md

Deprecated. Replaced by `CLAUDE.md` session start protocol.  
Do not edit. Will be removed in a future cleanup.

---

## General rules for all brain files

- Use plain markdown, no HTML
- Dates always in `YYYY-MM-DD` format
- Keep files focused — no strategy documents live here (strategy → `MAIN_BRAIN.md`)
- After any significant work block: update `current-state.md` first, then trigger CCC → brain sync for `task-queue.md`
- Commit brain updates with message: `docs: update brain after [brief description]`
