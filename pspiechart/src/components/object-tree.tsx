"use client";

import { useState, useContext, useEffect } from "react";
import { IOContext, IDataSource } from "../io-context";
import {
  Tree,
  TreeItemIndex,
  ControlledTreeEnvironment,
  TreeItem,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";

export default function ObjectTree() {
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>();
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  const { dataSources } = useContext(IOContext);
  let groupedSources: { [namespace: string]: IDataSource[] } = {};
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

  const sourceNodes = Object.entries(groupedSources).forEach(
    ([namespace, sources]) => {
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
    }
  );

  return (
    <ControlledTreeEnvironment
      items={items}
      getItemTitle={(item) => item.data}
      viewState={{
        ["tree"]: {
          focusedItem,
          expandedItems,
          selectedItems,
        },
      }}
      onFocusItem={(item) => setFocusedItem(item.index)}
      onExpandItem={(item) => setExpandedItems([...expandedItems, item.index])}
      onCollapseItem={(item) =>
        setExpandedItems(
          expandedItems.filter(
            (expandedItemIndex) => expandedItemIndex !== item.index
          )
        )
      }
      onSelectItems={(items) => setSelectedItems(items)}
    >
      <Tree treeId="tree" rootItem="root" treeLabel="Object Tree" />
    </ControlledTreeEnvironment>
  );
}
