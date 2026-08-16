# Archive — decisions table (2026-03-21 to 2026-04-02)

These entries were written to the Supabase `decisions` table, which received no writes
after 2026-04-02 and was formally retired on 2026-08-16. They are preserved here so that
`brain/decisions.md` is the single decision log going forward.

Ordered oldest first. Append below the existing entries in `brain/decisions.md`, or place
in a clearly marked archive section — do not interleave with the reverse-chronological
current entries.

---

## 2026-03-21 — Use visual_works + visual_work_locations for all historical media
**Decision:** Use `visual_works` + `visual_work_locations` junction table with a `geo_confidence` field instead of a paintings table with direct coordinates.
**Reason:** Historic visual material cannot be reliably assigned exact coordinates. Barbizon mosaics are not reliable exact painting locations. Geo confidence must be explicit: exact / approximate / interpretive / unknown. No coordinates stored on the work itself — attribution lives entirely in the junction table.
**Context:** Needed a way to store paintings, postcards, photographs, and engravings with geographic attribution.

## 2026-03-21 — Use repo-based project brain (brain/ + docs/) for AI continuity
**Decision:** All project state, decisions, and task queues live in `brain/` and `docs/` files in the repo, not only in chat history.
**Reason:** Chat history does not persist across sessions. Brain files allow any AI session to resume with full context.
**Context:** Multiple AI sessions across Claude Code, Cursor, and ChatGPT needed shared project context.
**Superseded in part (2026-08-16):** `tasks` and `outputs` are canonical in Supabase; `brain/task-queue.md` is a generated mirror, not a source of truth.

## 2026-03-21 — Cursor handles frontend implementation; Claude handles architecture
**Decision:** Claude/ChatGPT handle architecture, strategy, schema design, and planning. Cursor handles frontend code, UI iteration, and component-level changes.
**Reason:** Different tools have different strengths. This separation keeps the system stable and produces better output at each layer.
**Context:** Claude alone was producing UI that lacked contemporary visual refinement and iteration speed.

## 2026-03-21 — Keep Pages Router — do not migrate to App Router
**Decision:** Maintain Next.js Pages Router. Do not migrate to App Router without explicit instruction.
**Reason:** Migration would be a large, risky refactor with no immediate product benefit. All existing patterns work correctly on Pages Router.
**Context:** Next.js App Router is now the default but the project started on Pages Router.

## 2026-03-21 — Supabase is the single source of truth for all data
**Decision:** All locations, tours, media, and user data live in Supabase. Static `data/` files in the repo are temporary placeholders only.
**Reason:** Centralised, queryable, scalable database with auth and row-level security. Enables live updates, dashboard editing, and AI-readable data without redeploys.
**Context:** The project started with static `data/places.ts` and `data/tours.ts` files.

## 2026-03-21 — Mapbox is the spatial engine
**Decision:** All map rendering, location pins, clustering, and trail display go through Mapbox GL JS.
**Reason:** Best-in-class for custom map styling, layer control, and geo-narrative use cases. Mapbox Static API also used for place card thumbnails.
**Context:** Needed a map layer for place discovery with custom styling.

## 2026-03-21 — Homepage is visual-first and video-led
**Decision:** Hero is a `<video>` element with autoPlay muted loop playsInline. Minimal text overlay: eyebrow + H1 + two CTAs only. Long-form content lives deeper in the site.
**Reason:** Beauty and utility attract users faster than text. The video asset must be in `/public/videos/` — code is in place, asset pending.
**Context:** Early versions had heavy copy on the homepage.

## 2026-03-21 — Refinement-over-rebuild workflow
**Decision:** Build structure once, then refine section by section. Never prompt for full page rewrites.
**Reason:** Full rebuilds break coherence, waste time, and produce regressions. Iterative passes preserve editorial DNA and allow controlled, reviewable diffs.
**Context:** Early sessions involved full page rewrites that caused regressions.

## 2026-03-21 — Dashboard v1 lives inside the same Next.js codebase
**Decision:** Dashboard lives at `/dashboard` within the main Next.js app — same codebase, same Supabase client.
**Reason:** Avoids a separate admin tool. Keeps the stack unified and reduces maintenance overhead. Protected routes handle auth.
**Context:** Considered a separate admin tool (e.g. Retool, separate Next.js app).

## 2026-03-21 — Finish Barbizon MVP before any multi-town migration
**Decision:** Multi-town schema changes (`town_settings`, `category_templates`, composite slugs) are deferred until Barbizon MVP is complete.
**Reason:** Premature abstraction would add complexity before the core product is proven. The `town_id` FK is already on `locations` — migration will be tractable when the time comes.
**Context:** The long-term vision is a multi-town platform (Civitas Layers).

## 2026-03-21 — Postcards are the practical starting point for the historical media layer
**Decision:** Begin the historical visual overlay with postcards. Paintings require serious historical research and mosaic coordinates are unreliable.
**Reason:** Barbizon mosaic coordinates are not reliable exact painting locations. Postcards are more tractable and still historically significant. Use `geo_confidence = interpretive` or `unknown` for mosaic-derived positions.
**Context:** The `visual_works` model covers paintings, postcards, photographs, and engravings.

## 2026-03-21 — Enforce specific schema field name conventions
**Decision:** Always use `layer` (not `map_layer`), `distance_meters` (not `distance_km`), `stop_narrative` (not `notes`). These override any default assumptions.
**Reason:** Consistency across queries, migrations, and AI sessions. Documented in `CLAUDE.md` and `docs/schema-reference.md`.
**Context:** AI-assisted development sessions were generating inconsistent field names.

## 2026-03-21 — show_in_editorial dual-filter pattern
**Decision:** Both `locations.show_in_editorial` AND `categories.show_in_editorial` must be true for a location to appear in the editorial listing. Two independent filters, both boolean.
**Reason:** `categories.show_in_editorial` filters whole categories (utility vs. cultural). `locations.show_in_editorial` filters individual locations within an eligible category. Allows fine-grained control without schema changes.
**Context:** Needed to hide utility locations (Parking, Bus Stop) from the places listing without unpublishing them.

## 2026-03-21 — CCC as an AI operating system inside the Next.js app
**Decision:** Command Center is built as an internal tool at `/command-center` within the same Next.js codebase — tasks, decisions, memory, prompts, outputs all in Supabase.
**Reason:** Keeps the operating system inside the repo where all the context lives. Avoids external tools that would fragment state.
**Context:** Needed a way to coordinate tasks across Claude, Cursor, and ChatGPT without leaving the project.
**Superseded in part (2026-08-16):** `decisions` and `memory` retired as tables; `brain/decisions.md` is the single decision log. `tasks` and `outputs` remain canonical in Supabase.

## 2026-03-21 — Project must be developed from a local directory, not Google Drive
**Decision:** Develop from a local path only (e.g. `~/Documents/Projects/explore-barbizon`). Do not use synced or cloud-mounted folders.
**Reason:** Google Drive interfered with local dev behaviour, file watching, and build reliability.
**Context:** Early development was inside a Google Drive synced folder.

## 2026-04-02 — Add barbizonvillagedespeintres.wordpress.com as Tier 3 source
**Decision:** `barbizonvillagedespeintres.wordpress.com` is added as a Tier 3 source alongside `grappilles.fr`. Subject to identical policy: valuable for orientation and anecdote, must be cross-verified against Tier 1 sources before any factual claim is published.
**Reason:** The author has institutional standing (former Tourism Office president) and the blog covers restaurants, boutiques, celebrities, trails and village history with detail not found in official sources. Not systematically updated since ~2015 but the historical content remains useful. Same rules as grappilles.fr: credited research contribution, not primary authority.
**Context:** A second blog by Jean-Michel Mahenc (former Président de l'Office du Tourisme de Barbizon), rich in anecdotal detail, village atmosphere, commerce listings and historical context.

## 2026-04-02 — Duplicate location elimination policy established
**Decision:** When duplicate locations are found: keep the record with better GPS accuracy and more complete content; re-point any `tour_stops` FKs to the keeper; merge narrative content before deleting; document in the session log.
**Reason:** Eliminates map pin doubling, prevents confusing duplicate place pages, and ensures tour routes stay intact.
**Context:** A session audit found 6 duplicate location records. Pattern applied to: `medallion-millet-rousseau`, `lesquisse-hotel-bar`, `maison-theodore-rousseau`, `besharat-gallery-ess`, `musee-millet`, `parcours-mosaiques`.

## 2026-04-02 — L'Ermitage Saint Antoine reopening date confirmed as 26 January 2026
**Decision:** All L'Ermitage content uses 26 January 2026.
**Reason:** Historical accuracy principle: when the owner confirms a date, that overrides inferred dates from third-party review timestamps. Restaurant Guru page updated 30 January 2026 confirms the review was written days after reopening.
**Context:** Initially entered as January 2025 based on a misread of review timestamps.

## 2026-04-02 — Galerie 41 identified as Mairie-managed municipal exhibition space
**Decision:** Galerie 41 is managed by the Mairie of Barbizon, not a private association. Expositions announced on barbizon.fr. Free admission, weekly rotation.
**Reason:** Mairie-managed spaces should be noted as such in descriptions to help visitors understand the public/open nature of the programming.
**Context:** 41 Grande Rue flagged as a temporary exhibition space similar to Cercle Laure Henry.

## 2026-04-02 — Cercle Laure Henry: lay association, not Mairie-owned
**Decision:** Cercle Laure Henry is run by Les Amis du Cercle Laure Henry, a private lay Christian association founded February 2016. Receives some funding support but is not municipally managed.
**Reason:** Distinction matters for editorial accuracy: Galerie 41 = municipal; Cercle Laure Henry = private associative.
**Context:** The Cercle was believed to possibly be Mairie-funded.
