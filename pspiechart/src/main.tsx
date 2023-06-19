import ReactDOM from "react-dom/client";
import "./globals.css";

import App from "./App.tsx";
import ObjectViewFactory from "./object-views/object-view-factory.tsx";
import { IconContext } from "react-icons";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [{ path: "/:namespace/:id", element: <ObjectViewFactory /> }],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <IconContext.Provider value={{ size: "1.25rem" }}>
    <RouterProvider router={router} />
  </IconContext.Provider>
);
