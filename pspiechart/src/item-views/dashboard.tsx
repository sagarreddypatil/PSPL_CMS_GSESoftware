import { useCallback, useContext, useEffect, useState } from "react";
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
const BASE_HEIGHT = 3;
const ROW_HEIGHT = 85;

type EditModeState = {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
};

const useEditMode = create<EditModeState>((set) => ({
  editMode: false,
  setEditMode: (editMode) => set({ editMode }),
}));

export function Dashboard({ item }: UserItemProps) {
  const existingLayout = JSON.parse(
    localStorage.getItem(`layout:${item.id}`) ?? "[]"
  );

  const editMode = useEditMode((state) => state.editMode);

  const [layout, setLayout] = useState<Layout[]>(existingLayout);
  const [size, setSize] = useDebounce({ width: 0, height: 0 }, 100);

  useEffect(() => {
    localStorage.setItem(`layout:${item.id}`, JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    setLayout(existingLayout);
  }, [item.id]);

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
    lg: layout,
    xxs: genSmallLayout(layout),
  };

  const onResize = useCallback((width: number, height: number) => {
    setSize({ width, height });
  }, []);

  const onLayoutChange = useCallback((_: Layout[], allLayouts: Layouts) => {
    setLayout(
      allLayouts.lg.map((item) => {
        if (item.w === 1) item.w = BASE_WIDTH;
        if (item.h === 1) item.h = BASE_HEIGHT;

        return item;
      })
    );
  }, []);

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
        onLayoutChange={onLayoutChange}
        width={size.width}
        margin={[12, 2]}
      >
        {item.childIds?.map((childId) => {
          const child = userItems.get(childId);
          return (
            <div key={childId}>
              <fieldset className="ring-1 ring-opacity-20 dark:ring-opacity-20 ring-black dark:ring-white w-full h-full min-w-0">
                <legend className="w-auto mx-auto bg-white dark:bg-black">
                  {child?.name}
                </legend>
                {editMode ? (
                  <div className="bg-aged-light dark:bg-aged w-full h-full flex text-center text-5xl text-white shadow-md shadow-night-sky">
                    <div className="m-auto">{child?.name}</div>
                  </div>
                ) : (
                  <ItemViewFactory key={childId} item={child} />
                )}
              </fieldset>
            </div>
          );
        })}
      </Responsive>
    </SizedDiv>
  );
}

export function DashboardTreeItem({ item }: UserItemProps) {
  const { editMode, setEditMode } = useEditMode();

  return (
    <>
      {item.name}
      <div className="flex-grow"></div>
      <div>
        <Select
          checked={editMode}
          onChange={(value) => setEditMode(value)}
          className="py-0.5 px-[0.25rem] text-sm"
        >
          <HiOutlineWrenchScrewdriver />
        </Select>
      </div>
    </>
  );
}
