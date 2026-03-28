# Current State

Last updated: 2026-03-27

---

## What is live (explorebarbizon.com)

### Branding
- Public brand is **Visit Barbizon** across all pages — nav, footer, titles, body copy
- Domain remains explorebarbizon.com

### Map (`/map`)
- Full-screen map, sidebar hidden by default
- Floating "Layers & Search" button top-left opens drawer panel
- Drawer: search, layer toggles, location count — closes on Escape or backdrop click
- Cluster bubbles color-matched to dominant layer (brown = Art & History, green = Forest & Nature, etc.)
- **Subcategory-level pin icons** — teardrop shape with Noun Project glyphs:
  - Museum (columns), Artist House (house), Gallery (palette), POI/Mosaic (star), Cemetery (cross)
  - Restaurant (fork+knife), Bakery (croissant), Café (cup), Hotel (bed), Shop (bag)
  - Trail (footprints), Viewpoint (binoculars), Boulder/Climbing (climber figure)
  - Parking (P), Bus (bus), Info (i)
- **Trail route rendering**: Circuit des Peintres de Barbizon shown as dashed green line
  - Click → popup with name, distance, duration, difficulty
  - Apple Maps + Google Maps navigation buttons routing to trail start

### Places (`/places`)
- 70 published locations (Practical excluded — editorial page only)
- Art & History + ESS categories only
- Filter pills by subcategory

### Database
- `routes` table created with geojson column
- Circuit des Peintres de Barbizon seeded (7.4km, 1,011 GPS points, is_published = true)

---

## What is NOT yet done

### Content
- No stories written (biggest visible gap)
- No narrative text for most Art & History locations
- No Forest & Nature layer data
- Three ESS items pending: unnamed gallery 78 Grande Rue, La Dame aux Coquelicots, Boucherie cheese confirmation

### Data
- Coordinate audit not done — many map pins are incorrectly placed
- No real place images (using fallback)
- No hero video asset

### Frontend
- Full aesthetic pass not done (homepage full-bleed, places magazine grid, stories layout)
- Stories page not wired to Supabase
- Tours page not wired to Supabase
- Dashboard v1 not built

### Schema
- `stories` table not created
- `artists` table not created
- `visual_works` table not created
- `layers` table not created
- `tours` missing `is_published`, `tour_type`, `difficulty`

---

## Repo state

Branch: `main`
Build: passing
TypeScript: clean
Lint: clean (existing exhaustive-deps warning on map init effect — intentional)

Key files:
- `components/MapGL.tsx` — map rendering, icons, trail layers
- `lib/supabase.ts` — data fetching including routes
- `pages/map.tsx` — map page with routes prop
- `pages/places/index.tsx` — editorial listing (Practical excluded)
- `migrations/create-routes-circuit-des-peintres.sql` — routes table + seed
