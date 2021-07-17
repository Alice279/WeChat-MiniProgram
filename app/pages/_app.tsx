import React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../theme";
import { Backend } from "../lib/backend";
import FetchCaller from "../lib/backend/fethch-caller";
import "../components/editor/quill.snow.cn.css";

function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
}

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  // Since we disable SSR, there's no need for it.
  // React.useEffect(() => {
  //   // Remove the server-side injected CSS.
  //   const jssStyles = document.querySelector("#jss-server-side");
  //   if (jssStyles) {
  //     jssStyles.parentElement!.removeChild(jssStyles);
  //   }
  // }, []);

  return (
    <React.Fragment>
      <Head>
        <title>My page</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <SafeHydrate>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Backend
            caller={FetchCaller}
            storage={{
              get: (key) => Promise.resolve(localStorage.getItem(key)),
              set: (k, v) => Promise.resolve(localStorage.setItem(k, v)),
            }}
          >
            <Component {...pageProps} />
          </Backend>
        </ThemeProvider>
      </SafeHydrate>
    </React.Fragment>
  );
}
