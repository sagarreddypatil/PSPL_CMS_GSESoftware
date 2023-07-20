import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  TreeItemIndex,
  TreeItem,
  DraggingPositionItem,
  DraggingPositionBetweenItems,
} from "react-complex-tree";
import "react-complex-tree/lib/style.css";

import Nav from "../controls/nav";
import Logo from "../controls/logo";
import TreeView from "../controls/tree-view";

import CreateMenu from "../item-views/create-menu";

import { UserItemsContext } from "../contexts/user-items-context";
import { UserItem } from "../item-views/item-view-factory";

export default function Sidebar() {
  const navigate = useNavigate();

  // const { dataSources } = useContext(IOContext);
  const { userItems, setUserItems } = useContext(UserItemsContext);

  let items: Record<TreeItemIndex, TreeItem> = {};

  const rootNode: TreeItem = {
    index: "root",
    data: "root",
    children: userItems.get("root")?.childIds ?? [],
  };

  items.root = rootNode;

  userItems.forEach((item) => {
    if (item.id === "root") return;

    items[item.id] = {
      index: item.id,
      data: item,
      isFolder: item.childIds ? true : false,
      children: item.childIds ?? [],
    };
  });

  const openItem = (item: TreeItem<any>) => {
    const route = `/item/${item.index}`;
    navigate(route);
  };

  const addChild = (childItems: UserItem[], parentId: string, pos: number) => {
    setUserItems((items) => {
      const parent = items.get(parentId);
      if (!parent) {
        console.error(`Parent not found: ${parentId}`);
        return items;
      }
      if (!parent.childIds) {
        console.error(`Parent is not a folder: ${parentId}`);
        return items;
      }

      const addChildIds = childItems
        .map((item) => item.id)
        .filter((id) => !parent.childIds?.includes(id));
      if (pos < 0) pos = parent.childIds.length;

      let newChildIds = parent.childIds.slice();
      newChildIds.splice(pos, 0, ...addChildIds);

      const newParent = {
        ...parent,
        childIds: newChildIds,
      };

      items.set(parentId, newParent);
      return items;
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Nav>
        <div className="flex">
          <Logo />
        </div>
        <div className="flex">
          <CreateMenu />
        </div>
      </Nav>
      <div className="pt-2 flex-1">
        <TreeView
          items={items}
          onPrimaryAction={openItem}
          onDrop={(items, target) => {
            const userItems = items.map((item) => item.data);
            if (target.targetType == "item") {
              const actTarget = target as DraggingPositionItem;
              addChild(userItems, actTarget.targetItem.toString(), -1);
            }
            if (target.targetType == "between-items") {
              const actTarget = target as DraggingPositionBetweenItems;
              addChild(
                userItems,
                actTarget.parentItem.toString(),
                actTarget.linePosition == "top"
                  ? actTarget.childIndex - 1
                  : actTarget.childIndex
              );
            }
          }}
        />
      </div>
    </div>
  );
}
