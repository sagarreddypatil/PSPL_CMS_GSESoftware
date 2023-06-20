import IOContextProvider, { IOContext } from "./contexts/io-context";
import VertLayout from "./layouts/vert-layout";
import Select from "./controls/select";
import { FiMoon } from "react-icons/fi";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";
import { useState } from "react";
import SensorNetPlugin from "./plugins/sensornet";
import TimeConductorProvider from "./contexts/time-conductor";
import TimeConductorView from "./components/time-conductor-view";

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TimeConductorProvider>
      <IOContextProvider>
        <SensorNetPlugin />

        <VertLayout onCollapse={setCollapsed}>
          <Sidebar />
          <div className="h-full flex flex-col">
            <nav className="bg-moondust dark:bg-night-sky h-14">
              <div className="px-2 flex h-full flex-wrap items-center">
                <div className="flex-1">
                  {collapsed ? (
                    <div className="flex items-center">
                      <img src="/PSP-2Color.svg" className="h-10" alt="Logo" />
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
                  <Select>
                    <FiMoon />
                  </Select>
                </div>
              </div>
            </nav>
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
          </div>
        </VertLayout>
      </IOContextProvider>
    </TimeConductorProvider>
  );
}

export default App;
