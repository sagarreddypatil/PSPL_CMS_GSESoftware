import { DashboardStore } from "@/types/DashboardInterfaces";
import Image from "next/image";
import Link from "next/link";
import pspColor from "../public/PSP-2Color-Reversed.svg";
import styles from "../styles/Sidebar.module.scss";
import { Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function NavItem({
  href,
  active,
  text,
}: {
  href: string;
  active: boolean;
  text: string;
}) {
  const activeClass = active ? "active" : "";
  return (
    <li className="nav-item">
      <Link href={href} className={`nav-link my-1 px-2 py-2 ${activeClass}`}>
        {text}
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<DashboardStore[]>([]);

  const dashboardId: number = parseInt(router.query.dashboardId as string);
  const edited = router.query.edited as string;
  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setDashboards(data);
      });

    if (edited != undefined) {
      router.push(`/dashboard/${dashboardId}`);
    }
  }, [dashboardId, edited]); // eslint-disable-line react-hooks/exhaustive-deps

  const addDashboard = () => {
    fetch("/api/dashboard", {
      method: "POST",
      body: JSON.stringify({ name: "New Dashboard" }),
    })
      .then((res) => res.json())
      .then((data) => {
        router.push(`/dashboard/${data.id}`);
      })
      .then(() => fetch("/api/dashboard"))
      .then((res) => res.json())
      .then((data) => {
        setDashboards(data);
      });
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-black">
      <Link
        href="/"
        className="d-flex row align-items-center text-white text-decoration-none"
      >
        <div className="col pe-0">
          <div className={`${styles["image-container"]} mb-2`}>
            <Image src={pspColor} alt="logo" fill className={styles["image"]} />
          </div>
        </div>
        <div className="col">
          <h3 className="m-0">Mission Control</h3>
        </div>
      </Link>
      <div className="mx-auto my-2" />
      {/* <hr style={{ opacity: "100%" }} /> */}
      <ul className="nav nav-pills flex-column mb-4">
        <li className="nav-item fs-5 fw-bold px-2">Configs</li>
        <hr />
        <NavItem
          href={`/config/sensornet`}
          text={"SensorNet"}
          active={router.route === "/config/sensornet"}
        />
        <NavItem
          href={`/config/commandnet`}
          text={"CommandNet"}
          active={router.route === "/config/commandnet"}
        />
      </ul>

      <ul className="nav nav-pills flex-column mb-4">
        <li className="nav-item fs-5 fw-bold px-2">Dashboards</li>
        <hr />
        {dashboards.map((dashboard) => {
          const selected = dashboardId == dashboard.id;
          return (
            <NavItem
              key={dashboard.id}
              href={`/dashboard/${dashboard.id}`}
              active={selected}
              text={dashboard.name}
            />
          );
        })}
        <li className="nav-item d-grid">
          <Button
            variant="outline-primary"
            className="my-1 p-2"
            onClick={addDashboard}
          >
            <Icon.PlusLg /> Add Dashboard
          </Button>
        </li>
      </ul>
    </div>
  );
}
