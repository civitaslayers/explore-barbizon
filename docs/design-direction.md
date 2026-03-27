# Design Direction

Last updated: 2026-03-27

---

## Strategic Positioning

The strongest positioning for the product is:

**A quiet digital atlas of Barbizon**

The platform should sit between:
- cultural magazine / editorial publication
- museum / archive interface
- cartographic exploration product

This means the brand and UI should avoid generic tourism design.

---

## Core Design Principle

**The map is the product. Everything else is a funnel.**

The map should be the first destination a user reaches.
All editorial content — place pages, stories, plan your visit — exists to
draw users in and route them to the map for spatial exploration.

Design every page with the question: does this move the user toward the map?

---

## Aesthetic Direction

**Aim for:**
- calm
- eloquent
- immersive
- modern without being trendy
- visually courageous — full-bleed images, generous negative space, bold scale
- museum-cartography feel

**Avoid:**
- loud gradients
- startup SaaS aesthetics
- cluttered travel-directory layouts
- tourism-brochure design
- timid layouts that under-use the canvas
- excessive padding that reads as emptiness, not space

The site should be calm **and** immersive simultaneously.
Calm = restraint in palette, typography, ornamentation.
Immersive = scale, full-bleed visuals, presence of the map.

---

## Homepage

### Role
The homepage is a cinematic doorway into the map and the village.
It is not an essay. It is not a directory. It is an atmospheric invitation.

### Above the fold
- Full-bleed hero: video (when available) or atmospheric full-bleed still
- Minimal overlay text: eyebrow + H1 only
- Map CTA must be visible without scrolling
- No paragraph copy in the hero

### Below the fold
- Brief editorial orientation (2–3 sentences maximum)
- Featured places or map preview
- Entry points into Stories and Places
- Richer editorial depth lives here, not above

### Hero content
Minimal text. Examples:
- "Visit Barbizon"
- "A quiet atlas of art, forest, and village paths."

CTAs:
- "Explore the Map" → `/map`
- "Discover the Village" → `/places`

---

## Map page

- Full-screen — the map occupies the entire viewport
- No persistent sidebar or panel
- Sidebar hidden by default; opens only when a pin is clicked or a filter is activated
- Desktop: slide-in drawer from left or right, dismisses on map click outside
- Mobile: bottom sheet — peek state (pin name + category) that expands on tap
- Controls appear as floating UI elements (zoom, layer toggle, search), not as a panel
- Layer toggles accessible but not dominant — they should not compete with the map itself

---

## Map icons

Icons must be legible at 32px and instantly distinguishable from each other.
One visual idea per icon. No decoration beyond that idea.
Icons are differentiated at the **subcategory** level, not the group level.

Subcategory icon matrix:

### Art & History (warm brown #8A5A3B)
- museum / heritage site — pediment + columns
- gallery / studio — picture frame outline
- historic house / maison — house outline + keystone
- monument / landmark — obelisk or pillar
- church / chapel — arch + cross

### Eat, Stay & Shop (gold #C4A25E)
- restaurant — fork + knife
- café / salon de thé — cup + steam
- hotel / chambre d'hôte — bed + pillow
- shop / boutique — bag outline
- galerie (commercial art) — diamond / frame variant distinct from Art & History gallery
- épicerie / food shop — jar or basket

### Forest & Nature (green #4E6B4A)
- viewpoint / panorama — eye + horizon line
- trail head / forest entry — tree outline
- rock / boulder — boulder silhouette
- clearing / landscape — horizon + grass line

### Practical (neutral #888) — map only, not shown in Places editorial
- parking — P
- toilet / WC — person outline
- bus stop — bus silhouette
- tourist info — i

---

## Places page

- Excludes Practical category entirely — bus stops and toilets are map utilities, not editorial content
- Shows Art & History + ESS only
- Layout: magazine-style grid — generous card images, not a directory list
- Cards: full-bleed image, serif title, short lead text
- Should feel like a cultural guide, not a search results page

---

## Stories page

Two content registers, unified in one section:

1. **Historical / cultural** — long-form essays, archival depth
   - Example: "The studios that shaped the Barbizon School"
   - Visual: atmospheric, archival-feeling imagery

2. **Practical-editorial** — curated recommendation guides
   - Example: "Where to sleep in Barbizon", "The best tables in the village"
   - These are editorial picks, not directory listings

Both use the same `/stories` section.
Schema differentiates via `type: history | guide`.
Visual treatment may vary slightly (guide posts could use a lighter, warmer header treatment).

Best-of lists and recommendation articles live in Stories.
Plan Your Visit is for logistics only (getting there, seasons, access) — not recommendations.

---

## Typography

- **Serif**: Cormorant Garamond — headings, lead text, place names
- **Sans**: system stack or equivalent — body, metadata, UI labels
- Hierarchy: generous size contrast between heading levels
- Tracking: generous on eyebrows/labels (0.2–0.3em uppercase)
- Leading: generous in body text (1.7–1.8 in long-form)

---

## Colour system

- **Cream** `#F5F1E8` — background, default surface
- **Ink** `#111111` — primary text, borders
- **Gold** `#C4A25E` — CTA buttons, highlights, ESS layer
- **Warm brown** `#8A5A3B` — Art & History layer
- **Forest green** `#4E6B4A` — Forest & Nature layer
- **Neutral grey** `#888888` — Practical layer, metadata

---

## Current Site Diagnosis

Current strengths:
- restrained palette
- serif typography
- calm layout
- good editorial tone

Current weaknesses (as of 2026-03-27):
- map is buried — not immediately accessible
- sidebar is permanently visible on map — should be hidden by default
- icons insufficiently differentiated — subcategory icons not fully implemented
- many map pin coordinates are incorrect — need full audit
- Places page includes Practical — should be editorial only
- branding says "Explore Barbizon" — should be "Visit Barbizon"
- no stories written — biggest visible content gap
- hero is not yet full-bleed / video
- layout is occasionally too timid — needs more visual courage
