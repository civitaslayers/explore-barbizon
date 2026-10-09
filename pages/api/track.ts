import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { extractReferrerHost } from "@/lib/referrerHost";

// ---------------------------------------------------------------------------
// pages/api/track.ts
//
// Cookieless first-party page-view beacon. See brain/decisions.md,
// 2026-08-13 ("Audience measurement is first-party and Supabase-native") and
// 2026-10-04 and 2026-10-09 (referrer_host). Writes through the record_page_view()
// RPC with the service-role client — never from the browser directly, since
// page_views carries RLS deny-all (service_role only).
//
// Every response path is 204 with no body — this endpoint must never surface
// errors to the client calling it via navigator.sendBeacon/fetch.
// ---------------------------------------------------------------------------

export const config = {
  api: {
    bodyParser: { sizeLimit: "1kb" },
  },
};

const ALLOWED_LOCALES = ["fr", "en"] as const;
type AllowedLocale = (typeof ALLOWED_LOCALES)[number];

const LOCATION_SLUG_RE = /^[a-z0-9-]{1,120}$/;
const BOT_UA_RE = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|preview/i;
const TABLET_UA_RE = /ipad|tablet|playbook|silk|android(?!.*mobile)/i;
const MOBILE_UA_RE = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i;

type Device = "mobile" | "tablet" | "desktop" | null;

function parseBody(raw: unknown): Record<string, unknown> | null {
  try {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === "string") {
      if (raw.length === 0) return null;
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null;
    }
    if (typeof raw === "object") {
      // Blob bodies sent via sendBeacon arrive as a Buffer under the
      // "application/json" content-type in some runtimes — guard that case
      // too by attempting a JSON.parse of its string form.
      if (Buffer.isBuffer(raw)) {
        const parsed = JSON.parse(raw.toString("utf8"));
        return typeof parsed === "object" && parsed !== null
          ? (parsed as Record<string, unknown>)
          : null;
      }
      return raw as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function deriveDevice(userAgent: string | null): Device {
  if (!userAgent) return null;
  // Tablet check must run before mobile — tablet UAs (e.g. iPad) often also
  // match generic mobile-ish patterns.
  if (TABLET_UA_RE.test(userAgent)) return "tablet";
  if (MOBILE_UA_RE.test(userAgent)) return "mobile";
  return "desktop";
}

// The generated lib/supabase.types.ts has no Functions entry for
// record_page_view (confirmed — see Functions: { [_ in never]: never }), so
// the RPC call is typed locally and cast, following the same stale-types
// workaround already used in pages/api/locations/[id].ts (e.g.
// `.update(payload as any)`, `.from("location_edits" as any)`).
type RecordPageViewArgs = {
  p_path: string;
  p_visitor_day_hash: string;
  p_locale: AllowedLocale | null;
  p_location_slug: string | null;
  p_referrer_host: string | null;
  p_device: Device;
  p_country: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = parseBody(req.body);
    if (!body) {
      return res.status(204).end();
    }

    const rawPath = body.path;
    if (
      typeof rawPath !== "string" ||
      !rawPath.startsWith("/") ||
      rawPath.length >= 512
    ) {
      return res.status(204).end();
    }
    const path = rawPath;

    const rawLocale = body.locale;
    const locale: AllowedLocale | null =
      typeof rawLocale === "string" &&
      (ALLOWED_LOCALES as readonly string[]).includes(rawLocale)
        ? (rawLocale as AllowedLocale)
        : null;

    const rawLocationSlug = body.locationSlug;
    const locationSlug: string | null =
      typeof rawLocationSlug === "string" &&
      LOCATION_SLUG_RE.test(rawLocationSlug)
        ? rawLocationSlug
        : null;

    // Derived server-side only — never trust these from the body.
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]?.split(",")[0]?.trim() ?? null
      : forwardedFor?.split(",")[0]?.trim() || req.socket.remoteAddress || null;

    const userAgentHeader = req.headers["user-agent"];
    const userAgent =
      typeof userAgentHeader === "string" ? userAgentHeader : null;

    const countryHeader = req.headers["x-vercel-ip-country"];
    const rawCountry =
      typeof countryHeader === "string" ? countryHeader.toUpperCase() : "";
    const country = /^[A-Z]{2}$/.test(rawCountry) ? rawCountry : null;

    // referrerHost comes from document.referrer, sent on first load only and
    // reduced to a bare hostname server-side (brain/decisions.md, 2026-10-09).
    const referrerHost = extractReferrerHost(body.referrer, req.headers.host);

    // Bot filter.
    if (userAgent && BOT_UA_RE.test(userAgent)) {
      return res.status(204).end();
    }

    const device = deriveDevice(userAgent);

    const salt = process.env.TRACKING_SALT;
    if (!salt) {
      // Never hash with an empty/missing salt.
      return res.status(204).end();
    }

    const day = new Date().toISOString().slice(0, 10);
    const visitorDayHash = crypto
      .createHash("sha256")
      .update(`${salt}:${day}:${ip ?? ""}:${userAgent ?? ""}`)
      .digest("hex");

    try {
      const args: RecordPageViewArgs = {
        p_path: path,
        p_visitor_day_hash: visitorDayHash,
        p_locale: locale,
        p_location_slug: locationSlug,
        p_referrer_host: referrerHost,
        p_device: device,
        p_country: country,
      };
      const { error } = await (
        supabaseAdmin.rpc as unknown as (
          fn: string,
          args: RecordPageViewArgs
        ) => Promise<{ error: { message: string } | null }>
      )("record_page_view", args);

      if (error) {
        // Safe to log — only the hash appears here, never the raw ip/UA.
        console.error("[track] rpc failed:", error.message);
      }
    } catch (err) {
      console.error(
        "[track] rpc threw:",
        err instanceof Error ? err.message : "unknown error"
      );
    }

    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
}
