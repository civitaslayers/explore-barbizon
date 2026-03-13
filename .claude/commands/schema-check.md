---
description: Check the current schema state and propose the next migration step.
---

Read `docs/schema-reference.md` in full.

Then do the following:

1. **Report live schema state** (Part 1 of schema-reference.md):
   - List the 7 confirmed live tables
   - Note any known gaps (missing `is_published` on tours, etc.)

2. **Report proposed schema state** (Part 2 of schema-reference.md):
   - List all proposed tables and whether each has been created
   - Mark each as: `✅ live` / `⏳ not yet created` / `🔧 partially done`

3. **Identify the next migration**:
   - Based on the implementation sequence in schema-reference.md, identify the next step that has not been done
   - State the exact SQL needed to execute it
   - Flag any dependencies or risks

4. **Field naming check**:
   - Confirm the following are used correctly throughout the codebase:
     - `layer` not `map_layer`
     - `distance_meters` not `distance_km`
     - `stop_narrative` not `notes`
   - Search `pages/`, `data/`, and `lib/` for any violations

5. If $ARGUMENTS is "migrate [table-name]", generate the full SQL migration for that table based on the proposed schema, ready to run via the Supabase Management API.

Output the migration SQL in a fenced block:
```sql
-- Migration: [table name]
-- Date: [today]
-- Risk: [none / low / breaking]

[SQL here]
```
