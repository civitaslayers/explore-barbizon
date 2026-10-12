# Plan: map tips layer (Allée John Constable)

Task 5e8e23cf. Plan only.

## Goal
Dashed line with a hover/tap hint, not a pin, for the shortcut from `parking-marc-jacquet` (48.44482, 2.60260) through `allee-john-constable` (48.44453, 2.60444) to the Grande Rue.

## Options
1. **Static GeoJSON in repo** (`lib/mapTips.ts`, a typed LineString with `slug, hint_fr, hint_en`). No DDL, no publish gate, ships in a normal PR. Edits need a commit.
2. **`map_tips` table**: `id uuid pk, town_id fk towns, slug text unique, geojson jsonb not null, translations jsonb, is_published bool default false, created_at`. Editable without a deploy and ready for multiple towns. Costs a migration, RLS, a types regen and a fetch, all for one row.
3. **`tips` flag on `routes`**: rejected. The brief forbids it, and tips would leak into every `routes` consumer (tour pages, the `route-line` click, `hideAllRoutes` resets).

## Recommendation
Option 1. In `MapGL.tsx`, add its own `map-tips` source and a `tip-line` layer (`line-dasharray`), following the `my-day` pattern so the `routes` handlers never clear it. Hover and tap open a small popup. Move to option 2 at 3 or more tips.

## Luigi to supply or confirm on site
1. Path start: the exact gap where it leaves the Marc Jacquet car park.
2. Any bend vertices along the allée.
3. Path end: where it meets the Grande Rue.
4. Confirm that 48.44453, 2.60444 lies on the walked path.
5. The positions of the two Parcours des Peintres mosaics.
6. Opening: always open, gated or seasonal (for the hint text).

## Mosaics
Two ordinary `locations` rows in the existing mosaic category (the `eb-poi` star in `CATEGORY_ICON`). Once published (human gate), `buildGeoJSON` renders them as normal pins above the tip line. No special code.
