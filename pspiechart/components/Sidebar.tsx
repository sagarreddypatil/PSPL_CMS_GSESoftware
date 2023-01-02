// hey copilot can you import an image for me and call it pspColor, do it nextjs style

import Image from "next/image";
import pspColor from "../public/PSP-2Color-Reversed.svg";

export default function Sidebar() {
  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-dark">
      <a
        href="#"
        className="d-flex row align-items-center text-white text-decoration-none"
      >
        <div className="col pe-0">
          <Image
            src={pspColor}
            alt="logo"
            className="mb-2"
            layout="responsive"
          />
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
