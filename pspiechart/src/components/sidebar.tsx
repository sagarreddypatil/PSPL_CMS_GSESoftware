import { Dropdown, DropdownItem } from "../controls/dropdown";
import Logo from "../controls/logo";
import ObjectTree from "./object-tree";

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col">
      <nav className="bg-moondust dark:bg-night-sky h-11">
        <div className="h-full px-2 flex flex-row justify-between">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="flex items-center">
            <Dropdown right name="Create">
              <DropdownItem>Dashboard</DropdownItem>
            </Dropdown>
          </div>
        </div>
      </nav>
      <div className="pt-2 pe-2 flex-1">
        <ObjectTree />
      </div>
    </div>
  );
}
