// ---------------------------------------------------------------------------
// lib/productEvents.ts
//
// Cookieless, anonymous My day counters (task 068cfc3d). The payload carries
// the event name and locale only: no slugs, no identifiers, no query strings.
// Validation here is shared by the client sender and pages/api/track.ts.
// ---------------------------------------------------------------------------

export const PRODUCT_EVENTS = [
  "myday_add",
  "myday_share_created",
  "myday_shared_opened",
  "myday_shared_saved",
] as const;

export type ProductEvent = (typeof PRODUCT_EVENTS)[number];

export function isProductEvent(value: unknown): value is ProductEvent {
  return (
    typeof value === "string" &&
    (PRODUCT_EVENTS as readonly string[]).includes(value)
  );
}

/** Fire-and-forget. Never throws, never surfaces errors. */
export function sendProductEvent(event: ProductEvent): void {
  try {
    if (typeof window === "undefined") return;
    const locale = /^\/en(\/|$)/.test(window.location.pathname) ? "en" : "fr";
    const payload = JSON.stringify({ event, locale });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/track", blob)) return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics must never break the UI
  }
}
