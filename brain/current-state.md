# Current State

Last updated: 2026-04-06

## Status

Full project file audit complete — docs, brain files, Cursor rules, and agent files updated; atelier-rouge placeholder removed; Supabase memory rows corrected.

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

---

## Blockers

- Hero video full edit pending — current clip is placeholder; migrate to Cloudflare Stream when ready

---

## Next Tasks

1. Continue location data entry — nos. 41–63 Grande Rue still unreviewed
2. Verify coordinates for four trail pins (Futaie du Bas-Breau, Parcours FB, Sentier bleu no.6, Sentier des Peintres)
3. Wire artists grid — design artists + artist_locations tables, seed initial artist records
4. Expand /about to absorb practical visitor content (getting here, seasons, accessibility)
5. Tighten getStaticProps select on /places and /plan-your-visit (136 kB page data warning)

---

## Next Session Starting Point

Continue location data entry from no. 41 Grande Rue; coordinate verification for four trail pins is also unblocked.
