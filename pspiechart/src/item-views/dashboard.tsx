import { useCallback, useContext, useEffect, useState } from "react";
import useLocalStorage from "use-local-storage";
import { create } from "zustand";

import { Responsive, Layout, Layouts } from "react-grid-layout";
import SizedDiv from "../controls/sized-div";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { UserItemProps } from "./item-view-factory";
import { UserItemsContext } from "../contexts/user-items-context";
import { ItemViewFactory } from "./item-view-factory";
import Select from "../controls/select";

import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { useDebounce } from "@react-hook/debounce";

const COLS = 12;
const BASE_WIDTH = 3;
const ROW_HEIGHT = 85 / 2;

type EditModeState = {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
};

const useEditMode = create<EditModeState>((set) => ({
  editMode: false,
  setEditMode: (editMode) => set({ editMode }),
}));

export function Dashboard({ item }: UserItemProps) {
  const [size, setSize] = useDebounce({ width: 0, height: 0 }, 100);
  const editMode = useEditMode((state) => state.editMode);

  const [allLayouts, setAllLayouts] = useLocalStorage<{
    [key: string]: Layout[];
  }>(`layouts`, {});

  const myLayout = allLayouts[item.id] ?? [];

  const { userItems } = useContext(UserItemsContext);

  const genSmallLayout = (curLayout: Layout[]) => {
    if (curLayout.length === 0) return [];
    let y = -curLayout[0].h;

    return curLayout.map((item) => {
      return {
        ...item,
        x: 0,
        y: (y += item.h),
        w: BASE_WIDTH,
      };
    });
  };

  const layouts = {
    lg: myLayout,
    xxs: genSmallLayout(myLayout),
  };

  const onResize = useCallback((width: number, height: number) => {
    setSize({ width, height });
  }, []);

  const onLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setAllLayouts((oldAllLayouts) => {
      return {
        ...oldAllLayouts,
        [item.id]: allLayouts.lg,
      };
    });
  };

  return (
    <SizedDiv onResize={onResize}>
      <Responsive
        className="layout"
        layouts={layouts}
        isResizable={editMode}
        isDraggable={editMode}
        breakpoints={{ lg: 640, xxs: 0 }}
        cols={{ lg: COLS, xxs: BASE_WIDTH }}
        rowHeight={ROW_HEIGHT}
        useCSSTransforms={false}
        onLayoutChange={onLayoutChange}
        width={size.width}
        margin={[12, 2]}
      >
        {item.childIds?.map((childId) => {
          const child = userItems.get(childId);
          return (
            <div key={childId}>
              <fieldset className="bg-white dark:bg-black ring-1 ring-opacity-20 dark:ring-opacity-20 ring-black dark:ring-white w-full h-full min-w-0 text-center flex flex-col justify-center">
                <legend className="w-auto mx-auto bg-white dark:bg-black">
                  {child?.name}
                </legend>
                {editMode ? (
                  <div className="w-full h-full flex text-center text-5xl">
                    <div className="m-auto">It goeth here</div>
                  </div>
                ) : (
                  <ItemViewFactory itemId={childId} />
                )}
              </fieldset>
            </div>
          );
        })}
      </Responsive>
    </SizedDiv>
  );
}

export function DashboardTreeItem({}: UserItemProps) {
  const { editMode, setEditMode } = useEditMode();

  return (
    <Select
      checked={editMode}
      onChange={(value) => setEditMode(value)}
      className="pl-1 pr-1 pt-1 pb-1 text-sm h-3/4 flex items-center"
    >
      <HiOutlineWrenchScrewdriver />
    </Select>
  );
}
