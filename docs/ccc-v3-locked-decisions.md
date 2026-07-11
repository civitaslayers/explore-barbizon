# CCC v3 — "La Fiche" — Locked Decisions

Lead-level constraints. The architect plans within these; implementation loops
do not reopen them. Extracted from `docs/ccc-v3-fiche-planning-brief.md` so the
brief's cross-reference resolves to a real file.

1. **ONE admin surface.** /command-center absorbs /dashboard. The existing
   dashboard locations list + editor are raw material to absorb, not a parallel
   product. /dashboard routes get removed or redirected by the final phase.
2. **All writes go through authed API routes** using the verified-write pattern
   (service-role, epsilon compare, committed-writes-never-report-failure),
   and PATCH sends changed fields only. No client-direct Supabase writes.
3. **Publishing stays a human act.** The is_published toggle may exist in the UI
   (Luigi clicking IS the human gate) but must be visually distinct, confirm
   with a summary of what goes live, and never be part of a bulk operation.
4. **Media is read-only display in v3** (existing R2 URLs). Upload/reorder waits
   for the photo-sprint pipeline. The fiche must show the media slots and
   their emptiness honestly — the gap is information.
5. **Audit trail ships in v3.** Generalize the queued pin_moves task into a
   location_edits table (location_id, field, before, after, timestamp,
   source page). Every write endpoint records to it. Cheap insurance,
   already proven necessary.
6. **Design language: existing tokens and the design-direction doc.** This is an
   internal tool but it is not exempt from the aesthetic — "archival
   instrument," not SaaS admin panel.
7. **Stack rules unchanged.** Pages Router, no new deps without justification
   (a form library must be argued for, not assumed).
