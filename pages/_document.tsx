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
      <Html lang={this.props.__NEXT_DATA__?.locale ?? "fr"}>
        <Head />
        <body className="bg-cream text-ink">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

