# Frontend Workflow

Last updated: 2026-03-28

---

## Tool Division

| Role | Responsibility |
|---|---|
| Claude | strategy, architecture, task planning, prompts, SQL, content, review |
| Cursor | code implementation, UI iteration, component changes, page refinement |
| GPT / Grok | research, second opinions on architecture — not in the implementation loop |

Claude alone is too slow for visual iteration. Cursor handles the actual file edits and build feedback loop.  
Claude plans → Cursor implements → Claude reviews.

---

## Correct Way to Work with Cursor

Do not prompt for full rebuilds.  
Use Cursor in refinement passes:

1. Build structure once
2. Refine section by section
3. Polish visual rhythm
4. Fix errors quickly
5. Continue iterating

---

## Practical Workflow

Keep open at all times during development:

- Cursor (with the relevant files open)
- local browser preview at `http://localhost:3000`
- terminal running `npm run dev`

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

Cursor has previously introduced non-existent utility classes inside `@apply`, causing build failures.

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