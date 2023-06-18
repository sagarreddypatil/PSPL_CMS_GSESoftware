import GlobalContextProvider, { GlobalContext } from "./global-context";
import VertLayout from "./layouts/vert-layout";
import Select from "./controls/select";
import { FiMoon } from "react-icons/fi";
import GridLayout from "./layouts/grid-layout";
import Sidebar from "./components/sidebar";
import { useEffect, useState } from "react";
import { useWindowWidth } from "@react-hook/window-size";
import SensorNetPlugin from "./plugins/sensornet";

function App() {
  const [collapsed, setCollapsed] = useState(false);

  const [rigthPanelWidthPercent, setRightPanelWidthPercent] = useState(0.8);
  const windowWidth = useWindowWidth({ wait: 0 });
  const [rigthPanelWidth, setRightPanelWidth] = useState(0);

  useEffect(() => {
    setRightPanelWidth(windowWidth * rigthPanelWidthPercent);
  }, [windowWidth, rigthPanelWidthPercent]);

  const onResize = (size: number) => {
    setRightPanelWidthPercent(size * 0.01);
  };

  return (
    <GlobalContextProvider>
      <SensorNetPlugin />

      <VertLayout onCollapse={setCollapsed} onResize={onResize}>
        <Sidebar />
        <div className="h-full flex flex-col">
          <nav className="bg-moondust dark:bg-night-sky h-14">
            <div className="px-2 flex h-full flex-wrap justify-end items-center">
              {collapsed ? (
                <div className="flex items-center me-auto">
                  <img src="/PSP-2Color.svg" className="h-10" alt="Logo" />
                </div>
              ) : (
                <></>
              )}
              <Select className="mr-2">Edit Mode</Select>
              <Select>
                <FiMoon />
              </Select>
            </div>
          </nav>
          <div className="flex-1 overflow-auto">
            <GridLayout width={rigthPanelWidth} />
          </div>
        </div>
      </VertLayout>
    </GlobalContextProvider>
  );
}

export default App;
