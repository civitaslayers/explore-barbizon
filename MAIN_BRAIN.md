# Civitas Layers — Main Brain

Last updated: 2026-03-14

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

## Product model

ExploreBarbizon combines four connected products:

1. interactive cultural map
2. dynamic place pages
3. tours and walking routes
4. editorial stories / archive content

Primary user journey:

**Visual entry -> Spatial exploration -> Editorial depth**

This means:
- image and video attract
- map and trails engage
- stories and archive content deepen

---

## Current design direction

The homepage should be:

**visual-first, text-deeper**

Principles:
- cinematic hero
- minimal top-of-page copy
- strong visual atmosphere
- map access early
- editorial depth further down or deeper in the site

The interface should feel:
- calm
- elegant
- refined
- visually led
- museum-cartographic

Not:
- brochure-like
- loud
- crowded
- dashboard-like

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

## Near-term product priorities

1. refine the visual shell
2. strengthen place pages
3. complete early walking/tour flows
4. prepare historical media and postcard layer
5. continue Barbizon MVP before multi-town migration

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

Finish the Barbizon MVP first.
Then evolve the system in controlled steps toward:
- town-aware settings
- composite slug discipline
- category templates
- town-aware dashboard logic

---

## Operating principle

Do not confuse refinement with rebuild.

The correct method is:
- keep what works
- refine section by section
- preserve coherence
- avoid unnecessary rewrites
- let the product mature through controlled passes
