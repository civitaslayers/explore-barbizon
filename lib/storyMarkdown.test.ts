// ---------------------------------------------------------------------------
// lib/storyMarkdown.test.ts
//
// Unit tests for renderStoryMarkdown (lib/storyMarkdown.ts): raw HTML in DB
// markdown must become visible literal text, link/image URLs must pass a
// positive scheme allowlist, and ordinary markdown (headings, emphasis,
// lists, breaks, FR typography, safe links) must render exactly as the
// previous inline `marked(body, { breaks: true, gfm: true })` call did.
// Run with `npm test` (`node --test lib/storyMarkdown.test.ts`).
// ---------------------------------------------------------------------------

import test from "node:test";
import assert from "node:assert/strict";
import { marked } from "marked";
import { renderStoryMarkdown } from "./storyMarkdown.ts";

// --- Hostile inputs --------------------------------------------------------

test("M-H1: block <script> becomes literal text between paragraphs", () => {
  const out = renderStoryMarkdown("Avant\n\n<script>alert(1)</script>\n\nAprès");
  assert.ok(!/<script/i.test(out));
  assert.ok(out.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(out.includes("<p>Avant</p>"));
  assert.ok(out.includes("<p>Après</p>"));
});

test("M-H2: inline <img onerror> becomes literal text", () => {
  const out = renderStoryMarkdown("Bonjour <img src=x onerror=alert(1)> monde");
  assert.ok(!out.includes("<img"));
  assert.ok(out.includes("Bonjour &lt;img src=x onerror=alert(1)&gt; monde"));
});

test("M-H3: HTML comments (inline and block) are escaped, not hidden", () => {
  const inline = renderStoryMarkdown("Texte <!-- caché --> suite");
  const block = renderStoryMarkdown("<!--\nbloc\n-->");
  assert.ok(!inline.includes("<!--"));
  assert.ok(!block.includes("<!--"));
  assert.ok(inline.includes("&lt;!--"));
  assert.ok(block.includes("&lt;!--"));
});

test("M-H4: raw HTML whose source already holds an entity shows the exact source", () => {
  const out = renderStoryMarkdown('<a href="?a=1&amp;b=2">x</a>');
  assert.ok(
    out.includes("&lt;a href=&quot;?a=1&amp;amp;b=2&quot;&gt;x&lt;/a&gt;"),
    out,
  );
});

test("M-H5: dangerous or scheme-less link hrefs render text only", () => {
  const inputs = [
    "[clic](javascript:alert(1))",
    "[clic](JavaScript:alert(1))",
    "[clic](vbscript:x)",
    "[clic](data:text/html;base64,PHNjcmlwdD4=)",
    "[clic](&#106;avascript:alert(1))",
    "[clic](www.example.com)",
  ];
  for (const input of inputs) {
    const out = renderStoryMarkdown(input);
    assert.ok(!out.includes("href="), `${input} -> ${out}`);
    assert.ok(out.includes("clic"), `${input} -> ${out}`);
  }
});

test("M-H5b: protocol-relative href (//host) renders text only", () => {
  const out = renderStoryMarkdown("[x](//evil.example/x)");
  assert.ok(!out.includes("href="), out);
  assert.ok(out.includes("x"));
});

test("M-H6: dangerous image srcs render alt text only", () => {
  for (const input of [
    "![alt](javascript:alert(1))",
    "![alt](data:image/svg+xml;base64,AAAA)",
  ]) {
    const out = renderStoryMarkdown(input);
    assert.ok(!out.includes("<img"), `${input} -> ${out}`);
    assert.ok(out.includes("alt"), `${input} -> ${out}`);
  }
});

test("M-H7: reference-style link with javascript: definition", () => {
  const out = renderStoryMarkdown("[x][r]\n\n[r]: javascript:alert(1)");
  assert.ok(!out.includes("href="), out);
  assert.ok(out.includes("x"));
});

test("M-H8: autolink form <javascript:...> emits neither href nor raw tag", () => {
  const out = renderStoryMarkdown("<javascript:alert(1)>");
  assert.ok(!out.includes("href="), out);
  assert.ok(!out.includes("<javascript"), out);
});

test("M-H9: raw HTML inside link text is escaped, link kept", () => {
  const out = renderStoryMarkdown("[<b>x</b>](https://ex.com)");
  assert.ok(
    out.includes('<a href="https://ex.com">&lt;b&gt;x&lt;/b&gt;</a>'),
    out,
  );
});

test("M-H10: a quote inside a link title cannot break the attribute", () => {
  const out = renderStoryMarkdown('[t](https://ex.com "a\\"b")');
  assert.ok(out.includes('title="a&quot;b"'), out);
});

// --- Raw-block passthrough (marked's inRawBlock state) ---------------------
//
// An inline <pre>/<code>/<kbd>/<script> opener puts marked's lexer into
// "raw block" mode: subsequent text tokens are flagged escaped:true and the
// default text renderer emits them verbatim. Anything the tag regex rejects
// ("<img/src=x …>") would then reach the page raw. These cases pin the
// walkTokens fix in lib/storyMarkdown.ts.

const RAW_TAG = /<(img|svg|a|b)\//i;

test("M-H11: inline <script> opener then <img/…> on the same line is escaped", () => {
  const out = renderStoryMarkdown("Texte <script><img/src=x onerror=alert(1)>");
  assert.ok(!RAW_TAG.test(out), out);
  assert.ok(out.includes("&lt;script&gt;&lt;img/src=x onerror=alert(1)&gt;"), out);
});

test("M-H12: <pre>, <code>, <kbd>, <SCRIPT>, <script type=x> openers are all neutralised", () => {
  const cases: Array<[string, string]> = [
    ["Texte <pre><img/src=x onerror=alert(1)>", "&lt;img/src=x"],
    ["Texte <code><svg/onload=alert(1)>", "&lt;svg/onload=alert(1)&gt;"],
    ['Texte <kbd><a/href="javascript:alert(1)">clic</a>', "&lt;a/href="],
    ["Texte <SCRIPT><img/src=x onerror=alert(1)>", "&lt;img/src=x"],
    ["Texte <script type=x><img/src=x onerror=alert(1)>", "&lt;img/src=x"],
  ];
  for (const [input, expected] of cases) {
    const out = renderStoryMarkdown(input);
    assert.ok(!RAW_TAG.test(out), `${input} -> ${out}`);
    // No raw <a> element at all (the escaped literal text still reads "href=").
    assert.ok(!/<a[\s/>]/i.test(out), `${input} -> ${out}`);
    assert.ok(out.includes(expected), `${input} -> ${out}`);
  }
});

test("M-H13: raw-block state does not leak into later paragraphs or list items", () => {
  const out = renderStoryMarkdown(
    "Intro <script>\n\nDeuxième paragraphe <img/src=x onerror=alert(1)> fin\n\n- item <b/onclick=alert(1)>x",
  );
  assert.ok(!RAW_TAG.test(out), out);
  assert.ok(out.includes("<p>Intro &lt;script&gt;</p>"), out);
  assert.ok(
    out.includes("<p>Deuxième paragraphe &lt;img/src=x onerror=alert(1)&gt; fin</p>"),
    out,
  );
  assert.ok(out.includes("<li>item &lt;b/onclick=alert(1)&gt;x</li>"), out);
});

test("M-H14: opener inside emphasis, link text, heading, table cell, blockquote", () => {
  const cases: Array<[string, string]> = [
    ["**<script>**<img/src=x onerror=alert(1)>", "<strong>&lt;script&gt;</strong>&lt;img/src=x onerror=alert(1)&gt;"],
    [
      "[<script><img/src=x onerror=alert(1)>](https://ex.com)",
      '<a href="https://ex.com">&lt;script&gt;&lt;img/src=x onerror=alert(1)&gt;</a>',
    ],
    ["# T <script><img/src=x onerror=alert(1)>", "T &lt;script&gt;&lt;img/src=x onerror=alert(1)&gt;</h1>"],
    ["| a |\n|---|\n| <script><img/src=x onerror=alert(1)> |", "<td>&lt;script&gt;&lt;img/src=x onerror=alert(1)&gt;</td>"],
    ["> q <script><img/src=x onerror=alert(1)>", "q &lt;script&gt;&lt;img/src=x onerror=alert(1)&gt;"],
  ];
  for (const [input, expected] of cases) {
    const out = renderStoryMarkdown(input);
    assert.ok(!RAW_TAG.test(out), `${input} -> ${out}`);
    assert.ok(out.includes(expected), `${input} -> ${out}`);
  }
});

test("M-H15: plain < > & after an inline <script> opener are still escaped", () => {
  const out = renderStoryMarkdown("Texte <script> 1 < 2 > 0 & co");
  assert.ok(out.includes("&lt;script&gt; 1 &lt; 2 &gt; 0 &amp; co"), out);
  assert.ok(!out.includes(" 1 < 2 "), out);
});

test("M-H16: backslash after a single slash in href renders text only", () => {
  const out = renderStoryMarkdown("[x](/\\evil.example/x)");
  assert.ok(!out.includes("href="), out);
  assert.ok(out.includes("x"), out);
});

test("M-H17: walkTokens fix keeps M-F6 byte-equality and M-F4 no-double-escape", () => {
  const body =
    "## Sous-titre\n\nUn **paragraphe** avec un [lien](/places/auberge-ganne) et une\nligne suivante.\n\n- a\n- b";
  assert.equal(renderStoryMarkdown(body), marked(body, { breaks: true, gfm: true }));
  const entities = renderStoryMarkdown("Texte &amp; &lt;script&gt; fin");
  assert.ok(entities.includes("&amp; &lt;script&gt; fin"), entities);
  assert.ok(!entities.includes("&amp;lt;"), entities);
  assert.ok(!entities.includes("&amp;amp;"), entities);
});

// --- Feature preservation --------------------------------------------------

test("M-F1: headings, emphasis, lists, blockquote, strikethrough, tables", () => {
  const out = renderStoryMarkdown(
    "# Titre\n\n**gras** et *italique*\n\n- un\n- deux\n\n> citation\n\n~~barré~~\n\n| a | b |\n|---|---|\n| 1 | 2 |",
  );
  for (const needle of [
    "<h1>",
    "<strong>gras</strong>",
    "<em>italique</em>",
    "<ul>",
    "<li>un</li>",
    "<blockquote>",
    "<del>barré</del>",
    "<table>",
  ]) {
    assert.ok(out.includes(needle), `missing ${needle} in ${out}`);
  }
});

test("M-F2: single newlines become <br> (breaks: true)", () => {
  assert.ok(renderStoryMarkdown("ligne un\nligne deux").includes("<br>"));
});

test("M-F3: French typography with NBSP is byte-exact", () => {
  const out = renderStoryMarkdown("« Bonjour »\u00a0: été\u00a0!");
  assert.ok(out.includes("« Bonjour »\u00a0: été\u00a0!"), out);
});

test("M-F4: entities already in source are not double-escaped", () => {
  const out = renderStoryMarkdown("Texte &amp; &lt;script&gt; fin");
  assert.ok(out.includes("&amp; &lt;script&gt; fin"), out);
  assert.ok(!out.includes("&amp;lt;"), out);
  assert.ok(!out.includes("&amp;amp;"), out);
});

test("M-F5: safe link forms keep their href", () => {
  const cases: Array<[string, string]> = [
    ["[Musée](/places/musee-de-barbizon)", '<a href="/places/musee-de-barbizon">Musée</a>'],
    ["[x](/places/maison-millet)", '<a href="/places/maison-millet">x</a>'],
    ["[m](mailto:info@example.com)", 'href="mailto:info@example.com"'],
    ["[a](#ancre)", 'href="#ancre"'],
    ["[r](../a)", 'href="../a"'],
    ["<https://example.com/a?b=1&c=2>", 'href="https://example.com/a?b=1&amp;c=2"'],
    ["https://example.com", 'href="https://example.com"'],
    ['[t](https://ex.com "Le « titre »")', 'title="Le « titre »"'],
    ["[c](https://ex.com/château)", 'href="https://ex.com/ch%C3%A2teau"'],
  ];
  for (const [input, expected] of cases) {
    const out = renderStoryMarkdown(input);
    assert.ok(out.includes(expected), `${input} -> ${out}`);
  }
});

test("M-F6: benign body is byte-identical to the previous call site", () => {
  const body =
    "## Sous-titre\n\nUn **paragraphe** avec un [lien](/places/auberge-ganne) et une\nligne suivante.\n\n- a\n- b";
  assert.equal(
    renderStoryMarkdown(body),
    marked(body, { breaks: true, gfm: true }),
  );
});

test("M-F7: empty input renders empty string", () => {
  assert.equal(renderStoryMarkdown(""), "");
});

test("M-F8: deterministic across calls (SSR/CSR proxy)", () => {
  const input = "Bonjour <img src=x onerror=alert(1)> monde";
  assert.equal(renderStoryMarkdown(input), renderStoryMarkdown(input));
});
