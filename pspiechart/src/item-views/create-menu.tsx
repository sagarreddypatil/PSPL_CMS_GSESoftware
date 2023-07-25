import { useContext } from "react";
import { Dropdown, DropdownItem } from "../controls/dropdown";
import { DefaultUserItem, ItemViewType, UserItem } from "./item-view-factory";
import { UserItemsContext } from "../contexts/user-items-context";

function randomId() {
  return Math.random().toString(36).substr(2, 9);
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
  const { setUserItems } = useContext(UserItemsContext);

  const addItem = (type: ItemViewType) => {
    if (!typeDefaults.get(type)) {
      console.error("Type creation not implemented", type);
      return;
    }

    setUserItems((items) => {
      const newItems = new Map(items);

      const id = randomId();
      const newItem: UserItem = {
        id,
        ...typeDefaults.get(type)!!,
      };

      newItems.set(id, newItem);

      const root = newItems.get("root");
      if (!root) {
        console.error("Should be unreachable", root);
        return items;
      }

      root.childIds?.push(id);

      return newItems;
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
