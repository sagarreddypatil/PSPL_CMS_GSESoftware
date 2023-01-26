import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import { getDashboards, DashboardStore } from "@/lib/dashboard-store";

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
    <Layout>
      <Sidebar dashboards={props.dashboards} />
      {/* <Dashboard title="Wow" id="bruh" /> */}
      <div className="bg-dark text-primary m-auto px-4 py-5 text-center">
        <div className="py-5">
          <h1 className="display-5 fw-bold text-primary">
            No Dashboard Selected
          </h1>
          <div className="mx-auto">
            <p className="fs-5 mb-4 text-white">
              Select one from the sidebar to get started
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
