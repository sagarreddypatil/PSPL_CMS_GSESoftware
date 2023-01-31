import Dashboard from "@/components/Dashboard/Dashboard";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const { dashboardId } = router.query;

  const idInt = parseInt(dashboardId as string);

  return <Dashboard id={idInt} />;
}
