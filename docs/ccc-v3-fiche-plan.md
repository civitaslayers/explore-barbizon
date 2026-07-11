# CCC v3 — "La Fiche" — Architecture & Feature Proposal

Status: Stage 0 planning output. No code. For the Luigi + Claude human gate.
Author: civitas-architect
Date: 2026-07-11

---

## 0. Scope, sources, and verification notes

This plan grows the pin editor (`pages/command-center/pins.tsx`) into the full
location editor — the base tool for building and maintaining the ExploreBarbizon
heritage atlas. It stays strictly inside the 7 locked decisions in
`docs/ccc-v3-fiche-planning-brief.md` (lines 13–35).

**What was verified against real code (ground truth):**

- Locations column set — cross-checked across `pages/dashboard/locations/[id].tsx`
  (`getServerSideProps` select), `pages/api/locations/[id].ts` (`ALLOWED_FIELDS`),
  `lib/supabase.ts` (`DbLocation`, `LocationFull`), and `docs/schema-reference.md`
  Part 1.
- `opening_hours` shape — typed as `Record<string, string> | null` in `lib/supabase.ts`
  (lines 39, 288). It is a flat map, keys rendered literally. **Caveat on precedent:**
  the free-form `Object.entries(...)` day→string render in `pages/places/[slug].tsx`
  (lines 149–205) is for `location_functions.opening_hours` (a `LocationFunction`,
  `fn.opening_hours`) — a *different table's* column — NOT the parent
  `locations.opening_hours`. The parent field is selected in `getPublishedLocations`
  (`lib/supabase.ts:160`) but then **discarded** by `toPlace()` (`lib/supabase.ts:78–93`)
  and is absent from `LocationFull` (`lib/supabase.ts:298–311`) — so
  `locations.opening_hours` currently has **no public renderer**; it is effectively
  unrendered/dead on the public site today. The type-shape claim
  (`Record<string, string> | null`) holds either way, but the absence of a live
  renderer makes Open Question 1's live-data key-convention check **more** load-bearing,
  not less — there is no shipped render precedent to conform the editor to.
- `location_functions`, `tour_stops`, `media` shapes — `lib/supabase.ts`
  (`getLocationFull`, lines 313–358), `pages/tours/[slug].tsx`, `docs/schema-reference.md`.
- Verified-write pattern — `pages/api/locations/[id].ts` (epsilon compare, RETURNING
  row is truth, committed-write-never-reported-as-failure).
- Design tokens — `docs/design-direction.md` + `tailwind.config.js` references.

**Discrepancies found — `docs/schema-reference.md` (dated 2026-04-03) is STALE:**

1. `curation_order` is a **live** column (used in `dashboard/locations/[id].tsx`,
   `lib/supabase.ts` line 47/91, `ALLOWED_FIELDS`, and the generated types) but is
   **missing from the schema-reference Part 1 `locations` table**. Treat it as live.
2. `lib/supabase.types.ts` (generated) is stale in the opposite direction: it still
   carries a `place_id` column + `locations_place_id_fkey` and an entire
   `place_functions` table — both **legacy artifacts** of the dropped `places` table
   (per `brain/current-state.md`: "places + place_functions tables dropped"). `place_id`
   must never be surfaced or written in the fiche.
3. `internal_notes`, `allow_proximity_override`, `booking_url` are live columns
   (schema-reference + migration `add_internal_notes_to_locations.sql`) but **absent
   from `lib/supabase.types.ts`** — the API route already documents this staleness
   (comment at lines 30–33) and types those fields with local row shapes.

**Could not run live SQL:** the Supabase MCP `execute_sql` / `list_tables` read tools
were not exposed as callable in this planning session. Consequences, stated honestly:
(a) completeness gap counts below are **structural** (derived from the schema and the
known content backlog), not measured; (b) the exact `opening_hours` day-key convention
(`"Lundi"` vs `"lundi"` vs `"Mon–Fri"` vs mixed) is **to confirm from live data** before
the hours editor is built — the editor design below is deliberately non-destructive of
whatever keys already exist. A one-query confirmation is listed in Open Questions.

**Live `locations` columns treated as authoritative for this plan:**
`id, town_id, category_id, name, slug, short_description, full_description, narrative,
latitude, longitude, address, phone, website, booking_url, opening_hours (jsonb),
is_published, is_premium, is_featured, curation_order, qr_code_url, show_on_map,
show_in_editorial, route_slug, allow_proximity_override, internal_notes, created_at,
updated_at`. (`place_id` exists but is legacy — ignored.)

---

## 1. Information Architecture

### 1.1 The decision: sibling routes sharing state via the URL — NOT one mega-page with modes

**Recommendation: a single "Atlas" surface under `/command-center/atlas`, built as
route-addressable sibling pages that share one data layer and carry selection state in
the URL — not `pins.tsx` swollen with internal `mode` state.**

Concrete URL structure:

| Route | Role | Absorbs |
|---|---|---|
| `/command-center/atlas?view=map` | Atlas index, **Map** view (default) | `pages/command-center/pins.tsx` |
| `/command-center/atlas?view=list` | Atlas index, **List** view w/ completeness filters | `pages/dashboard/locations/index.tsx` |
| `/command-center/atlas?view=…&sel=<id>` | Preview card open for a location (shallow-routed, over either view) | — |
| `/command-center/atlas/[id]` | **La Fiche** — full-record editor | `pages/dashboard/locations/[id].tsx` |
| `/command-center/pins` | **301/redirect** → `/command-center/atlas?view=map` (Phase 3) | itself |
| `/dashboard/locations`, `/dashboard/locations/[id]` | **redirect** → atlas equivalents (Phase 3) | themselves |

### 1.2 Why sibling routes, argued

The alternative — bolting a `list` mode and a `fiche` mode onto `pins.tsx` — was
rejected for concrete reasons:

- `pins.tsx` is already 930 lines of **imperative Mapbox marker management** (manual
  `Marker` refs, stack-fanning geometry, drag lifecycle, proximity popovers). Adding
  list-table state and a full multi-section form's dirty/save state into the same
  component would entangle two very different rendering models and make every future
  change riskier. Keep the heavy imperative map code isolated.
- **Route-addressability is a feature, not a nicety here.** A fiche at its own URL is
  deep-linkable (share "go fix Auberge Ganne"), back-button-correct, and — critically for
  locked decision 5 — gives every write a clean `source_page` value
  (`/command-center/atlas/[id]`) for the audit trail. It also mirrors the mental model
  we are absorbing (`/dashboard/locations/[id]` was already its own route).
- **Shared state without a client store:** the two index views (map, list) share one
  server-loaded dataset (one `getServerSideProps` on `/command-center/atlas` using
  `supabaseAdmin`, the same source `pins.tsx` uses today) and one selection (`?sel=<id>`
  in the query, shallow-routed so toggling map↔list keeps the selection and the map
  doesn't remount). No Redux/Zustand/new dep — the URL *is* the shared state.

So: **sibling pages, shared GSSP dataset, selection + view in the URL.** The map view
and list view are co-equal children of one Atlas index; the fiche is a full sibling
route reached by a normal `next/link` from the preview card.

### 1.3 The relationship, in one line

Map/List (Atlas index) → click a pin or row → **preview card** (`?sel=`) → "Ouvrir la
fiche" → **la fiche** (`/atlas/[id]`, full editor) → "← Atlas" returns to the exact view
you left (`view` preserved in the back link).

### 1.4 Real files created / absorbed

Created:
- `pages/command-center/atlas/index.tsx` — Atlas index (GSSP loads all locations +
  category + media-count + completeness inputs; holds `view` and `sel` from query).
- `pages/command-center/atlas/[id].tsx` — la fiche (GSSP loads full record + linked
  entities).
- `components/command-center/AtlasMapView.tsx` — the extracted `pins.tsx` map logic
  (markers, stacks, drag-to-move, proximity guard, search, filters), re-parented to
  emit `sel` selection instead of an ad-hoc inspector card.
- `components/command-center/AtlasListView.tsx` — the absorbed dashboard table, plus
  completeness column + filters + layer chip.
- `components/command-center/LocationPreviewCard.tsx` — shared card (Section 2).
- `components/command-center/fiche/` — one file per fiche section (Section 3).
- `components/command-center/OpeningHoursEditor.tsx` — the jsonb hours editor (Section 3).
- `lib/completeness.ts` — pure scoring function, shared server + client (Section 4).
- `migrations/create_location_edits.sql` — audit table DDL (proposal, Section 3.9).

Absorbed then redirected (Phase 3): `pages/command-center/pins.tsx`,
`pages/dashboard/locations/index.tsx`, `pages/dashboard/locations/[id].tsx`, and the
sidebar entry in `components/CommandCenterLayout.tsx` ("Éditeur de pins" → "Atlas").
Note there is also a legacy `pages/dashboard/places/index.tsx` and
`pages/api/places/[id].ts` — flagged for the Phase 3 sweep, confirm they are dead before
removal.

Modified: `pages/api/locations/[id].ts` (extend `ALLOWED_FIELDS`, add audit writes —
Section 3.9); `components/CommandCenterLayout.tsx` (nav label + href).

---

## 2. The Preview Card

`components/command-center/LocationPreviewCard.tsx`. Opens on selecting a pin (map) or a
row (list); rendered identically from both views. It is a **read-mostly summary that
answers "what is this and what's missing"** — the launch pad into the fiche, not an
editor itself. Design language: the existing `.card` token (`rounded-card`,
`bg-cream/90`, `shadow-ambient`), no 1px dividers (No-Line rule), umber-tinted shadow.

Exact contents, every field named against real columns:

| Element | Source field(s) | Behaviour |
|---|---|---|
| Photo / placeholder | first `media.url` ordered by `media.display_order` | If no media row: an honest empty slot — a tonal `surface-container-low` rectangle with a small "— sans photo —" label. The gap is information (locked decision 4). |
| Name | `locations.name` | Newsreader italic, `heading-lg`. |
| Category | `categories.name` (join) | `.chip`. |
| Layer colour | `categories.layer` → `GROUP_COLORS` in `lib/categoryGroups.ts` | A colour dot / left-edge tint using the exact layer hex (umber / moss / `#4A5E3A` / `#888888`). Reuses `getCategoryGroup`. |
| Address | `locations.address` | If null: italic `— sans adresse —` (matches the existing pins tooltip convention). |
| Short description | `locations.short_description` | Truncated 2 lines; if null, an empty-state line. |
| Published state | `locations.is_published` | Distinct visual: published = `primary-container` solid chip; draft = `secondary-container` chip. The existing pins inspector (`pins.tsx:792–801`) labels these in **English "Published"** with a French draft "Brouillon" (mixed). **Recommendation: standardise the fiche/card to French — "Publié" / "Brouillon" —** since the tool is French-facing (nav "Éditeur de pins", "sans adresse", "Brouillon"); flagged as a small consistency fix, not a match-existing. Read-only on the card — publishing happens only in the fiche with a confirm summary. |
| Completeness | `lib/completeness.ts` (Section 4) | A small ring / bar + `NN%`, tinted by band (see 4.4). This is the card's most operational element. |
| Expand affordance | — | Primary action "Ouvrir la fiche →" (`next/link` to `/atlas/[id]`), plus the whole card body is clickable. On the map, a secondary "Centrer" re-centres without leaving. |

The card also carries the two flags most relevant to triage as tiny muted markers
(not editable here): `show_on_map` and `show_in_editorial` — because a location can be
published yet hidden from a surface, and that is worth seeing at a glance.

Coordinates are shown read-only in monospace (as the pins inspector does) — dragging
remains the map view's job, not the card's.

---

## 3. La Fiche

`pages/command-center/atlas/[id].tsx`. Full-record editor, one location. GSSP loads the
full row + linked entities via `supabaseAdmin`. Every write goes through the extended
`PATCH /api/locations/[id]` (locked decision 2); **no client-direct Supabase writes.**

Layout: a single scrollable column of tonally-separated sections (No-Line rule — sections
divided by `surface`→`surface-container-low` shifts and generous `space-y`, not
borders), with a sticky header showing name + completeness ring + a single **Save**
control and dirty-state indicator. Newsreader italic for the section headings, Inter
uppercase `tracking-widest` for field labels (as `FieldLabel` in the current dashboard
editor already does — reuse that pattern). "Archival instrument, not SaaS admin"
(locked decision 6): restrained, generous whitespace, umber-tinted depth, no candy.

Save model: PATCH **changed fields only** (locked decision 2). The client diffs current
state against the loaded snapshot and sends only dirty keys — this also keeps the audit
trail (3.9) meaningful (only real changes get logged).

**Form library — argued against, per locked decision 7.** The fiche uses plain
`useState` + a manual dirty-field diff against the loaded snapshot; **no
react-hook-form / Formik / rich-text dep is added.** Three concrete reasons this pays
its way: (1) the field count per section is small and bounded (identity ~3, content 3
textareas, practical ~4 + hours, flags ~5 booleans + 1 number) — well within what
plain controlled inputs handle without register-wiring ceremony; the current dashboard
editor (`pages/dashboard/locations/[id].tsx`) already does exactly this with ~15 fields
and no library. (2) The PATCH-changed-fields-only design **already requires** an explicit
dirty-set (snapshot-vs-current diff), which is the same bookkeeping a form library would
otherwise own — so a form lib duplicates state we must maintain anyway rather than
replacing it, and its headline value (uncontrolled-input perf, `register`, schema
validation) does not pay for itself at this scale. (3) Validation here is thin and
domain-specific (numeric lat/lng, numeric-or-empty `curation_order`, non-empty `name`) —
handled inline, as the existing editor does — not the multi-rule form-validation problem
those libraries exist to solve. Default-to-no-new-deps applies; the argument, not the
assumption, is what clears locked decision 7.

### 3.1 Identity
Fields: `name` (editable), `slug` (**read-only** — hard constraint, no rename without a
migration; render disabled as the dashboard editor does), `category_id` (editable via a
select of `categories`; changing it changes layer colour + completeness requirements),
`town_id` (read-only for now — single-town MVP). Shows `categories.name` + `layer` for
context.

### 3.2 Position — embedded draggable mini-map
A small Mapbox map (reuse the exact `pins.tsx` init: `mapbox://styles/mapbox/standard`,
`DEFAULT_LIGHT_PRESET`, POI/transit labels off) with **one draggable marker** for this
location. Drag → confirm popover showing old/new coords + metres moved (reuse
`haversineMeters`) → PATCH `{ latitude, longitude }`. This inherits the **proximity
guard** for free: the DB trigger raises `PROXIMITY GUARD:` and the API returns 409; the
fiche reuses the pins page's proximity-override flow (flag neighbour, retry with
`allow_proximity_override`). `latitude`/`longitude` are `NOT NULL`, so position always
exists — but a manual numeric lat/lng pair stays available as a fallback (as today) for
precise entry. **Extract the shared map + drag + proximity logic into
`AtlasMapView`/a small hook so both the Atlas map view and the fiche mini-map use one
implementation** — do not fork the imperative Mapbox code.

### 3.3 Content (FR)
`short_description`, `full_description`, `narrative` — three textareas (as the current
dashboard editor). These are the primary editorial fields and the heaviest completeness
inputs. Plain textareas in v3 (no rich-text dep — see 3.10). Character-count hints on
`short_description` (it drives cards).

### 3.4 Practical info + `opening_hours` jsonb editor
Fields: `address`, `phone`, `website`, `booking_url` (booking_url shown **only** for
accommodation categories, per the schema rule — Hotel / Chambre d'hôtes), and the
hours editor.

**`opening_hours` jsonb shape being edited** (verified from code, key convention
to-confirm from live data):

```jsonc
// Flat object: day label → hours string. Keys rendered literally on the public page.
{ "Lundi": "Fermé", "Mardi": "12:00–14:00, 19:00–22:00", "Mercredi": "12:00–14:00" }
```

Editor design (`OpeningHoursEditor.tsx`), **non-destructive**:
- Presents **7 canonical French day rows** (Lundi…Dimanche) as label + free-text hours
  input. Free-text (not a time-picker) because the real data holds strings like
  "Fermé", ranges, and split services — a picker would fight the data.
- **Preserves unknown keys:** if the stored object contains any key outside the 7
  canonical days (e.g. `"Mon–Fri"`, or a lowercase variant), those are shown in a
  clearly-labelled "Autres entrées (existantes)" list, editable but never silently
  dropped. This is the safety valve for the unconfirmed key convention.
- Empty inputs are **omitted** from the written object (matching the public renderer,
  which filters empty values) so we never persist `""` noise.
- Writes the whole `opening_hours` object as one PATCH field (it's a single jsonb column).
  **Requires adding `opening_hours` to `ALLOWED_FIELDS`** (3.9).

Before this ships, confirm the live key convention (Open Question 1) and canonicalise or
consciously keep mixed keys — the editor is built to survive either answer.

### 3.5 Flags / curation
Reuse the current dashboard fieldset, minus publishing (which is promoted to its own
distinct block): `show_in_editorial`, `show_on_map`, `is_featured`, `is_premium`,
`curation_order` (numeric or empty). All boolean toggles + one number field. Note
`show_in_editorial` on `locations` is `NOT NULL` default false.

### 3.6 Publishing — deliberately set apart (locked decision 3)
`is_published` lives in its **own visually distinct block**, not in the flags fieldset
and never in any bulk control. Toggling to publish opens a **confirm summary** listing
what goes live: name, category, whether it will appear on map / in editorial, and — as a
guard — any completeness gaps ("Publier sans photo ni horaires ?"). Luigi clicking
confirm *is* the human gate. Unpublishing is allowed without the summary but is logged.
The persistent live-write banner from `pins.tsx` ("Écriture directe en production")
carries over onto the fiche — this surface writes production with no sandbox.

### 3.7 Media — read-only (locked decision 4)
Renders the `media` rows for this location (url, caption, display_order) as a read-only
ordered strip. **Empty slots shown honestly** — if zero media rows, an explicit
"Aucune image — en attente du sprint photo" panel, not a hidden section. No upload, no
reorder, no delete in v3 (waits for the photo-sprint pipeline). `media` is
location-scoped only (schema-reference note) — no tour/story media here.

### 3.8 Internal notes + "unverified" convention
`internal_notes` (text) — a single private textarea, visually marked as internal
(distinct tonal background, a small "Notes internes — jamais publiées" label). Per the
migration comment and schema rule, this field is **never** exposed in public queries; the
fiche is an admin surface so it may show it, but the API must keep it out of any
public-facing response. **Convention:** unverified claims are prefixed `⚠ non vérifié:`
in the note body (a text convention, not a new column) — matching the existing content
integrity discipline ("No invented architecture / Tier-1 sourcing"). This gives the
operator a lightweight, greppable way to track what still needs a source before it can
move into public description fields.

### 3.9 Audit trail — SHIPS in v3 (locked decision 5)

Generalise the queued `pin_moves` task into a `location_edits` table. Every write
endpoint records to it. **Proposed DDL (proposal — not executed in this planning loop;
run on a dev branch / via the human-gated migration path):**

```sql
-- migrations/create_location_edits.sql  (PROPOSAL — do not auto-execute)
create table if not exists public.location_edits (
  id           uuid primary key default uuid_generate_v4(),
  location_id  uuid not null references public.locations(id) on delete cascade,
  field        text not null,            -- e.g. 'latitude', 'short_description', 'is_published'
  before_value text,                     -- stringified previous value (null-safe)
  after_value  text,                     -- stringified new value
  source_page  text,                     -- e.g. '/command-center/atlas/[id]'
  created_at   timestamptz not null default now()
);

create index if not exists location_edits_location_id_idx
  on public.location_edits (location_id, created_at desc);

comment on table public.location_edits is
  'Append-only audit of admin edits to locations. One row per changed field per write.
   Written by the authed /api/locations write path only. Never publicly exposed.';
```

Design choices, argued:
- **One row per changed field**, not one per request — the PATCH already sends changed
  fields only, so the endpoint iterates the payload keys, reads `before` from the
  existing row (already fetched for the verified-write check), and inserts one edit row
  per key with `after`. Field-granular history is what makes 3.5's "surface edit history
  on the fiche" (Feature 5) cheap.
- **Values stored as text**, null-safe, stringified — a uniform audit shape across
  booleans, numbers, jsonb, and text without a polymorphic column zoo. Coordinates keep
  full precision as their string form.
- **`source_page`** distinguishes a fiche edit from a map-drag edit from a future bulk
  op — the exact provenance the pin-move incident showed we needed.
- **Append-only, cascade-delete with the location.** No RLS exposure; written only by
  the service-role endpoint. Insert failures are logged but **must never fail the
  committed write** (same discipline as the re-select cross-check in the current API):
  the audit is insurance, not a gate.

API change: `pages/api/locations/[id].ts` extends `ALLOWED_FIELDS` to add the fiche's new
writable columns — `opening_hours`, `booking_url`, `internal_notes`, `qr_code_url`,
`category_id` — and, after a successful verified write, inserts `location_edits` rows for
each changed key. (Note: `curation_order` is already handled; `name`, descriptions,
address, website, phone, the flags, and coords are already allowed.)

### 3.10 Linked entities — read-only in v3, argued

Three linked-entity blocks. **Recommendation: all three are read-only in v3**, with
navigation links out. Reasoning: v3's job is to make the ~106 locations *individually
complete and correct*; editing relationships is a different, higher-risk surface, and two
of the three aren't even fully backed by tables yet.

| Block | Real backing | v3 decision |
|---|---|---|
| **`location_functions`** (multi-service venues) | Live table (`location_functions`), has its own `label, description, website, phone, opening_hours, is_primary, category_id`. | **Read-only list** in v3. Show each function's label + category + a "cette fiche a N services". Editing a function means editing a second nested record with its *own* hours jsonb and proximity-irrelevant fields — a real sub-editor. Defer to a v3.1 "function editor" rather than rush it. Do surface it read-only so the operator sees why a venue looks "incomplete" (its content may live on a function). **Completeness must account for this** — see 4.3. |
| **`tour_stops` appearances** | Live table (`tour_stops`: `tour_id, location_id, stop_order, stop_narrative`). | **Read-only list** of "apparaît dans N parcours" with `stop_order` + a link to the tour. Editing tour composition belongs to a future tour editor, not the location fiche. |
| **Story mentions** | **No live table.** `stories` / `story_locations` are *proposed only* (schema-reference Part 2); stories currently live as **static data** in `data/stories.ts`, not the DB. | **Deferred / best-effort read-only.** In v3 either omit, or show a static-derived "mentionné dans" list read from `data/stories.ts` if those entries reference location slugs. Do **not** invent a `story_locations` table for v3. Flag as Open Question 3. |

Editable linked entities are explicitly **out of scope for v3** and called out as the
natural v3.1 follow-on (a `location_functions` sub-editor first, since it's the only one
with a real table and real completeness impact).

---

## 4. Completeness Model

`lib/completeness.ts` — a **pure function** `computeCompleteness(location, ctx)` shared by
the Atlas index (server, for list filters + card badges) and the fiche (client, live as
you type). It turns real gaps into an operational to-do system.

### 4.1 Principle
Score = `100 × Σ(weightᵢ · satisfiedᵢ) / Σ(weightᵢ)` over the **applicable** field set for
that location's category group. Category-aware because a Trail legitimately has no
opening hours and a Parking legitimately has no narrative — a flat checklist would
permanently punish them and make the score useless for triage.

### 4.2 The fields that feed it (all real columns / relations)

| Input | Real source | Satisfied when |
|---|---|---|
| `short_description` | `locations.short_description` | non-empty trimmed |
| body text | `locations.full_description` OR `locations.narrative` | either non-empty |
| `address` | `locations.address` | non-empty trimmed |
| photo | count of `media` rows for the location | ≥ 1 |
| `opening_hours` | `locations.opening_hours` jsonb | ≥ 1 non-empty day value |
| `website` | `locations.website` | non-empty trimmed |
| `phone` | `locations.phone` | non-empty trimmed |
| category assigned | `locations.category_id` | not null |

Deliberately **excluded**: `latitude`/`longitude` (`NOT NULL` — always present, so scoring
them is noise; position *quality* is a separate concern handled by the pin-verification
pass, not this score), `slug`/`name` (`NOT NULL`), and all flags (curation choices, not
completeness).

### 4.3 Weights + applicability by category group (`getCategoryGroup`)

Weights are small integers; only *applicable* rows count in the denominator.

| Field (weight) | Art & History | Eat & Stay | Forest & Nature | Practical |
|---|---|---|---|---|
| short_description (2) | ✓ | ✓ | ✓ | ✓ |
| body text (3) | ✓ | ✓ | ✓ | — |
| photo (3) | ✓ | ✓ | ✓ | — |
| address (2) | ✓ | ✓ | — | ✓ |
| opening_hours (2) | — | ✓ | — | — |
| website (1) | — | ✓ | — | — |
| phone (1) | — | ✓ | — | — |
| category assigned (1) | ✓ | ✓ | ✓ | ✓ |

So an Eat & Stay location is scored out of 15; an Art & History out of 9; a Forest &
Nature out of 9; a Practical out of 5. A Practical pin with a category, a short
description, and an address reads 100% — correctly, because that *is* complete for a
parking.

**`location_functions` caveat (from 3.10):** for a multi-service venue, `website`,
`phone`, and `opening_hours` may live on `location_functions` rows rather than the parent.
The scorer accepts an optional `hasFunctions`/function-aggregate in `ctx` and treats those
three inputs as satisfied-at-parent-level if any function supplies them — otherwise a
correctly-modelled hotel-with-restaurant would show a false gap. Confirm the aggregate is
loaded in the Atlas GSSP.

### 4.4 Surfacing
- **Cards + fiche header:** a ring/bar + `NN%`, banded by colour — using existing
  tokens, not a new palette: `< 40%` umber-tinted "à compléter", `40–79%` neutral
  `on-surface-variant`, `≥ 80%` moss "presque complète", `100%` solid moss "complète".
  No red — this is a to-do meter, not an error state.
- **List filters** (`AtlasListView`): filter by band, plus **missing-field chips**
  ("sans photo", "sans horaires", "sans adresse", "sans description") that filter the list
  to exactly that gap. This is the photo-sprint worklist: pick "sans photo", get the list.
- **Sort** by completeness ascending = "what needs work most" at the top.

### 4.5 One-line formula
`completeness% = round(100 × Σ(weightᵢ · filledᵢ) / Σ(weightᵢ))` over the category
group's applicable field set (photo 3, body 3, short_desc 2, address 2, hours 2,
website 1, phone 1, category 1).

---

## 5. Feature Proposals (ranked by value-to-effort, single-operator)

Excludes anything needing auth roles, multi-user, or media upload (all deferred).
External claims verified where present. Ranked best value/effort first.

**1. Completeness worklist ("À compléter") — S.** A saved view on the Atlas list,
pre-sorted by completeness ascending with the missing-field chips from 4.4 as one-click
filters ("sans photo" → the photo-sprint list). This is the single highest-leverage
feature: it turns the whole atlas into a prioritised to-do queue for exactly the work
Luigi is doing now (photo/hours/address sprint per `brain/current-state.md`). Depends only
on `lib/completeness.ts` (already built for Section 4) — nearly free once the score exists.

**2. Map↔list live linking — S.** Hovering a list row highlights/pulses its pin (reuse
`pulseMarker` from `pins.tsx`); selecting on either side sets `?sel=` and both views
agree. Makes the two views feel like one instrument. Depends on the shared selection state
(already in the IA). Very low effort, high daily value.

**3. Unsaved-changes guard + per-field save state — S.** A dirty-state tracker that (a)
warns on navigating away from a fiche with unsaved edits (`beforeunload` +
`router.beforePopState`), and (b) shows each field's saved/dirty/error state inline. Given
this tool writes production with no sandbox (the persistent banner), losing edits or not
knowing what saved is a real hazard. Depends on the fiche's diff-based save model
(already required by locked decision 2). No new dep.

**4. Field-level edit history on the fiche — M.** A collapsible "Historique" panel per
fiche reading `location_edits` (Section 3.9): who-less but field/before/after/when/source.
Turns the audit table from insurance into a visible safety net and directly answers "did
that save?" — the exact anxiety the silent-pin-move incident created. Depends on the audit
table shipping (Phase 2) and one read endpoint. Medium because it needs a small paginated
read.

**5. Command-palette quick-jump (Cmd-K) — S/M.** Fuzzy jump to any location by name from
anywhere in the Command Center, landing on its fiche. At 106+ locations this beats
scrolling a list. **Build native** (a filtered overlay over the already-loaded name list)
rather than adding the `cmdk` library — `cmdk` is a real, maintained React package and
Pages-Router-compatible, but it's a new dep and the no-new-deps-without-justification rule
applies; a native filter over an in-memory list is enough at this scale. Depends on
nothing beyond the loaded dataset.

**6. Near-duplicate / stray-pin detector — S.** Reuse `haversineMeters` + the stack logic
from `pins.tsx` to flag location pairs < ~15 m apart that are **not** flagged
`allow_proximity_override` — i.e. likely accidental duplicates or an un-acknowledged close
pair. Surfaces as a small "Vérifier la proximité" list. Cheap (the geometry already
exists), and it caught real problems in the manual pin pass (Barjole/Roz, the deleted
rocher-elephant duplicate). Depends on the loaded coords only.

**7. Content-audit export (JSON/CSV) — S.** A "Exporter l'atlas" button producing a flat
snapshot (name, slug, category, layer, completeness, missing-fields, is_published) for
offline review / sharing with Luigi outside the app. Cheap, and a useful paper trail
alongside the audit table. Depends on nothing new. Slightly lower rank because the
in-app worklist (Feature 1) covers most of the same need.

**8. Geocode-assist for the position section — M (with a ToS caveat).** In the fiche
position block, "coller une adresse → proposer des coordonnées" via the **Mapbox
Geocoding API** (the map token is already present). **Verified caveat:** Mapbox's default
geocoding is *temporary* and its terms forbid storing the returned coordinates; storing
them in our DB requires *permanent* geocoding (`permanent=true`), which needs a card on
file / enterprise contract and is internal-use-only. Since the fiche *does* persist coords
to `locations`, a compliant implementation must use permanent geocoding — so this feature
carries a real billing/ToS dependency, not just engineering. Ranked last for that reason;
propose it only as an operator-confirmed *suggestion* whose ToS posture is settled with
Luigi first. Depends on: Mapbox permanent-geocoding entitlement + the proximity guard on
write.

*(Considered and dropped: bulk field editing — collides with locked decision 3's
"never part of a bulk op" and the single-operator care ethic; and any "apply default
hours to all" macro for the same reason.)*

---

## 6. Phasing

Three loops, each independently shippable, each ending at the human gate. Argued cut —
close to the brief's expected shape, with the audit table pulled slightly forward.

### Phase 1 — Atlas index: preview cards + list with completeness filters (read paths)
Ship: `/command-center/atlas` with Map + List views sharing the GSSP dataset and `?sel=`
selection; `LocationPreviewCard`; `lib/completeness.ts`; the list's completeness sort +
missing-field filter chips (Feature 1); map↔list linking (Feature 2). The map view is the
extracted `AtlasMapView` (drag-to-move + proximity guard preserved verbatim — behaviour
parity with today's `pins.tsx`, which stays live and unchanged this phase). **All
read/low-risk, immediately useful for the photo sprint.**
Risks: extracting the 930-line imperative map without regressing drag/stack/proximity —
mitigate by moving it wholesale into `AtlasMapView` with a behaviour-parity checklist
before touching anything; `pins.tsx` remains the untouched fallback until Phase 3.

### Phase 2 — La Fiche: full editor + hours editor + audit trail
Ship: `/command-center/atlas/[id]` full fiche (all sections 3.1–3.8), the
`OpeningHoursEditor`, the extended `PATCH` (`ALLOWED_FIELDS` + audit inserts), the
`location_edits` table (via the human-gated migration path), the distinct publish block
with confirm-summary, the unsaved-changes guard (Feature 3), and edit-history read
(Feature 4). Writes production through the verified-write pattern only.
Risks: (a) **`opening_hours` key convention unconfirmed** — resolve Open Question 1 with a
one-query check *before* building the editor; the non-destructive "Autres entrées" design
is the safety net if the answer is "mixed". (b) publish confirm-summary must be genuinely
un-bypassable and never wired to any list-level control (locked decision 3). (c) audit
insert must never fail a committed write (mirror the re-select discipline).

### Phase 3 — Linked entities (read-only) + absorb-and-delete /dashboard + polish
Ship: read-only `location_functions` / `tour_stops` blocks on the fiche (Section 3.10);
story-mentions per the Open Question 3 resolution; near-duplicate detector (Feature 6),
export (Feature 7), command-palette (Feature 5) as polish; then **redirect + remove**
`/command-center/pins`, `/dashboard/locations`, `/dashboard/locations/[id]`, and sweep the
legacy `/dashboard/places` + `/api/places/[id]` if confirmed dead; swap the sidebar entry
to "Atlas". One admin surface achieved (locked decision 1).
Risks: dangling links to old routes — grep for `/dashboard/locations` and
`/command-center/pins` before deleting; keep redirects (not hard 404s) for any bookmarked
URLs. Confirm `/dashboard/places` really is dead before removal.

*(Geocode-assist, Feature 8, is not scheduled — it's gated on the Mapbox permanent-
geocoding ToS decision and belongs in a later loop if Luigi wants it at all.)*

---

## 7. Open Questions for the human gate

1. **`opening_hours` key convention.** What day-keys does live data actually use —
   canonical French (`"Lundi"`…), lowercase, English, or mixed / free-form ranges like
   `"Mon–Fri"`? One read query settles it
   (`select opening_hours from locations where opening_hours is not null limit 20`).
   Decision needed: canonicalise to 7 French days, or keep whatever exists and only edit
   in place? The editor is built non-destructively either way, but the answer changes
   whether we run a one-time normalisation.
2. **Completeness weights + Practical bar.** Are the Section 4.3 weights and the
   category-group applicability right for how Luigi thinks about "done"? Specifically:
   should Practical locations be scorable at all, or excluded from the worklist? And does
   a multi-service venue's completeness roll up from its `location_functions` (4.3 caveat)
   the way proposed?
3. **Story mentions.** Stories are static (`data/stories.ts`), not a DB table. For v3: (a)
   omit story mentions entirely, (b) show a best-effort read from `data/stories.ts` if it
   references location slugs, or (c) is building `stories` + `story_locations` now in
   scope? (Recommendation: (a) or (b); do not build the tables in v3 — multi-town/editorial
   schema is deferred.)
4. **`location_functions` editing.** Confirmed out of scope for v3 (read-only). Is a
   `location_functions` sub-editor the right first v3.1 follow-on, ahead of tour/story
   editors?
5. **`location_edits` migration path.** The DDL is a proposal. On free-tier Supabase there
   is no dev branch (`brain/current-state.md`) — so this table gets created via the
   human-gated direct-migration path (as the DB-hygiene migration was). Confirm Luigi runs
   it, and confirm append-only + no public exposure is acceptable as specified.
6. **Legacy route sweep.** OK to redirect-then-remove `/dashboard/locations*`,
   `/command-center/pins`, and (if dead) `/dashboard/places` + `/api/places/[id]` in Phase
   3? Any bookmarks or external links to preserve?
7. **Geocode-assist appetite.** Given the Mapbox permanent-geocoding ToS/billing caveat
   (Section 5, Feature 8), is address→coords suggestion wanted at all, or is manual pin
   placement (the current, working model) sufficient?

---

## Compliance restatement (the 7 locked decisions)

1. **One admin surface** — Atlas under `/command-center`; Phase 3 redirects + removes
   `/dashboard` (and legacy `/command-center/pins`). ✓
2. **All writes via authed API, verified-write, changed-fields-only** — every fiche write
   goes through the extended `PATCH /api/locations/[id]`; no client-direct Supabase
   writes; diff-based payloads. ✓
3. **Publishing stays a human act** — `is_published` in its own distinct block, with a
   what-goes-live confirm summary, never in any bulk op; the live-write banner carries
   over. ✓
4. **Media read-only** — read-only strip, empty slots shown honestly. ✓
5. **Audit trail ships** — `location_edits` DDL proposed; every write endpoint records
   one row per changed field with `source_page`; failure never fails the committed write. ✓
6. **Design language** — existing tokens + `docs/design-direction.md`; No-Line rule, umber
   depth, Newsreader/Inter, archival not SaaS. ✓
7. **Stack unchanged** — Pages Router; no new deps: the fiche's no-form-library choice is
   argued in Section 3.0 (bounded field count, the changed-fields diff already owns the
   dirty-set, thin domain-specific validation); the command palette is built native not
   with `cmdk` (argued in Feature 5); no rich-text library (Section 3.3, plain textareas). ✓
