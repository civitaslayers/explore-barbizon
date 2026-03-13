import type { AppProps } from "next/app";
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

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div
      className={`${inter.variable} ${playfair.variable} font-sans bg-cream text-ink min-h-screen`}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}

