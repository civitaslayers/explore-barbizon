-- Seed CCC knowledge base: decisions, memory, prompt_templates
-- Run once in Supabase SQL editor.
-- Sources: brain/decisions.md, brain/current-state.md, docs/agent-tooling.md, CLAUDE.md

-- ============================================================
-- DECISIONS
-- ============================================================

INSERT INTO decisions (title, context, decision, reasoning) VALUES

(
  'Use visual_works + visual_work_locations for all historical media',
  'Needed a way to store paintings, postcards, photographs, and engravings with geographic attribution.',
  'Use visual_works + visual_work_locations junction table with geo_confidence field instead of a paintings table with direct coordinates.',
  'Historic visual material cannot be reliably assigned exact coordinates. Barbizon mosaics are not reliable exact painting locations. Geo confidence must be explicit: exact/approximate/interpretive/unknown. No coordinates stored on the work itself — attribution lives entirely in the junction table.'
),

(
  'Use repo-based project brain (brain/ + docs/) for AI continuity',
  'Multiple AI sessions across Claude Code, Cursor, and ChatGPT needed shared project context.',
  'All project state, decisions, and task queues live in brain/ and docs/ files in the repo, not only in chat history.',
  'Chat history does not persist across sessions. Brain files allow any AI session to resume with full context. brain/current-state.md, brain/task-queue.md, and brain/decisions.md are the canonical sources of truth.'
),

(
  'Cursor handles frontend implementation; Claude handles architecture',
  'Claude alone was producing UI that lacked contemporary visual refinement and iteration speed.',
  'Claude/ChatGPT handle architecture, strategy, schema design, and planning. Cursor handles actual frontend code, UI iteration, and component-level changes.',
  'Different tools have different strengths. This separation keeps the system stable and produces better output at each layer.'
),

(
  'Keep Pages Router — do not migrate to App Router',
  'Next.js App Router is now the default but the project started on Pages Router.',
  'Maintain Next.js Pages Router. Do not migrate to App Router without explicit instruction.',
  'Migration would be a large, risky refactor with no immediate product benefit. All existing patterns (API routes in pages/api/, getStaticProps, etc.) work correctly on Pages Router.'
),

(
  'Supabase is the single source of truth for all data',
  'The project started with static data/places.ts and data/tours.ts files.',
  'All locations, tours, media, and user data live in Supabase. Static data/ files in the repo are temporary placeholders only.',
  'Centralised, queryable, scalable database with auth and row-level security. Enables live updates, dashboard editing, and AI-readable data without redeploys.'
),

(
  'Mapbox is the spatial engine',
  'Needed a map layer for place discovery with custom styling.',
  'All map rendering, location pins, clustering, and trail display go through Mapbox GL JS.',
  'Best-in-class for custom map styling, layer control, and geo-narrative use cases. Mapbox Static API also used for place card thumbnails.'
),

(
  'Homepage is visual-first and video-led',
  'Early versions had heavy copy on the homepage.',
  'Hero is a <video> element with autoPlay muted loop playsInline. Minimal text overlay: eyebrow + H1 + two CTAs only. Long-form content lives deeper in the site.',
  'Beauty and utility attract users faster than text. The video asset (hero-barbizon.mp4) must be in /public/videos/ — code is already in place, asset is pending.'
),

(
  'Refinement-over-rebuild workflow',
  'Early sessions involved full page rewrites that caused regressions.',
  'Build structure once, then refine section by section. Never prompt for full page rewrites.',
  'Full rebuilds break coherence, waste time, and produce regressions. Iterative passes preserve editorial DNA and allow controlled, reviewable diffs.'
),

(
  'Dashboard v1 lives inside the same Next.js codebase',
  'Considered a separate admin tool (e.g. Retool, separate Next.js app).',
  'Dashboard lives at /dashboard within the main Next.js app — same codebase, same Supabase client.',
  'Avoids a separate admin tool. Keeps the stack unified and reduces maintenance overhead. Protected routes handle auth.'
),

(
  'Finish Barbizon MVP before any multi-town migration',
  'The long-term vision is a multi-town platform (Civitas Layers).',
  'Multi-town schema changes (town_settings, category_templates, composite slugs) are deferred until Barbizon MVP is complete.',
  'Premature abstraction for multi-town would add complexity before the core product is proven. The town_id FK is already on the locations table — migration will be tractable when the time comes.'
),

(
  'Postcards are the practical starting point for the historical media layer',
  'The visual_works model covers paintings, postcards, photographs, and engravings.',
  'Begin the historical visual overlay with postcards. Paintings require serious historical research and mosaic coordinates are unreliable.',
  'Barbizon mosaic coordinates are not reliable exact painting locations. Postcards are more tractable and still historically significant. Use geo_confidence = interpretive or unknown for mosaic-derived positions.'
),

(
  'Enforce specific schema field name conventions',
  'AI-assisted development sessions were generating inconsistent field names.',
  'Always use: layer (not map_layer), distance_meters (not distance_km), stop_narrative (not notes). These override any default assumptions.',
  'Consistency across queries, migrations, and AI sessions. Documented in CLAUDE.md and docs/schema-reference.md.'
),

(
  'show_in_editorial dual-filter pattern',
  'Needed to hide utility locations (Parking, Bus Stop) from the places listing without unpublishing them.',
  'Both locations.show_in_editorial AND categories.show_in_editorial must be true for a location to appear in the editorial listing. Two independent filters, both boolean.',
  'categories.show_in_editorial filters whole categories (utility vs. cultural). locations.show_in_editorial filters individual locations within an eligible category. Allows fine-grained control without schema changes.'
),

(
  'CCC as an AI operating system inside the Next.js app',
  'Needed a way to coordinate tasks across Claude, Cursor, and ChatGPT without leaving the project.',
  'Command Center (CCC) is built as an internal tool at /command-center within the same Next.js codebase — tasks, decisions, memory, prompts, outputs all in Supabase.',
  'Keeps the operating system inside the repo where all the context lives. Avoids external tools that would fragment state. The CCC automation loop (dispatch → run → outputs API) enables programmatic task execution.'
),

(
  'Project must be developed from a local directory, not Google Drive',
  'Early development was inside a Google Drive synced folder.',
  'Develop from a local path only (e.g. ~/Documents/Projects/explore-barbizon). Do not use synced or cloud-mounted folders.',
  'Google Drive interfered with local dev behavior, file watching, and build reliability.'
);


-- ============================================================
-- MEMORY
-- ============================================================

INSERT INTO memory (key, content, category) VALUES

-- Stack
('stack_framework', 'Next.js with Pages Router. Do not migrate to App Router. API routes live in pages/api/. Data fetching uses getStaticProps / getServerSideProps.', 'stack'),
('stack_database', 'Supabase. Project ref: afqyrxtfbspghpfulvmy. Client at lib/supabase.ts. Always check for null client (not configured in some envs). Use lib/commandCenter.ts for CCC tables.', 'stack'),
('stack_map', 'Mapbox GL JS for interactive map. Mapbox Static API for place card thumbnails. Access token in NEXT_PUBLIC_MAPBOX_TOKEN env var.', 'stack'),
('stack_styling', 'Tailwind CSS v3. Custom tokens: ink (dark), cream (light), moss (green), umber (warm brown). Typography scale uses tracking-[0.Nem] pattern.', 'stack'),
('stack_language', 'TypeScript throughout. Strict mode. No any unless unavoidable.', 'stack'),

-- Schema conventions
('schema_field_names', 'Use: layer (not map_layer), distance_meters (not distance_km), stop_narrative (not notes). These are locked conventions — override any AI default.', 'schema'),
('schema_locations_key_fields', 'locations table key fields: id, town_id, category_id, name, slug, short_description, full_description, narrative, latitude, longitude, is_published, show_on_map, show_in_editorial.', 'schema'),
('schema_geo_confidence', 'visual_work_locations uses geo_confidence: exact | approximate | interpretive | unknown. Never use exact for coordinates derived from mosaics or secondary sources.', 'schema'),
('schema_supabase_project', 'Supabase project ID: afqyrxtfbspghpfulvmy. Region: eu-west-2 (London). Anon key in NEXT_PUBLIC_SUPABASE_ANON_KEY env var.', 'schema'),

-- Product
('product_name', 'Public product name: ExploreBarbizon. Internal platform name: Civitas Layers. URL: /explore-barbizon. First town: Barbizon, Seine-et-Marne, France.', 'product'),
('product_vision', 'Cultural discovery platform for small towns — maps, walking trails, historical visual works, stories. Museum-cartography aesthetic. Beauty and utility over copy density.', 'product'),
('product_multi_town', 'Multi-town expansion (Civitas Layers) is deferred until Barbizon MVP is complete. Do not introduce town_settings, category_templates, or composite slug logic yet.', 'product'),
('product_editorial_filter', 'Editorial places listing uses dual filter: locations.show_in_editorial = true AND categories.show_in_editorial = true. Both must be true. Backfill sets all published locations to true on migration.', 'product'),

-- Design
('design_direction', 'Museum-cartography aesthetic. Dark ink tones, cream backgrounds, moss and umber accents. Typography is editorial — generous tracking, restrained scale.', 'design'),
('design_hero', 'Homepage hero: <video autoPlay muted loop playsInline>. Asset path: /public/videos/hero-barbizon.mp4 (pending). Falls back to static image if file absent.', 'design'),
('design_workflow', 'Refinement over rebuilds. Build structure once, refine section by section. Never prompt for full page rewrites — always targeted diffs.', 'design'),

-- Ops
('ops_local_dev', 'Dev server: npm run dev (port 3000 or 3001 if occupied). Must be running for CCC automation endpoints (/api/tasks/run, /api/tasks/suggest, /api/brain/sync-tasks).', 'ops'),
('ops_mcp_context7', 'Context7 MCP active in Cursor and Claude Code CLI. Invoke by appending "use context7" to prompts involving Next.js, Supabase JS, Mapbox GL, or Tailwind.', 'ops'),
('ops_mcp_tavily', 'Tavily MCP configured. Requires TAVILY_API_KEY in shell env (~/.zshrc). Get free key at tavily.com. Use for historical research, library docs, external content.', 'ops'),
('ops_agent_roles', 'Claude: architecture, schema design, migration planning, SQL, CCC tasks assigned to claude. Cursor: frontend code, UI iteration, component changes. ChatGPT: strategy and product direction. Human: content entry, asset creation, Supabase SQL execution, external actions.', 'ops'),
('ops_ccc_automation', 'CCC automation loop: POST /api/tasks/[id]/dispatch → brief_json + callback_url. POST /api/tasks/[id]/run → spawns claude --print via stdin, saves output. POST /api/tasks/[id]/outputs → ingestion callback. npm run task <id> for CLI version.', 'ops'),
('ops_brain_sync', 'brain/task-queue.md is generated from Supabase via → brain button in CCC or POST /api/brain/sync-tasks. Supabase is authoritative — brain file is a snapshot. Run → brain after task status changes.', 'ops'),
('ops_worktree', 'Claude Code runs in a git worktree at .claude/worktrees/sad-aryabhata. Main repo at ~/Documents/Projects/explore-barbizon. Active branch: claude/sad-aryabhata. PR target: command-center-v1.', 'ops'),

-- Context
('context_barbizon', 'Barbizon is a village in Seine-et-Marne, France. Famous for the Barbizon school of landscape painters (Millet, Corot, Rousseau, Daubigny). Key theme: the relationship between place, light, and artistic practice.', 'context'),
('context_ai_workflow', 'Three-agent workflow: ChatGPT (strategy) → Claude Code (architecture + planning) → Cursor (implementation). CCC is the coordination layer. Never have one AI do everything.', 'context');


-- ============================================================
-- PROMPT TEMPLATES
-- ============================================================

INSERT INTO prompt_templates (name, target_agent, description, template) VALUES

(
  'Schema migration review',
  'claude',
  'Review a proposed schema migration for correctness, safety, and convention compliance before running it.',
  '## Schema migration review

Review the following SQL migration for the ExploreBarbizon / Civitas Layers Supabase project.

**Schema conventions to enforce:**
- Field names: use `layer` (not `map_layer`), `distance_meters` (not `distance_km`), `stop_narrative` (not `notes`)
- All new boolean flags: use `NOT NULL DEFAULT false` unless there is a strong reason for nullable
- New junction tables must have a composite PK or unique constraint
- `geo_confidence` must be one of: exact | approximate | interpretive | unknown
- Never store coordinates directly on `visual_works` — use `visual_work_locations`

**Migration to review:**
```sql
[PASTE MIGRATION HERE]
```

Check for:
1. Correct field names per conventions above
2. Missing NOT NULL / DEFAULT values
3. Missing indexes on FK columns
4. Any breaking changes to existing queries in lib/supabase.ts
5. Whether a backfill UPDATE is needed to preserve current behaviour

Return: a list of issues found (or "No issues") and a corrected version of the SQL if changes are needed.'
),

(
  'Place page audit',
  'cursor',
  'Audit a place detail page for layout, hierarchy, spacing, and mobile/large-screen behaviour.',
  '## Place page audit — pages/places/[slug].tsx

Audit the current place detail page for visual and layout quality. Focus on:

1. **Layout hierarchy** — is the information ordered correctly? (hero → name/category → description → map → related)
2. **Image treatment** — hero image aspect ratio, fallback state, overlay legibility
3. **Typography scale** — heading sizes, body text size, line height, tracking
4. **Spacing** — section gaps, padding consistency, breathing room
5. **Large viewport** (>1280px) — does the layout hold? Max-width, column balance
6. **Mobile** — does the layout collapse correctly? No overflow, tap targets OK
7. **Related / nearby section** — spacing, card presentation

For each issue found: state the problem, which element it affects, and the exact Tailwind class change needed.

Do not rewrite the page. Return targeted diff-style suggestions only.'
),

(
  'New location data entry',
  'claude',
  'Generate a SQL INSERT for a new location entry in the locations table.',
  '## New location SQL — ExploreBarbizon

Generate a SQL INSERT for the following location. Follow the schema exactly.

**Location details:**
- Name: [NAME]
- Category: [CATEGORY NAME — must match an existing categories.name]
- Short description (1–2 sentences): [SHORT DESCRIPTION]
- Full description (2–4 paragraphs): [FULL DESCRIPTION]
- Narrative / historical context: [NARRATIVE]
- Address: [ADDRESS]
- Latitude / Longitude: [LAT], [LNG]
- is_published: [true/false]
- show_on_map: [true/false]
- show_in_editorial: [true/false]

**Schema reference:**
- Table: `locations`
- Required: name, slug (derive from name: lowercase, hyphens, no accents), latitude, longitude, category_id (FK — use a subquery to look up by name)
- Optional: short_description, full_description, narrative, address, phone, website

Return only the SQL INSERT statement. Use a subquery for category_id. Do not hardcode UUIDs.'
),

(
  'Task brief — architecture planning',
  'claude',
  'Standard brief framing for Claude architecture and planning tasks.',
  '## Brief framing (Claude)

Use for architecture, repo-aware reasoning, scoped change planning, careful constraint-following, and implementation strategy before coding.

Guidance: if this is not code work, stay useful as rigorous planning or review — avoid improvisation; respect stated boundaries.

---

## Task
[PASTE TASK TITLE AND DESCRIPTION]

## Constraints
- Keep Pages Router
- Preserve stack: Next.js, Supabase, Mapbox GL, Tailwind
- Minimal diffs — do not refactor unrelated code
- Follow schema field conventions: layer, distance_meters, stop_narrative
- Do not introduce new dependencies without clear justification

## Output format
Return: a clear implementation plan with specific file paths and line-level changes. Do not write code unless asked — plan first.'
),

(
  'Task brief — frontend implementation',
  'cursor',
  'Standard brief framing for Cursor frontend implementation tasks.',
  '## Brief framing (Cursor)

Use for frontend code, UI iteration, component-level changes, and targeted file edits.

Guidance: make the smallest safe change. Do not refactor unrelated code. Preserve existing design direction and component patterns.

---

## Task
[PASTE TASK TITLE AND DESCRIPTION]

## Stack
- Next.js Pages Router
- Tailwind CSS (tokens: ink, cream, moss, umber)
- Supabase JS client at lib/supabase.ts

## Constraints
- Do not change stack architecture
- Do not rewrite pages — make targeted edits
- Preserve existing class patterns and spacing conventions
- Test at mobile and >1280px viewport

## Protected files — do NOT touch unless explicitly named in this task
- `pages/_document.tsx` — global HTML shell; removing <Head /> breaks CSS for the entire app
- `pages/_app.tsx` — global app wrapper; changes affect every route
- `lib/supabase.ts` — DB client and shared types
- `tailwind.config.js` — design token source of truth
- Any file in `migrations/`

## Files likely in scope
[LIST FILES]'
),

(
  'Historical content research',
  'claude',
  'Research brief for Barbizon historical content using Tavily.',
  '## Historical content research — Barbizon

Research the following topic for the ExploreBarbizon platform. Use Tavily for web search if available.

**Topic:** [TOPIC — e.g. "Jean-François Millet''s time in Barbizon", "The Auberge Ganne", "Barbizon forest landscape painting tradition"]

**Output needed:**
- Key dates and timeline
- Primary locations in Barbizon associated with this topic
- 2–3 sentences suitable for a place description (editorial voice — factual, evocative, not academic)
- Any visual works (paintings, postcards) associated with this topic and location

**Editorial voice guidelines:**
- Write for a curious visitor, not an art historian
- Specific and grounded — avoid generic phrases like "rich history"
- Present tense for physical places, past tense for historical events
- 80–120 words for a short_description, 200–400 words for a full_description'
);
