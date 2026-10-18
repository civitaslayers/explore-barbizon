-- Story subtitles lengthened to 110-160 characters (task 77e02c3f, DRAFT, not applied).
-- The meta description of a story page is its subtitle (pages/stories/[slug].tsx, dek),
-- so this also changes the visible dek under each story title.
-- source_hash is recomputed with the v_translation_health formula, md5(title|subtitle|body),
-- so the EN rows stay "current" rather than flipping to "stale".
-- Gate: Luigi approves, Claude Code executes via Supabase MCP. Verify with seo-audit.mjs after deploy.

with v(slug, fr, en) as (values
  ('rooms-of-light',
   $$Sur les intérieurs discrets et les ateliers de fortune qui ont façonné la manière de voir de Barbizon, de la maison de Millet aux fenêtres côté nord.$$,
   $$On the quiet interiors and improvised studios that shaped Barbizon's way of looking, from Millet's house to the tall north-facing windows of the Grande Rue.$$),
  ('paths-to-the-forest',
   $$Une courte cartographie des chemins qui mènent des rues pavées aux grès usés par le temps, sur les pas des peintres et des sentiers balisés par Denecourt.$$,
   $$A short cartography of the routes that lead from stone streets to weathered rock, in the footsteps of the painters and along the trails Denecourt marked.$$),
  ('how-the-forest-became-a-picture',
   $$Sur Corot, l'invention de la peinture en plein air, et ce que Barbizon a rendu possible : une attention patiente à un lieu précis, dans une lumière changeante.$$,
   $$On Corot, the invention of painting outdoors, and what Barbizon made possible: a patient attention to one particular place, in light that keeps changing.$$)
)
update stories s set
  subtitle = v.fr,
  translations = jsonb_set(
    jsonb_set(s.translations, '{en,subtitle}', to_jsonb(v.en)),
    '{en,_meta,source_hash}',
    to_jsonb(md5(coalesce(s.title,'') || '|' || v.fr || '|' || coalesce(s.body,'')))),
  updated_at = now()
from v where s.slug = v.slug
returning s.slug, length(s.subtitle) as fr_len, length(s.translations->'en'->>'subtitle') as en_len;
