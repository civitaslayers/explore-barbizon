# Civitas Layers — GitHub Main Brain Handoff

Last updated: March 2026
Purpose: Consolidated, repo-ready master handoff for the Civitas Layers / Visit Barbizon / ExploreBarbizon project.

This document is intended to be the primary orientation file inside the future GitHub repository. It consolidates the most important strategic, product, technical, design, and workflow decisions discussed across the project so far.

This file should sit at the top of the repo and act as the first document any collaborator or AI assistant reads.

---

# 1. Project Identity

## Company / infrastructure layer
Civitas Layers

## Public-facing town brand
Visit Barbizon

## Live digital destination
ExploreBarbizon.com

## Working principle
Civitas Layers is not a normal tourism website.
It is a civic geo-narrative platform designed to turn heritage towns into open-air museums through spatial storytelling, layered mapping, historical media, and curated discovery.

Barbizon is the flagship prototype.

---

# 2. Strategic Positioning

The strongest positioning for the product is:

**A quiet digital atlas of Barbizon**

The platform should sit between:
- cultural magazine / editorial publication
- museum / archive interface
- cartographic exploration product

This means the brand and UI should avoid generic tourism design.

Preferred direction:
- elegant
- refined
- calm
- visually led
- editorial
- museum-cartography feel

Avoid:
- loud gradients
- startup SaaS aesthetics
- cluttered travel-directory layouts
- tourism-brochure design

---

# 3. Current Technical Stack

## Core stack to keep
- Supabase = source of truth
- Mapbox = spatial engine
- Webflow = editorial shell / temporary marketing shell
- Next.js = real product layer

## Current development direction
The long-term public experience should move toward Next.js for:
- homepage shell if desired
- map
- place pages
- tour pages
- dashboard

Webflow may still be used for selected editorial pages or temporary shell work, but should not remain the core product surface.

---

# 4. Current Known Database Baseline

The current working schema already includes:
- towns
- categories
- locations
- tours
- tour_stops
- media
- users

Important schema rules still apply:
- use `layer`, not `map_layer`
- use `distance_meters`, not `distance_km`
- use `stop_narrative`, not `notes`
- preserve existing slugs and IDs carefully

The existing schema reference remains the authority for field names and SQL constraints.

---

# 5. Product Model

ExploreBarbizon should be understood as four connected products in one:

1. Interactive cultural map
2. Dynamic place pages
3. Tours and walking routes
4. Editorial stories / archive content

Primary visitor journey should be:

**Visual entry → Spatial exploration → Editorial depth**

This means:
- images and video attract
- map and trails engage
- stories and archive content deepen the experience

---

# 6. Current Product Entry Modes

## A. Map mode
For visitors discovering Barbizon spatially or physically while in town.

## B. Story mode
For users interested in artists, history, paintings, houses, archival layers, and cultural essays.

## C. Editorial / planning mode
For search traffic and users planning a visit.

---

# 7. Website / Design Direction — UPDATED

## Major recent decision
The website should become more visual and less text-heavy at the homepage level.

The user preference, which is also strategically correct, is:
- more visuals
- more video
- less homepage text
- stronger emphasis on beauty and utility
- let long-form text live deeper in articles and story pages

## Homepage role
The homepage should not behave like a long essay.
It should function as a cinematic doorway into the map and the village.

## Updated homepage principle
**Visual-first homepage, text-deeper architecture**

This means:
- hero video first
- minimal but elegant text
- clear CTAs into the map and discovery paths
- richer editorial content below or deeper in the site

## Preferred design direction
The strongest direction is a hybrid of:
- cultural magazine
- museum/archive interface
- elegant cartographic website

This aligns with the user’s taste for elegance and refinement.

---

# 8. Current Homepage Design Intent — UPDATED

The homepage should now be treated as:

**A cinematic visual entry to Explore Barbizon**

## Hero direction
The hero should use:
- one large looping video
- clips of Barbizon and the forest
- minimal overlay text
- soft, refined buttons

## Hero content direction
Minimal text only, for example:
- Explore Barbizon
- A quiet atlas of art, forest, and village paths.

Possible buttons:
- Explore the Map
- Discover the Village

## Important design principle
The hero should be image/video-led, not copy-led.
Most users will be attracted first by:
- moving image
- atmosphere
- beauty
- clear map access

Then those who want depth can continue into:
- stories
- articles
- archives
- place pages

---

# 9. Current Website State — UPDATED

A local Next.js version now runs successfully in the browser.

Important recent developments:
- the project was moved out of Google Drive into a local folder because Google Drive caused development/server issues
- the local Next.js app now runs correctly from a local project directory
- Tailwind build issues were debugged and partially resolved during setup
- the current site already has the right editorial DNA, but still needs hero/media refinement and visual polish

## Key diagnosis from current visual review
The site is already moving away from “tourism template” territory and toward a calmer editorial identity.

Current strengths:
- restrained palette
- serif typography
- calm layout
- good editorial tone

Current weaknesses:
- hero placeholder still needs proper media treatment
- some cards still feel slightly flat / prototype-like
- layout width on large screens should feel more curated
- imagery is still mostly placeholder content

---

# 10. Current Front-End Development Workflow — UPDATED

## Problem discovered
Using Claude alone for visual website design was too slow and did not produce the desired level of contemporary refinement.

## Updated workflow
Use Cursor for front-end implementation and iteration.

Recommended division:
- ChatGPT / Claude = strategy, structure, copy, feature planning, prompts
- Cursor = actual code implementation, UI iteration, component changes, page refinement

## Correct way to work with Cursor
Do not keep prompting for full rebuilds.
Use Cursor in refinement passes:
1. build structure once
2. refine section by section
3. polish visual rhythm
4. fix errors quickly
5. continue iterating

## Practical workflow
Keep open:
- Cursor
- local browser preview
- terminal running `npm run dev`

---

# 11. Current Local Dev Notes — UPDATED

## Local project warning
Do not actively develop this project inside Google Drive or similar synced folders.

Use a purely local path such as:
- ~/Projects/explore-barbizon
- /Users/.../Documents/Projects/explore-barbizon

## Why
Google Drive interfered with local dev behavior and likely with file watching / build reliability.

## Standard startup flow
From the local project folder:
- `npm install`
- `npm run dev`
- open `http://localhost:3000`

---

# 12. Tailwind / Build Notes — UPDATED

A Tailwind build error occurred due to Cursor introducing a non-existent utility class inside `@apply`.

Example invalid class that caused an error:
- `shadow-card/60`

Resolution principle:
- avoid invented Tailwind utility classes inside `@apply`
- prefer valid built-in classes or direct custom CSS where needed

This is a recurring caution for AI-assisted front-end work.

---

# 13. Current Design Priorities — UPDATED

Immediate front-end priorities are now:

1. replace hero placeholder with a cinematic video block
2. reduce homepage text density at the top
3. preserve elegant editorial tone
4. maintain calm spacing and serif hierarchy
5. improve card refinement and image treatment
6. eventually connect the visual shell to real data

## Design philosophy
The site should feel like:
- a slow interface
- a place for wandering
- a cultural atlas
- a museum-like map of a village

Not like:
- a directory
- a dashboard
- a generic guidebook

---

# 14. Product Features to Preserve in the Roadmap

These remain important long-term product features:

## QR infrastructure
Physical QR plaques around town linking into map/place pages.

## Merchant discovery trails
Curated local trails connecting galleries, food, commerce, and culture.

## Historical media layer
Old postcards, photographs, and archival imagery linked to places.

## Story mode
Deeper cultural narratives and articles.

## AI guide
Conversational layer later, grounded in database content.

## Events layer
Temporary map pins for exhibitions, openings, concerts, seasonal activity.

## Visitor passport / visits tracking
Longer-term gamified exploration layer.

---

# 15. Signature Future Content Direction

A potentially defining future feature remains:

## Painting locations / historical visual overlays
Long-term goal:
- connect paintings, postcards, or archival images to locations in Barbizon
- allow users to move from image to place to walk

Important caveat already established:
- the Barbizon mosaics are not reliable exact painting coordinates
- this feature requires real historical research
- postcards may be an easier and stronger starting point than paintings

---

# 16. Barbizon Content Priorities

Current major product content priorities still include:
- complete Forest & Nature layer
- polish hero locations
- build first walking trail
- improve featured places presentation
- prepare historical postcard/media layer

---

# 17. Dashboard / Internal Tool Direction

The dashboard plan remains valid.
A lightweight internal dashboard should be built to reduce dependence on raw SQL.

Dashboard v1 priorities remain:
- login
- overview
- locations list
- single location editor

This should be built inside the same Next.js codebase as the app.

---

# 18. Multi-Town Direction

The multi-town migration plan remains valid.
Before onboarding town #2, the system should evolve toward:
- `town_settings`
- composite slug discipline
- `category_templates`
- `town_categories`
- town-aware dashboard logic later

Do not perform a giant refactor now.
Finish Barbizon MVP first, then execute the migration in a controlled sequence.

---

# 19. Main GitHub Repo Recommendation

The future GitHub repo should include a clear project brain structure.

Recommended top-level docs:

- `README.md` → high-level public overview
- `MAIN_BRAIN.md` or this file → master orientation document
- `docs/schema-reference.md`
- `docs/conversation-handoff.md`
- `docs/dashboard-handoff.md`
- `docs/product-strategy.md`
- `docs/multi-town-migration.md`
- `docs/execution-queue.md`
- `docs/design-direction.md` (recommended new file)
- `docs/frontend-workflow.md` (recommended new file)

## Recommended repo principle
One repo should become the project memory layer:
- architecture
- design
- product vision
- workflows
- migration plans
- execution queue

---

# 20. Recommended New Docs for the Repo

Two new documentation files are now recommended because of recent developments:

## A. `design-direction.md`
Should capture:
- cultural magazine + museum archive positioning
- visual-first homepage logic
- hero video direction
- quiet interface principles
- typography and palette guidance

## B. `frontend-workflow.md`
Should capture:
- Cursor workflow
- local dev setup
- local folder requirement
- common Tailwind/Next debugging notes
- refinement-pass workflow instead of rebuild workflow

---

# 21. Current Immediate Next Actions — UPDATED

Current sequence should now be:

1. refine homepage width and card polish
2. replace hero placeholder with cinematic looping video
3. keep homepage text minimal and visually led
4. refine navigation/header calmness
5. refine featured places and map preview blocks
6. prepare real imagery/video assets for the homepage
7. then continue with place page and map shell refinement
8. only later connect real data and deeper app logic

---

# 22. Core Operating Principle Going Forward

Do not confuse visual refinement with a rebuild.

The correct method is:
- keep existing architecture where it works
- refine section by section
- preserve coherence
- avoid unnecessary rewrites
- let the design evolve through controlled passes

---

# 23. Short Strategic Summary

ExploreBarbizon is becoming strongest when treated as:

**a visual, map-first, editorial cultural atlas of Barbizon**

The most important recent update is that the homepage should now be more visual, more cinematic, and less text-led, while preserving the refined editorial identity.

That direction is coherent with the broader Civitas Layers vision and should now guide the GitHub “main brain” repo going forward.

---

End of master handoff.

