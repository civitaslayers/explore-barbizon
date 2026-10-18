-- Story subtitles, 110-160 characters (task 77e02c3f). DRAFT, not applied. Rewritten 2026-10-18
-- through the barbizon-writing workflow: claude.ai candidates, French native edit, English
-- native edit, fact parity against the story bodies. Replaces the earlier calqued draft
-- (« sur les pas des peintres et des sentiers balisés », « l'invention de la peinture en plein air »).
-- The subtitle is also the meta description and the dek under the title (pages/stories/[slug].tsx).
-- rooms-of-light also gets the corrected French title; its English title is unchanged.
-- FR lengths 151 / 141 / 136, EN lengths 152 / 139 / 144 (Python len). The colon in the
-- paths-to-the-forest French subtitle is preceded by U+00A0.
--
-- source_hash is recomputed in the same statement with the v_translation_health formula,
-- md5(title|subtitle|body), using the NEW French title and subtitle.
--
-- STATUS: _meta.status is written as 'draft'. getLocalized() falls back to the French base
-- for a draft, so running this as is would show FRENCH on /en for these three stories.
-- On Luigi's approval, change the one 'draft' literal below to 'published', then run.
-- Gate: Luigi approves, Claude Code executes via Supabase MCP. After deploy, re-run
-- scripts/seo-audit.mjs (these three stories are its six current failures, FR and EN).

with v(slug, fr_title, fr, en) as (values
  ('rooms-of-light',
   $$Des pièces baignées de lumière dans un village forestier$$,
   $$De la maison de Millet aux hautes fenêtres nord de la Grande Rue, des intérieurs paisibles et des ateliers improvisés ont façonné le regard à Barbizon.$$,
   $$From Millet's house to the tall north-facing windows along the Grande Rue, quiet interiors and makeshift studios shaped the way Barbizon learned to see.$$),
  ('paths-to-the-forest',
   null,
   $$Des rues du village aux rochers de grès : la marche jusqu'à la forêt, sur les pas des peintres et le long des sentiers balisés par Denecourt.$$,
   $$A short map of the routes that lead from stone streets to weathered rock, in the painters' footsteps and along the trails Denecourt marked.$$),
  ('how-the-forest-became-a-picture',
   null,
   $$Avec Corot et la peinture sur le motif, Barbizon a permis de regarder longuement un même lieu, sous une lumière qui ne cesse de changer.$$,
   $$With Corot and painting from nature on the spot, Barbizon became a place where a single site could be studied at length, in ever-changing light.$$)
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
