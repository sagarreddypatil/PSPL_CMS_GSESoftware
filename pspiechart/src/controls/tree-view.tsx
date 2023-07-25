import { useContext, useEffect, useState } from "react";
import {
  ControlledTreeEnvironment,
  DraggingPosition,
  Tree,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";

import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { TreeItemFactory, UserItem } from "../item-views/item-view-factory";
import Textbox from "./textbox";

interface TreeProps {
  items: Record<TreeItemIndex, TreeItem>;
  onPrimaryAction: (item: TreeItem) => void;
  onDrop: (items: TreeItem[], target: DraggingPosition) => void;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
}

function ItemText({ item, onClick }: { item: UserItem; onClick: () => void }) {
  // return <Textbox />;
  return (
    <div
      onClick={onClick}
      className="h-full flex-grow min-w-0 flex flex-row items-center mr-2 whitespace-nowrap"
      title={item.name}
    >
      <span className="truncate">
        <span className="truncate min-w-0">{item.name}</span>
      </span>
      <div className="flex-grow mx-1"></div>
      <TreeItemFactory item={item} />
    </div>
  );
}

export default function TreeView({
  items,
  onPrimaryAction,
  onDrop,
  selectedItems,
  setSelectedItems,
}: TreeProps) {
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>("root");
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);

  return (
    <ControlledTreeEnvironment
      items={items}
      canSearch={false}
      canRename={false}
      canDragAndDrop={true}
      canDropOnFolder={true}
      canDropOnNonFolder={true}
      canReorderItems={true}
      canDrag={() => true}
      canDropAt={() => true}
      onDrop={onDrop}
      getItemTitle={() => "you should never see this"}
      viewState={{
        ["tree"]: {
          focusedItem,
          expandedItems,
          selectedItems,
        },
      }}
      onFocusItem={(item) => setFocusedItem(item.index)}
      onSelectItems={(items) =>
        setSelectedItems(items.map((item) => item.toString()))
      }
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
              className={`flex flex-row bg-black dark:bg-white items-center rounded-none h-7 ${
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
              <ItemText
                item={item.data}
                onClick={() => onPrimaryAction(item)}
              />
            </label>
            {children}
          </div>
        );
      }}
      renderTreeContainer={({ children, containerProps }) => (
        <div
          {...containerProps}
          className="select-none w-full"
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
