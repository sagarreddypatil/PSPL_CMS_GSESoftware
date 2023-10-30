import { useContext } from "react";
import { Dropdown, DropdownItem } from "../controls/dropdown";
import { DefaultUserItem, ItemViewType } from "./item-view-factory";
import { UserItemsContext } from "../contexts/user-items-context";

function _randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function randomId() {
  const fullId = _randomId() + _randomId();
  const id15 = fullId.substring(0, 15);
  return id15;
}

const defaultFolder: DefaultUserItem = {
  name: "Untitled Folder",
  type: ItemViewType.Folder,
  childIds: [],
};

const defaultDashboard: DefaultUserItem = {
  name: "Untitled Dashboard",
  type: ItemViewType.Dashboard,
  childIds: [],
};

const defaultChart: DefaultUserItem = {
  name: "Untitled Chart",
  type: ItemViewType.Chart,
  childIds: [],
};

const typeDefaults = new Map<ItemViewType, DefaultUserItem>([
  [ItemViewType.Folder, defaultFolder],
  [ItemViewType.Dashboard, defaultDashboard],
  [ItemViewType.Chart, defaultChart],
]);

export default function CreateMenu() {
  const { userItems, createStoredItem, setRootItem } =
    useContext(UserItemsContext);

  const addItem = (type: ItemViewType) => {
    if (!typeDefaults.get(type)) {
      console.error("Type creation not implemented", type);
      return;
    }

    const id = randomId();
    createStoredItem({
      id: id,
      ...typeDefaults.get(type)!!,
    });

    // add to root
    const root = userItems.get("root");
    const newRootChildIds = [...(root?.childIds ?? []), id];
    setRootItem({
      id: "doesntmatter", // TODO: fix for multiple projects
      childIds: newRootChildIds,
    });
  };

  return (
    <Dropdown right name="Create">
      {Array.from(typeDefaults.keys()).map((type) => {
        return (
          <DropdownItem key={type} onClick={() => addItem(type)}>
            {type.toString()}
          </DropdownItem>
        );
      })}
    </Dropdown>
  );
}
