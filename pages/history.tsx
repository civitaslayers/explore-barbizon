import type { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import type { SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import { SeoHead } from "@/components/SeoHead";
import HistoryTimeline from "@/components/HistoryTimeline";
import nextI18NextConfig from "@/next-i18next.config";

type HistoryPageProps = SSRConfig;

// name/dates are proper nouns + numerals — locale-independent, stay literal.
// noteKey points at pages:history.painters.<slug> for the one-sentence note.
const ARTISTS = [
  {
    name: "Jean-François Millet",
    dates: "1814–1875",
    noteKey: "millet"
  },
  {
    name: "Théodore Rousseau",
    dates: "1812–1867",
    noteKey: "rousseau"
  },
  {
    name: "Camille Corot",
    dates: "1796–1875",
    noteKey: "corot"
  },
  {
    name: "Charles-François Daubigny",
    dates: "1817–1878",
    noteKey: "daubigny"
  }
] as const;

const HistoryPage: NextPage<HistoryPageProps> = () => {
  const router = useRouter();
  const locale = router.locale ?? "fr";
  const { t } = useTranslation("pages");
  return (
    <>
      <SeoHead
        title={t("history.meta.title")}
        description={t("history.meta.description")}
        path="/history"
        locale={locale}
      />

      <div className="section-stack">
        <header className="space-y-4 editorial-measure">
          <p className="eyebrow">{t("history.eyebrow")}</p>
          <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            {t("history.title")}
          </h1>
          <p className="text-sm leading-relaxed text-ink/80 md:text-base">
            {t("history.intro")}
          </p>
        </header>

        <section className="space-y-6">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">{t("history.timeline.eyebrow")}</p>
            <h2 className="heading-lg">{t("history.timeline.title")}</h2>
          </header>
          <HistoryTimeline />
        </section>

        <section className="space-y-6">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">{t("history.postcards.eyebrow")}</p>
            <h2 className="heading-lg">{t("history.postcards.title")}</h2>
          </header>
          <div className="rounded border border-ink/10 p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-ink/40">
              {t("history.postcards.comingSoon")}
            </p>
            <p className="mt-2 text-sm text-ink/60">
              {t("history.postcards.body")}
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">{t("history.painters.eyebrow")}</p>
            <h2 className="heading-lg">{t("history.painters.title")}</h2>
          </header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ARTISTS.map((artist) => (
              <div
                key={artist.name}
                className="space-y-1 border border-ink/10 p-5"
              >
                <p className="font-serif text-base text-ink">{artist.name}</p>
                <p className="text-xs text-ink/50">{artist.dates}</p>
                <p className="text-sm text-ink/70">
                  {t(`history.painters.${artist.noteKey}`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <header className="space-y-3 editorial-measure">
            <p className="eyebrow">{t("history.sources.eyebrow")}</p>
            <h2 className="heading-lg">{t("history.sources.title")}</h2>
          </header>
          <div className="editorial-measure space-y-4 text-sm leading-relaxed text-ink/80 md:text-base">
            <p>{t("history.sources.p1")}</p>
            <p>{t("history.sources.p2")}</p>
            <p>
              <a
                href="https://www.grappilles.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink/60 underline-offset-4 hover:underline"
              >
                {t("history.sources.grappillesCta")}
              </a>
            </p>
            <p>{t("history.sources.p3")}</p>
            <p>
              <a
                href="https://barbizonvillagedespeintres.wordpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink/60 underline-offset-4 hover:underline"
              >
                {t("history.sources.guideCta")}
              </a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<HistoryPageProps> = async ({
  locale,
}) => {
  const translations = await serverSideTranslations(locale ?? "fr", ["common", "pages"], nextI18NextConfig);
  return { props: { ...translations }, revalidate: 60 };
};

export default HistoryPage;
