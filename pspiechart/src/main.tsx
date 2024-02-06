import ReactDOM from "react-dom/client";
import "./globals.css";

import App from "./App.tsx";
import { UserItemRoute } from "./item-views/item-view-factory.tsx";
import { IconContext } from "react-icons";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./not-found.tsx";
import SensorNetSettings from "./sensornet/settings.tsx";
import Login from "./Login.tsx";

/*
Four accessible routes for whole we app:
1. "/" - Home Page
  - where user is redirected to after logging in.
2. "login" - Login Page
  - User must login to access web application
3. "/item/:id" - IN PROGRESS
4. "/sensornet" - IN PROGRESS

Any other url parameter will lead user to a Not Found page
*/

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/item/:id", element: <UserItemRoute /> },
      { path: "/sensornet", element: <SensorNetSettings /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <IconContext.Provider value={{ size: "1.25em", color: "inherit" }}>
    <RouterProvider router={router} />
  </IconContext.Provider>
);
