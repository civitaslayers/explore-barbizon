import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import { SeoHead } from "@/components/SeoHead";
import nextI18NextConfig from "@/next-i18next.config";

type AboutPageProps = SSRConfig;

const CONTACT_EMAIL = "info@explorebarbizon.com";

// Mid-sentence links without a <Trans> helper (same pattern as
// pages/plan-your-visit.tsx): interpolate a sentinel, split on it, render the
// link between the two halves.
const LINK_SENTINEL = "@@LINK@@";

const linkClass = "underline underline-offset-4 hover:text-ink";

const AboutPage: NextPage<AboutPageProps> = () => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const { t } = useTranslation("pages");

  const [p3Before, p3After] = t("about.p3", { historyLink: LINK_SENTINEL }).split(LINK_SENTINEL);
  const [p5Before, p5After] = t("about.p5", { email: LINK_SENTINEL }).split(LINK_SENTINEL);

  return (
    <>
      <SeoHead
        title={t("about.meta.title")}
        description={t("about.meta.description")}
        path="/about"
        locale={locale}
      />
      <section className="space-y-8">
        <header className="editorial-measure space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            {t("about.eyebrow")}
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            {t("about.title")}
          </h1>
        </header>

        <div className="editorial-measure space-y-4 text-sm leading-relaxed text-ink/80 md:text-base">
          <p>{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
          <p>
            {p3Before}
            <Link href="/history" className={linkClass}>
              {t("about.historyLink")}
            </Link>
            {p3After}
          </p>
          <p>{t("about.p4")}</p>
          <p>
            {p5Before}
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              {CONTACT_EMAIL}
            </a>
            {p5After}
          </p>
          <p className="text-ink/60">{t("about.closing")}</p>
        </div>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<AboutPageProps> = async ({
  locale,
}) => {
  const translations = await serverSideTranslations(locale ?? "fr", ["common", "pages"], nextI18NextConfig);
  return { props: { ...translations }, revalidate: 60 };
};

export default AboutPage;
