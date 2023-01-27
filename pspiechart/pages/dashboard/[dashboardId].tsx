import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import { useRouter } from "next/router";
import { getDashboards, DashboardStore } from "@/lib/dashboard-store";
import Banner from "@/components/Banner";
import { useContext, useEffect, useState } from "react";

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

export default function Home() {
  const router = useRouter();
  const { dashboardId } = router.query;

  const idInt = parseInt(dashboardId as string);

  return <Dashboard id={idInt} />;
}
