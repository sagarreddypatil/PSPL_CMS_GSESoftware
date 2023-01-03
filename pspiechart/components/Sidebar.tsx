// hey copilot can you import an image for me and call it pspColor, do it nextjs style

import Image from "next/image";
import pspColor from "../public/PSP-2Color-Reversed.svg";
import styles from "../styles/Sidebar.module.scss";

export default function Sidebar() {
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
        <li className="nav-item">
          <a
            href="#"
            className="nav-link active text-white"
            aria-current="page"
          >
            {" "}
            Home{" "}
          </a>
        </li>
      </ul>
    </div>
  );
}
