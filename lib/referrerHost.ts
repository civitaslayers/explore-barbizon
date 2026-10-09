// ---------------------------------------------------------------------------
// lib/referrerHost.ts
//
// Reduces a client-supplied document.referrer string to a bare hostname for
// page_views.referrer_host. See brain/decisions.md, 2026-10-09. The input is
// untrusted: only the lowercase hostname survives, never path, query, scheme
// or port, and own-domain referrers are discarded.
// ---------------------------------------------------------------------------

const MAX_RAW_LENGTH = 2048;
const MAX_HOST_LENGTH = 253;

export function extractReferrerHost(
  raw: unknown,
  ownHost: string | null | undefined
): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_RAW_LENGTH) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  let hostname = url.hostname.toLowerCase();
  if (hostname.endsWith(".")) hostname = hostname.slice(0, -1);
  if (hostname.length === 0 || hostname.length > MAX_HOST_LENGTH) return null;

  const own = (ownHost ?? "").split(":")[0].toLowerCase().replace(/\.$/, "");
  if (own && (hostname === own || hostname.endsWith("." + own))) return null;

  return hostname;
}
