# Design Direction

Last updated: 2026-07-05
Source: Stitch 2.0 design system (DESIGN.md) + implementation 
sessions March 2026

---

## Creative North Star

**"The Digital Archivist"**

A quiet digital atlas of Barbizon. The platform sits between:
- cultural magazine / editorial publication
- museum / archive interface
- cartographic exploration product

It should feel like it was made by someone who cares deeply about
Barbizon — not by a tourism tech company.

---

## Aesthetic Direction

**Aim for:** calm, elegant, refined, visually led, editorial,
museum-cartography feel, intentional asymmetry, generous 
negative space.

**Avoid:** loud gradients, startup SaaS aesthetics, cluttered
travel-directory layouts, tourism-brochure design, 1px border
dividers, 100% black (#000000).

---

## Typography

**Serif display: Newsreader** (Google Fonts)
- Used for all headlines, H1–H3, lead paragraphs, blockquotes,
  numbers, and dates
- Always italic for display sizes
- `tracking-tight` (-0.02em) at large sizes for dense, printed feel
- Loaded via `<link>` in `pages/_document.tsx`

**Sans-serif UI: Inter** (next/font/google, variable `--font-inter`)
- Used for navigation, labels, eyebrows, body copy, metadata
- `tracking-widest` (0.1em+) for all uppercase label-style text
- `tracking-[0.35em]` for eyebrows
- Line-height 1.6 for body text

**Rule:** Never use system fonts, Arial, or Roboto.

---

## Color Tokens

All tokens are defined in `tailwind.config.js`.

### Core palette
| Token | Hex | Use |
|---|---|---|
| `ink` | `#111111` | Primary text, dark surfaces |
| `cream` | `#F5F1E8` | Page background, reversed text |
| `umber` | `#7A5C3E` | Art & History layer, warm accents |
| `moss` | `#5F6F52` | Eat Stay & Shop layer, primary buttons |

### Surface hierarchy (tonal layering — no borders)
| Token | Hex | Use |
|---|---|---|
| `surface` | `#faf9f9` | Base page layer |
| `surface-container-low` | `#f5f3f3` | Section backgrounds, nav separator |
| `surface-container-lowest` | `#ffffff` | Cards that need to pop |
| `surface-variant` | `#e3e2e2` | Glassmorphic overlays |
| `on-surface-variant` | `#444840` | Secondary body text |
| `outline-variant` | `#c5c8bd` | Ghost borders (15% opacity max) |

### Accent / chip palette
| Token | Hex | Use |
|---|---|---|
| `secondary-container` | `#fed6b0` | Chip / tag backgrounds |
| `on-secondary-container` | `#795b3d` | Chip / tag text |
| `primary-container` | `#5f6f52` | Button gradient end |
| `on-primary` | `#ffffff` | Text on primary buttons |

### Map layer colors
| Layer | Hex |
|---|---|
| Art & History | `#7A5C3E` |
| Eat Stay & Shop | `#5F6F52` |
| Forest & Nature | `#4A5E3A` |
| Practical | `#888888` |

---

## The "No-Line" Rule

**Never use 1px solid borders to separate content sections.**

Boundaries must be defined through:
- **Tonal transitions:** shifting from `surface` to 
  `surface-container-low`
- **Whitespace:** `space-y-24` or larger between major sections
- **Ghost border fallback only:** `outline-variant` at max 15–20% 
  opacity, only where accessibility requires it

---

## Elevation & Shadows

Depth is tonal, not synthetic.

- Prefer surface layering over drop shadows
- When a shadow is needed: `shadow-ambient` 
  (`0 4px 40px rgba(121,91,61,0.04)`) — tinted with umber,
  not black
- Reserve `shadow-card` for elements physically "above" the page
  (modals, map popups, floating tooltips)
- Never apply card shadows to every element

---

## Buttons

Defined as `.btn` base in `globals.css`.

- **Primary (`.btn-primary`):** `ink-gradient` background 
  (radial, moss → primary), cream text, `shadow-ambient`,
  `hover:-translate-y-0.5`
- **Secondary (`.btn-secondary`):** transparent background,
  ink border at 40% opacity, ink text
- **Tertiary:** `primary` text, no background, `label-md`,
  `tracking-widest`, all caps

All buttons: `rounded-full`, no border on primary, 
`duration-300–500ms`, `cubic-bezier(0.2, 0.8, 0.2, 1)` easing.

---

## Cards

### Standard card (`.card`)
`rounded-card` (1.5rem), `border border-ink/10`, `bg-cream/90`,
`shadow-sm`, `backdrop-blur-[1.5px]`.
Add `.card-hover` for lift on hover.

### Atlas Card
Image-heavy card. Text sits in a glassmorphic overlay at the 
bottom of the image.
- Full-bleed image as background
- Dark gradient scrim: `bg-gradient-to-t from-ink/75 via-ink/20 
  to-transparent`
- Text container: `bg-surface-variant/60 backdrop-blur-sm 
  border-t border-white/10`
- Text: category chip + italic serif title + optional body copy

Used on: homepage featured enclaves, places index grid.

---

## Chips / Tags (`.chip`)

`bg-secondary-container` (`#fed6b0`), `text-on-secondary-container`
(`#795b3d`), `rounded-full`, `text-[10px]`, `tracking-[0.12em]`,
`uppercase`.

Used for: category labels on cards, place detail hero, related 
places, tour stops.

---

## Navigation

### Top bar
- `bg-cream sticky top-0 z-40`
- Three elements: hamburger left / wordmark center / search right
- Wordmark: `font-serif italic`, links to `/`, text: "Visit Barbizon"
- Tonal separator below: `bg-surface-container-low h-px w-full`
  (no border)

### Bottom nav (mobile only, `md:hidden`)
- Fixed, `bg-cream/90 backdrop-blur-md rounded-t-2xl`
- Four tabs: Atlas (`/map`), Trails (`/map`), Stories (`/stories`),
  Places (`/places`)
- Active: `text-ink border-t-2 border-ink -translate-y-0.5`
- Inactive: `text-ink/35 border-transparent`
- Component: `components/BottomNav.tsx`

---

## Hero (Homepage)

- Full-bleed looping `<video autoPlay muted loop playsInline>`
- No `mix-blend-multiply` — video renders at natural colors
- `opacity-90` on video element
- Gradient: `bg-gradient-to-t from-ink/60 via-ink/20 to-transparent`
- `min-h-screen`, bleeds past nav with `-mt-12 md:-mt-20 -mx-4 
  md:-mx-8`
- No border radius on hero
- Text: eyebrow (10px, tracking-[0.35em]) + H1 (Newsreader italic,
  large) + 2 CTAs
- Video asset: `/public/videos/hero-barbizon.mp4`

---

## Micro-interactions

- All transitions: `300ms–500ms`
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` (mapped to 
  `ease-soft` in Tailwind config)
- Image hover: `group-hover:scale-105` with `duration-700`
- No high-speed flashes or jarring state changes

---

## What's Next (design work remaining)

- **Pass 5:** Tour page — alternating stop grid, timeline anchor,
  route map visualization, archival quote block
- **Stories:** Long-form editorial article layout
- **Dashboard:** Internal admin — restrained, utilitarian but
  on-brand
- **Visual works layer:** Historical postcard overlay on map
- **Map Immersion Pass 1** — Barbizon light (brief ready)
- **Pass 2** — stylized landmark models (blocked on field photos)

---

## Motion & Immersion (2026-07)

### The signature

**The atlas lives on Barbizon light.**

The painters came to Barbizon for the light. Pass 1 renders the village in a
fixed dawn light — the quiet, silvered hour before the village wakes, the
light Millet and Rousseau painted most. Time-synced light (dawn, day, dusk,
night matched to the real Europe/Paris clock) remains the eventual signature
and the design intent stated below; it's deferred past Pass 1.5 in favor of a
single, dependable atmosphere while the map's other systems — terrain, camera,
stylized landmarks — mature. This is still the bold move in waiting.
Everything else stays quiet and disciplined around it.

One aesthetic-risk note, stated honestly: cream-plus-serif has become a common
AI-era default look. Our system predates the trend and is locked — but it means
distinctiveness cannot come from palette alone. It comes from subject-grounded
signatures: village light, stylized landmark architecture, paper grain,
cartographic motion. Execution specific to Barbizon is the differentiator.

---

### Map immersion principles

**Symbolic realism, never photorealism.** The map is a graphic representation
in the atlas's own language — the 3D extension of our icon philosophy (one
visual idea, legible, palette-bound). Google photorealistic tiles are ruled out
(EEA-unavailable, off-brand, coverage-poor for a village). Decision logged.

**Light.** Pass 1.5 ships a fixed `lightPreset: 'dawn'` — no time sync, no
override control. The time-synced version described above (hour-band mapping
re-evaluated every 10 minutes, later a true sun-position calculation, plus a
user override control) is the deferred design intent, not yet built. Revisit
once the map's other systems settle.

**Label restraint (Standard-style rule).** `showPointOfInterestLabels` and
`showTransitLabels` are set to `false` via Mapbox Standard's config API —
third-party POI icons and transit labels compete with our own pin system and
add visual noise foreign to the atlas. Road labels and house numbers stay on;
wayfinding legibility matters more than restraint here.

**Ground and air.** 3D terrain on (the forest edge and Gorges d'Apremont read
as relief, not flatness), atmospheric fog/haze at low pitch, subtle sky.
Terrain exaggeration restrained (≤1.3) — Barbizon is a plain meeting a forest,
not the Alps.

**Camera as narration.** The camera moves like a documentary drone, slow and
deliberate, never like a game.
- Load: begin high and tilted over the forest, one slow glide (~2.5s,
  ease-soft) settling on the village. With `prefers-reduced-motion`: cut
  directly to the settled frame.
- Pin select: `flyTo` with pitch 55–60°, ~1200ms, ease-soft — a glide down the
  street, not a teleport.
- Idle (map page hero moments only): drift ≤ 0.5°/s bearing rotation,
  suspended on any interaction, never on mobile.

**Stylized landmark program (Pass 2).** 3–5 hand-modeled buildings as the map's
jewelry — graphic architecture in the app palette:
- Candidates (all existing pins, Tier-1 verifiable): Auberge Ganne,
  Maison-atelier Millet, Maison-atelier Théodore Rousseau; optionally the
  Mairie and the Chapelle.
- Style: low-poly, flat-shaded, **no textures**. Walls `cream`, roofs `umber`,
  vegetation touches `moss`, openings `ink` at low opacity. One recognizable
  architectural gesture per model (Ganne's long inn façade, Millet's studio
  window) — the icon rule, in 3D.
- Geometry sources: building footprints from the French cadastre
  (cadastre.gouv.fr, Etalab open licence) or OSM; heights and gestures from
  Luigi's field photos. **No invented architecture** — the same integrity rule
  as content.
- Format: glTF (.glb), ≤100KB per model, anchored at the pin's verified GPS,
  served from `public/models/` (versioned in git; these are app assets, not
  content media — R2 convention does not apply).
- Rendered via the Mapbox GL v3 model layer; landmark models replace the
  generic extrusion on their footprint, never float beside it.

**Everything else stays symbolic:** generic OSM extrusions ghosted at low
opacity under the Standard style; our pins, colors, and icon system remain the
loudest layer on the map. The data is the figure; the basemap is the ground.

---

### Motion tokens (app-wide)

| Token | Value | Use |
|---|---|---|
| `duration-quick` | 200ms | hovers, chips, toggles |
| `duration-base` | 400ms | reveals, drawer, sheet |
| `duration-slow` | 700ms | image scale, page fade |
| `duration-cinematic` | 1200–2500ms | map camera only |
| easing | existing `ease-soft` cubic-bezier(0.2, 0.8, 0.2, 1) | everything |

Rules:
- **Reveal pattern:** fade-up 12px + opacity, stagger 60ms between siblings,
  triggered at 20% viewport entry, once per element. Editorial pages only.
- **Atlas Card parallax:** background image translates ≤6% on scroll; text
  overlay static. Desktop only.
- **Kinetic serif:** page titles (Newsreader italic) may enter with a single
  clip-path or fade-up reveal. Never letter-by-letter animation — that is the
  trendy default we avoid.
- **Grain:** a 2%-opacity monochrome noise texture on `cream` surfaces
  (single tiled PNG or CSS), evoking paper/canvas. Imperceptible as an effect,
  perceptible as warmth. Never on the map.
- **Page transitions:** cross-fade + 8px rise via framer-motion
  `AnimatePresence` in `pages/_app.tsx` (protected file — any task touching it
  must name it explicitly per .cursor/rules). Card → place page should feel
  continuous, not like a reload.
- **`prefers-reduced-motion`: reduce** disables reveals, parallax, idle drift,
  and camera choreography globally. Non-negotiable quality floor.
- **Restraint rule:** one orchestrated moment per view. If a screen has the
  map light signature, nothing else on it animates ambiently. Before shipping
  any motion pass: remove one accessory.

Dependency note: framer-motion is the single new dependency this addendum
justifies. Everything else is CSS and Mapbox config.

---

### What to avoid (extends parent list)

- Photorealistic anything
- Letter-by-letter or bouncing text
- Scroll-jacking; horizontal scroll sections
- Parallax deeper than 6%; multiple ambient animations per view
- Camera moves faster than the documentary register
- Motion that fires identically on every visit forever with no variation at
  all (the load glide, camera moves) — documentary pacing, not a stock loop.
  (Note: as of Pass 1.5 the light itself is a fixed dawn preset, not
  time-synced — see "Light" above. Time-synced light was the original reason
  this rule existed; it remains the deferred design intent, not yet shipped.)