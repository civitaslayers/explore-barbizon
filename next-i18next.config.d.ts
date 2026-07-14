// Ambient type declaration for the CJS next-i18next.config.js file so it can
// be imported (via the `@/next-i18next.config` alias) into strict TS pages
// without enabling `allowJs`. See fix/en-500-i18n-config: next-i18next.config
// must be passed explicitly to appWithTranslation() and every
// serverSideTranslations() call — Vercel's file tracer does not reliably
// bundle a config file that next-i18next loads dynamically from disk at
// request time, which was causing every /en/... route to 500 in production.
import type { UserConfig } from "next-i18next/pages";

declare const nextI18NextConfig: UserConfig;

export default nextI18NextConfig;
