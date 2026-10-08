// ---------------------------------------------------------------------------
// lib/storyMarkdown.ts
//
// The single place marked is configured for story bodies
// (pages/stories/[slug].tsx). Pure and deterministic so it is identical on
// the server render and on client hydration, and testable under node --test.
//
// stories.body is DB markdown. marked v17 passes raw HTML through untouched
// and does not check link/image URL schemes, so unsanitised DB markdown is
// arbitrary HTML. Decision (brain/decisions.md, 2026-10-08): no live story
// body contains an HTML tag, so raw HTML is escaped to visible literal text
// (not stripped), and link/image URLs are allowlisted. Revisit with an
// allowlist sanitiser only if a future story genuinely needs inline HTML.
//
// Uses a dedicated Marked instance — never marked.use() — so the global
// `marked` export is not mutated for any other importer.
// ---------------------------------------------------------------------------

import { Marked, type Token, type Tokens } from "marked";
import { escapeHtml } from "./popupHtml.ts";

// Positive allowlist on the raw, undecoded href. Everything else — javascript:,
// data:, vbscript:, entity-encoded schemes (&#106;avascript:), leading
// whitespace or control characters, scheme-less "www.example.com",
// protocol-relative "//evil.example" or "/\evil.example" (a single "/" must
// not be followed by another "/" or a backslash, which some browsers normalise
// to "/") — falls through to text-only output. A blocklist would have to
// anticipate every encoding trick; an allowlist does not.
const SAFE_URL = /^(?:https?:\/\/|mailto:|\/(?![\/\\])|#|\.\.?\/)/i;

function safeUrl(href: string): string | null {
  if (!SAFE_URL.test(href)) return null;
  try {
    // Mirrors marked's own cleanUrl so accepted links stay byte-identical.
    return encodeURI(href).replace(/%25/g, "%");
  } catch {
    return null; // lone surrogate — encodeURI throws
  }
}

const storyMarked = new Marked({
  breaks: true,
  gfm: true,
  // marked's raw-block passthrough — DO NOT REMOVE. When the inline tokenizer
  // meets an opener matching /^<(pre|code|kbd|script)(\s|>)/i it sets
  // lexer.state.inRawBlock = true and, until the matching closer, every
  // inline text token is emitted with `escaped: true`; the default
  // Renderer.text then returns such text UNESCAPED. The html() override below
  // escapes the opener tag itself but cannot reset that lexer state, so any
  // later "<img/src=x onerror=…>" (anything marked's tag regex rejects) would
  // reach the page raw — for the rest of the document, across paragraphs,
  // lists, headings, tables and blockquotes. Clearing the flag here, before
  // rendering, makes marked's own entity-preserving text escaper run on every
  // text token, so "<" / ">" / "&" always come out as entities.
  walkTokens(token: Token) {
    if (token.type === "text" && "escaped" in token) {
      (token as Tokens.Text).escaped = false;
    }
  },
  renderer: {
    // Raw HTML — block or inline, including comments — becomes visible
    // literal text. The token text is unescaped source, so the full escaper
    // (& always -> &amp;) is correct and cannot double-escape: nothing has
    // escaped this string before us. `'` unescaped is fine: text context only.
    html({ text }: Tokens.HTML | Tokens.Tag): string {
      return escapeHtml(text);
    },
    link({ href, title, tokens }: Tokens.Link): string {
      // Link text goes through the normal pipeline (marked's own text
      // escaping, entity-preserving; nested raw HTML hits html() above).
      const inner = this.parser.parseInline(tokens);
      const url = safeUrl(href);
      if (url === null) return inner; // same shape as marked's cleanUrl-null path
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${escapeHtml(url)}"${titleAttr}>${inner}</a>`;
    },
    image({ href, title, text, tokens }: Tokens.Image): string {
      const alt = tokens
        ? this.parser.parseInline(tokens, this.parser.textRenderer)
        : text;
      const url = safeUrl(href);
      if (url === null) return escapeHtml(alt); // marked's null path: alt as text
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"${titleAttr}>`;
    },
  },
});

export function renderStoryMarkdown(markdown: string): string {
  if (!markdown) return "";
  return storyMarked.parse(markdown, { async: false });
}
