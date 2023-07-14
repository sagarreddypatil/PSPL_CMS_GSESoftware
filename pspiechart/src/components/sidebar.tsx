import { useContext } from "react";
import { TreeItemIndex, TreeItem } from "react-complex-tree";
import { useNavigate } from "react-router-dom";
import "react-complex-tree/lib/style.css";
import Nav from "../controls/nav";
import Logo from "../controls/logo";
import TreeView from "../controls/tree-view";
import CreateMenu from "../item-views/create-menu";
import { UserItemsContext } from "../contexts/user-items-context";
import { ItemViewType } from "../item-views/item-view-factory";

export default function Sidebar() {
  const navigate = useNavigate();

  // const { dataSources } = useContext(IOContext);
  const { userItems } = useContext(UserItemsContext);

  let items: Record<TreeItemIndex, TreeItem> = {};

  const rootNode: TreeItem = {
    index: "root",
    data: "root",
    children: userItems.find((item) => item.id === "root")?.childIds ?? [],
  };

  items.root = rootNode;

  userItems.forEach((item) => {
    if (item.id === "root") return;

    items[item.id] = {
      index: item.id,
      data: item.name,
      isFolder: item.childIds ? true : false,
      children: item.childIds ?? [],
    };
  });

  const openItem = (item: TreeItem<any>) => {
    console.log(item);
    const route = `/item/${item.index}`;
    navigate(route);
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
        <TreeView items={items} onPrimaryAction={openItem} />
      </div>
    </div>
  );
}
