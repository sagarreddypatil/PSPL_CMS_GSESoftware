import { useEffect, useState } from "react";
import {
  ControlledTreeEnvironment,
  Tree,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

interface TreeProps {
  items: Record<TreeItemIndex, TreeItem>;
  onPrimaryAction: (item: TreeItem) => void;
}

export default function TreeView({ items, onPrimaryAction }: TreeProps) {
  const {
    focused,
    expanded,
    selected,
  }: {
    focused: TreeItemIndex | undefined;
    expanded: TreeItemIndex[];
    selected: TreeItemIndex[];
  } = JSON.parse(localStorage.getItem("tree") || "{}");

  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>(focused ?? "");
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>(
    expanded ?? []
  );
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>(
    selected ?? []
  );

  useEffect(() => {
    localStorage.setItem(
      "tree",
      JSON.stringify({
        focused: focusedItem,
        expanded: expandedItems,
        selected: selectedItems,
      })
    );
  }, [focusedItem, expandedItems, selectedItems]);

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
      onPrimaryAction={onPrimaryAction}
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
          <>
            <div className="mr-1"></div>
            {context.isExpanded ? <FiChevronDown /> : <FiChevronRight />}
          </>
        ) : null
      }
      renderItem={({ title, arrow, context, children }) => (
        <div {...context.itemContainerWithChildrenProps}>
          <label
            className={`flex items-center hover:font-semibold rounded-sm my-1 ${
              context.isSelected
                ? "font-bold bg-rush text-black hover:bg-rush-dark dark:hover:bg-rush-light"
                : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
            {...context.itemContainerWithoutChildrenProps}
            {...context.interactiveElementProps}
          >
            {arrow}
            <div className="mr-1"></div>
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
