import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { IconContext } from "react-icons";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <IconContext.Provider value={{ size: "1.25rem" }}>
    <App />
  </IconContext.Provider>
);
