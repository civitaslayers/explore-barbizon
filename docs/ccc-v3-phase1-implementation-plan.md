# CCC v3 "La Fiche" — Phase 1 Scoped Implementation Plan

Status: scoped plan for civitas-implementer. Author: civitas-architect. Date: 2026-07-12.
Design authority: `docs/ccc-v3-fiche-plan.md` (human-gate PASSED 2026-07-12, commit c7953f4),
Section 6 → "Phase 1 — Atlas index". Honors the 7 locked decisions and the IA decision
(sibling routes sharing URL state; `/command-center/atlas?view=map|list&sel=<id>`).

This is a **code/UI-only phase. No SQL, no migration, no DB writes of new shape.** All work
routes to **civitas-implementer**. `pins.tsx`, `pages/dashboard/locations/*`, and
`pages/api/locations/[id].ts` stay **live and UNCHANGED** this phase (pins.tsx is the fallback).

---

## 0. Ground-truth references (read before touching anything)

- Map/marker/drag/proximity source to extract: `pages/command-center/pins.tsx` (930 lines).
- List/table source to absorb: `pages/dashboard/locations/index.tsx`.
- Category grouping + colors: `lib/categoryGroups.ts` — `getCategoryGroup(name, layer)`,
  `GROUP_COLORS`, `GROUP_NAMES`, `GroupName`, `GROUP_DOT_TAILWIND`.
- Admin server client: `lib/supabaseAdmin.ts` (`supabaseAdmin`) — the source pins.tsx GSSP uses.
- Sidebar: `components/CommandCenterLayout.tsx`.
- Write API (DO NOT MODIFY this phase): `pages/api/locations/[id].ts`.
- Authoritative `locations` columns (plan Section 0): `id, town_id, category_id, name, slug,
  short_description, full_description, narrative, latitude, longitude, address, phone, website,
  booking_url, opening_hours (jsonb), is_published, is_premium, is_featured, curation_order,
  qr_code_url, show_on_map, show_in_editorial, route_slug, allow_proximity_override,
  internal_notes, created_at, updated_at`. **`place_id` is legacy — never select or surface it.**
- Embedded joins that work in one nested select (verified against `getLocationFull`,
  `lib/supabase.ts:317`): `categories(name, layer)`, `media(url, display_order)`,
  `location_functions(website, phone, opening_hours)`.

Design tokens to reuse (no new palette, no new deps): `.card`, `.chip`, `.eyebrow`,
`.btn/.btn-primary/.btn-secondary`, `.heading-lg`, `FieldLabel`-style Inter uppercase
`tracking-widest` labels, No-Line rule (tonal `surface`/`surface-container-low` shifts, not 1px
dividers), umber-tinted shadow, `GROUP_COLORS` hexes.

---

## 1. File-by-file work list

### 1.1 `lib/completeness.ts` — NEW (build FIRST)

Pure, dependency-free scoring function shared by GSSP (server) and the list/card (client).
No React, no Supabase import. Imports only the `GroupName` type from `lib/categoryGroups`.

Exports:

```ts
export type MissingField =
  | "photo" | "description" | "body" | "address"
  | "hours" | "website" | "phone" | "category";

export type CompletenessInput = {
  category_id: string | null;
  short_description: string | null;
  full_description: string | null;
  narrative: string | null;
  address: string | null;
  opening_hours: Record<string, string> | null;
  website: string | null;
  phone: string | null;
};

export type CompletenessCtx = {
  group: GroupName;        // resolved by the CALLER via getCategoryGroup(name, layer)
  mediaCount: number;      // number of media rows for this location
  functionWebsite?: boolean; // any location_functions row supplies a website
  functionPhone?: boolean;   // any location_functions row supplies a phone
  functionHours?: boolean;   // any location_functions row supplies opening_hours
};

export type Band = "low" | "mid" | "high" | "complete";

export type CompletenessResult = {
  score: number;            // 0–100 integer
  band: Band;               // < 40 low | 40–79 mid | 80–99 high | 100 complete
  missing: MissingField[];  // applicable-but-unsatisfied fields (drives the chips)
};

export function computeCompleteness(
  input: CompletenessInput,
  ctx: CompletenessCtx
): CompletenessResult;
```

Rules (from plan Section 4.2–4.5, exact):

- Weights: photo 3, body 3, short_description 2, address 2, opening_hours 2, website 1,
  phone 1, category 1.
- Applicability by `ctx.group` — the table in Section 4.3:
  - Art & History: short_description, body, photo, address, category.
  - Eat & Stay: short_description, body, photo, address, opening_hours, website, phone, category.
  - Forest & Nature: short_description, body, photo, category.
  - Practical: short_description, address, category.
- Only applicable fields count in the denominator.
- Satisfied predicates: `short_description`/`address`/`website`/`phone` = non-empty trimmed;
  body = `full_description` OR `narrative` non-empty trimmed; photo = `mediaCount >= 1`;
  opening_hours = at least one non-empty day value in the jsonb; category = `category_id != null`.
- **`location_functions` rollup (Section 4.3 caveat):** website / phone / opening_hours count as
  satisfied if the parent field is set **OR** the matching `ctx.functionWebsite/Phone/Hours` is true.
- `score = round(100 × Σ(weightᵢ·filledᵢ) / Σ(weightᵢ))` over applicable fields.
- `band`: `< 40` → low, `40–79` → mid, `80–99` → high, `100` → complete. No red — to-do meter.
- `missing`: applicable fields that are not satisfied. Note it emits `hours` (not `opening_hours`)
  and `description` (short_description) so the list chips map 1:1 to
  "sans photo / horaires / adresse / description".

Do NOT score `latitude`/`longitude`/`slug`/`name`/flags (Section 4.2 exclusions).

### 1.2 `pages/command-center/atlas/index.tsx` — NEW (build SECOND, with the list)

Atlas index route. `getServerSideProps` via `supabaseAdmin` (same source as pins.tsx). Holds
`view` (`map`|`list`, default `map`) and `sel` (selected location id) read from `router.query`,
shallow-routed.

**GSSP query — one query, no second round-trip:**

```ts
supabaseAdmin
  .from("locations")
  .select(
    "id, name, slug, short_description, address, latitude, longitude, " +
    "is_published, show_on_map, show_in_editorial, is_featured, is_premium, " +
    "category_id, opening_hours, website, phone, allow_proximity_override, updated_at, " +
    "categories(name, layer), " +
    "media(url, display_order), " +
    "location_functions(website, phone, opening_hours)"
  )
  .overrideTypes<AtlasLocationRow[]>();
```

- Media count = `media.length`; first photo = `media` sorted by `display_order` ascending → `[0].url`.
  **A `media(count)` aggregate is NOT needed** — the embedded `media(url, display_order)` array
  gives both the count and the hero url in the same query (verified against
  `getLocationFull`, `lib/supabase.ts:328/341`). One query total.
- For each row, in GSSP: resolve `group = getCategoryGroup(categories?.name ?? "Point of Interest",
  categories?.layer ?? null)` and `color = GROUP_COLORS[group]` (same fallbacks as pins.tsx:94–96).
  Compute `completeness = computeCompleteness(input, { group, mediaCount, functionWebsite,
  functionPhone, functionHours })` where the function* flags are `location_functions.some(fn => …)`.
- Serialize a flat `AtlasLocation[]` prop: `{ id, name, slug, shortDescription, address, latitude,
  longitude, isPublished, showOnMap, showInEditorial, isFeatured, isPremium, categoryName, layer,
  group, color, photoUrl, mediaCount, updatedAt, completeness }`. Include `opening_hours` only if a
  view needs it — the card/list read `completeness.missing`, so raw hours need not ship to the
  client (keep the prop lean). `internal_notes`, `full_description`, `narrative`, `booking_url`,
  `qr_code_url` are NOT loaded here — they belong to the Phase 2 fiche GSSP.

**Page component responsibilities:**
- Read `view`/`sel` from `router.query`; default `view=map`. Toggle map↔list via
  `router.replace({ query: { …query, view } }, undefined, { shallow: true })` so the dataset and
  the map instance are not re-fetched/remounted on toggle.
- Set/clear `sel` the same shallow way from either child view.
- Render the persistent live-write banner (copied verbatim from pins.tsx:724–733) — this surface
  writes production; even though Phase 1 is read-only, the map view still drags-to-move (a write),
  so the banner stays.
- Render a small view switch (Map / Liste) using `.chip`/`.btn` tokens.
- Render `<AtlasMapView>` or `<AtlasListView>` per `view`, passing the shared `locations`,
  `selectedId={sel}`, `onSelect`, and (for map↔list linking) an `onHoverRow`/`hoveredId` bridge.
- Render `<LocationPreviewCard>` when `sel` matches a loaded location (overlaid on either view).
- `getLayout` = `CommandCenterLayout` (same pattern as pins.tsx:925).

### 1.3 `components/command-center/AtlasListView.tsx` — NEW (build SECOND, with the index)

Absorbs `pages/dashboard/locations/index.tsx`'s table, re-parented to the Atlas dataset and
selection. Client component, no data fetching of its own.

Props:
```ts
{
  locations: AtlasLocation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHoverRow?: (id: string | null) => void; // map↔list linking (Feature 2)
}
```

Contents:
- The existing table columns (Name, Category, Layer, Published, Editorial, Featured, Last updated)
  — reuse the `LayerChip` and `formatRelative` logic (copy them in; do not import from the
  dashboard page). Add a **Completeness** column: a small ring/bar + `NN%` tinted by band via the
  shared band→token map (see 1.6). Layer chip stays.
- Row click → `onSelect(row.id)` (opens the preview card via `?sel=`), NOT a link to the old
  dashboard editor. Row hover → `onHoverRow(row.id)` for pin pulse.
- Selected row gets a tonal highlight (`surface-container-low`), agreeing with `selectedId`.
- **Completeness-band filter** (segmented control: Toutes / À compléter <40 / En cours 40–79 /
  Presque ≥80 / Complètes 100) + **missing-field chips** ("sans photo", "sans horaires",
  "sans adresse", "sans description") that filter to rows whose `completeness.missing` includes the
  mapped field (`photo`/`hours`/`address`/`description`). Chips are multi-select AND-narrowing.
- Name search box (reuse the dashboard `useMemo` filter).
- **Sort by completeness ascending by default** (lowest first = "what needs work most" on top);
  allow the operator to keep the existing layer/category sort as a secondary option if cheap,
  else default-ascending-completeness is the required behaviour.
- Design: keep dashboard table styling but this lives under `CommandCenterLayout` (cream/ink), not
  `DashboardLayout` — so use the command-center tonal tokens already in pins.tsx, not the
  dashboard's `outline-variant` borders where they clash with the No-Line direction. Prefer tonal
  row separation over 1px rules.

### 1.4 `components/command-center/AtlasMapView.tsx` — NEW (build LAST — riskiest)

The **wholesale extraction** of pins.tsx's imperative Mapbox code, re-parented to emit `?sel=`
selection instead of its internal `inspectPinId` inspector card. See Section 2 for the extraction
strategy and the parity checklist — this component must be behaviour-identical to today's map.

Props:
```ts
{
  locations: AtlasLocation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hoveredId?: string | null;      // pulse this pin when a list row is hovered (Feature 2)
}
```

What moves in verbatim (from pins.tsx): `haversineMeters`, `STACK_THRESHOLD_M`, `FAN_RADIUS_PX`,
`computeStacks`, `NEIGHBOR_PATTERN`, `parseProximityError`, `patchLocation`, all marker/stack DOM
construction, the map-init effect (Standard style, `DEFAULT_LIGHT_PRESET`, POI/transit off,
`fitBounds`, NavigationControl bottom-right), the search + layer-filter effects, `pulseMarker`,
`dissolveStack`, `snapMarkerBack`, `handleDragEnd`, `handleConfirmDrag`, `handleConfirmOverride`,
`handleRevert`, and the drag/proximity/toast popover JSX.

What CHANGES:
- The internal `AdminPin` shape becomes a narrowed view of `AtlasLocation` (the map only needs
  `id, name, slug, latitude, longitude, address, isPublished, allowOverride, group, color`). Derive
  it from the `locations` prop in a `useMemo`, so the map and list share one server dataset.
- Delete the `inspectPinId` state + the "Pin details" inspector JSX (pins.tsx:260, 716–718,
  764–806, 427–433). Replace the marker `click` handler's `setInspectPinId(pin.id)` with
  `onSelect(pin.id)` — selection now flows up to the URL and the shared `LocationPreviewCard`.
- Add an effect: when `hoveredId` changes, call `pulseMarker(hoveredId)` (map↔list linking).
- Add an effect: when `selectedId` changes from outside (list selection while in map view is not a
  Phase 1 requirement, but keep the map centered/pulsed on the selected pin for coherence) —
  optional flyTo/pulse; keep minimal.
- Keep the persistent banner in the parent (index) OR here — put it in the index (1.2) so it
  shows over both views; remove it from this component to avoid double-render.

Because the drag→PATCH path still calls `/api/locations/[id]` unchanged, **no API change is needed
and drag-to-move keeps working exactly as today.**

### 1.5 `components/command-center/LocationPreviewCard.tsx` — NEW (build THIRD)

Shared read-mostly summary card (plan Section 2). Rendered by the index over either view when
`sel` is set. Uses `.card` (`rounded-card`, `bg-cream/90`, `shadow-ambient`), No-Line rule.

Props:
```ts
{
  location: AtlasLocation;
  onClose: () => void;
  onCenter?: () => void; // map view only — recenter without leaving
}
```

Contents (every element mapped to a real field, per Section 2 table):
- Photo: `location.photoUrl` (first media by `display_order`). If null → tonal
  `surface-container-low` rectangle + "— sans photo —" label (honest gap, locked decision 4).
- Name: `location.name`, Newsreader italic `heading-lg`.
- Category: `location.categoryName` in a `.chip`.
- Layer color: dot / left-edge tint using `location.color` (already `GROUP_COLORS[group]`).
- Address: `location.address` or italic `— sans adresse —`.
- Short description: `location.shortDescription` truncated 2 lines, empty-state line if null.
- Published state: French — `Publié` (`primary-container` solid chip) / `Brouillon`
  (`secondary-container` chip). Read-only (Section 2 standardizes to French).
- `show_on_map` / `show_in_editorial`: two tiny muted markers (read-only triage signal).
- Completeness: ring/bar + `NN%` tinted by band (shared helper, 1.6).
- Coordinates: read-only monospace `lat.toFixed(6), lng.toFixed(6)` (as pins inspector).
- **Primary action "Ouvrir la fiche →":** the fiche route `/command-center/atlas/[id]` does NOT
  exist until Phase 2. **DECISION: render it as a DISABLED/muted affordance** (styled link-like
  button, `aria-disabled`, tooltip/subtext "Fiche — Phase 2") — do NOT point a live `next/link`
  at a route that 404s in production, which would be a real operator trap on a live-write tool.
  Wire the live `next/link href="/command-center/atlas/[id]"` in Phase 2 when the route ships.
- "Centrer" secondary action (map view only) → `onCenter`.

### 1.6 Shared completeness-display helper — small, colocated

A tiny band→token map + a `<CompletenessRing />` (or bar) presentational component, used by both
the list column and the preview card. Put it in `components/command-center/CompletenessBadge.tsx`
(NEW) to avoid duplicating the band-tint logic. Bands → existing tokens (Section 4.4): low →
umber-tinted, mid → `on-surface-variant` neutral, high → moss, complete → solid moss. No new palette.

### 1.7 `components/CommandCenterLayout.tsx` — MODIFY (small)

Add an "Atlas" nav entry. **Do NOT remove "Éditeur de pins"** — that redirect/removal is Phase 3.
Insert into `navItems` (line 5–12), e.g. above the pins entry:
```ts
{ label: "Atlas", href: "/command-center/atlas" },
```
The existing `active` logic (`startsWith(href)`) already highlights `/command-center/atlas/*`.

---

## 2. AtlasMapView extraction strategy (the riskiest item)

**Approach: wholesale move + behaviour-parity checklist, `pins.tsx` untouched as fallback.**
Do not refactor or "improve" the imperative code while moving it — copy it, re-parent selection,
delete the inspector. The 930-line map is imperative Mapbox marker management (manual `Marker`
refs, fan geometry, drag lifecycle, proximity popovers); the only sanctioned behavioural change is
replacing the ad-hoc inspector with `onSelect(id)`.

**Sequence within the map extraction:**
1. Create `AtlasMapView.tsx`, paste pins.tsx's helpers + effects + popover JSX unchanged.
2. Swap the data source from the page's `initialPins` prop to a `useMemo` narrowing of the shared
   `locations` prop into the internal pin shape.
3. Remove `inspectPinId` state + inspector JSX; wire the marker click to `onSelect`.
4. Add the `hoveredId → pulseMarker` effect.
5. Verify against the parity checklist below **before** wiring it into the index route.

**Behaviour-parity checklist (must all pass, matching today's pins.tsx):**
1. **Marker render** — every location renders one marker; correct `GROUP_COLORS` fill; draft pins
   show the dashed `pin-dot--draft` ring + hover "Brouillon" badge; hover tooltip shows name +
   address (or "— sans adresse —").
2. **Stack fan-out** — pins within `STACK_THRESHOLD_M` fan on the `FAN_RADIUS_PX` arc with leader
   line + count badge; real coordinates untouched.
3. **Drag lifecycle** — mousedown/dragstart distinguishes drag from click; dragstart dissolves the
   stack; dragend opens the confirm popover with old/new coords + metres moved (`haversineMeters`).
4. **Confirm popover → PATCH** — Confirm calls `/api/locations/[id]` with `{latitude, longitude}`;
   success updates marker + shows the success toast with Revert; Cancel snaps the marker back.
5. **Proximity 409 handling** — a 409 / `proximity` response opens the proximity popover; override
   flags the neighbour first then retries with `allow_proximity_override`; a second 409 re-opens.
6. **Search** — name search filters marker visibility AND flies-to + pulses the best match (300ms
   debounce).
7. **Filters** — the four `GROUP_NAMES` layer chips toggle marker visibility.
8. **Live-write banner** — the "Écriture directe en production" banner is present (rendered by the
   index, over both views).
9. **Cleanup** — unmount removes all markers + the map (no leak), clears the pulse timeout.
10. **Selection** — a plain click (not a drag) emits `onSelect(id)` → `?sel=` → preview card opens;
    the old inspector card is gone.

`pins.tsx` remains the untouched, working fallback until Phase 3, so any parity regression has a
live reference to diff against.

---

## 3. Ordering of implementation (safest → riskiest)

1. **`lib/completeness.ts`** — pure function, unit-reasoned in isolation, no UI. Zero risk.
2. **`components/command-center/CompletenessBadge.tsx`** — presentational, depends only on the band.
3. **`pages/command-center/atlas/index.tsx` GSSP + `AtlasListView.tsx`** — the read path: one query,
   completeness computed server-side, list with band/missing filters + ascending sort. Immediately
   useful for the photo sprint even before the map is extracted.
4. **`LocationPreviewCard.tsx`** — wire `?sel=` selection from the list first (list rows open the
   card), proving the shared-selection URL model before the map is involved.
5. **`AtlasMapView.tsx`** — LAST. Extract wholesale, run the Section 2 parity checklist, then wire
   into the index. **Behaviour-parity verification happens here, before merge.**
6. **`CommandCenterLayout.tsx`** — add the "Atlas" nav entry (trivial; can be done any time).

Map↔list linking (Feature 2: hover row → pulse pin; selection agrees via `?sel=`) is wired in
step 5 once both views exist, reusing `pulseMarker`.

---

## 4. Risks + mitigations (Phase 1 specific)

- **Regressing drag/stack/proximity in the extraction (highest risk).** Mitigation: wholesale
  copy (no refactor), the 10-point parity checklist in Section 2, and `pins.tsx` kept live and
  unchanged as the diff reference until Phase 3.
- **Selection remount / map flicker on map↔list toggle.** Mitigation: `view`/`sel` are
  shallow-routed (`shallow: true`); the map instance lives in `AtlasMapView` and is created once
  in a mount effect (as pins.tsx does) — toggling `view` must not unmount the map if we can keep it
  mounted-but-hidden; if simpler to conditionally render, accept the one-time re-init but confirm no
  data re-fetch (GSSP runs once per navigation, not per toggle).
- **Completeness rollup false gaps for multi-service venues.** Mitigation: load
  `location_functions(website, phone, opening_hours)` in the GSSP and pass `functionWebsite/Phone/
  Hours` into `ctx` (Section 4.3 caveat) so a hotel-with-restaurant isn't punished.
- **`categories` null / group fallback.** Mitigation: mirror pins.tsx exactly —
  `categories?.name ?? "Point of Interest"`, `categories?.layer ?? null`, `getCategoryGroup(...)`.
- **Fiche link 404.** Mitigation: the "Ouvrir la fiche" action is disabled in Phase 1 (Section
  1.5) — no live link to a non-existent route.
- **Double banner.** Mitigation: banner rendered once by the index, removed from the map component.
- **`overrideTypes` staleness.** `lib/supabase.types.ts` is stale (missing
  `allow_proximity_override`, `booking_url`, `internal_notes`); the Atlas GSSP uses a local
  `AtlasLocationRow` shape + `.overrideTypes<>()` exactly as pins.tsx:89 does — do not rely on
  generated types for those columns.

---

## 5. Explicitly OUT of scope for Phase 1

- No fiche editor, no `pages/command-center/atlas/[id].tsx` (Phase 2).
- No writes of any new field; no change to `pages/api/locations/[id].ts` / `ALLOWED_FIELDS`
  (Phase 2). The only write in Phase 1 is the **existing** coordinate PATCH via the extracted map,
  unchanged.
- No `location_edits` audit table, no `OpeningHoursEditor`, no `opening_hours` normalization
  migration (all Phase 2).
- No SQL, no migration, no DDL — Phase 1 touches the DB read-only through GSSP.
- `pins.tsx`, `pages/dashboard/locations/index.tsx`, `pages/dashboard/locations/[id].tsx`,
  `pages/dashboard/places/*`, `pages/api/places/[id].ts` — all untouched (Phase 3 sweep).
- No route redirects, no nav removal — only the additive "Atlas" nav entry.
- No new dependencies (no form lib, no `cmdk`, no rich-text, no charting lib for the ring — draw
  the ring with an inline SVG or a CSS conic-gradient using existing tokens).

---

## 6. Executor routing

**All Phase 1 work is civitas-implementer (code/UI).** There is **no SQL and no DB write of new
shape** in Phase 1 — the GSSP is a read, and the only mutation is the pre-existing coordinate PATCH
carried over verbatim in the map extraction. No civitas-content-ops involvement this phase.
Ends at the standard human gate (release-checker review → HOLD, no deploy until human approval).
