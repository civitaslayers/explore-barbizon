# Design Direction

Last updated: 2026-03-30
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