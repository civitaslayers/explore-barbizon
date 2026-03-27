# Civitas Layers — Main Brain

Last updated: 2026-03-27

## Purpose

This document is the long-range strategic orientation for the Civitas Layers / ExploreBarbizon project.

Use it for:
- product positioning
- design direction
- roadmap decisions
- multi-town strategy
- workflow philosophy

Do not use it as the primary operational handoff for routine coding sessions.
Operational state belongs in:
- `brain/current-state.md`
- `brain/task-queue.md`
- `brain/decisions.md`

---

## Project identity

**Company / infrastructure:** Civitas Layers
**Public-facing town brand:** Visit Barbizon
**Digital destination:** ExploreBarbizon.com

Civitas Layers is a civic geo-narrative platform for heritage towns.
Barbizon is the flagship prototype.

The strongest positioning remains:

**A quiet digital atlas of Barbizon**

The product should sit between:
- cultural magazine
- museum / archive interface
- cartographic exploration product

Avoid:
- generic tourism website patterns
- startup SaaS aesthetics
- cluttered travel-directory design

---

## Branding note

The public-facing brand is **Visit Barbizon**, not "Explore Barbizon".
- All UI wordmarks, nav headers, and page titles use "Visit Barbizon"
- The domain remains explorebarbizon.com (visitbarbizon.com domain deferred — currently priced at ~5K)
- "Visit..." translates better across languages and works as a pattern for future cities (Visit Fontainebleau, Visit Giverny, etc.)

---

## Product model

ExploreBarbizon combines four connected products:

1. interactive cultural map ← **primary product, everything else feeds into it**
2. dynamic place pages
3. tours and walking routes
4. editorial stories / archive content

Primary user journey:

**Visual entry → Spatial exploration → Editorial depth**

This means:
- image and video attract
- map and trails engage
- stories and archive content deepen

**The map is the product. All editorial content is a funnel into the map.**

---

## Current design direction

The map should be the first thing a user reaches.
All other pages are funnels that lead back to spatial exploration.

The homepage should be:

**full-bleed visual → immediate map access → editorial below**

Principles:
- cinematic hero (video when available, atmospheric full-bleed still otherwise)
- map CTA above the fold
- minimal copy in the hero
- no text walls above the scroll break
- editorial depth lives below or deeper in the site

The interface should feel:
- calm
- eloquent
- immersive
- modern but not trendy
- visually courageous — big images, generous negative space

Not:
- brochure-like
- loud
- crowded
- dashboard-like
- timid or padding-shy

---

## Editorial architecture

### Places page (`/places`)
- Shows Art & History + ESS (Eat, Stay & Shop) locations only
- **Practical category is excluded from Places** — bus stops, toilets, parking are map utilities only
- Editorial catalogue: inspires discovery, not logistics

### Stories page (`/stories`)
Two registers of content, both live here:
- **Historical/cultural** — "How Millet's studio shaped the Barbizon School"
- **Practical-editorial** — "Where to sleep in Barbizon" / "The best tables in the village"

Stories uses a `type` field to distinguish: `history` vs `guide`.
Best-of lists, recommendations, and where-to-eat articles are all **Stories**, not Places or Plan Your Visit.

### Plan Your Visit (`/plan-your-visit`)
Logistics only: getting there, seasons, accessibility, practical orientation.
Not recommendations. Not editorial picks.

---

## Technical direction

Keep:
- Supabase as source of truth
- Mapbox as spatial engine
- Next.js as product layer
- Webflow only as editorial or temporary shell

Long-term direction:
- Next.js should carry the real product experience
- Webflow should not remain the core application surface

---

## Database baseline

Current schema family includes:
- towns
- categories
- locations
- tours
- tour_stops
- media
- users

Field rules:
- use `layer`, not `map_layer`
- use `distance_meters`, not `distance_km`
- use `stop_narrative`, not `notes`

The schema reference remains the authority for exact field names and constraints.

---

## Map design principles

The map page is full-screen. No persistent sidebar.
- Sidebar/panel is hidden by default
- Opens only when a pin is clicked or a filter is activated
- On desktop: slide-in drawer (left or right), dismisses on map click
- On mobile: bottom sheet — peek state (name only) → expanded on tap
- Map controls appear as floating elements, not as a panel

Map icons use **subcategory-level** differentiation, not group-level.
Each subcategory slug has its own distinct icon within its layer's color.
Icon clarity over decoration — one visual idea per icon, legible at 32px.

---

## Content state

- ~79 published locations: Art & History (24), Practical (17), ESS (38)
- Forest & Nature layer: not yet started
- Narratives: mostly missing — writing phase has not begun
- Stories: zero published — this is the most visible content gap
- First stories targets: Maison de Millet, Ferme du Couvent (historical); "Where to sleep", "Where to eat" (guides)

---

## Near-term product priorities

1. Branding: swap all UI references to "Visit Barbizon"
2. Places page: exclude Practical category
3. Map: coordinate audit — many pins are incorrectly placed
4. Map: sidebar UX redesign (hidden by default, drawer/bottom-sheet pattern)
5. Map: icon redesign — subcategory-level icons, all categories
6. Design: aesthetic review — more immersive, full-bleed, map-first
7. Content: write first stories (historical + guide register)
8. Stories: add `type` field to schema (`history` / `guide`)

---

## Dashboard direction

A lightweight internal dashboard remains desirable.

Dashboard v1 priorities:
- login
- overview
- locations list
- single location editor

This should live inside the same Next.js codebase.

---

## Multi-town principle

Do not execute a giant multi-town refactor yet.
Finish Barbizon MVP first.
The `town_id` FK is already on `locations` — migration will be tractable when the time comes.
