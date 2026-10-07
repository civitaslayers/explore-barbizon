# Repo Map

pages/
  index.tsx → homepage
  map.tsx → map view
  places/
    index.tsx → places list
    [slug].tsx → place page
  tours/
    [slug].tsx → tour page
  stories/
    index.tsx → stories index

components/
  map/
  places/
  ui/

lib/
  supabase/
  mapbox/

data/
  temporary static data

scripts/
  Plain Node .mjs utilities, linted by eslint and tested via `npm test` (node --test).
  `check-i18n-strings.mjs` (npm run check:i18n — FR typography + FR/EN key parity),
  `seo-audit.mjs` (npm run seo-audit), `upload-media.mjs` (npm run upload-media — R2
  + `media` rows ingest), `upload-to-r2.mjs`, `run-task.js` (npm run task), and
  `bootstrap-worktree.mjs` — `npm run worktree:bootstrap -- <path>`; symlinks main
  node_modules and copies .env.local (600) into a fresh worktree; idempotent;
  refuses non-worktrees. Pure helpers live in `bootstrap-worktree.lib.mjs`.

brain/
  project memory
