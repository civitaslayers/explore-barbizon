/**
 * R2 media ingestion (2026-07-17, brain/decisions.md) produces a -1600.webp
 * and a -800.webp sibling per photo, but `media.url` only stores the 1600w
 * URL. This derives the 800w sibling by filename substitution — no new DB
 * column, no re-ingest. Returns the input unchanged if it doesn't match the
 * expected `-1600.webp` suffix (e.g. a non-R2 URL), so callers never get a
 * broken derived URL.
 */
export function heroImage800w(url: string): string {
  return url.replace(/-1600\.webp$/, "-800.webp");
}
