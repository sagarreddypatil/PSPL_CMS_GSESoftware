import VertLayout from "./layouts/vert-layout";
import Select from "./controls/select";
import { FiMoon } from "react-icons/fi";
import GridLayout from "./layouts/grid-layout";
import Sidebar from "./components/sidebar";
import { useEffect, useState } from "react";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    console.log(collapsed);
  }, [collapsed]);

  return (
    <>
      <VertLayout onCollapse={setCollapsed}>
        <Sidebar />
        <div className="h-full flex flex-col">
          <nav className="bg-moondust dark:bg-night-sky h-14">
            <div className="w-full p-2 flex flex-row justify-end">
              {collapsed ? (
                <div className="flex items-center me-auto">
                  <img src="/PSP-2Color.svg" className="h-10" alt="Logo" />
                </div>
              ) : (
                <></>
              )}
              <div className="flex items-center">
                <Select>Edit Mode</Select>
              </div>
              <div className="flex items-center ml-2">
                <Select>
                  <FiMoon />
                </Select>
              </div>
            </div>
          </nav>
          <div className="flex-1">
            <GridLayout />
          </div>
        </div>
      </VertLayout>
    </>
  );
}

export default App;
