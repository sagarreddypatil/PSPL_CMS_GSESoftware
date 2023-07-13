import ReactDOM from "react-dom/client";
import "./globals.css";

import App from "./App.tsx";
import {
  RemoteViewRoute,
  UserItemRoute,
} from "./item-views/item-view-factory.tsx";
import { IconContext } from "react-icons";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/remote/:namespace/:id", element: <RemoteViewRoute /> },
      { path: "/item/:id", element: <UserItemRoute /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <IconContext.Provider value={{ size: "1.25em", color: "inherit" }}>
    <RouterProvider router={router} />
  </IconContext.Provider>
);
