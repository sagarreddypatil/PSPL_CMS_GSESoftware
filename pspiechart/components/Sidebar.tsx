import { DashboardStore } from "../lib/dashboard-store";
import Image from "next/image";
import Link from "next/link";
import pspColor from "../public/PSP-2Color-Reversed.svg";
import styles from "../styles/Sidebar.module.scss";

interface SidebarProps {
  dashboards: DashboardStore[];
  selectedDashboard?: DashboardStore;
}

export default function Sidebar(props: SidebarProps) {
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
        {props.dashboards.map((dashboard) => {
          const selected = props.selectedDashboard
            ? dashboard.id === props.selectedDashboard.id
            : null;
          const activeClass = selected ? "active" : "";

          return (
            <li key={dashboard.id} className="nav-item">
              <Link
                href={`/dashboard/${dashboard.id}`}
                className={`nav-link m-1 text-white ${activeClass}`}
              >
                {/* <a
                  className={`nav-link m-1 text-white ${activeClass}`}
                  aria-current="page"
                > */}
                {dashboard.name}
                {/* </a> */}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
