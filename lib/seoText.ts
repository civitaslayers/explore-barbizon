// ---------------------------------------------------------------------------
// lib/seoText.ts
//
// Pure length helpers for the two SEO meta tags: `truncateDescription` for
// <meta name="description"> / og:description (rendered by
// components/SeoHead.tsx) and `buildTitle` for detail-page <title> values
// (built at the call sites — the suffix choice is page knowledge).
//
// The yardstick is scripts/seo-audit.mjs: description 110–160 chars, title
// 30–60 chars. Lengths here are JS `.length` (UTF-16 code units) so they
// agree with what the audit measures. Too-short text is never padded or
// generated — that is authored content, not a code path.
//
// Kept free of React/Next imports so `node --test` can import it
// (lib/seoText.test.ts). Never add one.
// ---------------------------------------------------------------------------

export const DESCRIPTION_LIMIT = 160; // audit upper bound: ≤ this is returned unchanged
export const DESCRIPTION_CUT = 155; // result length ceiling when we do cut (incl. the ellipsis)
export const DESCRIPTION_MIN = 110; // audit lower bound: only used to decide whether a cosmetic rebalance is affordable
export const TITLE_MAX = 60;

const ELLIPSIS = "…"; // one UTF-16 unit

// Dangling opener, dash, trailing punctuation, or (non-)breaking space left at
// the end of a cut. The apostrophe is deliberately not stripped (French
// elision `l'` can't end a token at a space boundary anyway).
const TRAILING_JUNK = /[   ,;:.!?\-–—(«“"]+$/;

const BALANCED_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["«", "»"],
  ["(", ")"],
  ["“", "”"],
];

function countChar(text: string, ch: string): number {
  let n = 0;
  for (let i = 0; i < text.length; i += 1) if (text[i] === ch) n += 1;
  return n;
}

function stripTrailing(text: string): string {
  return text.replace(TRAILING_JUNK, "");
}

// Hard cut at `end` UTF-16 units, never splitting a surrogate pair.
function hardCut(text: string, end: number): string {
  let cut = end;
  const code = text.charCodeAt(cut - 1);
  if (code >= 0xd800 && code <= 0xdbff) cut -= 1;
  return text.slice(0, cut);
}

export function truncateDescription(
  text: string,
  limit: number = DESCRIPTION_LIMIT,
  cutTo: number = DESCRIPTION_CUT,
): string {
  // Collapse only ASCII whitespace — never `\s`, which would also match
  // U+00A0 / U+202F and destroy the French non-breaking spaces before
  // `: ; ! ?` and inside `« »`.
  const clean = text.replace(/[ \t\r\n\f\v]+/g, " ").trim();
  if (clean.length <= limit) return clean;

  // Word-boundary cut: last ASCII space at or before cutTo - 1, leaving one
  // unit for the ellipsis. NBSP is deliberately not a boundary.
  const cut = clean.lastIndexOf(" ", cutTo - 1);
  if (cut < 1) {
    // No space in the first cutTo chars: the only case where a word is cut.
    return hardCut(clean, cutTo - 1) + ELLIPSIS;
  }

  let head = stripTrailing(clean.slice(0, cut));

  // Balance: drop a dangling opener and what follows it, but only if the
  // result still clears the audit floor — an unclosed quote is cosmetic,
  // falling under 110 is a measurable failure.
  for (const [open, close] of BALANCED_PAIRS) {
    if (countChar(head, open) > countChar(head, close)) {
      const candidate = stripTrailing(head.slice(0, head.lastIndexOf(open)));
      if (candidate.length >= DESCRIPTION_MIN) head = candidate;
    }
  }

  if (head.length === 0) head = hardCut(clean, cutTo - 1);

  return head + ELLIPSIS;
}

// Returns `base + s` for the first suffix `s` (in order) that keeps the total
// ≤ max, else the bare `base`. The base is never cut, even when it is already
// longer than `max`.
export function buildTitle(
  base: string,
  suffixes: readonly string[],
  max: number = TITLE_MAX,
): string {
  const trimmed = base.trim();
  for (const suffix of suffixes) {
    const candidate = trimmed + suffix;
    if (candidate.length <= max) return candidate;
  }
  return trimmed;
}
