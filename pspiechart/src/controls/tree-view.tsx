import { useState } from "react";
import {
  ControlledTreeEnvironment,
  Tree,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { TreeItemFactory } from "../item-views/item-view-factory";

interface TreeProps {
  items: Record<TreeItemIndex, TreeItem>;
  onPrimaryAction: (item: TreeItem) => void;
}

export default function TreeView({ items, onPrimaryAction }: TreeProps) {
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>("root");
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  return (
    <ControlledTreeEnvironment
      items={items}
      canDragAndDrop={true}
      canDropOnFolder={true}
      canDropOnNonFolder={true}
      canReorderItems={true}
      canDrag={() => true}
      canDropAt={() => true}
      onDrop={(items, target) => console.log(items, target)}
      getItemTitle={() => "you should never see this"}
      viewState={{
        ["tree"]: {
          focusedItem,
          expandedItems,
          selectedItems,
        },
      }}
      onFocusItem={(item) => setFocusedItem(item.index)}
      // onExpandItem={(item) => {
      //   setExpandedItems([...expandedItems, item.index]);
      // }}
      // onCollapseItem={(item) => {
      //   setExpandedItems(
      //     expandedItems.filter(
      //       (expandedItemIndex) => expandedItemIndex !== item.index
      //     )
      //   );
      // }}
      onSelectItems={(items) => setSelectedItems(items)}
      renderItemTitle={({ title }) => <>{title}</>}
      renderItemArrow={({ item, context }) => {
        return item.isFolder ? (
          <div
            className="mx-0.5"
            onClick={() => {
              if (context.isExpanded) {
                setExpandedItems(
                  expandedItems.filter(
                    (expandedItemIndex) => expandedItemIndex !== item.index
                  )
                );
              } else {
                setExpandedItems([...expandedItems, item.index]);
              }
            }}
          >
            {context.isExpanded ? <FiChevronDown /> : <FiChevronRight />}
          </div>
        ) : null;
      }}
      renderDragBetweenLine={() => {
        return <div className="bg-rush h-1 w-full"></div>;
      }}
      renderItem={({ item, arrow, context, depth, children }) => {
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
              className={`flex bg-black dark:bg-white items-center rounded-none h-7 ${
                isSelected ? selectedClass : unselectedClass
              } ${isFocused ? focusedClass : ""}`}
              {...context.itemContainerWithoutChildrenProps}
              {...context.interactiveElementProps}
            >
              <div
                className={`h-full`}
                style={{ paddingLeft: `${padAmount}rem` }}
              ></div>
              {arrow ?? <div className="w-2"></div>}
              <div
                onClick={() => onPrimaryAction(item)}
                className="flex-1 me-2"
              >
                <TreeItemFactory item={item.data} />
              </div>
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