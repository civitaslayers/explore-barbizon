# i18n + SEO Foundation — Implementation Plan (Tasks 2–5)

Owner: civitas-architect (plan) → civitas-implementer (execute)
Branch: `feat/i18n-seo-foundation` — nothing merges to `main` this run.
Governing decisions: `brain/decisions.md` (2026-07-13 — French canonical Option B,
locale-identical slugs, Cursor retired). Schema contract:
`docs/schema-reference.md` → "Internationalization — `translations` JSONB" and
"View — `v_translation_health`".

## Hard invariants for this run

- **No base content columns are written.** French base columns stay untouched.
  The French content migration (draft → review → promote) is a separate, later,
  human-gated content pass. This run is routing + read-path + SEO only.
- **No slug is renamed or translated.** Slugs are locale-identical
  (`/en/lieux/…` uses the same slug as `/lieux/…`).
- Pages Router only. No App Router. **No middleware locale detection.**
- Additive dependencies only (justified below). No stack change.

---

## New dependencies (exact list + justification)

Runtime (add to `dependencies`):

| Package | Range | Why |
|---|---|---|
| `next-i18next` | `^16` | Required by Task 2. Provides Pages-Router `appWithTranslation` + `serverSideTranslations`, which is the standard, lowest-friction way to load per-locale namespaces into `getStaticProps`/`getServerSideProps` under the built-in Pages-Router `i18n` routing we already get for free. Building this by hand (custom context + per-page loaders) would be more code and more risk than the dep it replaces. **v16 verified to support Next 16 Pages Router + React 19** (peer deps: `next >= 12`, `react >= 17.0.2`). |
| `i18next` | `^25` | Peer of next-i18next (`>= 23.7.13`). Core translation engine. |
| `react-i18next` | `^16` | Peer of next-i18next (`>= 13.5.0`). React bindings + `useTranslation`. |

Install: `npm install next-i18next i18next react-i18next`, let npm resolve the
peer set, then **commit `package-lock.json`** so the resolved versions are pinned.

> **next-i18next v16 import-path change (verified):** in v16 the Pages-Router
> entry points moved. Import `appWithTranslation` / `useTranslation` from
> `next-i18next/pages`, and `serverSideTranslations` from
> `next-i18next/pages/serverSideTranslations`. Do **not** import from the bare
> `next-i18next` root for Pages Router in v16.

### Test runner — decision: zero new deps (Node built-in `node:test`)

Task 3 asks for a unit-tested fallback matrix, but there is no test runner and
"no new deps without justification" applies. **Decision: do NOT add vitest/jest.**
Use Node's built-in `node:test` + `node:assert`. `getLocalized` is a pure
function; the whole matrix is ~10 assertions — a full test framework (vitest pulls
a large transitive tree + a config file) is unjustified for that.

- Test file: `lib/getLocalized.test.ts`, run with `node --test`.
- Add script: `"test": "node --test lib/getLocalized.test.ts"`.
- Native TS: `@types/node ^25` implies a Node 25 runtime, which strips TS types
  natively. In the test file import with an explicit extension:
  `import { getLocalized } from "./getLocalized.ts";`.
- **Risk / confirm:** requires Node ≥ 23 for default type-stripping. Implementer
  confirms `node --version` locally/CI. If the runtime is < 23, run
  `node --test --experimental-strip-types lib/getLocalized.test.ts` (Node ≥ 22.6),
  or, as a last resort, author the test as `.mjs` against a `.mjs` twin. This test
  is **not** part of the Next build, so it never touches production bundling.

---

## Task 2 — locale routing wiring (next-i18next + `next.config.mjs`)

### 2a. Config file — `next-i18next.config.js` (CJS, project root)

next-i18next reads a CJS config. Create `next-i18next.config.js`:

```js
/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    localeDetection: false, // critical — see CCC exclusion below
  },
  fallbackLng: "fr",
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
```

### 2b. Wire the `i18n` block into the ESM `next.config.mjs`

`next.config.mjs` is ESM; the config file is CJS. Import it with a
`createRequire` shim (cleanest ESM→CJS interop), then spread its `i18n` block.
**Preserve the existing `/command-center/pins` redirect and the headers/images
blocks unchanged.**

```js
// next.config.mjs (top of file)
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { i18n } = require("./next-i18next.config.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n, // { locales: ['fr','en'], defaultLocale: 'fr', localeDetection: false }
  images: { /* unchanged */ },
  async headers() { /* unchanged */ },
  async redirects() {
    return [
      { source: "/command-center/pins", destination: "/command-center/atlas?view=map", permanent: true },
    ]; // unchanged
  },
};
export default nextConfig;
```

Result: `fr` served at the root (no prefix), `en` served under `/en/`. This is
built-in Pages-Router i18n routing — **no middleware**.

### 2c. `_app.tsx` — wrap with `appWithTranslation`

Wrap the existing default export. Keep the current `Layout`/`getLayout` logic and
the `<Head>` default-description block intact; just wrap the returned component
tree's export:

```tsx
import { appWithTranslation } from "next-i18next/pages";
// ...existing MyApp unchanged...
export default appWithTranslation(MyApp);
```

`appWithTranslation` needs the config; it auto-discovers `next-i18next.config.js`
at the root, so no explicit pass is required. If discovery fails in the Next 16
build, pass it explicitly: `appWithTranslation(MyApp, nextI18NextConfig)`.

### 2d. Translation resource files

Create `public/locales/fr/common.json` and `public/locales/en/common.json` for
UI chrome strings (nav, buttons, section headers). **Content strings (location
names, descriptions, story bodies) are NOT in these files** — they come from the
DB via `getLocalized`. Namespaces this run: just `common`. Seed with the existing
hardcoded UI strings; French is authoritative.

### 2e. `getStaticPaths` + locales (integration gotcha to handle)

Under Pages-Router i18n, dynamic pages with `getStaticPaths` are prerendered for
the **defaultLocale** only unless told otherwise. To make `/en/…` render, set
`fallback: "blocking"` on every dynamic public page's `getStaticPaths`
(`places/[slug]`, `stories/[slug]`, `tours/[slug]`). This keeps build cost flat
and generates `/en/…` on first request. (Explicit per-locale `{ params, locale }`
tuples are the alternative; `fallback: "blocking"` is lighter and preferred.)

---

## CCC / dashboard exclusion (French-only, out of translation wiring)

Next's `i18n` is app-wide, so `/en/command-center/*` and `/en/dashboard/*` routes
exist by default. Keep them French-only and inert:

1. **`localeDetection: false`** (set in 2a) — this is the key lever. Without it,
   Next auto-redirects `/command-center` → `/en/command-center` for an
   English-`Accept-Language` browser. With it off, French URLs stay French and
   `/en/` is only ever reached by explicit navigation.
2. **No `serverSideTranslations`** in any `pages/command-center/**` or
   `pages/dashboard/**` page. No namespace loads; their **hardcoded French
   labels render unchanged** at either URL. This is sufficient for correctness.
3. **Sitemap excludes them** (they are admin surfaces — the sitemap only lists
   published public content; see Task 4).
4. **`noindex` guard:** verify CCC/dashboard already emit
   `<meta name="robots" content="noindex">` (they should, as admin surfaces). If
   any do not, add it — this makes the incidental `/en/command-center/*` twins
   non-indexable. No canonical/redirect machinery is needed beyond this.

No middleware. No route-group config. The above is the whole exclusion.

---

## Task 3 — `getLocalized` contract + tests

File: `lib/getLocalized.ts`. Pure, dependency-free (no React, no Supabase).

### Signature

```ts
type Locale = "fr" | "en" | string;
type Row = Record<string, unknown> & {
  translations?: Record<string, {
    _meta?: { source_hash?: string; translated_at?: string; status?: string };
    [field: string]: unknown;
  }> | null;
};

export function getLocalized(row: Row | null | undefined, locale: Locale, field: string): string;
```

Returns a **string, never `null`/`undefined`**. (A `getLocalizedRaw` variant may
return the untyped value if a non-string field is ever needed; the string form is
the default consumer.)

### Fallback matrix (exact)

1. `row` is null/undefined → return `""` (empty-safe, never throws).
2. `locale === "fr"` → return the base column `row[field]` as string, or `""`.
   (French is canonical; translations are never consulted for `fr`.)
3. `locale === "en"` (or any non-`fr` locale):
   - Read `t = row.translations?.[locale]`.
   - Show the translated value **only if all hold**: `t` exists,
     `t._meta?.status === "published"`, `t[field]` is a non-empty string.
   - Otherwise fall back to the base column `row[field]` (as string), or `""`.
4. Never return an empty string when the base column has content.
5. Never return a `draft` (or missing-status) translation.
6. Unknown `field` (absent from both translation and base) → `""`.

> **Status-naming reconciliation (flag for content-ops):** `getLocalized` gates
> on the row's own `translations.<locale>._meta.status === "published"`. The
> `v_translation_health.en_status` column is a *computed ops signal*
> (`missing|stale|draft|current`) — a different axis. The promote step of the
> French content migration must stamp `_meta.status = "published"` on English
> rows it releases, or `getLocalized` will keep serving French. Confirm the
> promote script writes `"published"` (not `"current"`). This is a content-ops
> concern, not a code change here.

### Unit-test cases (`lib/getLocalized.test.ts`, `node:test`)

1. `fr` returns base column even when a published `en` translation exists.
2. `en` + published translation returns the translated value.
3. `en` + `status: "draft"` returns the base (never the draft).
4. `en` + no `translations` object returns the base.
5. `en` + `translations.en` present but `field` missing returns the base.
6. `en` + published translation whose value is `""` returns the base (never empty).
7. `en` + `_meta` missing entirely (no status) returns the base.
8. Unknown field with no base value returns `""` (no throw).
9. `row` null/undefined returns `""` (no throw).
10. Unpopulated locale (e.g. `"zh"`) returns the base.

Then thread `getLocalized(row, locale, field)` through the render path of the
public pages (names, descriptions, narratives, meta fields) — reading `locale`
from `useRouter().locale` (client) or the `locale` passed to
`getStaticProps`/`getServerSideProps` (server). **No writes.**

---

## Task 4 — `SeoHead` + JSON-LD + sitemap

### 4a. `components/SeoHead.tsx`

Props: `{ title, description, path, locale, image?, jsonLd? }` where `path` is the
locale-agnostic path (no `/en` prefix, e.g. `/lieux/maison-millet`).

Emits into `<Head>`:
- `<title>` and `<meta name="description">` (from localized meta — see below).
- **Canonical:** `https://explorebarbizon.com` + (locale === "fr" ? "" : "/en") + path.
- **hreflang alternates:** `fr` → `{BASE}{path}`, `en` → `{BASE}/en{path}`,
  **`x-default` → the French URL** (`{BASE}{path}`). Same slug both locales.
- **Open Graph:** `og:title`, `og:description`, `og:url` (= canonical),
  `og:type` (`website` for indexes, `article` for stories/place detail is fine as
  `article`), `og:image` (from `image` prop, fallback to a site default),
  `og:locale` (`fr_FR` / `en_US`), `og:site_name` = "Visit Barbizon".
- Optional `jsonLd`: rendered as
  `<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>`.

Localized title/description come from `getLocalized(row, locale, "meta_title")`
and `"meta_description"`, falling back to `name`/`short_description` when meta
fields are absent. Retire the ad-hoc default-description block in `_app.tsx` for
pages that adopt `SeoHead` (keep it as the global fallback only).

### 4b. JSON-LD type mapping — via `lib/categoryGroups.ts` groups

Refactor `lib/seo.ts` `buildPlaceSchema` to derive the group with
`getCategoryGroup(primaryCategoryName, layer)` and map **group → schema.org type**:

| Category group (`GROUP_NAMES`) | `@type` |
|---|---|
| `Art & History` | `TouristAttraction` |
| `Forest & Nature` | `TouristAttraction` |
| `Eat & Stay` | `LocalBusiness` (keep the finer subtype logic already in `buildPlaceSchema`: `LodgingBusiness` for hotel/suite, `FoodEstablishment` for restaurant/café/salon, else `LocalBusiness`) |
| `Practical` | **`Place`** (generic — parking, toilets, EV chargers are neither attractions nor businesses). **Flag:** the brief's mapping did not name `Practical`; `Place` is the recommendation — confirm, or omit JSON-LD for Practical entirely. |

Stories: separate builder `buildArticleSchema(story, locale)` → `@type: "Article"`
(`headline`, `description`, `author`, `datePublished` from `published_at`,
`image`, `mainEntityOfPage` = canonical URL).

### 4c. `openingHoursSpecification` — emit only for parseable canonical day values

Add to `lib/openingHours.ts`:

- **Parseability predicate — `parseHoursRange(dayValue: string)`**: returns
  `Array<{ opens: string; closes: string }>` when the string matches one or more
  canonical `HH:MM-HH:MM` ranges (comma/`/`-separated allowed), else `null`.
  This is the single helper that decides parseability.
- **`toOpeningHoursSpecification(value)`**: runs `splitOpeningHours(value)`, then
  for each of `mon…sun` whose value is a **non-empty string that `parseHoursRange`
  accepts**, emits one `{ "@type": "OpeningHoursSpecification", dayOfWeek,
  opens, closes }` entry (map `mon…sun` → schema.org day URIs, e.g.
  `https://schema.org/Monday`). **The `others` bucket is skipped entirely** —
  `check_in`, `check_out`, `default`, `eve_of_holidays`, and the object-valued
  rows never produce structured data. Returns `undefined` when nothing parses, so
  the caller omits the `openingHoursSpecification` key rather than emitting `[]`.

This guarantees no malformed structured data ever ships. Wire the result into
`buildPlaceSchema` only when defined.

### 4d. Sitemap — `pages/sitemap.xml.tsx` (rewrite)

Current file lists only `/places/{slug}`. Rewrite `getServerSideProps` to emit,
for every **published** entity, both-locale entries with `xhtml:link` alternates
(identical slugs). Add `xmlns:xhtml` to the urlset.

Entity → path base:
- locations → `/lieux/{slug}` (confirm the live public route; if it is
  `/places/{slug}`, use that — match the actual page route, do not invent).
- stories → `/stories/{slug}`
- tours → `/tours/{slug}`
- routes → the live routes public path (confirm; include only if a public page
  exists — do not list URLs that 404).

For each URL emit:
```xml
<url>
  <loc>{BASE}{path}</loc>
  <xhtml:link rel="alternate" hreflang="fr" href="{BASE}{path}"/>
  <xhtml:link rel="alternate" hreflang="en" href="{BASE}/en{path}"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="{BASE}{path}"/>
</url>
```
Plus the existing static routes, each with the same fr/en/x-default alternates.

**`is_published` confirmed present on all four entity tables** (locations, stories,
routes; and **`tours` now has `is_published`** — added 2026-07-13). Add
`getPublishedStorySlugs`, `getPublishedTourSlugs`, `getPublishedRouteSlugs` to
`lib/supabase.ts` mirroring the existing `getPublishedSlugs` (each filtered
`.eq("is_published", true)`), wrapped in try/catch so a Supabase outage degrades
to static routes (as the current file already does).

---

## Task 5 — SEO audit script + CCC translation-health panel

### 5a. `scripts/seo-audit.mjs`

Purpose: fail a pre-deploy check when SEO output is malformed.

- **Data source / auth:** enumerate published entities by querying Supabase with
  `@supabase/supabase-js` (already a dep) using the **anon key**
  (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — published rows
  are readable under RLS, so this is a **read-only, least-privilege** auth path.
  Then **fetch the rendered pages** at `SEO_AUDIT_BASE_URL` (Vercel preview or
  prod; default `http://localhost:3000`) for a sample per entity, for each
  available locale (`fr` root, `/en/…`).
- **Checks (per page, per available locale):**
  - `<title>` present and **50–60 chars** (fail outside range).
  - `<meta name="description">` present and **150–160 chars** (fail outside range).
  - **hreflang pair completeness**: both `fr` and `en` alternates present, plus
    `x-default` → the French URL.
  - **JSON-LD present** and valid JSON with an `@type`.
  - **sitemap inclusion**: fetch `/sitemap.xml` once, assert each audited public
    URL appears.
- **Opening-hours JSON-LD is a WARNING, not a failure**: when a location has
  hours but emits no `openingHoursSpecification` (all non-parseable), warn — never
  fail. (Correct behaviour by design; see 4c.)
- **Exit code:** non-zero on any hard failure; warnings print but keep exit 0.
- Add script: `"seo-audit": "node scripts/seo-audit.mjs"`.

### 5b. CCC translation-health panel

File: `pages/command-center/index.tsx` gains a read-only panel (or a new
`components/command-center/TranslationHealthPanel.tsx` rendered by it).

- Data via `supabaseAdmin` (service role) in `getServerSideProps` — reads
  `v_translation_health`, **published rows only** (`is_published = true`).
- Aggregate `en_status` counts per `entity_type`:
  `{ missing, stale, draft, current }`.
- Render **French labels**, e.g. header "Traductions" and a line per type like
  "Lieux — 106 manquantes, 0 obsolètes, 0 brouillons, 0 à jour". No writes, no
  edit affordances — this is a dashboard read.
- CCC page stays French-only (no `serverSideTranslations`), consistent with the
  exclusion rule above.

---

## Implementer build order

1. **Deps + config (Task 2):** install the three packages, create
   `next-i18next.config.js`, wire `i18n` into `next.config.mjs` (preserve
   redirect/headers/images), wrap `_app.tsx`, seed `public/locales/{fr,en}/common.json`.
   `npx tsc --noEmit` + `npm run lint` + `next build` must pass with routing live.
2. **`getLocalized` + tests (Task 3):** write `lib/getLocalized.ts`, add
   `lib/getLocalized.test.ts`, add `"test"` script, confirm Node ≥ 23, run
   `node --test`. Then thread `getLocalized` + `serverSideTranslations` through
   the public pages (see wiring list below). No writes.
3. **SeoHead + JSON-LD (Task 4a–4c):** `components/SeoHead.tsx`, refactor
   `lib/seo.ts` (group-based type map + `buildArticleSchema`), add
   `parseHoursRange` + `toOpeningHoursSpecification` to `lib/openingHours.ts`,
   adopt `SeoHead` on public pages.
4. **Sitemap (Task 4d):** add the published-slug fetchers to `lib/supabase.ts`,
   rewrite `pages/sitemap.xml.tsx` with per-locale `xhtml:link` alternates.
5. **SEO audit (Task 5a):** `scripts/seo-audit.mjs` + `"seo-audit"` script.
6. **CCC panel (Task 5b):** translation-health panel on `/command-center`.

Each step is independently reviewable; release-check after 1, then after each
subsequent step or in sensible pairs.

### `serverSideTranslations` wiring — page inventory

**Public pages that MUST call `serverSideTranslations(locale, ["common"])` in
their data method:**

| Page | Data method | Note |
|---|---|---|
| `pages/index.tsx` | `getStaticProps` (exists) | add locale param + SST |
| `pages/map.tsx` | `getStaticProps` (exists) | " |
| `pages/plan-your-visit.tsx` | `getStaticProps` (exists) | " |
| `pages/places/index.tsx` | `getStaticProps` (exists) | " |
| `pages/places/[slug].tsx` | `getStaticProps` + `getStaticPaths` (exist) | + `fallback: "blocking"` |
| `pages/stories/index.tsx` | `getStaticProps` (exists) | " |
| `pages/stories/[slug].tsx` | `getStaticProps` + `getStaticPaths` (exist) | + `fallback: "blocking"` |
| `pages/tours/[slug].tsx` | `getStaticProps` + `getStaticPaths` (exist) | + `fallback: "blocking"` |
| `pages/about.tsx` | **none — add `getStaticProps`** | new GSP returning only SST props |
| `pages/history.tsx` | **none — add `getStaticProps`** | new GSP returning only SST props |

**Excluded (no `serverSideTranslations`, French-only):** everything under
`pages/command-center/**` (`index`, `atlas/*`, `tasks/*`, `memory`, `prompts`,
`decisions`) and `pages/dashboard/**` (`index`, `locations/*`, `stories`, `tours`,
`places/*`). Also `pages/sitemap.xml.tsx` (XML endpoint, not a rendered page) and
`pages/_document.tsx`.

---

## Per-task risks

- **Task 2 — ESM↔CJS config interop:** the `createRequire` shim is the tested
  pattern; if `appWithTranslation` fails to auto-discover the config under Next
  16, pass the config object explicitly. Verify `next build` emits `/en/…` routes.
- **Task 2 — `getStaticPaths` locale coverage:** without `fallback: "blocking"`,
  `/en/{slug}` pages 404. This is the single most likely miss — call it out in
  review.
- **Task 2 — `localeDetection: false` is load-bearing:** if left default, admin
  users with English browsers get bounced to `/en/command-center`. Do not omit.
- **Task 3 — Node TS execution:** `node --test` on a `.ts` file needs Node ≥ 23
  (or `--experimental-strip-types` on ≥ 22.6). Confirm before relying on it.
- **Task 3 — status naming:** `getLocalized` gates on `_meta.status ===
  "published"`; the later promote script must stamp exactly that. Flagged for
  content-ops; not blocking this run (no en content is published yet).
- **Task 4 — malformed structured data:** the whole point of `parseHoursRange`
  is that non-day/object-valued hours never emit JSON-LD. Test with a location
  that has `check_in`/object-valued rows and assert no `openingHoursSpecification`.
- **Task 4 — sitemap routes reality:** confirm the live public path for each
  entity (`/lieux` vs `/places`, whether routes have a public page) before listing
  — never emit a URL that 404s.
- **Task 5 — audit needs a running target:** `SEO_AUDIT_BASE_URL` must point at a
  built/preview deploy; document that it is a post-build check, not a unit test.

## Explicit scope note

**No base content columns are written and no slug is renamed or translated in this
run.** All content translation (drafting French into `translations->'fr'`,
reviewing, promoting) is deferred to the separate, human-gated French content
migration. This run delivers routing, the read-path helper, and the SEO surface
only.
