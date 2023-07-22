import IOContextProvider from "./contexts/io-context";
import VertLayout from "./layouts/vert-layout";
import Select from "./controls/select";
import { FiMoon, FiSun } from "react-icons/fi";
import { Outlet, useNavigate, useOutlet } from "react-router-dom";
import Sidebar from "./components/sidebar";
import { createContext, useEffect, useState } from "react";
import SensorNetPlugin from "./plugins/sensornet";
import TimeConductorProvider from "./contexts/time-conductor-context";
import TimeConductorView from "./components/time-conductor";
import Logo from "./controls/logo";
import Nav from "./controls/nav";
import { Button } from "./controls/button";
import UserItemsContextProvider from "./contexts/user-items-context";
import Video from "./controls/video";

export const DarkModeContext = createContext(false);

function App() {
  const outlet = useOutlet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!outlet) {
      console.log("bruh");
      navigate("/item/root");
    }
  }, []);

  const localDarkMode = window.localStorage.getItem("darkMode");
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localDarkMode || "false")
  );

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("darkMode", darkMode ? "true" : "false");

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const myNav = (
    <Nav>
      <div className="flex-1">
        {collapsed ? (
          <div className="flex">
            <Logo />
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="">
        <TimeConductorView />
      </div>
      <div className="flex-1 flex justify-end">
        <Button className="mr-2" name="Download" />
        <Select checked={darkMode} onChange={setDarkMode}>
          {darkMode ? <FiSun /> : <FiMoon />}
        </Select>
      </div>
    </Nav>
  );

  const mainView = (
    <div className="h-full flex flex-col">
      {myNav}
      {outlet}
    </div>
  );

  return (
    <DarkModeContext.Provider value={darkMode}>
      <TimeConductorProvider>
        <UserItemsContextProvider>
          <IOContextProvider>
            <>
              <SensorNetPlugin />
            </>
            <div className="bg-white dark:bg-black text-black dark:text-gray-100 h-full">
              <VertLayout onCollapse={setCollapsed}>
                <Sidebar />
                {mainView}
              </VertLayout>
            </div>
          </IOContextProvider>
        </UserItemsContextProvider>
      </TimeConductorProvider>
    </DarkModeContext.Provider>
  );
}

export default App;
