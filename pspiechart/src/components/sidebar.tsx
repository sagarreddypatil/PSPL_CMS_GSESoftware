import { useContext } from "react";
import { IOContext, DataSource } from "../contexts/io-context";
import { TreeItemIndex, TreeItem } from "react-complex-tree";
import { useNavigate } from "react-router-dom";
import "react-complex-tree/lib/style.css";
import Nav from "../controls/nav";
import Logo from "../controls/logo";
import { Dropdown, DropdownItem } from "../controls/dropdown";
import TreeView from "../controls/tree-view";
import CreateMenu from "../item-views/create-menu";

export default function Sidebar() {
  const navigate = useNavigate();

  const { dataSources } = useContext(IOContext);

  let groupedSources: { [namespace: string]: DataSource[] } = {};
  dataSources.forEach((source) => {
    const namespace = source.identifier.namespace;
    if (!groupedSources[namespace]) groupedSources[namespace] = [];
    groupedSources[namespace].push(source);
  });

  let items: Record<TreeItemIndex, TreeItem> = {};

  const rootNode: TreeItem = {
    index: "root",
    data: "root",
    children: Object.keys(groupedSources),
  };
  items.root = rootNode;

  Object.entries(groupedSources).forEach(([namespace, sources]) => {
    items[namespace] = {
      index: namespace,
      data: namespace,
      isFolder: true,
      children: sources.map((source) => {
        const index = `${namespace}:${source.identifier.id}`;
        items[index] = {
          index,
          data: source.identifier.name,
          isFolder: false,
        };
        return index;
      }),
    };
  });

  const openItem = (item: TreeItem<any>) => {
    const identifier = (item.index as string).split(":");
    if (!identifier[1]) return;
    const route = `/remote/${identifier[0]}/${identifier[1]}`;
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
