-- Location functions: French in base columns, English in translations.en (task 1a2205a7).
-- DRAFT, not applied. Mode: CORRECTION (writing guide, "Two modes"), 2026-10-18.
-- Starting point: the CURRENT rows, which hold English in the French base columns and an
-- empty translations column. Facts frozen: every label, name, number, hour, price, phone and
-- claim as in the current row. Language only: French written with the same content, English
-- corrected from it; French and English native edits in correction mode; drift check
-- against the current row.
-- Labels: a label already in French is kept exactly, in both languages. A label in English
-- in the French column gets its French form in the base column and keeps the current
-- English label in translations.en.
-- One settled change: Maison Millet opening year 1923 -> 1922 (Luigi, 2026-10-18, matches
-- the location body).
-- This replaces the 2026-10-15 text, which had different facts (departmental museum 2004,
-- Millet seasonal hours); those differences are fact flags in
-- docs/content/2026-10-18-translationese-audit.md, not edits.
-- French typography: U+00A0 before : and inside 12 h, 5 €, 2 hectares, 4 étoiles, phone.
--
-- Apply ONLY after the code change that localizes function label/description is merged
-- (task 1a2205a7, PR #48), else /en shows French.
-- STATUS: _meta.status is written as 'draft'. getLocalized() returns the French base for a
-- draft, so /en would show French. On Luigi's approval change the 'draft' literal below to
-- 'published', then claude.ai applies, one statement per call. Verify with v_translation_health.

with v(id, fl, fd, el, ed) as (values
  -- auberge-ganne
  ('95e5e010-283e-4910-b531-0a9a14fb73c9'::uuid, $$Musée de l'École de Barbizon$$, $$Musée municipal depuis 1993. Murs peints d'origine, mobilier et objets du temps de l'auberge. Collection permanente consacrée à l'École de Barbizon (1830-1870). Le témoignage le plus complet sur le mouvement dont il est issu.$$, $$Musée de l'École de Barbizon$$, $$Municipal museum since 1993. Original painted walls, furniture and objects from the days of the inn. Permanent collection devoted to the Barbizon School (1830–1870). The most complete record of the movement that produced it.$$),
  -- besharat-gallery-barbizon
  ('7e1ed0c8-ae5c-42a1-9f52-7c98fa7f16b5'::uuid, $$Galerie d'art contemporain$$, $$Collection internationale où figurent notamment Mauro Corda, Jean-François Larrieu, Eishin Yoza et Antoni Taulé. Deux jardins de sculptures. Collection permanente et expositions temporaires toute l'année.$$, $$Contemporary art gallery$$, $$International collection including work by Mauro Corda, Jean-François Larrieu, Eishin Yoza and Antoni Taulé. Two sculpture gardens. Permanent collection and temporary exhibitions all year round.$$),
  ('ad7e6957-586d-4e63-9afe-2980116eed04'::uuid, $$Suites d'art$$, $$Des chambres aménagées au cœur de la collection de la galerie. Dans chaque suite, on séjourne entouré d'œuvres de la collection permanente. Jardins de sculptures accessibles aux résidents.$$, $$Art suites$$, $$Rooms set among the gallery's collection. Each suite surrounds its guests with works from the permanent collection. Sculpture gardens open to residents.$$),
  -- ermitage-saint-antoine
  ('6d848b17-e4b4-456d-8f6c-298fa46a22a4'::uuid, $$Restaurant gastronomique$$, $$Une carte française de saison, signée Cyrine Jarretie, chef du restaurant. Produits frais, technique classique, portions généreuses. Remarqué par le Gault & Millau. Terrasse et véranda vitrée. Du jeudi au lundi : déjeuner de 12 h à 14 h 30, dîner de 19 h 30 à minuit. Réservation conseillée.$$, $$Restaurant gastronomique$$, $$A seasonal French menu by Cyrine Jarretie, the restaurant's chef. Fresh produce, classical technique, generous portions. Recognised by Gault & Millau. Terrace and glazed veranda. Thursday to Monday: lunch 12:00–14:30, dinner 19:30–midnight. Booking recommended.$$),
  ('24ff41df-ee6f-47b9-85fa-c22461a0e3df'::uuid, $$Bar à Tapas — Happy Hour — Brunch$$, $$Pour la journée et le début de soirée, une formule décontractée : planches de tapas, happy hour, brunch le week-end. Plus légère que la carte gastronomique, et sans réservation.$$, $$Bar à Tapas — Happy Hour — Brunch$$, $$By day and into the early evening, a more informal option: tapas boards, happy-hour drinks and weekend brunch. Lighter than the fine-dining menu, and open to walk-ins.$$),
  ('ca59bbde-d857-4da4-b699-ac5b380f1fa5'::uuid, $$Coffee Shop$$, $$Café du matin, ouvert dès 10 h. Café, viennoiseries et petite restauration. La façon la plus simple de découvrir l'adresse, sans réservation.$$, $$Coffee Shop$$, $$Morning café, open from 10:00. Coffee, pastries and light bites. The easiest way to try the place, with no booking needed.$$),
  ('270ec9b7-ba7b-4d57-845a-7d79cd23d8a5'::uuid, $$L'Autre Nuit — Bar$$, $$Bar de nuit au sous-sol. L'adresse du village qui ferme le plus tard : elle prend le relais à la fin du dîner servi à l'étage. Cocktails et vins jusqu'à minuit.$$, $$L'Autre Nuit — Bar$$, $$Night bar in the basement. The last place in the village to close: it takes over when dinner upstairs ends. Cocktails and wine until midnight.$$),
  ('1c59a983-2d2a-4c2d-909f-ed197f73a06b'::uuid, $$La Boutique par Cyrine Jarretie$$, $$Épicerie fine attenante au restaurant. Vins, produits du terroir et plats cuisinés. Ouverte tous les jours de 10 h à 21 h, y compris les jours de fermeture du restaurant. Tél. : 01 64 71 00 26.$$, $$La Boutique par Cyrine Jarretie$$, $$Épicerie fine attached to the restaurant. Wine, local produce and prepared dishes. Open daily 10:00–21:00, including days when the restaurant is closed. Tel: 01 64 71 00 26.$$),
  -- hotellerie-bas-breau
  ('bf05e76c-198d-43f3-85fb-fe928b359aeb'::uuid, $$Hôtel 4 étoiles et restaurant$$, $$Hôtel historique dans un parc ombragé de 2 hectares, en lisière de la forêt de Fontainebleau. Restaurant, terrasse et accès direct à la forêt.$$, $$4-star hotel and restaurant$$, $$Historic hotel in a shaded 2-hectare park on the edge of the Forest of Fontainebleau. Restaurant, terrace and direct access to the forest.$$),
  -- la-juxtaposition
  ('47c65931-ffcf-43b5-9435-1c17022f633a'::uuid, $$Salon de thé, boutique et galerie$$, $$Remarqué par le Gault & Millau. Pâtisseries maison, 20 variétés de thé, expositions renouvelées. Une salle chaleureuse et une terrasse.$$, $$Salon de thé, boutique and gallery$$, $$Recognised by Gault & Millau. Home-made pastries, 20 varieties of tea, changing exhibitions. A cosy room and a terrace.$$),
  -- lesquisse
  ('1653639b-dd5f-481a-9e57-10521296c37a'::uuid, $$Hôtel et bar$$, $$Neuf chambres et suites, chacune consacrée à un artiste impressionniste européen et à son pays (un Norvégien, un Hongrois, un Écossais). Chacun de ces artistes a vu son œuvre marquée par un séjour à Barbizon ou à Fontainebleau. Matériaux biosourcés, pas de climatisation, chambres avec accès privatif au jardin. Bar-salon ouvert aux clients et aux visiteurs. Petit-déjeuner en chambre, au café ou en terrasse.$$, $$Hotel and bar$$, $$Nine rooms and suites, each dedicated to a European Impressionist artist and their country (a Norwegian, a Hungarian, a Scot). Each artist's work was shaped by time spent in Barbizon or Fontainebleau. Bio-based materials, no air conditioning, rooms with private garden access. Lounge bar open to guests and visitors. Breakfast served in the room, at the café or on the terrace.$$),
  ('4aafd863-2de3-4740-8b2f-9b6f5195ed3e'::uuid, $$Musée de l'Esquisse$$, $$Un musée qui retrace l'histoire des colonies d'artistes en Europe et le rayonnement de l'École de Barbizon hors de France. Collection permanente prêtée par des institutions de toute l'Europe, dont le Museum Domburg (Pays-Bas), sous le commissariat de Francisca van Vloten. Expositions temporaires renouvelées tous les quatre mois, chacune consacrée à un pays et à sa colonie. Ouvert tous les jours de 11 h à 18 h. Entrée libre.$$, $$Musée de l'Esquisse$$, $$A museum tracing the history of artists' colonies in Europe and the influence of the Barbizon School beyond France. Permanent collection on loan from institutions across Europe, including the Museum Domburg (Netherlands), curated by Francisca van Vloten. Temporary exhibitions every four months, each devoted to one country and its colony. Open daily 11:00–18:00. Free admission.$$),
  -- maison-millet
  ('dfbef7da-dfc6-42dd-8383-dec99de90fee'::uuid, $$Musée Millet$$, $$Musée privé ouvert au public depuis 1922. L'atelier, la salle à manger, la cuisine et la galerie L'Angélus. Objets personnels, dessins, études préparatoires et un autoportrait. Ouvert tous les jours sauf le mardi. Entrée 5 €, enfants 4 €.$$, $$Musée Millet$$, $$Private museum open to the public since 1922. The studio, dining room and kitchen, and the L'Angélus gallery. Personal belongings, drawings, preparatory studies and a self-portrait. Open daily except Tuesdays. Admission €5, children €4.$$),
  -- valet-des-fromages
  ('ea359c17-f726-462c-aacb-6185d468f095'::uuid, $$Fromagerie$$, null, $$Fromagerie$$, null),
  ('4f25eac0-740e-4e99-a921-3b55bc589bb0'::uuid, $$Restaurant$$, null, $$Restaurant$$, null)
)
update location_functions lf set label = v.fl, description = v.fd,
  translations = coalesce(lf.translations, '{}'::jsonb) || jsonb_build_object('en',
    jsonb_strip_nulls(jsonb_build_object('label', v.el, 'description', v.ed)) ||
    jsonb_build_object('_meta', jsonb_build_object('source_hash', md5(coalesce(v.fl,'') || '|' || coalesce(v.fd,'')), 'translated_at', now(), 'status', 'draft')))
from v where lf.id = v.id
returning lf.id, lf.label, lf.translations->'en'->'_meta'->>'status' as en_status
