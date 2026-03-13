# Decisions

A log of architectural, product, and workflow decisions with reasoning.
Add new entries at the top.

---

## 2026-03-13
**Decision:** Use repo-based project brain for Civitas / Explore Barbizon.
**Reason:** Preserve continuity across AI sessions and across machines.
**Consequence:** Core context must live in files, not only in chat history.

---

## March 2026
**Decision:** Use Cursor for front-end implementation and iteration, not Claude alone.
**Reason:** Claude alone was too slow and did not produce the desired level of contemporary visual refinement.
**Consequence:** Claude/ChatGPT handles strategy, structure, copy, and planning. Cursor handles actual code, UI iteration, and component changes.

---

## March 2026
**Decision:** Move project out of Google Drive into a purely local directory.
**Reason:** Google Drive interfered with local dev behavior, file watching, and build reliability.
**Consequence:** Project must be developed from a local path (e.g. `~/Documents/Projects/explore-barbizon`). Do not use synced folders.

---

## March 2026
**Decision:** Homepage should be visual-first and video-led, not essay/copy-led.
**Reason:** User preference and strategic alignment — beauty and utility attract users faster than text.
**Consequence:** Hero should be a cinematic looping video with minimal overlay text. Long-form content lives deeper in the site.

---

## March 2026
**Decision:** Adopt a refinement-over-rebuild workflow.
**Reason:** Full rebuilds break coherence, waste time, and produce regressions. Iterative passes preserve editorial DNA.
**Consequence:** Build structure once, then refine section by section. Never prompt for full page rewrites.

---

## March 2026
**Decision:** Next.js is the real product layer. Webflow is temporary and being phased out.
**Reason:** Next.js enables full control over the map, place pages, tours, dashboard, and data integration. Webflow cannot support the product long-term.
**Consequence:** All core surfaces (homepage, map, place pages, tour pages, dashboard) should move to Next.js. Webflow may remain for selected editorial pages only.

---

## March 2026
**Decision:** Supabase is the single source of truth for all data.
**Reason:** Centralised, queryable, scalable database with auth and row-level security.
**Consequence:** All locations, tours, media, and user data live in Supabase. Static `data/` files in the repo are temporary placeholders only.

---

## March 2026
**Decision:** Mapbox is the spatial engine.
**Reason:** Best-in-class for custom map styling, layer control, and geo-narrative use cases.
**Consequence:** All map rendering, location pins, and trail display go through Mapbox.

---

## March 2026
**Decision:** Dashboard v1 to be built inside the same Next.js codebase.
**Reason:** Avoid a separate admin tool. Keep the stack unified and reduce maintenance overhead.
**Consequence:** Dashboard lives at a protected route inside the main app.

---

## March 2026
**Decision:** Finish Barbizon MVP before any multi-town migration.
**Reason:** Premature abstraction for multi-town would add complexity before the core product is proven.
**Consequence:** Multi-town schema changes (`town_settings`, `category_templates`, composite slugs) are deferred until Barbizon MVP is complete.

---

## March 2026
**Decision:** Postcards are a better starting point than paintings for the historical media layer.
**Reason:** Barbizon mosaic coordinates are not reliable exact painting locations and require serious historical research. Postcards are more tractable.
**Consequence:** The historical visual overlay feature should begin with postcards, not paintings.

---

## March 2026
**Decision:** Enforce specific field name conventions in the schema.
**Reason:** Consistency across queries, migrations, and AI-assisted development sessions.
**Consequence:** Always use `layer` (not `map_layer`), `distance_meters` (not `distance_km`), `stop_narrative` (not `notes`). These override any default assumptions.
