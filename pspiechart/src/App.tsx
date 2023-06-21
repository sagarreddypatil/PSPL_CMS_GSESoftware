import IOContextProvider from "./contexts/io-context";
import VertLayout from "./layouts/vert-layout";
import Select from "./controls/select";
import { FiMoon, FiSun } from "react-icons/fi";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";
import { createContext, useEffect, useState } from "react";
import SensorNetPlugin from "./plugins/sensornet";
import TimeConductorProvider from "./contexts/time-conductor";
import TimeConductorView from "./components/time-conductor-view";
import Logo from "./controls/logo";

export const DarkModeContext = createContext(false);

function App() {
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

  return (
    <DarkModeContext.Provider value={darkMode}>
      <TimeConductorProvider>
        <IOContextProvider>
          <SensorNetPlugin />

          <div className="bg-white dark:bg-black text-black dark:text-gray-100 h-full">
            <VertLayout onCollapse={setCollapsed}>
              <Sidebar />
              <div className="h-full flex flex-col">
                <nav className="bg-moondust dark:bg-night-sky h-11 dark:text-gray-100">
                  <div className="px-2 flex h-full flex-wrap items-center">
                    <div className="flex-1">
                      {collapsed ? (
                        <div className="flex items-center">
                          <Logo />
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                    <div className="items-center">
                      <TimeConductorView />
                    </div>
                    <div className="flex-1 flex justify-end items-center">
                      <Select className="mr-2">Edit Mode</Select>
                      <Select checked={darkMode} onChange={setDarkMode}>
                        {darkMode ? <FiSun /> : <FiMoon />}
                      </Select>
                    </div>
                  </div>
                </nav>
                <div className="flex-1 overflow-auto">
                  <Outlet />
                </div>
              </div>
            </VertLayout>
          </div>
        </IOContextProvider>
      </TimeConductorProvider>
    </DarkModeContext.Provider>
  );
}

export default App;
