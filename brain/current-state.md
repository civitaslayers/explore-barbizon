# Current State

Last updated: 2026-03-14

---

## Status

The core Barbizon app is live locally in Next.js with:
- Mapbox GL JS map page
- clustering
- per-category SVG icons
- search
- layer toggles
- places index
- place detail pages
- related and nearby sections

The project is now in refinement mode, not rebuild mode.

---

## Last completed

- Map page shipped with clustering and category icon system
- Places index built
- Place detail pages built
- Mapbox Static thumbnails integrated for place cards / previews

---

## Current focus

1. place page refinement
2. geographic nearby places logic
3. large-screen layout audit
4. visual polish without broad rewrites

---

## Blockers

- none confirmed in repo state
- note blockers here only if they actively stop implementation

---

## Constraints

- keep Pages Router
- preserve current stack
- preserve museum-cartography direction
- keep diffs minimal
- follow schema reference exactly

---

## Recommended next step

Audit place detail layout on large screens, then tighten nearby places behavior using geographic logic only if the current data path supports it cleanly.

---

## Files likely in play next

- `pages/places/[slug].tsx`
- `pages/places/index.tsx`
- related place components
- nearby place query / utility files
