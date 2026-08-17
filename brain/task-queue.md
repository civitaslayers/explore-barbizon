# Task Queue

Last updated: 2026-08-17

Tasks are ordered by priority within each section.
Move tasks between sections as status changes.
Update this file whenever work is completed or blockers are resolved.

Task tags:
- frontend
- schema
- data
- sql
- infra
- user-action

---

## Now
*Unblocked tasks that can be started immediately.*

- [ ] Reconcile all docs and code to the Claude-only tool model
- [ ] Per-record hreflang gating in SeoHead and sitemap
- [ ] Complete French content migration — 43 records remaining
- [ ] Cookieless page-view tracking — API route + client tracker
- [ ] [frontend] Tighten getStaticProps select on /places and /plan-your-visit
- [ ] Remove CCC Decisions and Memory panels
- [ ] Sitemap: add /history and /stories index routes to STATIC_ROUTES
- [ ] [schema] Finish populating Forest & Nature category
- [ ] Cards use 800w variants — srcset wiring
- [ ] [infra] upload-media.mjs: add --only=<slug> flag

---

## Next
*Unblocked after Now tasks or after a specific blocker is resolved.*

- [ ] Heritage Plaque verification pass (7 records)
- [ ] Consider media.r2_key column to decouple storage path from slug
- [ ] pin_moves audit log — record before/after coords + timestamp on every coordinate PATCH
- [ ] [frontend] Fix suggest.ts anon getTasks() blind read (same RLS-blind family as 82295116)
- [ ] [data,user-action] Define and seed Forest & Nature subcategories
- [ ] [frontend,schema] Boulder trails and climbing spots
- [ ] [data,schema] Add is_published, tour_type, difficulty to tours table
- [ ] [data,schema] Create layers table + migrate categories.layer text → FK
- [ ] [data,schema] Create visual_works + visual_work_locations tables
- [ ] [data,schema] Create artists + artist_locations tables
- [ ] [data,schema] Create stories + story_locations tables
- [ ] [frontend] Update middleware → proxy convention for Next.js compatibility
- [ ] [data,user-action] Improve featured places presentation
- [ ] [frontend] Dashboard v1: login screen
- [ ] [data,user-action] Polish hero locations
- [ ] [frontend] Dashboard v1: locations list
- [ ] [frontend] Dashboard v1: single location editor
- [ ] [infra] Visitor passport: gamified exploration layer
- [ ] [data,user-action] Build first walking trail
- [ ] [frontend] Dashboard v1: overview page
- [ ] [data,user-action] Seed historical visual works layer — postcards first
- [ ] [data,user-action] Events layer: temporary map pins for exhibitions and openings
- [ ] [infra] QR infrastructure: generate and store qr_code_url on locations
- [ ] [infra] Multi-town migration: town_settings, composite slugs, category_templates
- [ ] [frontend] Merchant discovery trails
- [ ] [infra] AI guide: conversational layer grounded in database content
- [ ] [frontend] Wire tours page: tours + tour_stops to pages/tours/[slug].tsx

---

## Later
*Valid work, not yet prioritised.*

- [ ] [infra] run-loop: assign live-schema introspection to the lead, not the architect
- [ ] [infra] run-loop: fallback when civitas-architect bloats/API-cuts on code-planning
- [ ] [infra] Extend the deployed-runtime verification class to next.config.mjs images.remotePatterns
- [ ] [infra] Worktree bootstrap: symlink node_modules + copy .env.local for fresh worktrees

---

## Blocked
*Cannot proceed until the blocker is resolved.*

- [ ] [frontend,user-action] Add real hero video asset
- [ ] [frontend] Card polish and image treatment pass
- [ ] [infra] Replace data/tours.ts with live Supabase query
