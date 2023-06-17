import ObjectTree from "./components/object-tree";
import VertLayout from "./components/vert-layout";
import GridLayout from "./components/grid-layout";
import { FiMoon, FiSun } from "react-icons/fi";
import { Dropdown, DropdownItem } from "./components/dropdown";
import Select from "./components/select";

export default function Home() {
  return (
    <VertLayout>
      <div className="h-full flex flex-col">
        <nav className="bg-moondust dark:bg-night-sky h-14">
          <div className="w-full p-2 flex flex-row justify-between">
            <div className="flex items-center">
              <img src="/PSP-2Color.svg" className="h-10" alt="Logo" />
            </div>
            <div className="flex items-center">
              <Dropdown right>
                <DropdownItem>a</DropdownItem>
                <DropdownItem>a</DropdownItem>
                <DropdownItem>a</DropdownItem>
                <DropdownItem>a</DropdownItem>
                <DropdownItem>a</DropdownItem>
              </Dropdown>
            </div>
          </div>
        </nav>
        <div className="p-2 flex-1">
          <ObjectTree />
        </div>
      </div>
      <div className="h-full flex flex-col">
        <nav className="bg-moondust dark:bg-night-sky h-14">
          <div className="w-full p-2 flex flex-row justify-end">
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
        <div className="flex-1 p-2">Hello World</div>
      </div>
    </VertLayout>
  );
}
