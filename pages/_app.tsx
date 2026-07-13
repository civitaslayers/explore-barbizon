import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import Head from "next/head";
import { Inter } from "next/font/google";
import { appWithTranslation } from "next-i18next/pages";
import "@/styles/globals.css";
import { Layout } from "@/components/Layout";
import nextI18NextConfig from "@/next-i18next.config";

const DEFAULT_SITE_DESCRIPTION =
  "Visit Barbizon — a curated cultural guide to the forest-edge village that inspired generations of artists.";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <>
      {/* Global fallback only — every public page now sets its own
          description via <SeoHead> (rendered by Component below), which
          wins Next's last-one-wins <meta name="description"> dedup. This
          block only shows on pages that don't render SeoHead. */}
      <Head>
        <meta name="description" content={DEFAULT_SITE_DESCRIPTION} />
      </Head>
      <div
        className={`${inter.variable} font-sans bg-cream text-ink min-h-screen`}
      >
        {getLayout(<Component {...pageProps} />)}
      </div>
    </>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
