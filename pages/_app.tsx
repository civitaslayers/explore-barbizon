import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { Layout } from "@/components/Layout";

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
  const getLayout =
    Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <div
      className={`${inter.variable} ${playfair.variable} font-sans bg-cream text-ink min-h-screen`}
    >
      {getLayout(<Component {...pageProps} />)}
    </div>
  );
}
