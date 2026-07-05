# Current State

Last updated: 2026-07-05

## Status

Agent loop operational; first /run-loop completed (lint clean); gates verified on free-tier Supabase (no branching — guard-hook mode).

---

## Last Completed

- [ai-ops] Full repo audit — identified and queued all stale docs, Cursor rules, agent files
- [ai-ops] Project knowledge re-indexed — all repo files now visible including repo-map.md and ai-operating-system.md
- [ai-ops] brain/session-start.md deleted (deprecated)
- [data] atelier-rouge fictional placeholder removed from data/places.ts, data/highlights.ts, data/tours.ts
- [ai-ops] CLAUDE.md updated — SQL via MCP, table naming rules, repo-map + design-direction references added
- [ai-ops] MAIN_BRAIN.md updated — location count, Forest & Nature status, near-term priorities, Webflow retired
- [ai-ops] brain/architecture-summary.md updated — CCC added to stack, field naming rules section added
- [ai-ops] docs/ai-operating-system.md updated — Claude Code CLI removed, Supabase MCP workflow documented
- [ai-ops] Supabase memory rows updated — ops_worktree and context_ai_workflow corrected
- [ai-ops] .cursor/rules/database-supabase.mdc — table naming rules added
- [ai-ops] .claude/agents/civitas-content-ops.md — stale data/places.ts reference fixed
- [ai-ops] .claude/agents/civitas-release-checker.md — broken-pages check updated
- [ai-ops] .claude/hooks/session-start.sh — stale session-start.md reference fixed
- [map] GeolocateControl added to MapGL.tsx — real-time GPS dot with heading cone
- [schema] places + place_functions tables dropped — all data migrated to locations + location_functions
- [ai-ops] agent loop installed with tools: allowlists, /run-loop, prod-write-guard (hardened matcher), project-scoped Supabase MCP
- [frontend] 8 lint errors fixed via first loop run
- [infra] eslint ignores for .next and worktrees
- [infra] free-tier gate adaptation in content-ops
- [data] DB hygiene migration executed in production via Supabase MCP — pin_function_search_paths, add_covering_indexes_for_fks, drop_media_purged_backup_table; advisors verified clean

---

## Blockers

- Hero video full edit pending — current clip is placeholder; migrate to Cloudflare Stream when ready
- Supabase branching unavailable on free tier

---

## Next Tasks

1. Photo sprint batch 1 with hours/website/address collection
2. Field-verify Barjole/Roz duplicate coordinates

---

## Next Session Starting Point

Photo sprint batch 1 prep — regenerate the field checklist from live data and confirm the walking batches.
