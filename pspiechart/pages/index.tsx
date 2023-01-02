import Head from "next/head";
import styles from "../styles/Home.module.scss";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";

let ws: WebSocket;

if (typeof window !== 'undefined') {
  // ws = new WebSocket(window.location.origin.replace(/^http/i, 'ws') + '/ws');
  // @ts-ignore
  // window.ws = ws;

  // 'open,message,close,error'.split(',').forEach(evt => {
  //   // @ts-ignore
  //   ws['on' + evt] = (...args: any[]) => {
  //     console.log('ws.on' + evt + ': ', args);
  //   };
  // })
}

export default function Home() {
  return (
    <>
      <Head>
        <title>PSP Mission Control</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Sidebar />
        <Dashboard />
      </main>
    </>
  );
}
