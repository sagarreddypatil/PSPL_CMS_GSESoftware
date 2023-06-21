import { Dropdown, DropdownItem } from "../controls/dropdown";
import ObjectTree from "./object-tree";

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col">
      <nav className="bg-moondust dark:bg-night-sky h-11">
        <div className="h-full px-2 flex flex-row justify-between">
          <div className="flex items-center">
            <img src="/PSP-2Color.svg" className="h-7" alt="Logo" />
          </div>
          <div className="flex items-center">
            <Dropdown right name="Create">
              <DropdownItem>Dashboard</DropdownItem>
            </Dropdown>
          </div>
        </div>
      </nav>
      <div className="p-2 flex-1">
        <ObjectTree />
      </div>
    </div>
  );
}