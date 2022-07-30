import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    if (ctx.req) {
      const userAgent = ctx.req["userAgent"];
      const { isIOS } = getSelectorsByUserAgent(userAgent);
      initialProps.isIOS = isIOS;
    }
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="manifest"
            href={this.props.isIOS ? "/manifest-ios.json" : "/manifest.json"}
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/images/apple-touch-icon.png"
          />
          <meta name="theme-color" content="#fff" />
          <meta name="description" content="Repsetter - online coaching" />
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
