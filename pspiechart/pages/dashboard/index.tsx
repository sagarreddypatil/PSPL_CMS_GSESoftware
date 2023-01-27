import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import { getDashboards, DashboardStore } from "@/lib/dashboard-store";
import Banner from "@/components/Banner";
import { useContext, useEffect } from "react";

// let ws: WebSocket;

// if (typeof window !== 'undefined') {
//   // ws = new WebSocket(window.location.origin.replace(/^http/i, 'ws') + '/ws');
//   // @ts-ignore
//   // window.ws = ws;

//   // 'open,message,close,error'.split(',').forEach(evt => {
//   //   // @ts-ignore
//   //   ws['on' + evt] = (...args: any[]) => {
//   //     console.log('ws.on' + evt + ': ', args);
//   //   };
//   // })
// }

export function getServerSideProps() {
  const dashboards = getDashboards();
  return {
    props: {
      dashboards,
    },
  };
}

interface DashboardProps {
  dashboards: DashboardStore[];
}
export default function Home(props: DashboardProps) {
  return (
    <Banner
      title="No Dashboard Selected"
      text="Select one from the sidebar to get started"
    />
  );
}
