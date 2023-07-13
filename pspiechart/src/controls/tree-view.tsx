import { useEffect, useState } from "react";
import {
  ControlledTreeEnvironment,
  Tree,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";
import { FiChevronRight, FiChevronDown, FiAnchor } from "react-icons/fi";

interface TreeProps {
  items: Record<TreeItemIndex, TreeItem>;
  onPrimaryAction: (item: TreeItem) => void;
}

export default function TreeView({ items, onPrimaryAction }: TreeProps) {
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>("root");
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  useEffect(() => {
    const {
      focused,
      expanded,
      selected,
    }: {
      focused: TreeItemIndex | undefined;
      expanded: TreeItemIndex[];
      selected: TreeItemIndex[];
    } = JSON.parse(localStorage.getItem("tree") || "{}");
    setFocusedItem(focused ?? "root");
    setExpandedItems(expanded ?? []);
    setSelectedItems(selected ?? []);
  }, []);

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
      canDragAndDrop={true}
      canDropOnFolder={true}
      canDropOnNonFolder={true}
      canReorderItems={true}
      canDrag={(selected) => true}
      canDropAt={(dragged, target) => true}
      onDrop={(items, target) => console.log(items, target)}
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
          <div className="mx-0.5">
            {context.isExpanded ? <FiChevronDown /> : <FiChevronRight />}
          </div>
        ) : null
      }
      renderDragBetweenLine={() => {
        return <div className="bg-rush h-1 w-full"></div>;
      }}
      renderItem={({ title, arrow, context, depth, children }) => {
        const isSelected = context.isSelected;
        const isFocused = context.isFocused;

        const selectedClass =
          "bg-opacity-[0.15] hover:bg-opacity-20 dark:bg-opacity-[0.15] dark:hover:bg-opacity-20";
        const unselectedClass =
          "bg-opacity-0 hover:bg-opacity-5 dark:bg-opacity-0 dark:hover:bg-opacity-5";

        const focusedClass = "";

        const padAmount = depth * 1; // tailwind

        return (
          <div {...context.itemContainerWithChildrenProps} className="">
            <label
              className={`flex bg-black dark:bg-white items-center rounded-none ${
                isSelected ? selectedClass : unselectedClass
              } ${isFocused ? focusedClass : ""}`}
              {...context.itemContainerWithoutChildrenProps}
              {...context.interactiveElementProps}
            >
              <div
                className={`h-full`}
                style={{ paddingLeft: `${padAmount}rem` }}
              ></div>
              {arrow}
              {title}
            </label>
            {children}
          </div>
        );
      }}
      renderTreeContainer={({ children, containerProps }) => (
        <div
          {...containerProps}
          className="select-none"
          // onBlur={() => setFocusedItem("root")}
        >
          {children}
        </div>
      )}
      renderItemsContainer={({ children, containerProps }) => (
        <div {...containerProps}>{children}</div>
      )}
    >
      <Tree treeId="tree" rootItem="root" treeLabel="Object Tree" />
    </ControlledTreeEnvironment>
  );
}
