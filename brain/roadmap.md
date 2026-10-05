# Roadmap

Retired as a maintained checklist (2026-10-05). This file's Phase 1 / Phase 2
task lists (data integration, schema migrations, dashboard v1 — last updated
2026-03-13) are stale and superseded by the Supabase `tasks` table, which is
now the sole canonical work queue (see `brain/decisions.md`, 2026-08-16
entries, and `CLAUDE.md`). Do not read this file for current priorities —
read `tasks` (via CCC at `/command-center/tasks`) and `brain/current-state.md`.

Salvaged below: long-term product ideas that were never literal checklist
items and aren't tracked anywhere else. These are speculative future
directions, not committed work — if one becomes real work, file it in
`tasks`.

---

## Long-Term Product Ideas (salvaged, speculative, not scheduled)

### QR infrastructure
Physical QR plaques around town linking into map/place pages.

### Merchant discovery trails
Curated local trails connecting galleries, food, commerce, and culture.

### Visual works layer
Paintings, postcards, photographs, and archival imagery linked to places via
the `visual_works` + `visual_work_locations` model (see
`docs/schema-reference.md` Part 2). Postcards are the practical starting
point. Geo attribution uses `geo_confidence` — never assume exact coordinates
from mosaics or secondary sources.

### Story mode
Deeper cultural narratives and articles via the `stories` table (now live —
see `docs/schema-reference.md`).

### AI guide
Conversational layer grounded in database content. Deferred.

### Events layer
Temporary map pins for exhibitions, openings, concerts, seasonal activity.

### Visitor passport / visits tracking
Longer-term gamified exploration layer.
