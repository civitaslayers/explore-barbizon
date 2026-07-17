import { createRequire } from "node:module";

// next-i18next.config.js is CJS; next.config.mjs is ESM. createRequire is the
// standard ESM→CJS interop shim (docs/i18n-seo-implementation-plan.md, Task 2b).
const require = createRequire(import.meta.url);
const { i18n } = require("./next-i18next.config.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Built-in Pages-Router locale routing — fr served at the root (no prefix),
  // en served under /en/. No middleware. localeDetection: false is set in
  // next-i18next.config.js and is load-bearing (keeps CCC/dashboard French-only).
  i18n,

  // Belt-and-suspenders for the /en/... 500 regression (fix/en-500-i18n-config):
  // next-i18next's serverSideTranslations() loads next-i18next.config.js and
  // public/locales/** dynamically from disk at request time. Vercel's file
  // tracer doesn't reliably follow that dynamic require, so without an
  // explicit include the config/locale files can be missing from the
  // serverless bundle in production even though every call site now also
  // passes the config object directly (the primary fix, in pages/_app.tsx
  // and every serverSideTranslations() call).
  outputFileTracingIncludes: {
    "/**": ["./next-i18next.config.js", "./public/locales/**"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
      },
      {
        // Cloudflare R2 media host (scripts/upload-media.mjs,
        // scripts/upload-to-r2.mjs). Hardcoded, not derived from
        // NEXT_PUBLIC_MEDIA_BASE_URL — this file already caused one
        // serverless-bundling regression (the /en 500), so the build must
        // not depend on a runtime env var here.
        protocol: "https",
        hostname: "media.explorebarbizon.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // CCC v3 Phase 2 — pins retirement (docs/ccc-v3-phase2-implementation-plan.md
  // item 15). AtlasMapView shipped in Phase 1 with verified behaviour parity,
  // so pages/command-center/pins.tsx is removed this phase; a permanent
  // redirect (not a hard 404) keeps any bookmark working.
  async redirects() {
    return [
      {
        source: "/command-center/pins",
        destination: "/command-center/atlas?view=map",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
