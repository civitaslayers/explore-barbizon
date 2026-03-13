# Execution Queue

Source: extracted from MAIN_BRAIN.md
Last updated: March 2026

---

## Immediate Front-End Sequence

Current priority order:

1. Refine homepage width and card polish
2. Replace hero placeholder with cinematic looping video
3. Keep homepage text minimal and visually led
4. Refine navigation/header calmness
5. Refine featured places and map preview blocks
6. Prepare real imagery/video assets for the homepage
7. Then continue with place page and map shell refinement
8. Only later: connect real data and deeper app logic

---

## Barbizon Content Priorities

- Complete Forest & Nature layer
- Polish hero locations
- Build first walking trail
- Improve featured places presentation
- Prepare historical postcard/media layer

---

## Dashboard v1 Priorities

A lightweight internal dashboard should be built to reduce dependence on raw SQL.

Build order:
1. Login
2. Overview
3. Locations list
4. Single location editor

Build inside the same Next.js codebase as the app.

---

## Multi-Town Migration (Deferred)

Do not execute until Barbizon MVP is complete.

When ready, the migration sequence should cover:
- `town_settings` table
- Composite slug discipline
- `category_templates` and `town_categories`
- Town-aware dashboard logic

---

## Operating Principle

Do not confuse visual refinement with a rebuild.

The correct method:
- Keep existing architecture where it works
- Refine section by section
- Preserve coherence
- Avoid unnecessary rewrites
- Let the design evolve through controlled passes
