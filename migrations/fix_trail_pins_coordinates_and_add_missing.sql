-- Migration: fix trail pin coordinates and add missing trail pins
-- Applied directly via Supabase MCP on 2026-03-28
-- Add to migrations/ folder for repo record

-- Fix Allee des Vaches: correct start point of Sentier de l'Elephant (forest trailhead)
UPDATE locations SET
  latitude = 48.442829,
  longitude = 2.612654
WHERE slug = 'allee-des-vaches';

-- Fix Futaie du Bas-Breau: it's a different location entirely — forest area near Bas Bréau
UPDATE locations SET
  latitude = 48.44380,
  longitude = 2.61520
WHERE slug = 'futaie-bas-breau';

-- Fix Sentier de la Cavaliere: use its actual route start point
UPDATE locations SET
  latitude = 48.43617,
  longitude = 2.62688,
  route_slug = 'sentier-cavaliere-des-brigands'
WHERE slug = 'sentier-cavaliere-brigands';

-- Fix Sentier bleu no.6: Gorges d'Apremont entry point
UPDATE locations SET
  latitude = 48.43880,
  longitude = 2.60840
WHERE slug = 'sentier-bleu-gorges-apremont';

-- Fix Parcours FB: trailhead at La Faisanderie
UPDATE locations SET
  latitude = 48.44062,
  longitude = 2.62100
WHERE slug = 'parcours-fb';

-- Add missing pin: Dormoir de Lantara (route start point)
INSERT INTO locations (town_id, category_id, name, slug, short_description, latitude, longitude, is_published, show_on_map, route_slug)
SELECT
  t.id,
  c.id,
  'Sentier du Dormoir de Lantara',
  'sentier-dormoir-lantara',
  'A quiet forest loop named for the painter Simon Lantara, said to have slept beneath its sandstone rocks. 1.9km, easy.',
  48.440643,
  2.624549,
  true,
  true,
  'sentier-dormoir-de-lantara'
FROM towns t, categories c
WHERE t.name = 'Barbizon'
AND c.name = 'Trail'
AND c.town_id = t.id;

-- Add missing pin: Parcours des Mosaïques (starts at west end of Grande Rue)
INSERT INTO locations (town_id, category_id, name, slug, short_description, latitude, longitude, is_published, show_on_map, route_slug)
SELECT
  t.id,
  c.id,
  'Parcours des Mosaïques',
  'parcours-mosaiques',
  'Walk the full length of Grande Rue past ceramic mosaics reproducing the paintings that made Barbizon famous. 870m, very easy.',
  48.44640,
  2.60171,
  true,
  true,
  'parcours-des-mosaiques'
FROM towns t, categories c
WHERE t.name = 'Barbizon'
AND c.name = 'Trail'
AND c.town_id = t.id;

-- Verify
SELECT name, slug, latitude, longitude, route_slug
FROM locations
WHERE slug IN (
  'allee-des-vaches','futaie-bas-breau','sentier-cavaliere-brigands',
  'sentier-bleu-gorges-apremont','parcours-fb','sentier-dormoir-lantara','parcours-mosaiques'
)
ORDER BY name;
