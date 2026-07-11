# CCC v3 — "La Fiche" (full location editor)

The pin editor grows into the base tool for building and maintaining the app:
map/list → preview card per location (photo, address, description, state) →
expand into the full record ("la fiche") editing every field and linked entity.

Process: Stage 0 is an ARCHITECT PLANNING LOOP — no code. Its output is an
architecture + feature proposal reviewed by Luigi and Claude before any
implementation loop runs. Then phased implementation.

---

## Locked decisions (lead-level — the architect plans within these)

1. ONE admin surface. /command-center absorbs /dashboard. The existing
   dashboard locations list + editor are raw material to absorb, not a parallel
   product. /dashboard routes get removed or redirected by the final phase.
2. ALL writes go through authed API routes using the verified-write pattern
   (service-role, epsilon compare, committed-writes-never-report-failure),
   and PATCH sends changed fields only. No client-direct Supabase writes.
3. Publishing stays a human act: the is_published toggle may exist in the UI
   (Luigi clicking IS the human gate) but must be visually distinct, confirm
   with a summary of what goes live, and never be part of a bulk operation.
4. Media is read-only display in v3 (existing R2 URLs). Upload/reorder waits
   for the photo-sprint pipeline. The fiche must show the media slots and
   their emptiness honestly — the gap is information.
5. Audit trail ships in v3: generalize the queued pin_moves task into a
   location_edits table (location_id, field, before, after, timestamp,
   source page). Every write endpoint records to it. Cheap insurance,
   already proven necessary.
6. Design language: existing tokens and the design-direction doc. This is an
   internal tool but it is not exempt from the aesthetic — "archival
   instrument," not SaaS admin panel.
7. Stack rules unchanged: Pages Router, no new deps without justification
   (a form library must be argued for, not assumed).

---

## Stage 0 — paste to Claude Code:

/run-loop PLANNING ONLY — no implementation. Delegate to civitas-architect:
produce docs/ccc-v3-fiche-plan.md, an architecture and feature proposal for
CCC v3 "La Fiche", the full location editor that becomes the base tool for
building and maintaining the app. Read first: docs/design-direction.md,
docs/schema-reference.md (note: known stale — verify fields against
pages/dashboard/locations/[id].tsx which lists the real column set),
pages/command-center/pins.tsx, pages/dashboard/locations/index.tsx and
[id].tsx, pages/api/locations/[id].ts, and the locked decisions in
docs/ccc-v3-locked-decisions.md [committed alongside this brief].

The plan must cover:
1. INFORMATION ARCHITECTURE — how map view, list view, preview card, and
   full fiche relate; URL structure under /command-center; how the pins
   editor integrates (same page with modes, or sibling pages sharing state).
2. THE PREVIEW CARD — exact contents (photo/placeholder, name, category,
   layer color, address, short description, published state, completeness),
   and its expand affordance into the fiche.
3. THE FICHE — full-field editor sections and their grouping (identity,
   position with embedded draggable mini-map, content FR, practical info
   with a proper opening_hours jsonb editor, flags/curation, media
   read-only, internal_notes with its "unverified" convention, linked
   entities: location_functions, tour_stops appearances, story mentions —
   read-only links in v3 or editable, argue it).
4. COMPLETENESS MODEL — define a per-location completeness score from real
   gaps (media, hours, address, descriptions) surfaced on cards and as list
   filters; this becomes the operational to-do system for content work.
5. FEATURE PROPOSALS — research current admin/editor UX patterns (you have
   WebSearch/WebFetch) and propose up to 8 additional features RANKED by
   value-to-effort for a single-operator heritage atlas. For each: one
   paragraph, effort S/M/L, and what it depends on. Do not include features
   requiring auth roles, multi-user, or media upload (deferred).
6. PHASING — cut the whole into 2–4 implementation loops, each independently
   shippable, each ending at the human gate, absorb-and-delete of /dashboard
   included in the final phase. Flag risks per phase.
7. OPEN QUESTIONS for the human gate — anything genuinely undecidable
   without Luigi.

Constraints: plan within the locked decisions; verify any external API or
library claim before writing it into the plan; the plan must name real files
and real fields (no invented schema). Release-checker then reviews the PLAN
for consistency with locked decisions and real schema. Stop at the gate with
the doc committed, unpushed.

---

## After Stage 0 (the human gate)

Luigi + Claude review docs/ccc-v3-fiche-plan.md together in claude.ai:
approve/trim the feature list, answer the open questions, lock the phasing.
Only then does Phase 1's /run-loop fire — with the approved plan as its
design authority, the same way the map passes used the design doc.

Expected phase shape (the architect may argue otherwise):
- Phase 1: preview cards on the pins map + list view with completeness
  filters (read paths, low risk, immediately useful for the photo sprint)
- Phase 2: la fiche — full editor with verified writes, hours editor,
  audit trail
- Phase 3: linked entities + absorb-and-delete /dashboard + polish
