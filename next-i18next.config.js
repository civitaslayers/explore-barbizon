/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    // Critical — do NOT enable. See "CCC / dashboard exclusion" in
    // docs/i18n-seo-implementation-plan.md: without this, Next auto-redirects
    // /command-center → /en/command-center for an English-Accept-Language
    // browser. CCC/dashboard must stay French-only, reached only via explicit
    // navigation to /en/... URLs.
    localeDetection: false,
  },
  fallbackLng: "fr",
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
