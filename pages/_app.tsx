import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { Layout } from "@/components/Layout";

const DEFAULT_SITE_DESCRIPTION =
  "Visit Barbizon — a curated cultural guide to the forest-edge village that inspired generations of artists.";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const showDefaultDescription = router.pathname !== "/places/[slug]";
  const getLayout =
    Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <>
      {showDefaultDescription && (
        <Head>
          <meta name="description" content={DEFAULT_SITE_DESCRIPTION} />
        </Head>
      )}
      <div
        className={`${inter.variable} ${playfair.variable} font-sans bg-cream text-ink min-h-screen`}
      >
        {getLayout(<Component {...pageProps} />)}
      </div>
    </>
  );
}
