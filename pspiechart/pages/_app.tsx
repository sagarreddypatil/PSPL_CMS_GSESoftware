import "../styles/App.scss";
import "@fontsource/libre-franklin";
import "@fontsource/saira";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
