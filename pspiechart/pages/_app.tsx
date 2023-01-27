import "../styles/App.scss";
import "@fontsource/libre-franklin";
import "@fontsource/saira";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import { DashboardContext } from "@/components/Contexts";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [dashboardId, setDashboardId] = useState<number | undefined>();

  return (
    <Layout>
      <DashboardContext.Provider
        value={{ id: dashboardId, setId: setDashboardId }}
      >
        <Sidebar />
        <Component {...pageProps} />
      </DashboardContext.Provider>
    </Layout>
  );

  // return <Component {...pageProps} />;
}
