# Current State

Last updated: 2026-03-13

---

## Status

Visual shell partially built. Supabase SDK installed and integrated with ISR + static fallback pattern. Schema fully designed but not yet migrated. Live data queries ready — blocked on `.env.local` anon key and media assets. Dev environment fully configured for autonomous AI development.

---

## Last Completed

- Persistent AI dev environment: settings.json, hooks, agents, slash commands all configured
- `brain/task-queue.md` created and seeded (Now / Next / Later / Blocked)
- `/next-task`, `/update-brain`, `/schema-check`, `/ship-feature` commands available
- 4 agents: civitas-architect, civitas-implementer, civitas-content-ops, civitas-release-checker
- Homepage hero: `<video autoPlay muted loop playsInline>` (asset still needed)
- Homepage: text stripped, CTAs fixed, map placeholder removed, WIP copy removed
- Navigation: mobile hamburger with animated X and active route state
- Featured place cards: `<Link>` with slugs, 7 entries in `data/places.ts`
- Schema: live Supabase schema documented (7 tables) in `docs/schema-reference.md` Part 1
- Schema: proposed Civitas target schema documented in `docs/schema-reference.md` Part 2
- `visual_works` + `visual_work_locations` geo model finalised
- Supabase SDK: `@supabase/supabase-js` installed, `lib/supabase.ts` with typed helpers + `toPlace()` adapter
- `pages/places/index.tsx` + `[slug].tsx`: ISR with live Supabase queries + static fallback
- ESLint: migrated to flat config (`eslint.config.mjs`), `npm run lint` clean on ESLint 9 / Next.js 16
- `tsconfig.json`: removed non-existent `jest` type reference, `tsc --noEmit` clean

---

## Blockers

| Blocker | Needed for |
|---|---|
| `/public/videos/hero-barbizon.mp4` | Hero video renders |
| `/public/images/places/*.jpg` (7 files) | Place card images render |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` | All live data queries |

---

## Next Tasks

See `brain/task-queue.md` for the full ordered queue. Top unblocked items:

1. Visual refinement — card design, large-screen layout width
2. Place page refinement (`pages/places/[slug].tsx`)
3. Schema migration — add `is_published`, `tour_type`, `difficulty` to `tours`

---

## Next Session Starting Point

Run `/next-task` to identify the top unblocked item.
If assets are now available, add them to `public/` and verify hero + place cards render.
If the Supabase anon key is available, begin data integration (task-queue Next section).
