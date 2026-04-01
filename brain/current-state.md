# Current State

> **Format guide:** Status = one sentence present tense. Last Completed = newest first, max 15, area tag in brackets. Blockers = real blockers only. Next Tasks = max 5, priority order, actionable verbs. Update after every significant work block.

Last updated: 2026-04-01

## Status

Platform is live at explorebarbizon.com with four complete content layers, 5 published stories, and a working AI operating system (CCC + brain files). Primary gap is editorial content depth and a few schema items.

---

## Last Completed

- [schema] Added `is_published`, `tour_type`, `difficulty` to `tours` table — both existing tours set to published
- [content] Wrote and published 5 stories (all published in Supabase)
- [schema] Confirmed UNIQUE constraints exist on slug columns for locations, categories, tours, stories
- [content] Hero video deployed (repo-hosted placeholder at `/public/videos/hero-barbizon.mp4` — full edited version pending, will migrate to Cloudflare Stream)
- [schema] Created `stories` + `story_locations` tables — wired to frontend
- [map] Trail/routes system live: 5 seeded trails with GeoJSON, dashed-line rendering, click-to-reveal
- [map] Map icon system redesigned to subcategory-level teardrop pins (Noun Project SVGs)
- [media] Cover images seeded across ESS, Art & History, Forest & Nature locations via SQL
- [frontend] Hero image pipeline wired: `getLocationBySlug` joins `media` table; CSS blend/fade bugs resolved
- [ai-ops] AI operating system rewritten: Claude as lead, Cursor as implementer, GPT/Grok as supplementary
- [ai-ops] CCC (Command Center) live at `/command-center` — password protected, task management, dispatch loop
- [data] Four complete content layers populated (ESS, Art & History, Forest & Nature, Practical)

---

## Blockers

- Supabase Edge Function proxy not yet built — blocks two features (not yet defined which)
- Hero video full edit pending — current repo file is a placeholder clip

---

## Next Tasks

1. **Verify 4 trail pin coordinates** against Google Maps — Futaie du Bas-Breau, Parcours FB, Sentier bleu no.6, Sentier des Peintres (factual integrity issue, ~30 min)
2. **Write Art & History narratives** for published locations — target all 21, start with Maison de Millet and Auberge Ganne (core editorial differentiator)
3. **Remove `data/tours.ts` static fallback** once both tours have complete Supabase data — currently a safety net; `pages/tours/[slug].tsx` tries Supabase first and falls back gracefully
4. **Dashboard v1** — move from backlog to active: login screen → overview → locations list → location editor (content velocity blocker at scale)
5. **Create `artists` + `artist_locations` tables** — next schema step per implementation sequence in `docs/schema-reference.md`

---

## Next Session Starting Point

Run trail coordinate verification for the 4 unconfirmed pins, then move directly into writing the first Art & History narrative (Maison de Millet).
