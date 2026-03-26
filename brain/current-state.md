## Frontend / Product State

### Public Product (Explore Barbizon V1)

The public-facing product is now partially live and coherent:

- Places index (`/places`) uses live Supabase data (`locations`, `categories`) filtered by `is_published = true`
- Place detail pages (`/places/[slug]`) load real data by slug from Supabase
- Homepage CTAs are correctly wired:
  - "Explore the Map" → `/map`
  - "Discover the Village" → `/places`
- Featured places on homepage are derived from published Supabase locations (with fallback to static data)

### UX / Design Progress

- Place detail page has been refined toward an **editorial “quiet atlas” experience**:
  - calmer hero layout
  - serif lead instead of stacked headings
  - improved text hierarchy (lead / description / narrative)
  - metadata presented as orientation (not dashboard)
  - history block treated as archival margin content
  - improved spacing and rhythm on large screens

### Current Limitations

- Visual assets are still incomplete:
  - hero video missing or placeholder
  - many places use fallback image (`/images/places/place-default.jpg`)
- Map preview still depends on Mapbox configuration (`hasMapbox`)
- Homepage still partially relies on static/fallback data for images
- Forest & Nature layer has no data yet

### Overall Status

The product has transitioned from:
- static prototype

to:

- **live data-driven experience with coherent navigation and refined place pages**

Next step is improving **visual richness and depth (assets + tours)**.