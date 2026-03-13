# Frontend Workflow

Source: extracted from MAIN_BRAIN.md
Last updated: March 2026

---

## Tool Division

Using Claude alone for visual website design is too slow and does not produce the desired level of contemporary refinement.

**Recommended division:**
- ChatGPT / Claude = strategy, structure, copy, feature planning, prompts
- Cursor = actual code implementation, UI iteration, component changes, page refinement

---

## Correct Way to Work with Cursor

Do not keep prompting for full rebuilds.
Use Cursor in refinement passes:

1. Build structure once
2. Refine section by section
3. Polish visual rhythm
4. Fix errors quickly
5. Continue iterating

---

## Practical Workflow

Keep open at all times during development:
- Cursor
- local browser preview
- terminal running `npm run dev`

---

## Local Dev Setup

### Local project warning
Do not actively develop this project inside Google Drive or similar synced folders.

Use a purely local path such as:
- `~/Projects/explore-barbizon`
- `/Users/.../Documents/Projects/explore-barbizon`

**Why:** Google Drive interfered with local dev behavior and likely with file watching / build reliability.

### Standard startup flow
From the local project folder:
```
npm install
npm run dev
```
Then open `http://localhost:3000`

---

## Tailwind / Build Notes

A Tailwind build error occurred due to Cursor introducing a non-existent utility class inside `@apply`.

**Example invalid class that caused an error:**
- `shadow-card/60`

**Resolution principle:**
- Avoid invented Tailwind utility classes inside `@apply`
- Prefer valid built-in classes or direct custom CSS where needed

This is a recurring caution for AI-assisted front-end work.
