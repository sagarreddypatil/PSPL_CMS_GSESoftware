import { createContext, useEffect, useState } from "react";

import IOContextProvider from "./contexts/io-context";                  //
import TimeConductorProvider from "./contexts/time-conductor-context";  //
import UserItemsContextProvider from "./contexts/user-items-context";   //

import VertLayout from "./layouts/vert-layout";
import Select from "./controls/select";
import { FiMoon, FiSun } from "react-icons/fi";                         //
import { Outlet, useNavigate, useOutlet } from "react-router-dom";
import Sidebar from "./components/sidebar";

import SensorNetPlugin from "./sensornet/io-plugin";                    // 

import TimeConductorView from "./components/time-conductor";
import Logo from "./controls/logo";
import Nav from "./controls/nav";
import { Dropdown, DropdownItem } from "./controls/dropdown";
import { pb } from "./Login";                                           // Pocketbase data base
import { Button } from "./controls/button";

export const DarkModeContext = createContext(false);                    // 

function App() {
  const outlet = useOutlet();
  const navigate = useNavigate();

  // Checking if user is logged in or not
  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate("/login");
    }
  });

  // Logging out user
  const logout = () => {
    pb.authStore.clear();
    navigate("/login");
  };

  // Goes to the root page for all items if there is no selected item (indicated by !outlet)
  // Checks whenever App is rerendered
  // Dependencies: outlet (any child elements of component - any individual item selected)
  // Side Effects: navigate user to other page
  useEffect(() => {
    if (!outlet) {
      navigate("/item/root");
    }
  }, [outlet, navigate]);

  // If the user has dark mode enabled on personal computer, the web application whill change to accomadate the user
  // Dependencies: user's local storage
  // Side Effects: Changing css of document (adding dark to class list)
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

  // Component to be displayed at all times 
  // Holds navbar, logo, time conductor view, dark mode option, sensornet settings dropdown, logout button and the outlet 
  // the outlet is shown at the bottom of the main view. The outlet contains the selected item by the user
  // Dependencies: dark mode, logo, time conductor view, FiSun, FiMoon, outlet
  // SideEffects: None. Will later be used in the application shown to user down below
  const mainView = (
    <div className="h-full flex flex-col">
      <Nav>
        <div className="flex-1 flex flex-row gap-1">
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
        <div className="flex-1 flex justify-end gap-2">
          <Select checked={darkMode} onChange={setDarkMode}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </Select>
          <Dropdown name="Settings" right={true}>
            {/* <DropdownItem onClick={() => navigate("/settings")}>
              PSPC Settings
            </DropdownItem> */}
            <DropdownItem onClick={() => navigate("/sensornet")}>
              SensorNet Settings
            </DropdownItem>
          </Dropdown>
          <Button onClick={logout}>Logout</Button>
        </div>
      </Nav>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );

  // Web application shown to use at all times. Only variables aspects are the dark mode aspect and the main veiw.
  // Dependices: dark mode, main view
  // Side Effects: Web page shown to authorized user
  // Currently do not understand the contexts which rap the main veiw
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
