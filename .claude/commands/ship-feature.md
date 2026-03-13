---
description: Validate, commit, push, and update brain files for completed work. Run after finishing a feature.
---

Feature being shipped: $ARGUMENTS

Run the following steps in order. Stop and report if any step fails.

**Step 1 — Typecheck**
Run `npx tsc --noEmit`.
If errors: stop, list them, fix them before proceeding.

**Step 2 — Lint**
Run `npm run lint`.
If errors: stop, list them, fix them before proceeding.

**Step 3 — Sanity checks**
- Confirm no placeholder strings are visible in user-facing pages ("Future…", "Coming soon…", "TODO", "In future iterations…")
- Confirm no secrets or tokens appear in any staged files
- Confirm `brain/current-state.md` and `brain/task-queue.md` exist and are not empty

**Step 4 — Stage and review**
Run `git status` and `git diff --staged`.
Confirm only the expected files are changed.
Do not stage `.env`, `.env.local`, or `settings.local.json`.

**Step 5 — Commit**
Commit with a clear conventional message:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation or brain file updates
- `refactor:` for code changes with no behavior change

Always append:
```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Step 6 — Push**
Run `git push`.

**Step 7 — Update brain**
Run `/update-brain` with a brief description of what was shipped.

**Step 8 — Confirm**
Report:
- ✅ or ❌ for each step
- The git commit hash
- What is now unblocked as a result of this work
