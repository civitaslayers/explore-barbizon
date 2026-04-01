# Decisions

A log of architectural, product, and workflow decisions with reasoning.
Add new entries at the top.

---

> **Format guide:** Newest entry at top. Format: `## YYYY-MM-DD` / **Decision** / **Reason** / **Consequence** / **Migration risk** (schema/data decisions only). Never delete old entries.

## 2026-04-01
**Decision:** `stories.type` added with values `'history'` and `'guide'`; all existing stories set to `'history'`  
**Reason:** Practical visitor content ("where to sleep", "where to eat") belongs in a different editorial register from cultural essays. Same `/stories` route, different visual treatment per type.  
**Consequence:** `/stories` page renders two sections — essays (history) above with full editorial layout; practical guides (guide) below with a card/list treatment. New guide-type stories must set `type = 'guide'` on insert. CHECK constraint enforces valid values.  
**Migration risk:** low  

---

## 2026-04-01
**Decision:** `is_premium` on locations means eligible for featured placement in curated Places sections — not a visitor-facing paywall  
**Reason:** Monetisation model: local businesses pay to be prioritised in curated callout sections ("Best tables", "Where to stay") on `/places`. `is_premium` gates eligibility; `is_featured` gates whether they are currently featured.  
**Consequence:** Curated sections on `/places` query `is_featured = true` ordered by `curation_order` ASC (nulls last), then name. In the future, `is_premium = true` is a prerequisite for `is_featured = true` for commercial listings. Do not expose `is_premium` as a label to visitors — it is an internal commercial flag only.  
**Migration risk:** none  

---

## 2026-04-01
**Decision:** `curation_order` integer column added to `locations`  
**Reason:** `is_featured` boolean alone cannot control ordering within curated sections. Manual ordering needed to prioritise premium/featured businesses without arbitrary sort fallbacks.  
**Consequence:** Curated section queries: `WHERE is_featured = true ORDER BY curation_order ASC NULLS LAST, name ASC`. Set `curation_order` manually in Supabase for any featured location. NULL = falls back to name sort.  
**Migration risk:** low  

---

## 2026-04-01
**Decision:** `brain/task-queue.md` is a generated read-only cache — never edit it manually  
**Reason:** Manual edits drift from Supabase CCC state. The `→ brain` sync button in CCC is the only authoritative write path.  
**Consequence:** Add "Generated — do not edit manually. Use CCC → brain to sync." header to `brain/task-queue.md`. All task status changes happen in CCC first.

---

## 2026-04-01
**Decision:** `data/tours.ts` static file is retained as a graceful fallback, not removed yet  
**Reason:** `pages/tours/[slug].tsx` tries Supabase first and catches errors to fall back to static data. This is a valid resilience pattern while tour data in Supabase is incomplete.  
**Consequence:** Do not delete `data/tours.ts` until both tours have complete stop data in Supabase and the fallback has been tested as unnecessary. Log removal as a task.

---

## 2026-04-01
**Decision:** Hero video remains repo-hosted until full edited version is ready  
**Reason:** Current clip at `/public/videos/hero-barbizon.mp4` is a working placeholder. Full edit pending (iPhone + Hohem iSteady M7). Migration to Cloudflare Stream happens at that point.  
**Consequence:** Do not treat hero video as a blocker. It is live. Track Cloudflare Stream setup as a separate task triggered when the full edit is done.  
**Migration risk:** none

---

## 2026-04-01
**Decision:** `is_published`, `tour_type`, `difficulty` added to `tours` table  
**Reason:** Missing `is_published` meant all tours were effectively always public with no publish control. `tour_type` and `difficulty` added at the same time as they are low-risk and complete the proposed schema.  
**Consequence:** Both existing tours set to `is_published = true`. Any new tour defaults to `false` and must be explicitly published. Query layers that render tours should now filter on `is_published = true`.  
**Migration risk:** low

---

## March 2026
**Decision:** Webflow retired. All surfaces now on Next.js deployed via Vercel.
**Reason:** Platform fully migrated. Webflow no longer serves any active role in the stack.
**Consequence:** Remove all Webflow references from stack docs. Do not route any new editorial work to Webflow.

---

## 2026-03-31
**Decision:** Map preview on place pages links to `/map?location=[slug]`; map page auto-enables the location's layer group on arrival.
**Reason:** Deep-linking to a specific location on the map requires both the URL param and the layer being visible. Silently enabling the group on arrival is better UX than showing a blank map.
**Consequence:** `getCategoryGroup` is the shared mapping between `map.tsx` and `MapGL.tsx`. Any new category must be added to that mapping or deep-links for that category will not auto-enable correctly.

---

## 2026-03-31
**Decision:** Stories body field stored and rendered as Markdown (GFM + breaks via marked).
**Reason:** Enables inline hyperlinks to places and other stories without a rich text editor or schema change.
**Consequence:** All future story body copy must be written in Markdown. Content must come from trusted editorial sources — no sanitization is currently applied.

---

## 2026-03-31
**Decision:** stories.theme is a dedicated column, not reused from author.
**Reason:** author and theme are semantically different. Reusing author for theme was a temporary hack that broke the stories index display.
**Consequence:** Every story INSERT must include a theme value. Fallback chain (theme → author → Editorial) is in place for legacy rows.

---

## 2026-03-31
**Decision:** Add `/history` as a top-level nav page; retire `/plan-your-visit` from nav.
**Reason:** Site architecture review identified overlap between pages. `/history` gives a dedicated home to the historical dimension. `/plan-your-visit` was thin and duplicated Map and Places.
**Consequence:** Nav is now: Map · Places · History · Stories · About. `/plan-your-visit` route preserved but not linked from nav — content to be folded into `/about`.

---

## 2026-03-31
**Decision:** History page content order: timeline → postcards/images → artists index → sources.
**Reason:** Timeline is the most complete and visually distinctive content; it earns the lead position. Postcards follow as the next archival layer (placeholder for now). Artists index grounds the abstract history in people. Sources/grappilles.fr credit comes last — important but not the entry point.
**Consequence:** When postcards and artists DB tables are wired, this page becomes the primary historical reference for the platform without restructuring.

---

## 2026-03-28
**Decision:** Claude is the project lead. GPT and Grok are demoted to reviewers and researchers.
**Reason:** The original operating loop assigned ChatGPT as strategist and Claude as architect. In practice, Claude and Cursor have been the primary working pair for all sessions. ChatGPT added friction without adding strategic value that Claude could not provide directly.
**Consequence:** Claude owns the full operating loop — strategy, architecture, planning, review, SQL, content, and brain maintenance. Cursor implements. GPT and Grok are available for second opinions and external research only, with no authority over task ordering or brain files. Updated files: `docs/ai-operating-system.md`, `CLAUDE.md`, `.cursor/rules/working-style.mdc`, `.claude/agents/civitas-implementer.md`, `docs/frontend-workflow.md`.

---

## 2026-03-27

**Decision:** Stories is the home for both historical essays and practical-editorial guides (best places to stay, eat, etc.)
**Reason:** Places is a catalogue; Plan Your Visit is logistics. Stories is the only section with an editorial voice capable of holding both cultural depth and curated recommendations.
**Consequence:** Add `type` field to `stories` table with values `history` | `guide`. Stories index can filter or badge by type. Plan Your Visit remains logistics-only.

---

## 2026-03-27

**Decision:** Map sidebar is hidden by default; opens only on pin click or filter activation.
**Reason:** Persistent sidebar reduces map real estate and is not intuitive on mobile. Industry standard for modern map products is a drawer/sheet pattern.
**Consequence:** Desktop: slide-in drawer, dismisses on map click outside. Mobile: bottom sheet with peek state (name + category) expanding to full detail on tap. Map controls remain as floating elements.

---

## 2026-03-27

**Decision:** Map icons must be differentiated at the subcategory level, not the group level.
**Reason:** Group-level icons (one icon for all Art & History, one for all ESS) are not specific enough — a museum and a gallery look identical. Users need to distinguish at a glance.
**Consequence:** Each subcategory slug gets its own icon shape within its layer color. See `docs/design-direction.md` for the full subcategory icon matrix. Implementation in `components/MapGL.tsx`.

---

## 2026-03-27

**Decision:** Practical category is excluded from the Places editorial page (`/places`).
**Reason:** Bus stops, parking, and public toilets are map utilities — they orient visitors spatially but do not inspire discovery. The Places page is an editorial catalogue for cultural and commercial locations.
**Consequence:** Filter Practical layer out of the Supabase query in `pages/places/index.tsx`. Practical pins remain fully visible on the map. No data deletion.

---

## 2026-03-27

**Decision:** Public-facing brand is "Visit Barbizon", not "Explore Barbizon".
**Reason:** "Visit..." is shorter, translates better across languages, and scales cleanly to other cities (Visit Fontainebleau, Visit Giverny). The domain remains explorebarbizon.com — visitbarbizon.com is currently priced at ~5K, deferred.
**Consequence:** All UI wordmarks, nav headers, page titles, and footer references use "Visit Barbizon". Domain is unchanged. Update Layout component and any static references.

---

## 2026-03-27

**Decision:** The map is the primary product. All other pages are funnels into the map.
**Reason:** The spatial experience is what differentiates the platform. Editorial content (places, stories, plan your visit) should draw users in and route them to map exploration, not compete with the map for attention.
**Consequence:** Map CTA must be above the fold on the homepage. Map page should be full-screen with minimal chrome. Design reviews should always ask: does this move the user toward the map?

---

## 2026-03-13

**Decision:** Use `visual_works` + `visual_work_locations` instead of a `paintings` table with direct coordinates.
**Reason:** Historic visual material (paintings, postcards, photographs, engravings) cannot reliably be assigned exact coordinates. Geo interpretation must be explicit about its confidence level and the nature of the relationship. The Barbizon mosaics are not reliable exact painting locations.
**Consequence:** `visual_works` covers all archival image types. Geographic attribution is handled entirely through the `visual_work_locations` junction table with `relation_type`, `geo_confidence` (`exact`/`approximate`/`interpretive`/`unknown`), and `notes`. No coordinates are stored on the work itself. Any row derived from mosaic positions must use `interpretive` or `unknown`, not `exact`.

---

## 2026-03-13

**Decision:** Use repo-based project brain for Civitas / Explore Barbizon.
**Reason:** Preserve continuity across AI sessions and across machines.
**Consequence:** Core context must live in files, not only in chat history. All brain/ and docs/ files must be kept current after meaningful sessions.

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
**Consequence:** Hero is a `<video>` element with `autoPlay muted loop playsInline`. Minimal text overlay: eyebrow + H1 + two CTAs only. Long-form content lives deeper in the site.

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
**Consequence:** The historical visual overlay feature should begin with postcards. Subsumed into the `visual_works` model — postcards are a `work_type` value.

---

## March 2026

**Decision:** Enforce specific field name conventions in the schema.
**Reason:** Consistency across queries, migrations, and AI-assisted development sessions.
**Consequence:** Always use `layer` (not `map_layer`), `distance_meters` (not `distance_km`), `stop_narrative` (not `notes`). These override any default assumptions.
