import { DashboardStore } from "../lib/dashboard-store";
import Image from "next/image";
import Link from "next/link";
import pspColor from "../public/PSP-2Color-Reversed.svg";
import styles from "../styles/Sidebar.module.scss";
import { Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface SidebarProps {
  selectedId?: number;
  jank?: number;
}

export default function Sidebar(props: SidebarProps) {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<DashboardStore[]>([]);

  useEffect(() => {
    console.log("yeet");

    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setDashboards(data);
      });
  }, [props.selectedId, props.jank]);

  const addDashboard = () => {
    fetch("/api/dashboard", {
      method: "POST",
      body: JSON.stringify({ name: "New Dashboard" }),
    })
      .then((res) => res.json())
      .then((data) => {
        router.push(`/dashboard/${data.id}`);
      });
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-black">
      <a
        href="#"
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
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {dashboards.map((dashboard) => {
          const selected = props.selectedId
            ? props.selectedId == dashboard.id
            : false;
          const activeClass = selected ? "active" : "";

          return (
            <li key={dashboard.id} className="nav-item">
              <Link
                href={`/dashboard/${dashboard.id}`}
                className={`nav-link m-1 ${activeClass}`}
              >
                {dashboard.name}
              </Link>
            </li>
          );
        })}
        <li className="nav-item d-grid">
          <Button
            variant="outline-primary"
            className="m-1"
            onClick={addDashboard}
          >
            <Icon.PlusLg /> Add Dashboard
          </Button>
        </li>
      </ul>
    </div>
  );
}
