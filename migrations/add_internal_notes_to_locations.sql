sql-- Migration: add internal_notes to locations
-- Applied via Supabase MCP on 2026-04-03
-- Private operational field — never expose in public-facing queries or API responses.

ALTER TABLE locations
ADD COLUMN IF NOT EXISTS internal_notes text;

COMMENT ON COLUMN locations.internal_notes IS 'Private operational notes — owner info, local knowledge, sourcing flags, unverified claims. Never exposed on public-facing pages.';
