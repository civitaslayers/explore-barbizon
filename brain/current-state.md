# Current State

Last updated: 2026-07-10

## Status

Agent loop operational, proven across multiple /run-loop cycles including a HOLD → fix → SHIP iteration. Map Immersion Pass 1 shipped and pushed to main (Mapbox Standard style, fixed-dawn light, terrain, camera choreography). Gates verified on free-tier Supabase (no branching — guard-hook mode). CCC v2 (Command Center) complete and pushed to main — fail-closed auth over the admin API routes, service-role verified writes, and a full pin editor (drag-to-move with proximity guard, stack handling, search, click inspector, address display, sidebar link). Luigi completed a full manual pin-verification pass (~50 pins re-placed via the editor); published count now 106.

---

## Last Completed

- [ccc] CCC v2 complete — fail-closed auth over API routes, service-role verified writes, pin editor with stack handling/search/inspector/address display, sidebar link.
- [data] Root cause of silent saves found and fixed twice: (a) anon-key writes were RLS no-ops, (b) comparator false-500s on float equality — a committed write is never again reported as failed.
- [data] Full manual pin verification pass by Luigi (~50 pins re-placed via editor); Barjole/Roz separated to true positions; le-royal confirmed correct.
- [data] Via Claude/Supabase MCP with approval: plaine-angelus-ferme-couvent renamed to ferme-du-couvent (slug + name; painting site already has its own pin), and duplicate rocher-elephant DELETED (unreferenced NE duplicate; snapshot preserved in chat + this entry: 48.4415,2.6195, viewpoint). Published count now 106.
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
- [map] Map Immersion Pass 1 shipped — Mapbox Standard style migration (custom layers preserved via slots), 3D terrain (exaggeration 1.2), documentary camera choreography (load glide + pitch-55 pin select), all pins/routes/geolocate intact; commit 0ca295f
- [map] Pass 1.5 revision — time-synced light replaced with a permanent dawn preset; light override control removed; POI/transit labels suppressed via Standard config (road labels/house numbers kept on)

---

## Blockers

- Hero video full edit pending — current clip is placeholder; migrate to Cloudflare Stream when ready
- Supabase branching unavailable on free tier

---

## Next Tasks

1. Content pass on ferme-du-couvent description (currently describes the plain, not the farm; verify the "à l'ouest" direction claim against a Tier-1 source before publishing the rewrite)
2. Photo sprint batch 1 with hours/website/address collection

---

## Next Session Starting Point

Content pass on ferme-du-couvent description (currently describes the plain; verify "à l'ouest" direction claim against Tier-1 before publishing rewrite); then photo sprint batch 1 prep.
