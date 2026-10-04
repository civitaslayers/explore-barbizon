import { useEffect } from "react";
import { useRouter } from "next/router";

// ---------------------------------------------------------------------------
// components/PageViewTracker.tsx
//
// Mounts once in pages/_app.tsx. Renders nothing — fires a cookieless
// first-party page-view beacon to /api/track on first load and on every
// client-side route change. See brain/decisions.md, 2026-08-13.
// ---------------------------------------------------------------------------

const EXCLUDED_PATH_PREFIXES = ["/command-center", "/dashboard"];
const LOCATION_PATH_RE = /^\/places\/([^/]+)$/;

function normalizePath(asPath: string): string {
  return asPath.split(/[?#]/)[0];
}

function isExcludedPath(path: string): boolean {
  return EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function sendBeaconSafely(path: string, locale: string | undefined) {
  try {
    if (isExcludedPath(path)) return;

    const match = path.match(LOCATION_PATH_RE);
    const locationSlug = match ? match[1] : null;

    const payload = {
      path,
      locale: locale ?? null,
      locationSlug,
    };
    const json = JSON.stringify(payload);
    const blob = new Blob([json], { type: "application/json" });

    const sent =
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon("/api/track", blob);

    if (!sent) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Never let a tracking failure throw into the React tree.
  }
}

export function PageViewTracker() {
  const router = useRouter();

  useEffect(() => {
    // Vercel sets NODE_ENV=production for both Preview and Production
    // builds, so this correctly fires on Preview deploys too — do not swap
    // for VERCEL_ENV, that would break Preview verification.
    if (process.env.NODE_ENV !== "production") return;
    // asPath is unreliable before isReady on static pages (Next Pages
    // Router docs) — gate the initial beacon on it.
    if (!router.isReady) return;

    sendBeaconSafely(normalizePath(router.asPath), router.locale);
  }, [router.isReady]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const handleRouteChangeComplete = () => {
      // Read asPath (not the `url` argument passed to the event), which
      // includes basePath/locale prefix — asPath is locale-agnostic, and
      // locale is sent separately via router.locale.
      sendBeaconSafely(normalizePath(router.asPath), router.locale);
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router]);

  return null;
}

export default PageViewTracker;
