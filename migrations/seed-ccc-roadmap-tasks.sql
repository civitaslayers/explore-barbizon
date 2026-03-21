-- Seed CCC tasks from the full Barbizon MVP roadmap + later phases
-- Run once in Supabase SQL editor.
-- Two tasks already exist (Forest & Nature category, Boulder trails) — this script
-- does not touch them. All new tasks are inserted fresh.
-- Last updated: 2026-03-21

-- ============================================================
-- NOW — Ready to start immediately (priority 1–2)
-- ============================================================

INSERT INTO tasks (title, description, status, priority, task_type, related_area, execution_status, assigned_to) VALUES
(
  'Run show_in_editorial SQL migration',
  'Add show_in_editorial column to locations table. SQL is ready — just needs to be run in the Supabase dashboard SQL editor.',
  'ready', 1, 'ops', 'database', 'todo', 'human'
),
(
  'Set TAVILY_API_KEY in shell env',
  'Add TAVILY_API_KEY to ~/.zshrc to activate the Tavily MCP in Cursor. Get a free key at tavily.com.',
  'ready', 1, 'ops', 'ops', 'todo', 'human'
),
(
  'Large-screen layout width refinement',
  'Audit place detail and place index pages on large viewports (>1280px). Check max-width, column balance, typography scale.',
  'ready', 2, 'code', 'design', 'todo', 'cursor'
),
(
  'Place page visual refinement',
  'Polish pages/places/[slug].tsx — layout hierarchy, image treatment, related/nearby section spacing.',
  'ready', 2, 'code', 'engineering', 'todo', 'cursor'
);

-- ============================================================
-- NOW — Blocked (execution_status = blocked)
-- ============================================================

INSERT INTO tasks (title, description, status, priority, task_type, related_area, execution_status, assigned_to) VALUES
(
  'Add real hero video asset',
  'Drop /public/videos/hero-barbizon.mp4 into the repo. Video element code is already in place. Without this file the hero falls back to a static image.',
  'ready', 1, 'design', 'design', 'blocked', 'human'
);

-- ============================================================
-- NEXT — Unblocked after Now tasks (priority 3)
-- ============================================================

INSERT INTO tasks (title, description, status, priority, task_type, related_area, execution_status, assigned_to) VALUES
(
  'Replace data/tours.ts with live Supabase query',
  'Query the tours + tour_stops tables directly. Remove the static data/tours.ts file once the live query is wired.',
  'backlog', 3, 'code', 'database', 'todo', 'cursor'
),
(
  'Stories page: wire stories table',
  'Connect the Supabase stories table to pages/stories/index.tsx. Schema migration must run first.',
  'backlog', 3, 'code', 'engineering', 'todo', 'cursor'
),
(
  'Add real place images',
  'Source and drop optimised JPG images into /public/images/places/. One image per key location minimum.',
  'backlog', 3, 'data', 'content', 'todo', 'human'
),
(
  'Card polish and image treatment pass',
  'Tighten place card visual presentation once real images are in place. Aspect ratio, overlay, hover state.',
  'backlog', 3, 'design', 'design', 'todo', 'cursor'
),
(
  'Pilot Task Master AI on one multi-step CCC initiative',
  'Run npx -y task-master-ai on one larger initiative to evaluate whether it adds value over brain/task-queue.md. Document findings in docs/agent-tooling.md.',
  'backlog', 3, 'research', 'ops', 'todo', 'claude'
);

-- ============================================================
-- SCHEMA QUEUE — Database migrations (priority 4, run in order)
-- ============================================================

INSERT INTO tasks (title, description, status, priority, task_type, related_area, execution_status, assigned_to) VALUES
(
  'Add is_published, tour_type, difficulty to tours table',
  'Schema migration. is_published boolean default false, tour_type text, difficulty text. See docs/schema-reference.md for conventions.',
  'backlog', 4, 'data', 'database', 'todo', 'claude'
),
(
  'Create stories + story_locations tables',
  'Schema migration. stories (id, title, slug, body, is_published, created_at). story_locations junction with location_id FK.',
  'backlog', 4, 'data', 'database', 'todo', 'claude'
),
(
  'Create artists + artist_locations tables',
  'Schema migration. artists (id, name, slug, bio, born, died, nationality). artist_locations junction with location_id FK and relation_type.',
  'backlog', 4, 'data', 'database', 'todo', 'claude'
),
(
  'Create visual_works + visual_work_locations tables',
  'Schema migration. visual_works covers paintings, postcards, photographs, engravings. visual_work_locations uses geo_confidence (exact/approximate/interpretive/unknown). See decisions.md.',
  'backlog', 4, 'data', 'database', 'todo', 'claude'
),
(
  'Create routes table',
  'Schema migration. routes (id, title, slug, description, distance_meters, difficulty, tour_id FK nullable). Prerequisite for walking trail features.',
  'backlog', 4, 'data', 'database', 'todo', 'claude'
),
(
  'Create layers table + migrate categories.layer text → FK',
  'Breaking schema migration — do last. Introduces a layers table and migrates the current text layer field on categories to a proper FK. Requires careful migration sequencing.',
  'backlog', 4, 'data', 'database', 'todo', 'claude'
);

-- ============================================================
-- DASHBOARD V1 (priority 5)
-- ============================================================

INSERT INTO tasks (title, description, status, priority, task_type, related_area, execution_status, assigned_to) VALUES
(
  'Dashboard v1: login screen',
  'Build /dashboard/login. Session-based auth using Supabase Auth. Redirect to /dashboard on success.',
  'backlog', 5, 'code', 'engineering', 'todo', 'cursor'
),
(
  'Dashboard v1: overview page',
  'Build /dashboard. Show key counts: published locations, tours, stories. Link to sub-pages.',
  'backlog', 5, 'code', 'engineering', 'todo', 'cursor'
),
(
  'Dashboard v1: locations list',
  'Build /dashboard/locations. Table of all locations with published status, edit link, quick-toggle.',
  'backlog', 5, 'code', 'engineering', 'todo', 'cursor'
),
(
  'Dashboard v1: single location editor',
  'Build /dashboard/locations/[id]. Edit all location fields inline. Save to Supabase on submit.',
  'backlog', 5, 'code', 'engineering', 'todo', 'cursor'
);

-- ============================================================
-- LATER — Content and data (priority 5)
-- ============================================================

INSERT INTO tasks (title, description, status, priority, task_type, related_area, execution_status, assigned_to) VALUES
(
  'Polish hero locations',
  'Review and improve the 3–5 hero/featured locations. Improve descriptions, confirm cover images, check map pin accuracy.',
  'backlog', 5, 'content', 'content', 'todo', 'human'
),
(
  'Build first walking trail',
  'Define the first official walking trail route as a series of stops. Seed into tours + tour_stops. Requires routes table migration.',
  'backlog', 5, 'data', 'content', 'todo', 'human'
),
(
  'Improve featured places presentation',
  'Review which places appear in featured sections. Improve copy, ordering, and visual presentation for key locations.',
  'backlog', 5, 'content', 'content', 'todo', 'human'
),
(
  'Seed historical visual works layer — postcards first',
  'Seed first postcard entries into visual_works + visual_work_locations. Use geo_confidence = interpretive or unknown for mosaic-derived positions.',
  'backlog', 5, 'data', 'content', 'todo', 'human'
),
(
  'Wire tours page: tours + tour_stops to pages/tours/[slug].tsx',
  'Connect live Supabase query to the tours detail page. Requires Replace data/tours.ts task to be done first.',
  'backlog', 5, 'code', 'engineering', 'todo', 'cursor'
),
(
  'Events layer: temporary map pins for exhibitions and openings',
  'Seed temporary event entries. Define events schema or use a lightweight approach (temporary locations with event category).',
  'backlog', 5, 'data', 'content', 'todo', 'human'
),
(
  'QR infrastructure: generate and store qr_code_url on locations',
  'Generate QR codes linking to each place page. Store qr_code_url on the locations table. Physical plaque integration later.',
  'backlog', 5, 'ops', 'engineering', 'todo', 'claude'
);

-- ============================================================
-- DEFERRED — Phase 2 and long-term (priority 5, backlog)
-- ============================================================

INSERT INTO tasks (title, description, status, priority, task_type, related_area, execution_status, assigned_to) VALUES
(
  'Multi-town migration: town_settings, composite slugs, category_templates',
  'Do not begin until Barbizon MVP is complete. Adds town_settings table, composite slug discipline, category_templates, town-aware dashboard.',
  'backlog', 5, 'ops', 'engineering', 'todo', 'claude'
),
(
  'Merchant discovery trails',
  'Curated local trails connecting galleries, food, commerce, and culture. Long-term product feature.',
  'backlog', 5, 'design', 'product', 'todo', null
),
(
  'AI guide: conversational layer grounded in database content',
  'Conversational experience anchored to the Barbizon location and tour data. Deferred until data layer is stable.',
  'backlog', 5, 'research', 'engineering', 'todo', null
),
(
  'Visitor passport: gamified exploration layer',
  'Track which places a visitor has been to. Longer-term engagement feature.',
  'backlog', 5, 'research', 'product', 'todo', null
);
