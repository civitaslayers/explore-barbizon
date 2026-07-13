# CCC v3 "La Fiche" — Phase 2 Scoped Implementation Plan

Status: scoped plan for the executors (civitas-implementer + civitas-content-ops).
Author: civitas-architect. Date: 2026-07-13.
Design authority: `docs/ccc-v3-fiche-plan.md` (human-gate PASSED 2026-07-12; Phase-2 scope
amendment 2026-07-13; tip `b66014c`), Section 6 → "Phase 2", plus §2.1, §3.1–3.9, §1.4.
Builds directly on the shipped Phase 1 (`docs/ccc-v3-phase1-implementation-plan.md`,
deploy READY at `07fe981`). Honors the 7 locked decisions and the sibling-route IA.

This phase **writes production** through the verified-write pattern only. It contains two
**human-gated migrations** (drafted, never executed by an agent) and one **human-gated
publish action**. Everything else is autonomous code that **degrades gracefully if neither
migration has run yet** (argued in §5).

---

## 0. Ground-truth references (read before touching anything)

Verified live against the repo at plan time — real files, real columns only.

- **Write API to extend:** `pages/api/locations/[id].ts` — `ALLOWED_FIELDS` (16 fields today),
  epsilon coord compare (`COORD_EPSILON = 1e-9`), RETURNING-row-is-truth, committed-write-
  never-reported-as-failure, re-select cross-check whose failure does not fail the save.
  The `existing` select today is only `id, latitude, longitude, allow_proximity_override`.
- **Existing field-editor patterns to absorb (not import):** `pages/dashboard/locations/[id].tsx`
  — `FieldLabel` (Inter uppercase `tracking-widest`), controlled `useState` per field, textareas,
  flags `<fieldset>`, numeric `curation_order`, `inputClass` token string. This is the proven
  no-form-library pattern the fiche reuses (locked decision 7).
- **Public renderer target:** `pages/places/[slug].tsx` — `UnifiedPlaceArticle` renders
  `place.functions` via `practicalBlock(fn)` (that is `location_functions.opening_hours`, a
  *different table*). The parent `locations.opening_hours` is **discarded** by `toPlace()` and is
  **absent from `LocationFull`** (`lib/supabase.ts:299–311`, `getLocationFull:317–372`). It has
  **no public renderer today** — confirmed. Phase 2 adds one.
- **Phase 1 shipped, reuse verbatim:** `pages/command-center/atlas/index.tsx` (GSSP shape,
  shallow-routed `view`/`sel`, live-write banner), `components/command-center/{AtlasMapView,
  AtlasListView,LocationPreviewCard,CompletenessBadge}.tsx`, `lib/completeness.ts`
  (`computeCompleteness`, `CompletenessInput`, `CompletenessCtx`, `CompletenessResult` — pure,
  client-usable), `lib/atlasTypes.ts` (`AtlasLocation`), `lib/categoryGroups.ts`
  (`getCategoryGroup`, `GROUP_COLORS`).
- **Map/drag/proximity source:** `components/command-center/AtlasMapView.tsx` already holds the
  extracted imperative helpers (`haversineMeters`, `parseProximityError`, `patchLocation`,
  proximity-409 retry). `pages/command-center/pins.tsx` is the legacy fallback, retired this phase.
- **Sidebar + redirect surface:** `components/CommandCenterLayout.tsx` (nav array, line 12 is the
  "Éditeur de pins" entry), `next.config.mjs` (has `headers()`, **no `redirects()` yet**).
- **Only inbound link to `/command-center/pins`** (verified grep, `.ts/.tsx`): the sidebar entry
  in `CommandCenterLayout.tsx:12`. All other hits are comments (`AtlasMapView.tsx:9`,
  `supabaseAdmin.ts:15`) — no code href.
- **Accommodation categories** (for `booking_url` gating, `lib/categoryGroups.ts`): category
  `name ∈ {"Hotel", "Chambre d'hôtes"}`.

**Authoritative live `locations` columns** (fiche-plan §0): `id, town_id, category_id, name, slug,
short_description, full_description, narrative, latitude, longitude, address, phone, website,
booking_url, opening_hours (jsonb), is_published, is_premium, is_featured, curation_order,
qr_code_url, show_on_map, show_in_editorial, route_slug, allow_proximity_override, internal_notes,
created_at, updated_at`. **`place_id` is legacy — never select or surface it.** `lib/supabase.types.ts`
is stale (missing `allow_proximity_override`, `booking_url`, `internal_notes`) — use local row
shapes + `.overrideTypes<>()` for those, exactly as the API route and Phase 1 GSSP already do.

Design tokens (no new palette, no new deps): `.card`, `.chip`, `.eyebrow`, `.btn/.btn-primary/
.btn-secondary`, `.heading-lg`, `FieldLabel`-style labels, No-Line rule (tonal
`surface`/`surface-container-low` shifts, not 1px rules), umber-tinted shadow, `GROUP_COLORS`.

---

## 1. Ordered work list (filenames + one line)

Safest → riskiest; **pins retirement is last, only after the fiche + card land green.** The two
migration SQL drafts are order-independent (draft-only) and can be produced any time before the gate.

| # | File | Type | Executor | One line |
|---|---|---|---|---|
| 1 | `lib/openingHours.ts` | NEW | implementer | Pure day-key constants, FR labels, load-normalize + split + omit-empty helpers — the single source both editor and public renderer use. |
| 2 | `lib/supabase.ts` | MODIFY | implementer | Add `opening_hours` to `LocationFull` + `getLocationFull` select + mapping (stop discarding the parent field). |
| 3 | `pages/places/[slug].tsx` | MODIFY | implementer | Render parent `locations.opening_hours` in `UnifiedPlaceArticle` via `lib/openingHours` (display-normalized, works pre- or post-migration). |
| 4 | `lib/atlasTypes.ts` | MODIFY | implementer | Add `FicheLocation` (full editable shape + media/functions rollup) and `LocationEditRow` types. |
| 5 | `pages/api/locations/[id].ts` | MODIFY | implementer | Extend `ALLOWED_FIELDS` (+5); fetch before-values; after each verified write insert one `location_edits` row per changed field; accept `source_page`; audit NEVER fails the committed write. |
| 6 | `pages/api/locations/[id]/edits.ts` | NEW | implementer | GET read endpoint for the fiche edit-history panel; returns `[]` gracefully if the table doesn't exist yet. |
| 7 | `components/command-center/OpeningHoursEditor.tsx` | NEW | implementer | 7 FR day rows bound to `mon…sun`, free-text hours, "Autres entrées" for non-day keys, empty-omit-on-write; reused in fiche + card popover. |
| 8 | `lib/atlasMap.ts` | NEW | implementer | Extract the pure map helpers (`haversineMeters`, `parseProximityError`, a `patchLocation` wrapper, init constants) so the fiche mini-map reuses them without forking `AtlasMapView`'s imperative code. |
| 9 | `components/command-center/fiche/FichePositionMap.tsx` | NEW | implementer | Single-draggable-marker Mapbox mini-map with drag→confirm→PATCH→proximity-409-retry (§3.2), using `lib/atlasMap`. |
| 10 | `components/command-center/fiche/*` (section components) | NEW | implementer | Presentational controlled sections (identity, content, practical, flags, publish block, media strip, internal notes, edit-history panel). |
| 11 | `pages/command-center/atlas/[id].tsx` | NEW | implementer | La fiche — GSSP loads full row + categories + media + function-rollup via `supabaseAdmin`; owns all field state + manual dirty-diff + single Save + unsaved guard; composes the sections. |
| 12 | `components/command-center/LocationPreviewCard.tsx` | MODIFY | implementer | Inline quick-edit of `address`/`phone`/`website`/`opening_hours` (same verified changed-fields-only PATCH, `source_page='/command-center/atlas#card'`); "Ouvrir la fiche" → live `next/link`. |
| 13 | `migrations/create_location_edits.sql` | NEW (draft) | **content-ops (draft only)** | Draft the §3.9 DDL to a file for Luigi to run. No execute, no merge, no publish. |
| 14 | `migrations/normalize_opening_hours_keys.sql` | NEW (draft) | **content-ops (draft only)** | Draft the 16-row `monday→mon…` normalization (preserve `check_in`/`check_out`/`default`) with a before/after row dump. No execute. |
| 15 | `next.config.mjs` | MODIFY | implementer | Add `async redirects()` → `/command-center/pins` ⇒ `/command-center/atlas?view=map` (permanent 308). **After the fiche + card land green.** |
| 16 | `components/CommandCenterLayout.tsx` | MODIFY | implementer | Remove the "Éditeur de pins" nav entry (line 12). **After the redirect ships.** |
| 17 | `pages/command-center/pins.tsx` | DELETE | implementer | Remove the retired file. **Last** — only after 15+16 land and the map editor is exercised through the Atlas. |

---

## 2. Executor split (explicit)

- **civitas-implementer (code/UI, autonomous):** items **1–12, 15–17.** All of the fiche, the
  editor, the API extension, the read endpoint, the public renderer, the card quick-edit, and the
  pins retirement. No DB tools; no SQL execution.
- **civitas-content-ops (DRAFT ONLY — no execute, no merge, no publish):** items **13 & 14** — the
  two migration SQL files. On free-tier Supabase there is no dev branch, so content-ops **writes the
  SQL to a file** for a human to run. Content-ops MAY run read-only `SELECT`s to produce the
  before/after row dump for item 14, but MUST NOT `apply_migration`, `merge_branch`, `INSERT`,
  `UPDATE`, `DELETE`, or set `is_published`. The `prod-write-guard.sh` hook + the agent allowlist
  enforce this structurally.
- **civitas-release-checker:** reviews the code (tsc/lint/build + parity), then **HOLD** at the
  human gate. No deploy, no migration run, no publish.

---

## 3. File-by-file specification

### 3.1 `lib/openingHours.ts` — NEW (build FIRST, zero risk)

Pure module, no React, no Supabase. The **single source of truth** for the day-key convention,
imported by the editor (7), the fiche practical section (10), the card popover (12), and the public
renderer (3). Makes the code correct **before or after** the normalization migration.

Exports:
```ts
export const DAY_KEYS = ["mon","tue","wed","thu","fri","sat","sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export const DAY_LABELS_FR: Record<DayKey, string>;
// mon→"Lundi", tue→"Mardi", wed→"Mercredi", thu→"Jeudi",
// fri→"Vendredi", sat→"Samedi", sun→"Dimanche"

// Legacy full-English → canonical 3-letter. 3-letter keys pass through.
export function normalizeDayKey(key: string): string; // "monday"→"mon", "mon"→"mon", "check_in"→"check_in"

// Optional FR labels for the known non-day keys (display only).
export const NON_DAY_LABELS_FR: Record<string, string>;
// check_in→"Arrivée", check_out→"Départ", default→"Par défaut"

// Split an opening_hours object into ordered day rows + preserved "other" entries,
// applying normalizeDayKey so legacy keys land in the right row (display-normalization).
export function splitOpeningHours(
  value: Record<string, string> | null
): { days: Record<DayKey, string>; others: { key: string; value: string }[] };

// Rebuild the stored object from editor state, omitting empty values entirely.
export function buildOpeningHours(
  days: Record<DayKey, string>,
  others: { key: string; value: string }[]
): Record<string, string>;
```

Rules:
- `splitOpeningHours` iterates the input; for each key, `normalizeDayKey`; if the result ∈ `DAY_KEYS`
  it fills that day row (last non-empty wins if both `mon` and `monday` somehow coexist); otherwise
  it goes to `others` **unchanged** (safety valve — never dropped). This is why a pre-migration
  `"monday"` value displays under Lundi, not as a stray "Autres entrées" — **no duplicate rows.**
- `buildOpeningHours` writes canonical `mon…sun` keys for non-empty day rows and preserves `others`;
  empty strings are omitted so we never persist `""` noise. (Editing a legacy-key row and saving thus
  normalizes that one row on write — desirable, non-destructive to unknown keys.)

### 3.2 `lib/supabase.ts` — MODIFY (public read path; verify first)

Verified current behaviour: `LocationFull` has no `opening_hours`; `getLocationFull`'s select omits it.
- Add `opening_hours: Record<string, string> | null` to the `LocationFull` type.
- Add `opening_hours` to the `getLocationFull` select string (parent-level, alongside `address`).
- Map it in the returned object (`opening_hours: row.opening_hours ?? null`).
- **Do NOT** add `internal_notes` or any admin-only field to any public shape (`LocationFull`,
  `toPlace`, `PublishedLocationRow`). `internal_notes` must never enter a public response (§3.8).

### 3.3 `pages/places/[slug].tsx` — MODIFY (parent-field public renderer, §3.4)

In `UnifiedPlaceArticle`, after the function sections (or in the hero-adjacent practical area), render
the parent `place.opening_hours` **only when it has ≥1 non-empty value**, using
`splitOpeningHours` from `lib/openingHours`:
- Render the 7 ordered day rows with `DAY_LABELS_FR` labels + the hours string; render `others` with
  `NON_DAY_LABELS_FR` (fallback to the raw key). Reuse the existing hours-block markup idiom from
  `practicalBlock` (a `<dl>`), but keep it distinct from function hours (this is venue-level hours).
- Because `splitOpeningHours` display-normalizes, this renders correctly **whether or not** the
  16-row migration has run. Without this renderer, hours edited in the fiche would save into a field
  that never appears publicly — this closes that gap.

### 3.4 `lib/atlasTypes.ts` — MODIFY (fiche + history shapes)

Add (colocated with `AtlasLocation`):
```ts
export type FicheLocation = {
  id: string; slug: string; name: string; townId: string | null;
  categoryId: string | null; categoryName: string; layer: string; group: GroupName;
  shortDescription: string | null; fullDescription: string | null; narrative: string | null;
  address: string | null; phone: string | null; website: string | null; bookingUrl: string | null;
  openingHours: Record<string, string> | null;
  latitude: number; longitude: number; allowProximityOverride: boolean;
  isPublished: boolean; showOnMap: boolean; showInEditorial: boolean;
  isFeatured: boolean; isPremium: boolean; curationOrder: number | null;
  qrCodeUrl: string | null; internalNotes: string | null;
  media: { url: string; caption: string | null; displayOrder: number | null }[];
  // rollup inputs for live completeness (NOT an editable entity block in Phase 2)
  functionWebsite: boolean; functionPhone: boolean; functionHours: boolean;
};

export type FicheCategoryOption = { id: string; name: string; layer: string };

export type LocationEditRow = {
  id: string; field: string; before_value: string | null; after_value: string | null;
  source_page: string | null; created_at: string;
};
```

### 3.5 `pages/api/locations/[id].ts` — MODIFY (the extended verified write + audit — RISKIEST)

Preserve the existing verified-write discipline **exactly**; extend it. Three changes:

1. **Extend `ALLOWED_FIELDS`** — add `opening_hours`, `booking_url`, `internal_notes`, `qr_code_url`,
   `category_id`. (`curation_order`, `name`, descriptions, `address`, `website`, `phone`, coords,
   flags already present. The `curation_order` coercion block stays.)
2. **Fetch before-values for the audit.** Widen the `existing` select from
   `id, latitude, longitude, allow_proximity_override` to include **every `ALLOWED_FIELDS` column**
   (plus the coord columns it already needs). Keep it typed via a local row shape + `.overrideTypes<>()`
   (generated types are stale). The coord epsilon-compare path is **unchanged** — it still uses
   `payload.latitude/longitude` vs the RETURNING `persisted` row.
3. **Accept `source_page`** — read `body.source_page` (a string, optional). It is **not** an
   `ALLOWED_FIELDS` column and is never written to `locations`; it is used only to tag audit rows.
   Default to `null` when absent.

**Audit insert — after the committed write, before returning 200:**
- Build one `location_edits` row per key in `payload`: `{ location_id: id, field: key,
  before_value: stringify(existing[key]), after_value: stringify(payload[key]),
  source_page }`. `stringify`: `null`→`null`; objects (e.g. `opening_hours`)→`JSON.stringify`;
  scalars→`String()`.
- Insert via `supabaseAdmin.from("location_edits").insert(rows)` inside a `try/catch`.
- **This insert MUST NEVER fail the committed write.** On any error (including "relation
  `location_edits` does not exist" before the migration runs): `console.error(...)` and continue.
  The response is decided **only** by the coord verification, identical to today. Mirror the exact
  re-select discipline already in the file ("its failure must not be reported as a failed save").
- Do not change the `409 PROXIMITY GUARD` path, the `committed: true` divergence path, or the 200
  shape (the drag flow in `AtlasMapView` depends on `before`/`after`).

Risk + mitigation: this is on the critical write path for **every** Phase 2 write (fiche + card), so a
regression re-introduces the exact silent-write / false-failure class the verified-write decision
exists to prevent. Mitigation: change only the three points above; leave the coord path byte-for-byte;
wrap audit in try/catch; test the graceful path **with the table absent** (item 5 must be green before
migration 1 runs).

### 3.6 `pages/api/locations/[id]/edits.ts` — NEW (Feature 4 read endpoint)

`GET` only. `supabaseAdmin.from("location_edits").select("id, field, before_value, after_value,
source_page, created_at").eq("location_id", id).order("created_at", { ascending: false }).limit(N)`
(N ~50, optional `?before=` cursor for pagination). **Graceful degradation:** if the query errors
(table absent pre-migration), return `200 { edits: [] }`, not a 500 — the panel then shows "aucun
historique" and the fiche stays fully usable before the migration. Never expose to unauthenticated
callers (same auth posture as the write route).

### 3.7 `components/command-center/OpeningHoursEditor.tsx` — NEW

Controlled component; **non-destructive**; reused by the fiche practical section and the card popover.
```ts
{
  value: Record<string, string> | null;
  onChange: (next: Record<string, string>) => void;
  compact?: boolean; // card popover variant
}
```
- On mount/`value` change: `splitOpeningHours(value)` → 7 day rows (FR labels via `DAY_LABELS_FR`,
  bound to `mon…sun`) + an "Autres entrées (existantes)" list of `others` (editable key+value; e.g.
  `check_in`, `check_out`, `default`, or any escaped key).
- Free-text hours inputs (not a time-picker — real data holds "Fermé", ranges, split services).
- On any edit, recompute via `buildOpeningHours(days, others)` (empty-omit) and call `onChange` with
  the whole object. The **parent** owns dirty-tracking and the PATCH (single jsonb field
  `opening_hours`) — the editor never calls the API itself.
- Works **before or after** the normalization migration (split display-normalizes; write emits
  canonical keys).

### 3.8 `lib/atlasMap.ts` — NEW (shared pure helpers, do NOT fork imperative code)

To satisfy §3.2's "extract the shared map + drag + proximity logic … do not fork," extract only the
**pure, behaviour-free** helpers so the fiche mini-map reuses one implementation:
- `haversineMeters(a, b)`, `parseProximityError(message)`, a thin `patchLocation(id, body)` fetch
  wrapper (POSTs the changed coord fields; returns the `{before, after}` / `409 proximity` /
  `committed` union), and the map-init constants (`mapbox://styles/mapbox/standard`,
  `DEFAULT_LIGHT_PRESET`, POI/transit-off config).
- **Do NOT edit `AtlasMapView.tsx` in Phase 2.** It shipped with 10/10 verified parity; touching it
  risks regressing the map editor right as `pins.tsx` (its diff reference) is being deleted. Either
  (a) leave `AtlasMapView`'s own copies of these helpers in place and let `lib/atlasMap.ts` carry an
  identical pure copy for the mini-map, or (b) defer any de-dup of `AtlasMapView` to Phase 3. The hard
  rule is: **do not fork the imperative single-marker vs multi-marker drag lifecycle across two files
  by copy-paste** — share the pure helpers via `lib/atlasMap.ts`; the imperative marker code is
  necessarily different (one marker, no stacks/fan) and lives only in `FichePositionMap`.

### 3.9 `components/command-center/fiche/FichePositionMap.tsx` — NEW (§3.2, second-riskiest)

Single-draggable-marker Mapbox mini-map for one location.
```ts
{
  latitude: number; longitude: number; allowProximityOverride: boolean;
  locationId: string; name: string;
  onCommitted: (lat: number, lng: number) => void; // update fiche state after a verified PATCH
}
```
- Init one map (Standard style, `DEFAULT_LIGHT_PRESET`, POI/transit off) with one draggable marker.
- Drag → confirm popover (old/new coords + metres via `haversineMeters`) → `patchLocation` with
  `{latitude, longitude}`. On 200, `onCommitted(...)` + success toast + Revert; on `409 proximity`,
  the override flow (flag neighbour, retry with `allow_proximity_override`); on `committed: true`
  divergence, surface the distinct "write committed — values differ" signal. Cancel snaps back.
- A manual numeric lat/lng fallback pair stays available (as the dashboard editor has) for precise
  entry; those also PATCH via the same path.
- Cleanup on unmount (remove marker + map, clear timeouts) — no leak.

### 3.10 `components/command-center/fiche/*` section components — NEW

**State ownership rule:** the **fiche page (3.11) owns all field state + the dirty-diff + Save.**
These are **presentational controlled** components (receive `value`s + `onChange`s + `dirty` flags),
so there is a **single source of dirty truth** — required for changed-fields-only PATCH (locked
decision 2), the unsaved-changes guard (Feature 3), and meaningful audit rows (only real changes log).

- `fiche/IdentitySection.tsx` (§3.1) — `name` (editable), `slug` (read-only disabled), `category_id`
  (`<select>` of `FicheCategoryOption[]`; changing it re-tints layer + shifts completeness/booking_url
  applicability), `town_id` (read-only), shows `categoryName · layer`.
- `fiche/ContentSection.tsx` (§3.3) — three textareas: `short_description` (with char-count hint —
  it drives cards), `full_description`, `narrative`. Plain textareas (no rich-text dep).
- `fiche/PracticalSection.tsx` (§3.4) — `address`, `phone`, `website`; `booking_url` rendered **only**
  when the currently-selected category `name ∈ {"Hotel","Chambre d'hôtes"}`; and `<OpeningHoursEditor>`
  bound to `opening_hours`.
- `fiche/FlagsSection.tsx` (§3.5) — `show_in_editorial`, `show_on_map`, `is_featured`, `is_premium`
  toggles + `curation_order` (numeric-or-empty) + `qr_code_url` (single optional text input).
  **Excludes `is_published`** (promoted to its own block). Reuse the dashboard `<fieldset>` idiom.
- `fiche/PublishBlock.tsx` (§3.6, locked decision 3) — `is_published` in its **own visually distinct
  block**, never in the flags fieldset, never a bulk control. Toggling to publish opens a
  **confirm summary** listing what goes live: name, category, on-map / in-editorial, and any
  completeness gaps ("Publier sans photo ni horaires ?"). Building the UI is in scope; **the confirm
  click that actually sets `is_published=true` is Luigi's human act** (human gate). Unpublish allowed
  without the summary but logged. The persistent live-write banner carries over.
- `fiche/MediaStrip.tsx` (§3.7, read-only) — ordered `media` strip (url, caption, display_order). Zero
  rows → explicit "Aucune image — en attente du sprint photo" panel (honest empty slot, locked
  decision 4). No upload / reorder / delete.
- `fiche/InternalNotesSection.tsx` (§3.8) — `internal_notes` textarea, distinct tonal background,
  "Notes internes — jamais publiées" label. Convention: unverified claims prefixed `⚠ non vérifié:`
  (text convention, not a column). Editable here (admin surface); never in any public response.
- `fiche/EditHistoryPanel.tsx` (Feature 4) — collapsible "Historique"; on open, `fetch`
  `/api/locations/[id]/edits`; render field / before / after / when / source. Empty (or table-absent)
  → "aucun historique". Re-fetch after a successful Save so new edits appear.

### 3.11 `pages/command-center/atlas/[id].tsx` — NEW (la fiche)

- **GSSP via `supabaseAdmin`** (admin surface): (a) the full location row (all authoritative columns
  incl. `internal_notes`, `booking_url`, `qr_code_url`, `town_id`), `categories(name, layer)`,
  `media(url, caption, display_order)`, and `location_functions(website, phone, opening_hours)` for
  the completeness rollup; (b) a `categories` list (`id, name, layer`, ordered) for the identity
  select. Serialize to `FicheLocation` + `FicheCategoryOption[]`. `notFound: true` on missing id.
  **`location_functions` is loaded for the rollup only — it is NOT rendered as an editable or
  read-only entity block in Phase 2 (that is Phase 3, §3.10).**
- **State + dirty-diff (no form lib, locked decision 7):** one `useState` per field seeded from the
  loaded `FicheLocation` snapshot; a `dirtyKeys` computed by diffing current vs snapshot (mirrors the
  changed-fields-only PATCH). Single **Save** in the sticky header PATCHes **only** `dirtyKeys`
  (mapped to snake_case columns) with `source_page: "/command-center/atlas/[id]"`. On 200, reset the
  snapshot to the returned/committed values and re-fetch edit history.
- **Live completeness:** compute `computeCompleteness(input, ctx)` client-side from current state +
  loaded `mediaCount`/`functionWebsite/Phone/Hours`, rendered as the sticky-header ring
  (`CompletenessBadge`) — updates as you type.
- **Sticky header:** name + completeness ring + single Save + dirty indicator + "← Atlas" back link
  that preserves the origin `view` (read from query/referrer; default `?view=map`). Live-write banner
  carries over (verbatim from the index).
- **Unsaved-changes guard (Feature 3):** `beforeunload` + `router.beforePopState` block navigation
  when `dirtyKeys.length > 0`; per-field saved/dirty/error inline state (production writes, no sandbox).
- **Validation (inline, thin):** non-empty `name`; numeric lat/lng; numeric-or-empty `curation_order`
  — exactly as the dashboard editor, no validation library.
- `getLayout = CommandCenterLayout`.

### 3.12 `components/command-center/LocationPreviewCard.tsx` — MODIFY (§2.1 card quick-edit)

- **Make `address`/`phone`/`website` inline click-to-edit inputs** and `opening_hours` an
  `<OpeningHoursEditor compact>` in a small popover over the card. Each field: per-field
  saved/dirty/error inline state; on commit, PATCH **only that field** (changed-fields-only) via
  `/api/locations/[id]` with `source_page: "/command-center/atlas#card"`. No client-direct Supabase.
- **NOT on the card:** `short_description`/`full_description`/`narrative`, all flags, `category_id`,
  position, and **`is_published`** (publishing is a fiche-only human act — the card never publishes,
  never part of a bulk control).
- **"Ouvrir la fiche →" goes live:** replace the disabled affordance with a real
  `next/link href="/command-center/atlas/[id]"`. (The card currently has `AtlasLocation`, which lacks
  the four editable values as live-editable — it already carries `address`; ensure the card reads the
  current `address`/`phone`/`website`/`openingHours` it needs. `AtlasLocation` today carries `address`
  but not `phone`/`website`/`opening_hours` — **add `phone`, `website`, `openingHours` to
  `AtlasLocation` and the index GSSP serialization** (the row already selects `website, phone,
  opening_hours`; they are just not serialized to the prop). After a successful card PATCH, optimistically
  update the card's local copy so the edit is visible without a full reload.)

### 3.13 Pins retirement — items 15–17 (LAST, after fiche + card are green)

- `next.config.mjs`: add `async redirects()` returning
  `[{ source: "/command-center/pins", destination: "/command-center/atlas?view=map", permanent: true }]`
  (a real 308, not a hard 404 — bookmarks survive).
- `components/CommandCenterLayout.tsx`: remove the `{ label: "Éditeur de pins", href:
  "/command-center/pins" }` entry (line 12). The "Atlas" entry stays.
- Delete `pages/command-center/pins.tsx`. Grep confirmed the sidebar entry is the only code inbound
  link; the redirect covers any external bookmark. Do this only after items 1–12 land and the map
  editor has been exercised through `/command-center/atlas` — never a window without an interactive
  map editor.

### 3.14 `migrations/create_location_edits.sql` — item 13 (content-ops, DRAFT ONLY)

Draft the §3.9 DDL verbatim to the file (append-only, cascade-delete, index on
`(location_id, created_at desc)`, table comment). Header comment: "PROPOSAL — do not auto-execute;
run via the human-gated direct-migration path (no dev branch on free tier)." Content-ops does **not**
execute, merge, or publish.

### 3.15 `migrations/normalize_opening_hours_keys.sql` — item 14 (content-ops, DRAFT ONLY)

Draft the one-time 16-row normalization: `monday→mon … sunday→sun`; 3-letter keys pass through;
**preserve `check_in` / `check_out` / `default`** (and any other non-day key). Include a **before/after
row dump** (content-ops may run read-only `SELECT`s to capture the 16 affected `id, slug, opening_hours`
rows and show the intended post-shape as a comment). Header comment: "PROPOSAL — touches 16 live rows;
run via the human-gated path; the `OpeningHoursEditor` is non-destructive and display-normalizes, so
this is recommended-before-use but not required for correctness (§5)." No execute.

---

## 4. Implementation ordering (safest → riskiest)

1. `lib/openingHours.ts` — pure, unit-reasoned, zero risk.
2. `lib/supabase.ts` + `pages/places/[slug].tsx` — additive public renderer; verify the discard
   behaviour first, then render. Low risk, immediately visible.
3. `lib/atlasTypes.ts` — type additions only.
4. `pages/api/locations/[id].ts` — the extended write + audit; **build and verify with the table
   absent** (graceful path) before any migration runs.
5. `pages/api/locations/[id]/edits.ts` — read endpoint, graceful-empty.
6. `OpeningHoursEditor.tsx` — reused by both fiche and card; build once.
7. `lib/atlasMap.ts` + `FichePositionMap.tsx` — the mini-map (second-riskiest imperative code).
8. `fiche/*` sections + `pages/command-center/atlas/[id].tsx` — compose; state/dirty/save; publish
   block; unsaved guard; edit-history panel.
9. `LocationPreviewCard.tsx` quick-edit + live fiche link (+ `AtlasLocation`/index-GSSP field adds).
10. **Verify fiche + card land green** (tsc/lint/build + manual smoke of a real save through the
    verified-write path, audit degrading gracefully).
11. **Pins retirement** (15→16→17): redirect, then nav removal, then delete `pins.tsx`.

Migration drafts (13, 14) are produced by content-ops any time before the gate; they gate nothing in
the code path.

---

## 5. Migration-vs-code sequencing (the safe order, argued)

**Order: build all code → commit → release-checker HOLD → human runs both migrations → human deploys.**
The code is designed to make this order safe because **nothing hard-depends on a migration having run:**

- **`location_edits` absent (migration 1 not run):** the API's audit insert is wrapped in `try/catch`;
  a missing-relation error is logged and the committed write still returns 200 (§3.5). The
  `/edits` endpoint returns `{ edits: [] }` on error, so the history panel shows "aucun historique"
  (§3.6). The fiche and card are **fully functional** with no audit table. When Luigi later runs
  migration 1, auditing simply begins recording — no code change, no redeploy required.
- **`opening_hours` not normalized (migration 2 not run):** the `OpeningHoursEditor` and the public
  renderer both go through `splitOpeningHours`, which **display-normalizes** legacy keys (`monday→mon`)
  so a pre-migration row renders and edits correctly, with no duplicate rows and no dropped non-day
  keys (§3.1/3.7). Saving a row emits canonical keys (per-row normalize-on-write). So the normalization
  migration is **recommended before heavy editing** (it makes stored data uniform for any *other*
  reader and tidies the 16 rows in bulk) but is **not required for correctness** — the editor is
  non-destructive and the renderer is display-normalized.

Therefore the executors build and commit the full Phase 2 code first; the code ships and runs green
whether or not either migration has been applied. The human then runs the two SQL drafts (order between
them does not matter) and deploys. **Confirmed: no code path throws, 500s, or corrupts if neither
migration has run.**

---

## 6. Human gates (stop here — nothing else crosses autonomously)

1. **Migration 1** — Luigi runs `migrations/create_location_edits.sql` (content-ops drafted it).
2. **Migration 2** — Luigi runs `migrations/normalize_opening_hours_keys.sql` (drafted with a
   before/after dump).
3. **Publish action** — Luigi clicks the `PublishBlock` confirm that sets `is_published = true`.
   Building the UI is autonomous; the click is the human act (locked decision 3).
4. **Production deploy** — human, after release-checker HOLD.

The `prod-write-guard.sh` hook + agent allowlists enforce that content-ops cannot execute SQL, merge a
branch, or publish, and that the loop stops at release-checker HOLD.

---

## 7. Risks + mitigations (per item)

- **Extended PATCH audit path (riskiest).** On the critical write path for every Phase 2 write; a
  regression re-introduces the silent-write / false-failure class. Mitigation: change only ALLOWED_FIELDS,
  the widened before-select, and the post-commit audit insert; leave the coord epsilon path
  byte-for-byte; audit in try/catch that never touches the response; verify green with the table absent.
- **FichePositionMap imperative Mapbox (second-riskiest).** New single-marker drag + proximity-409
  code. Mitigation: reuse the pure helpers via `lib/atlasMap.ts` (do not fork the marker lifecycle);
  do not edit the verified `AtlasMapView`; cleanup on unmount; reuse the exact proximity/override flow
  semantics the API already returns.
- **Publish confirm bypass.** Mitigation: `is_published` lives only in `PublishBlock`, never in the
  flags fieldset or any list-level control; the confirm summary is un-bypassable; the toggle-to-true
  is the human gate.
- **Card quick-edit writing production with no sandbox.** Mitigation: same verified changed-fields-only
  PATCH, per-field saved/dirty/error state, `source_page='/command-center/atlas#card'` provenance,
  optimistic local update only after a 200.
- **`AtlasLocation` prop gaps for the card.** The index row already selects `website, phone,
  opening_hours` but does not serialize them; add `phone`, `website`, `openingHours` to `AtlasLocation`
  + the index GSSP mapping so the card can edit them. Low risk (additive serialization).
- **Public renderer double-counting hours.** The parent renderer (§3.3) is venue-level
  `locations.opening_hours`; `practicalBlock` is `location_functions.opening_hours`. Keep them visually
  distinct so a multi-service venue does not look duplicated.
- **Pins retirement dangling links.** Grep confirmed the sidebar is the only code inbound; ship the
  308 redirect before deleting; retire only after the fiche + card are green.
- **Stale generated types.** Use local row shapes + `.overrideTypes<>()` for `booking_url`,
  `internal_notes`, `allow_proximity_override`, `qr_code_url` — do not trust `lib/supabase.types.ts`.

---

## 8. Explicitly OUT of scope for Phase 2 (Phase 3+)

- **Linked-entity editing** — no `location_functions` sub-editor, no `tour_stops` editing (Phase 3.1+).
- **Read-only linked-entity blocks (§3.10)** — the `location_functions` / `tour_stops` display blocks
  and story-mentions are **Phase 3**. Phase 2 loads `location_functions` **only** for the completeness
  rollup, and does not render it as an entity block.
- **Media upload / reorder / delete** — Phase 2 shows media **read-only** (§3.7); the pipeline is later.
- **`/dashboard` removal** — `pages/dashboard/locations/*`, `pages/dashboard/places/*`,
  `pages/api/places/[id].ts` all stay live and untouched (Phase 3 sweep). Only `/command-center/pins`
  retires this phase.
- **Command palette (Feature 5), near-duplicate detector (Feature 6), export (Feature 7)** — Phase 3.
- **No new dependencies** — plain `useState` + manual dirty-diff (no form lib, argued §3.0); native
  inputs; CSS/SVG completeness ring (already shipped); no rich-text; no `cmdk`.
- **No `story_locations` join / schema change** — editorial-link schema deferred with multi-town.
