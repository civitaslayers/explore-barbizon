# Frontend Workflow — Local Dev & Tailwind

Last updated: 2026-10-05

---

## Workflow

Claude (claude.ai) handles strategy, architecture, task planning, prompts,
SQL, content, and review. Implementation runs through Claude Code's agent
loop (`/run-loop`): civitas-architect plans → civitas-implementer writes the
code → civitas-release-checker reviews → human gate. There is no hand-stepped
editor in the loop — the implementer runs a scoped task to completion.

Refinement passes, not full rebuilds:

1. Build structure once
2. Refine section by section
3. Polish visual rhythm
4. Fix errors quickly
5. Continue iterating

---

## Practical Workflow

Keep open at all times during development:

- an editor with the relevant files open
- local browser preview at `http://localhost:3000`
- a terminal running `npm run dev`

---

## Local Dev Setup

### Local project path

Do not develop this project inside Google Drive or any synced folder.

Use a purely local path:

```
~/Projects/explore-barbizon
~/Documents/Projects/explore-barbizon
```

Google Drive interferes with file watching and build reliability.

### Standard startup

```bash
npm install
npm run dev
```

---

## Tailwind / Build Notes

AI-assisted edits have previously introduced non-existent utility classes inside `@apply`, causing build failures.

**Example of an invalid class that caused an error:**

```css
/* ❌ do not do this */
@apply shadow-card/60;
```

**Rules:**

- Never use invented Tailwind utility classes inside `@apply`
- Check `tailwind.config.js` before using any custom token
- Prefer valid built-in classes or direct custom CSS where needed

This is a recurring issue in AI-assisted frontend work — always verify against `tailwind.config.js` before committing.