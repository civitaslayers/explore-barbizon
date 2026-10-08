// ---------------------------------------------------------------------------
// lib/jsonLd.ts
//
// Serialises a JSON-LD object for injection into
// <script type="application/ld+json"> (components/SeoHead.tsx).
//
// JSON.stringify leaves < > & intact, so a DB-sourced string containing
// "</script>" would close the element and the remainder would render as page
// HTML. HTML entities are NOT a fix here — the HTML parser does not decode
// entities inside <script>. The correct escape is JSON's own \uXXXX form:
// the output stays valid JSON (JSON.parse round-trips to the same value) and
// the raw characters never appear in the markup. U+2028/U+2029 are legal in
// JSON strings but line terminators in older JS engines; escaped too.
// Dependency-free so SeoHead can import it without a cycle via lib/seo.ts.
// ---------------------------------------------------------------------------

export function serializeJsonLd(data: unknown): string {
  // JSON.stringify returns undefined (not a string) for undefined/functions.
  const json: string | undefined = JSON.stringify(data);
  if (json === undefined) return "";
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
