# Architecture Summary

Source: extracted from MAIN_BRAIN.md
Last updated: March 2026

---

## Project Identity

| Layer | Name |
|---|---|
| Company / infrastructure | Civitas Layers |
| Public-facing town brand | Visit Barbizon |
| Live digital destination | ExploreBarbizon.com |

Civitas Layers is not a normal tourism website. It is a civic geo-narrative platform designed to turn heritage towns into open-air museums through spatial storytelling, layered mapping, historical media, and curated discovery. Barbizon is the flagship prototype.

---

## Core Stack

| Tool | Role |
|---|---|
| Supabase | Source of truth / database |
| Mapbox | Spatial engine |
| Next.js | Real product layer |
| Tailwind | Styling |
| Webflow | Editorial shell (temporary / being phased out) |

---

## Current Development Direction

The long-term public experience should move toward Next.js for:
- Homepage shell
- Map
- Place pages
- Tour pages
- Dashboard

Webflow may still be used for selected editorial pages or temporary shell work, but should not remain the core product surface.

---

## Product Model

ExploreBarbizon is four connected products in one:

1. Interactive cultural map
2. Dynamic place pages
3. Tours and walking routes
4. Editorial stories / archive content

**Primary visitor journey:**
Visual entry → Spatial exploration → Editorial depth

- Images and video attract
- Map and trails engage
- Stories and archive content deepen the experience

---

## Product Entry Modes

### A. Map mode
For visitors discovering Barbizon spatially or physically while in town.

### B. Story mode
For users interested in artists, history, paintings, houses, archival layers, and cultural essays.

### C. Editorial / planning mode
For search traffic and users planning a visit.

---

## Dashboard Direction

A lightweight internal dashboard should be built to reduce dependence on raw SQL.
It should be built inside the same Next.js codebase as the app.

Dashboard v1 scope:
- Login
- Overview
- Locations list
- Single location editor

---

## Multi-Town Direction

The multi-town migration plan is valid but deferred.
Before onboarding town #2, the system should evolve toward:
- `town_settings`
- Composite slug discipline
- `category_templates` / `town_categories`
- Town-aware dashboard logic

Do not perform a giant refactor now. Finish Barbizon MVP first.
