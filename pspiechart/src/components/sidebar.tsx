import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
import { useHotkeys } from "react-hotkeys-hook";

type MyTreeIndex = {
  id: string;
  parentId: string | null;
};

/*
 * stupid fucking hack because
 * this idiotic tree view library
 * decides to not return the whole
 * item object when setting selected
 * items so I need to encode this
 * information in the item's id
 * so I can properly delete items
 * from the tree
 *
 * don't make the mistake of using
 * react-complex-tree
 *
 * roll your own
 *
 * holy fucking shit
 *  - Sagar Patil (sagarreddypatil@gmail.com)
 */

function toIndex(item: MyTreeIndex) {
  return btoa(JSON.stringify(item));
}

export function fromIndex(index: string): MyTreeIndex {
  return JSON.parse(atob(index));
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { userItems, setUserItems } = useContext(UserItemsContext);
  const [selected, setSeleced] = useState<string[]>([]);

  // deleting items
  useHotkeys(
    "delete",
    () => {
      setUserItems((items) => {
        let newItems = new Map(items);

        selected.forEach((index) => {
          const { id, parentId } = fromIndex(index);

          if (!parentId) return; // tried to delete root?

          // don't delete if parent is read-only (noStore)
          const oldParent = newItems.get(parentId);
          if (oldParent?.noStore) return;

          // don't delete if item is read-only (noStore) and parent is root
          const child = newItems.get(id);
          if (oldParent?.id === "root" && child?.noStore) return;

          if (!oldParent) {
            console.error("Should be unreachable", oldParent);
            return;
          }

          const newChildren = oldParent.childIds?.filter(
            (childId) => childId != id
          );

          newItems.set(parentId, {
            ...oldParent,
            childIds: newChildren,
          });
        });

        return newItems;
      });
    },
    [selected]
  );

  let items: Record<TreeItemIndex, TreeItem> = {};

  const buildTree = (id: string, parent: string | null) => {
    const item = userItems.get(id);
    if (!item) return;

    const index = toIndex({ id, parentId: parent });
    const childIdxs =
      item.childIds?.map((childId) => toIndex({ id: childId, parentId: id })) ??
      [];

    items[index] = {
      index,
      data: item,
      isFolder: item.childIds ? true : false,
      children: childIdxs,
    };

    item.childIds?.forEach((childId) => {
      buildTree(childId, id);
    });

    return items[index];
  };

  const rootNode = buildTree("root", null);
  items.root = rootNode!!;

  const openItem = (item: TreeItem<any>) => {
    const currentId = location.pathname.split("/").at(-1);
    const newId = (item.data as UserItem).id;

    if (currentId == newId) return;

    const route = `/item/${newId}`;
    navigate(route);
  };

  const addChild = (childItems: UserItem[], parentId: string, pos: number) => {
    // fuck you again complex tree
    // the below line is because the library uses "root" for the parentId
    // instead of the index I specifically told it was the root

    if (parentId == "root") return;

    // if (parentId == "root") parentId = items.root.index.toString();
    parentId = fromIndex(parentId).id;

    setUserItems((userItems) => {
      const parent = userItems.get(parentId);
      if (!parent) {
        console.error(`Parent not found: ${parentId}`);
        return userItems;
      }
      if (!parent.childIds) {
        console.error(`Parent is not a folder: ${parentId}`);
        return userItems;
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

      let newItems = new Map(userItems);
      newItems.set(parentId, newParent);

      return newItems;
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
          selectedItems={selected}
          setSelectedItems={setSeleced}
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
