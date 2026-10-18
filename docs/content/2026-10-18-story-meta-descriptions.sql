-- Story subtitles, 110-160 characters (task 77e02c3f). DRAFT, not applied.
-- Mode: CORRECTION (writing guide, "Two modes"). Starting point: Luigi's versions of
-- 2026-10-18, lengthened only with details already in each story's own body; French and
-- English native edits in correction mode; checked against the current rows and bodies.
-- Nothing added for parity (the Grande Rue is in the English rooms-of-light subtitle and
-- its English body, not in the French).
-- The subtitle is also the meta description and the dek under the title (pages/stories/[slug].tsx).
-- rooms-of-light also gets the French title « Des pièces baignées de lumière dans un village
-- forestier » (Luigi's version); the English title is unchanged.
-- Lengths FR 156 / 148 / 145, EN 157 / 139 / 156 (Python len). U+00A0 before the French colons.
--
-- source_hash is recomputed in the same statement with the v_translation_health formula,
-- md5(title|subtitle|body), from the NEW French title and subtitle.
--
-- STATUS: _meta.status is written as 'draft'. getLocalized() falls back to the French base
-- for a draft, so running this as is would show FRENCH on /en for these three stories.
-- On Luigi's approval, change the one 'draft' literal below to 'published', then run.
-- Gate: Luigi approves, Claude Code executes via Supabase MCP. After deploy, re-run
-- scripts/seo-audit.mjs (these three stories are its six current failures, FR and EN).

with v(slug, fr_title, fr, en) as (values
  ('rooms-of-light',
   $$Des pièces baignées de lumière dans un village forestier$$,
   $$Sur les intérieurs paisibles et les ateliers improvisés qui ont façonné la manière de voir à Barbizon, de la maison de Millet aux hautes fenêtres côté nord.$$,
   $$On the quiet interiors and makeshift studios that shaped how Barbizon learned to see, from Millet's house to the tall north-facing windows on the Grande Rue.$$),
  ('paths-to-the-forest',
   null,
   $$Des rues du village aux rochers de grès : les chemins qui mènent à la forêt, sur les pas des peintres et le long des sentiers balisés par Denecourt.$$,
   $$A short map of the routes that lead from stone streets to weathered rock, in the painters' footsteps and along the trails Denecourt marked.$$),
  ('how-the-forest-became-a-picture',
   null,
   $$Corot, la peinture sur le motif et ce que Barbizon a rendu possible : regarder longuement un même lieu, sous une lumière qui ne cesse de changer.$$,
   $$Corot, the practice of painting from the motif, and what Barbizon made possible: looking at one place for a long time, in a light that never stops changing.$$)
)
update stories s set
  title = coalesce(v.fr_title, s.title),
  subtitle = v.fr,
  translations = jsonb_set(
    jsonb_set(s.translations, '{en,subtitle}', to_jsonb(v.en)),
    '{en,_meta}',
    coalesce(s.translations->'en'->'_meta', '{}'::jsonb) || jsonb_build_object(
      'source_hash', md5(coalesce(v.fr_title, s.title, '') || '|' || v.fr || '|' || coalesce(s.body, '')),
      'translated_at', now(),
      'status', 'draft')),
  updated_at = now()
from v where s.slug = v.slug
returning s.slug, s.title, length(s.subtitle) as fr_len, length(s.translations->'en'->>'subtitle') as en_len,
  s.translations->'en'->'_meta'->>'status' as en_status;
