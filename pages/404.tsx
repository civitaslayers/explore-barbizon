import Link from "next/link";
import type { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import type { SSRConfig } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { SeoHead } from "@/components/SeoHead";
import nextI18NextConfig from "@/next-i18next.config";

// A custom 404 page is needed so this route (rendered inside the shared
// public Layout, which calls useTranslation for nav/footer) has its own
// getStaticProps/serverSideTranslations — without it, Next's built-in
// fallback 404 has no _nextI18Next in pageProps and react-i18next warns
// "NO_I18NEXT_INSTANCE" at build time, rendering raw translation keys
// instead of nav labels.

type NotFoundPageProps = SSRConfig;

const NotFoundPage: NextPage<NotFoundPageProps> = () => {
  const router = useRouter();
  const locale = router.locale ?? "fr";

  return (
    <>
      <SeoHead
        title={
          locale === "fr"
            ? "Page introuvable — Visit Barbizon"
            : "Page not found — Visit Barbizon"
        }
        description={
          locale === "fr"
            ? "Cette page n'existe pas ou a été déplacée."
            : "This page doesn't exist or has moved."
        }
        path="/404"
        locale={locale}
      />
      <section className="space-y-6 py-20 text-center">
        <p className="eyebrow">404</p>
        <h1 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
          {locale === "fr" ? "Page introuvable" : "Page not found"}
        </h1>
        <p className="text-sm text-ink/70">
          <Link href="/" className="underline underline-offset-4 hover:text-ink">
            {locale === "fr" ? "Retour à l'accueil" : "Back to the homepage"}
          </Link>
        </p>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<NotFoundPageProps> = async ({
  locale,
}) => {
  const translations = await serverSideTranslations(locale ?? "fr", ["common"], nextI18NextConfig);
  return { props: { ...translations } };
};

export default NotFoundPage;
