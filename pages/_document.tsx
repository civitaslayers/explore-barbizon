import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta
            name="description"
            content="Explore Barbizon — a curated cultural guide to the forest-edge village that inspired generations of artists."
          />
        </Head>
        <body className="bg-cream text-ink">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

