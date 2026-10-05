import type { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import type { SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import { SeoHead } from "@/components/SeoHead";
import nextI18NextConfig from "@/next-i18next.config";

type AboutPageProps = SSRConfig;

const AboutPage: NextPage<AboutPageProps> = () => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const { t } = useTranslation("pages");
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
          <p>{t("about.p3")}</p>
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

