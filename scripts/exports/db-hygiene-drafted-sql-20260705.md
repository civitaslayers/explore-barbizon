# DB Hygiene — Drafted SQL for Human Approval (2026-07-05)

Project: `afqyrxtfbspghpfulvmy` (free tier, no dev branch available).

**None of the SQL in this file has been executed.** All statements below are drafted
for human review and must be run manually (or explicitly authorized) by a human with
production write access. This agent has no `apply_migration` calls in this task and
did not execute any ALTER, CREATE INDEX, or DROP statement.

---

## Part 1 — Pin `search_path` on two functions

### Introspection result (read-only SELECT, executed)

```json
[
  {
    "schema": "public",
    "function_name": "check_location_proximity",
    "identity_args": "",
    "is_security_definer": false,
    "current_settings": null,
    "notes": "Trigger function, no arguments. References the `locations` table unqualified — resolves fine under `public, pg_temp`. Not SECURITY DEFINER. search_path currently unpinned (current_settings = null)."
  },
  {
    "schema": "public",
    "function_name": "set_updated_at",
    "identity_args": "",
    "is_security_definer": false,
    "current_settings": null,
    "notes": "Trigger function, no arguments, no table references at all. Not SECURITY DEFINER. search_path currently unpinned (current_settings = null)."
  }
]
```

Both functions take no arguments, are not `SECURITY DEFINER`, reference only `public` schema
objects (or none), and neither currently has `search_path` pinned — both ALTERs below are needed.

### Drafted SQL — REQUIRES HUMAN APPROVAL — NOT EXECUTED

```sql
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_location_proximity() SET search_path = public, pg_temp;
```

---

## Part 2 — Covering indexes for unindexed FKs

### Introspection result (read-only SELECT, executed) — 8 rows returned

| table_name | fk_constraint | fk_column | suggested_index_name |
|---|---|---|---|
| location_functions | location_functions_category_id_fkey | category_id | idx_location_functions_category_id |
| locations | locations_category_id_fkey | category_id | idx_locations_category_id |
| media | media_location_id_fkey | location_id | idx_media_location_id |
| outputs | outputs_task_id_fkey | task_id | idx_outputs_task_id |
| routes | routes_town_id_fkey | town_id | idx_routes_town_id |
| tour_stops | tour_stops_location_id_fkey | location_id | idx_tour_stops_location_id |
| tour_stops | tour_stops_tour_id_fkey | tour_id | idx_tour_stops_tour_id |
| tours | tours_town_id_fkey | town_id | idx_tours_town_id |

### Drafted SQL — REQUIRES HUMAN APPROVAL — NOT EXECUTED

```sql
CREATE INDEX IF NOT EXISTS idx_location_functions_category_id ON public.location_functions(category_id);
CREATE INDEX IF NOT EXISTS idx_locations_category_id ON public.locations(category_id);
CREATE INDEX IF NOT EXISTS idx_media_location_id ON public.media(location_id);
CREATE INDEX IF NOT EXISTS idx_outputs_task_id ON public.outputs(task_id);
CREATE INDEX IF NOT EXISTS idx_routes_town_id ON public.routes(town_id);
CREATE INDEX IF NOT EXISTS idx_tour_stops_location_id ON public.tour_stops(location_id);
CREATE INDEX IF NOT EXISTS idx_tour_stops_tour_id ON public.tour_stops(tour_id);
CREATE INDEX IF NOT EXISTS idx_tours_town_id ON public.tours(town_id);
```

---

## Part 3 — Export and drop `media_purged_20260610`

### Introspection result (read-only SELECT, executed)

- Table exists: **yes**
- Columns (9): `id` (uuid), `location_id` (uuid), `type` (text), `url` (text),
  `caption` (text), `is_premium` (boolean), `display_order` (integer),
  `created_at` (timestamp with time zone), `purged_at` (timestamp with time zone)
- Row count: **55**
- Referencing foreign keys (other tables pointing at this table): **none found** (0 rows)

### Export

- File written: `scripts/exports/media_purged_20260610_20260705.json`
- Array length in file: **55**
- Row count from `COUNT(*)`: **55**
- Integrity check: **PASS** (55 == 55)

### Drafted SQL — REQUIRES HUMAN APPROVAL — NOT EXECUTED

```sql
-- Precondition: export written to scripts/exports/media_purged_20260610_20260705.json,
-- array length (55) == row_count (55), zero referencing FKs found.
DROP TABLE IF EXISTS public.media_purged_20260610;
```

---

## Summary

No DDL was executed as part of producing this file. All ALTER FUNCTION, CREATE INDEX,
and DROP TABLE statements above are staged for human approval and execution.
