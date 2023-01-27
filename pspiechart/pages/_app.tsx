import "../styles/App.scss";
import "@fontsource/libre-franklin";
import "@fontsource/saira";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Sidebar />
      <Component {...pageProps} />
    </Layout>
  );

  // return <Component {...pageProps} />;
}
