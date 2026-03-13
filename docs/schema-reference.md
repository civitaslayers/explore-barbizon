# Schema Reference

Last updated: 2026-03-13
Source: Live Supabase project `afqyrxtfbspghpfulvmy` (Civitas Layers' Project, eu-west-2, Postgres 17)

---

## Part 1 — Current Live Schema

This is the exact schema as it exists in the database today, pulled directly from `information_schema`.

---

### `towns`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| name | text | NO | — |
| country | text | NO | — |
| region | text | YES | — |
| slug | text | NO | — |
| description | text | YES | — |
| created_at | timestamptz | YES | now() |

---

### `categories`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| town_id | uuid | YES | — |
| name | text | NO | — |
| slug | text | NO | — |
| layer | text | NO | — |
| icon | text | YES | — |
| color | text | YES | — |
| display_order | integer | YES | 0 |

FK: `town_id` → `towns.id`

Note: `layer` is a plain text field encoding which map layer this category belongs to. See proposed schema for how this should evolve.

---

### `locations`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| town_id | uuid | YES | — |
| category_id | uuid | YES | — |
| name | text | NO | — |
| slug | text | NO | — |
| short_description | text | YES | — |
| full_description | text | YES | — |
| narrative | text | YES | — |
| latitude | double precision | NO | — |
| longitude | double precision | NO | — |
| address | text | YES | — |
| phone | text | YES | — |
| website | text | YES | — |
| opening_hours | jsonb | YES | — |
| is_published | boolean | YES | false |
| is_premium | boolean | YES | false |
| is_featured | boolean | YES | false |
| qr_code_url | text | YES | — |
| show_on_map | boolean | YES | true |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

FKs: `town_id` → `towns.id`, `category_id` → `categories.id`

---

### `media`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| location_id | uuid | YES | — |
| type | text | YES | — |
| url | text | NO | — |
| caption | text | YES | — |
| is_premium | boolean | YES | false |
| display_order | integer | YES | 0 |
| created_at | timestamptz | YES | now() |

FK: `location_id` → `locations.id`

Note: `media` is currently scoped to locations only. No attachment to tours, stories, or artists.

---

### `tours`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| town_id | uuid | YES | — |
| name | text | NO | — |
| slug | text | NO | — |
| description | text | YES | — |
| duration_minutes | integer | YES | — |
| distance_meters | integer | YES | — |
| is_premium | boolean | YES | false |
| cover_image_url | text | YES | — |
| created_at | timestamptz | YES | now() |

FK: `town_id` → `towns.id`

Note: no `is_published` column. No tour type or difficulty field. No geographic path (GeoJSON).

---

### `tour_stops`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| tour_id | uuid | YES | — |
| location_id | uuid | YES | — |
| stop_order | integer | NO | — |
| stop_narrative | text | YES | — |

FKs: `tour_id` → `tours.id`, `location_id` → `locations.id`

---

### `users`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| email | text | NO | — |
| is_premium | boolean | YES | false |
| premium_until | timestamptz | YES | — |
| created_at | timestamptz | YES | now() |

Note: `id` has no default — it is expected to mirror `auth.users.id` from Supabase Auth. The FK to `auth.users` is not visible through `information_schema`.

---

### Foreign Key Map

```
categories.town_id        → towns.id
locations.town_id         → towns.id
locations.category_id     → categories.id
media.location_id         → locations.id
tours.town_id             → towns.id
tour_stops.tour_id        → tours.id
tour_stops.location_id    → locations.id
```

---

### Field Naming Rules (enforced)

These override any default assumptions in queries, migrations, or AI-assisted sessions:

| Use | Not |
|---|---|
| `layer` | `map_layer` |
| `distance_meters` | `distance_km` |
| `stop_narrative` | `notes` |

---

### Current Schema Gaps

- No `stories` table
- No `artists` table
- No `paintings` table
- No `routes` table (geographic paths)
- No `layers` table — layer identity is encoded as a plain text field on `categories`
- `media` is location-scoped only — cannot attach images to tours, stories, or artists
- `tours` has no `is_published` flag
- No unique constraints visible on slug columns (may exist as indexes, not visible through information_schema)

---

---

## Part 2 — Proposed Civitas Target Schema

This section documents the intended schema evolution. Nothing here should be created until the Barbizon MVP is complete and the implementation is sequenced carefully.

All proposed tables are additive. No existing columns or IDs should be altered.

---

### Design principles

1. `locations` stays as the core spatial anchor. Do not rename it at the database level. The product layer can call them "places."
2. `stories` is a new first-class editorial table, not a text field on locations.
3. `artists` and `paintings` form the cultural archive layer — linked but independent.
4. `routes` is separated from `tours`: a route is a geographic artifact (GeoJSON path), a tour is an editorial product with narrative and stops. A tour may reference a route or not.
5. `layers` becomes a proper table, replacing the `categories.layer` text field. This enables full layer management: visibility, ordering, map styling.
6. Paintings require a `geo_confidence` field because exact painting-to-location coordinates are unreliable and require real historical research.
7. No breaking changes to existing tables. New columns added to existing tables are nullable.

---

### Proposed: `stories`

Editorial content. Long-form articles, cultural essays, archival texts.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | uuid_generate_v4() |
| town_id | uuid FK → towns.id | |
| slug | text NOT NULL UNIQUE | |
| title | text NOT NULL | |
| subtitle | text | Optional deck/standfirst |
| body | text | Markdown or structured rich text |
| cover_image_url | text | |
| author | text | Display name |
| published_at | timestamptz | Null = draft |
| is_published | boolean | default false |
| is_premium | boolean | default false |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

Junction: **`story_locations`** (many stories ↔ many locations)

| Column | Type |
|---|---|
| story_id | uuid FK → stories.id |
| location_id | uuid FK → locations.id |

---

### Proposed: `artists`

People who worked in or are associated with the town. Not just painters — writers, photographers, etc.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | uuid_generate_v4() |
| slug | text NOT NULL UNIQUE | |
| name | text NOT NULL | |
| birth_year | integer | |
| death_year | integer | |
| nationality | text | |
| bio_short | text | One paragraph |
| bio_long | text | Full editorial text |
| portrait_url | text | |
| is_published | boolean | default false |
| created_at | timestamptz | default now() |

Junction: **`artist_locations`** (where they lived, worked, or are commemorated)

| Column | Type | Notes |
|---|---|---|
| artist_id | uuid FK → artists.id | |
| location_id | uuid FK → locations.id | |
| relationship | text | 'lived', 'worked', 'subject', 'commemorated' |

---

### Proposed: `paintings`

Artworks with optional geographic attribution. Geo data must be treated carefully.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | uuid_generate_v4() |
| slug | text NOT NULL UNIQUE | |
| title | text NOT NULL | |
| artist_id | uuid FK → artists.id | Nullable — unknown attribution |
| year_circa | text | Free text: "c. 1856", "1850–1855" |
| medium | text | e.g. "Oil on canvas" |
| dimensions | text | e.g. "46 × 55 cm" |
| current_location | text | Museum or collection name |
| image_url | text | |
| location_id | uuid FK → locations.id | Where it was painted — nullable |
| latitude | double precision | Approximate pin — nullable |
| longitude | double precision | Approximate pin — nullable |
| geo_confidence | text | 'exact', 'approximate', 'uncertain', 'unknown' |
| source_notes | text | Research provenance and caveats |
| is_published | boolean | default false |
| created_at | timestamptz | default now() |

**Important:** `geo_confidence` is required on any row with coordinates. The Barbizon mosaics are not reliable exact painting coordinates. Do not populate `latitude`/`longitude` without historical source verification. Postcards are a more tractable starting point than paintings for geo-attribution.

---

### Proposed additions to `tours`

The existing `tours` table is sound but missing three fields:

| Column | Type | Notes |
|---|---|---|
| is_published | boolean | default false — currently missing |
| tour_type | text | 'walking', 'thematic', 'art', 'nature' |
| difficulty | text | 'easy', 'moderate', 'challenging' |

---

### Proposed: `routes`

Geographic paths, decoupled from tour narrative. Allows a path to exist before editorial content is written, and allows the same path to be reused.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | uuid_generate_v4() |
| town_id | uuid FK → towns.id | |
| tour_id | uuid FK → tours.id | Nullable — route can exist without a tour |
| name | text NOT NULL | |
| slug | text NOT NULL UNIQUE | |
| geojson | jsonb | LineString or MultiLineString |
| distance_meters | integer | |
| duration_minutes | integer | |
| created_at | timestamptz | default now() |

---

### Proposed: `layers`

Replaces the `categories.layer` text field with a proper table. Enables per-layer visibility, styling, and ordering in the map.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | uuid_generate_v4() |
| town_id | uuid FK → towns.id | |
| name | text NOT NULL | e.g. 'Cultural', 'Nature', 'Historical', 'Commerce' |
| slug | text NOT NULL UNIQUE | |
| description | text | |
| color | text | Hex or named colour for map rendering |
| icon | text | |
| display_order | integer | default 0 |
| is_visible_by_default | boolean | default true |
| is_premium | boolean | default false |
| created_at | timestamptz | default now() |

Migration consequence: `categories.layer` (text) would be replaced by `categories.layer_id` (uuid FK → layers.id). This is a breaking change to the categories table and should be done in a controlled migration, not ad hoc.

---

### Proposed entity relationship summary

```
towns
 ├── categories (via town_id)
 │    └── [future] layer_id → layers
 ├── locations (via town_id)
 │    ├── media (via location_id)
 │    ├── story_locations (junction)
 │    ├── artist_locations (junction)
 │    ├── paintings (via location_id, optional)
 │    └── tour_stops (via location_id)
 ├── tours (via town_id)
 │    ├── tour_stops (via tour_id)
 │    └── routes (via tour_id, optional)
 ├── stories (via town_id)
 ├── artists (no direct town_id — scoped via artist_locations)
 └── layers (via town_id)
```

---

### Implementation sequence (when ready)

1. Add `is_published`, `tour_type`, `difficulty` to `tours` — safe, additive
2. Create `stories` + `story_locations` — no impact on existing tables
3. Create `artists` + `artist_locations` — no impact on existing tables
4. Create `paintings` — requires `artists` to exist first
5. Create `routes` — requires `tours` to exist (already does)
6. Create `layers` and migrate `categories.layer` text → `layer_id` FK — this is the one breaking change; sequence last
