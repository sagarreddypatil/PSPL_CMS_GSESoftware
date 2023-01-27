import { DashboardStore } from "../lib/dashboard-store";
import Image from "next/image";
import Link from "next/link";
import pspColor from "../public/PSP-2Color-Reversed.svg";
import styles from "../styles/Sidebar.module.scss";
import { Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "./Contexts";

export default function Sidebar() {
  const router = useRouter();
  const { id: selectedId } = useContext(DashboardContext);
  const [dashboards, setDashboards] = useState<DashboardStore[]>([]);

  console.log(selectedId);

  useEffect(() => {
    // load localstorage cache
    const cache = localStorage.getItem("sidebarcache");
    if (cache) {
      setDashboards(JSON.parse(cache));
    }

    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setDashboards(data);

        // cache data to localstorage because nextjs is dumb
        localStorage.setItem("sidebarcache", JSON.stringify(data));
      });
  }, [selectedId]);

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
          const selected = selectedId ? selectedId == dashboard.id : false;
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
