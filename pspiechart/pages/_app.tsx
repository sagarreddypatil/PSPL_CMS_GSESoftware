import "../styles/App.scss";
import "@fontsource/libre-franklin";
import "@fontsource/saira";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import { FullscreenContext } from "../contexts/FullscreenContext";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <Layout>
      <FullscreenContext.Provider value={{ fullscreen, setFullscreen }}>
        {fullscreen ? null : <Sidebar />}
        <Component {...pageProps} />
      </FullscreenContext.Provider>
    </Layout>
  );

  // return <Component {...pageProps} />;
}
