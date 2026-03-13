# Schema Reference

Source: extracted from MAIN_BRAIN.md
Last updated: March 2026

---

## Current Working Schema

The current working schema already includes:

| Table | Notes |
|---|---|
| `towns` | Top-level entity |
| `categories` | Place/content categorisation |
| `locations` | Core geographic entries |
| `tours` | Walking/discovery routes |
| `tour_stops` | Individual stops within a tour |
| `media` | Images, video, archival material |
| `users` | Authentication and dashboard access |

---

## Important Field Name Rules

These rules override any default assumptions. The existing schema is the authority for field names and SQL constraints.

| Use this | Not this |
|---|---|
| `layer` | `map_layer` |
| `distance_meters` | `distance_km` |
| `stop_narrative` | `notes` |

---

## Slug and ID Discipline

- Preserve existing slugs and IDs carefully
- Do not regenerate or rename slugs without a deliberate migration

---

## Multi-Town Schema (Future)

Before onboarding town #2, the schema should evolve toward:
- `town_settings`
- Composite slug discipline
- `category_templates`
- `town_categories`
- Town-aware dashboard logic

Do not perform this migration now. Finish Barbizon MVP first, then execute in a controlled sequence.
