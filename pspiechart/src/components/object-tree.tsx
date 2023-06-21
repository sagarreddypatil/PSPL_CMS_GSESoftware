"use client";

import { useState, useContext } from "react";
import { IOContext, IDataSource } from "../contexts/io-context";
import {
  Tree,
  TreeItemIndex,
  ControlledTreeEnvironment,
  TreeItem,
} from "react-complex-tree";
import { useNavigate } from "react-router-dom";
import "react-complex-tree/lib/style.css";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";

export default function ObjectTree() {
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>();
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);
  const navigate = useNavigate();

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
    const route = `/${identifier[0]}/${identifier[1]}`;
    navigate(route);
  };

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
      onPrimaryAction={openItem}
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
      renderItemTitle={({ title }) => <>{title}</>}
      renderItemArrow={({ item, context }) =>
        item.isFolder ? (
          <>{context.isExpanded ? <FiChevronDown /> : <FiChevronRight />}</>
        ) : null
      }
      renderItem={({ title, arrow, depth, context, children }) => (
        <div {...context.itemContainerWithChildrenProps}>
          <label
            className={`flex items-center hover:font-semibold ${
              context.isSelected
                ? "font-bold bg-rush text-black hover:bg-rush-dark dark:hover:bg-rush-light"
                : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
            {...context.itemContainerWithoutChildrenProps}
            {...context.interactiveElementProps}
          >
            {arrow}
            <div className="mr-2"></div>
            {title}
          </label>
          {children}
        </div>
      )}
      renderTreeContainer={({ children, containerProps }) => (
        <div {...containerProps} className="-space-x-6 select-none">
          <div></div>
          {children}
        </div>
      )}
      renderItemsContainer={({ children, containerProps }) => (
        <div {...containerProps} className="space-x-6">
          <div></div>
          {children}
        </div>
      )}
    >
      <Tree treeId="tree" rootItem="root" treeLabel="Object Tree" />
    </ControlledTreeEnvironment>
  );
}
