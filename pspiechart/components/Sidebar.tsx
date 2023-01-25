import { Dashboard /*, getDashboards */ } from "../lib/dashboard-store";
import Image from "next/image";
import pspColor from "../public/PSP-2Color-Reversed.svg";
import styles from "../styles/Sidebar.module.scss";

// get list of dashbaords from api
export async function getServerSideProps() {
  // const dashboards = getDashboards();
  // const dashboards: Dashboard[] = [];
  let bruh: Dashboard[] = JSON.parse(
    '[{"name":"your mom","layout":[],"panels":[],"id":1,"dateCreated":"2023-01-25T10:34:00.222Z","dateModified":"2023-01-25T10:34:00.222Z"},{"name":"hello","layout":[],"panels":[],"id":2,"dateCreated":"2023-01-25T10:34:09.622Z","dateModified":"2023-01-25T10:34:09.622Z"}]'
  );

  console.log("what the fuck");

  return {
    props: {
      dashboards: bruh,
    },
  };
}

interface SidebarProps {
  dashboards: Dashboard[];
}

export default function Sidebar(props: SidebarProps) {
  console.log(props);

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
        {/* {props.dashboards.map((dashboard) => {
          return (
            <li key={dashboard.id} className="nav-item">
              <a
                href="#"
                className="nav-link m-1 text-white"
                aria-current="page"
              >
                {dashboard.name}
              </a>
            </li>
          );
        })} */}
        <li className="nav-item">
          <a
            href="#"
            className="nav-link m-1 active text-white"
            aria-current="page"
          >
            Panel Library
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link m-1 text-white" aria-current="page">
            Home
          </a>
        </li>
      </ul>
    </div>
  );
}
