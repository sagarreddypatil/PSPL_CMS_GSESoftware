import { Dropdown, DropdownItem } from "../controls/dropdown";
import Logo from "../controls/logo";
import Nav from "../controls/nav";
import ObjectTree from "./object-tree";

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col">
      <Nav>
        <div className="flex">
          <Logo />
        </div>
        <div className="flex">
          <Dropdown right name="Create">
            <DropdownItem>Dashboard</DropdownItem>
          </Dropdown>
        </div>
      </Nav>
      <div className="pt-2 pe-2 flex-1">
        <ObjectTree />
      </div>
    </div>
  );
}
