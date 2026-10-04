import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";

type LanguageSwitcherProps = {
  /** Does this page have a genuinely published EN translation? Default true
   *  so the i18n-catalogue-only pages (home, map, places index, etc.) keep
   *  offering both locales with zero changes at their call sites — same
   *  default-true contract as SeoHead's `hasEnglishVersion` prop. */
  hasEnglishVersion?: boolean;
  /** Render an inline "coming soon" note under the toggle when the EN side
   *  is disabled. True in the mobile drawer, false (sr-only/title only) in
   *  the header. */
  showNote?: boolean;
  className?: string;
};

export function LanguageSwitcher({
  hasEnglishVersion = true,
  showNote = false,
  className = "",
}: LanguageSwitcherProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { pathname, query, locale } = router;

  // Internal admin surface — never render here.
  if (pathname.startsWith("/dashboard")) return null;

  const currentLocale = locale ?? "fr";

  // No sensible "same page, other locale" for a 404 — the EN link targets
  // the homepage instead of trying to resolve a nonexistent route.
  const target =
    pathname === "/404" ? { pathname: "/", query: {} } : { pathname, query };

  // FR -> EN unavailable only when we are SITTING ON the FR page and the
  // page has no published EN translation. If the visitor is already on the
  // EN page (reached via a crawler or stale link) EN is the active/current
  // locale and must render as active, never disabled — this is the
  // escape-hatch rule, do not invert it.
  const enDisabled = !hasEnglishVersion && currentLocale === "fr";

  const sharedTypography = "text-[10px] uppercase tracking-[0.25em]";

  return (
    <div
      role="group"
      aria-label={t("locale.label")}
      className={`flex items-center gap-1.5 ${className}`}
    >
      {currentLocale === "fr" ? (
        <span className={`${sharedTypography} text-ink`} aria-current="page">
          {t("locale.fr")}
        </span>
      ) : (
        <Link
          href={target}
          locale="fr"
          className={`${sharedTypography} text-ink/40 transition-colors duration-200 hover:text-ink`}
          title={t("locale.switchToFr")}
        >
          {t("locale.fr")}
        </Link>
      )}

      <span aria-hidden className="text-ink/25">
        ·
      </span>

      {currentLocale === "en" ? (
        <span className={`${sharedTypography} text-ink`} aria-current="page">
          {t("locale.en")}
        </span>
      ) : enDisabled ? (
        <span
          aria-disabled="true"
          title={t("locale.enUnavailable")}
          className={`${sharedTypography} cursor-default text-ink/20`}
        >
          {t("locale.en")}
        </span>
      ) : (
        <Link
          href={target}
          locale="en"
          className={`${sharedTypography} text-ink/40 transition-colors duration-200 hover:text-ink`}
          title={t("locale.switchToEn")}
        >
          {t("locale.en")}
        </Link>
      )}

      {showNote && enDisabled ? (
        <span className="ml-2 text-[10px] normal-case tracking-normal text-ink/40">
          {t("locale.enUnavailable")}
        </span>
      ) : null}
    </div>
  );
}

export default LanguageSwitcher;
