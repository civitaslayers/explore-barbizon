-- Migration: add route_slug to locations
-- Applied directly via Supabase MCP on 2026-03-28
-- Add to migrations/ folder for repo record

-- Add route_slug column so trail pins can reference their route line
ALTER TABLE locations ADD COLUMN IF NOT EXISTS route_slug text;

-- Link existing trail pins to their routes
UPDATE locations SET route_slug = 'circuit-des-peintres'
WHERE slug = 'sentier-des-peintres';

UPDATE locations SET route_slug = 'sentier-cavaliere-des-brigands'
WHERE slug = 'sentier-cavaliere-brigands';

UPDATE locations SET route_slug = 'sentier-des-peintres-elephant'
WHERE slug = 'allee-des-vaches';

-- Verify
SELECT name, slug, route_slug FROM locations WHERE route_slug IS NOT NULL;
