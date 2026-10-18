# Health audit V3: Vercel Ignored Build Step (proposal, not applied)

Date: 2026-10-18. Status: proposal for Luigi. Nothing has been changed in Vercel or in the repo config.

## Problem

Every merge to `main` starts a full production build, even when the commit only adds a file under `docs/` or `brain/`. On 2026-10-18 the 19 night docs PRs (#50 to #68) produced 19 production builds with no code change. Audit V3 (docs/audits/2026-10-18-health.md) saw the same pattern on 2026-10-14 and 2026-10-16.

## Current setting

Project `civitas-command-center` (prj_RXCdaPaVsPSRfjo7xEJQfHjdQJYm) has no Ignored Build Step, and the repo has no `vercel.json`.

## Proposed command

Vercel runs the command before each build. Exit 0 skips the build, exit 1 builds.

```bash
[ -n "$VERCEL_GIT_PREVIOUS_SHA" ] && git cat-file -e "$VERCEL_GIT_PREVIOUS_SHA^{commit}" 2>/dev/null && git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" HEAD -- . ':(exclude)docs/**' ':(exclude)brain/**'
```

It compares against the last successful deployment of the branch (`VERCEL_GIT_PREVIOUS_SHA`), not against `HEAD^`. That matters because sessions often push a code commit and a brain commit together. A `HEAD^` comparison would see only the brain commit and skip a build that ships code.

It fails safe. If the variable is empty (first deployment of a branch) or the commit is missing from Vercel's shallow clone, the command exits non-zero and the build runs.

## Local test (2026-10-18, real commit ranges)

| Previous SHA | HEAD | Content | Exit | Result |
|---|---|---|---|---|
| c33cb45 | 670d3bb | the 19 docs PRs | 0 | skip |
| 670d3bb | 9292b3c | sharp upgrade (#47) | 1 | build |
| 9292b3c | b2b945e | /places code plus a brain commit (#70) | 1 | build |
| empty | b2b945e | first deployment of a branch | 1 | build |

## Where to set it

Option A, recommended: Project Settings, Ignored Build Step, behavior "Run my Bash script", paste the command. No repo change, and it is easy to remove.

Option B: a `vercel.json` with `"ignoreCommand"`. It is versioned, but it adds a config file the stack does not have today.

## Trade-offs to decide

1. **brain/ is read at run time.** `pages/api/tasks/suggest.ts` reads `brain/current-state.md` from the deployment. With `brain/**` excluded, the CCC suggest endpoint keeps the copy from the last code build until the next one. If that staleness matters, exclude `docs/**` only.
2. **Previews are skipped too.** A docs-only PR will show the Vercel check as skipped, not green. Today's merge rule for night PRs ("Vercel checks are green") would need to accept "skipped" for docs-only PRs.
3. **CLAUDE.md serverless gate.** Unaffected, since any change to code, config or locales still builds.

## Alternative without config

Merge docs PRs in one batch, for example through one staging branch, so a night's docs produce one build.
