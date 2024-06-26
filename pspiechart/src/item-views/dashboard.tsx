import { useCallback, useContext, useEffect } from "react";
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
import { usePbRecord } from "../hooks/pocketbase";
import Banner from "../controls/banner";
import { pb } from "../Login";

const COLS = 20;
const ROWS = 14;
const BASE_WIDTH = 3;

type EditModeState = {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
};

type SavedLayout = {
  id: string;
  layout: Layout[];
};

const useEditMode = create<EditModeState>((set) => ({
  editMode: false,
  setEditMode: (editMode) => set({ editMode }),
}));

// to prevent this thing from spamming the db
let prevLayout: Layout[] = [];
function layoutsEqual(a: Layout[], b: Layout[]) {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (
      a[i].i !== b[i].i ||
      a[i].x !== b[i].x ||
      a[i].y !== b[i].y ||
      a[i].w !== b[i].w ||
      a[i].h !== b[i].h
    ) {
      return false;
    }
  }

  return true;
}

export function Dashboard({ item }: UserItemProps) {
  const { userItems } = useContext(UserItemsContext);

  const [size, setSize] = useDebounce({ width: 0, height: 0 }, 10);
  const editMode = useEditMode((state) => state.editMode);

  const {
    loading,
    error,
    record: layout,
    setRecord: setLayout,
  } = usePbRecord<SavedLayout>("dashboardLayouts", item.id);

  const onResize = useCallback((width: number, height: number) => {
    setSize({ width, height });
  }, []);

  useEffect(() => {
    if (!loading && error) {
      pb.collection("dashboardLayouts").create({
        id: item.id,
        layout: [],
      });
    }
  }, [loading, error]);

  // if (loading) return <Banner text="Loading..." />;

  const myLayout = layout?.layout ?? [];

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

  const onLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    if (layoutsEqual(prevLayout, allLayouts.lg)) return;

    prevLayout = allLayouts.lg;
    setLayout({
      id: item.id,
      layout: allLayouts.lg,
    });
  };

  return (
    <SizedDiv onResize={onResize}>
      { (loading || size.width <= 1e-2) ? <Banner text="Loading..." /> :
      <Responsive
        className="layout"
        layouts={layouts}
        isResizable={editMode}
        isDraggable={editMode}
        breakpoints={{ lg: 640, xxs: 0 }}
        cols={{ lg: COLS, xxs: BASE_WIDTH }}
        rowHeight={size.height / ROWS - 0.5}
        useCSSTransforms={false}
        onLayoutChange={onLayoutChange}
        width={size.width}
        margin={[12, 0]}
      >
        {item.childIds?.map((childId) => {
          const child = userItems.get(childId);
          return (
            <div key={childId} className="pb-1">
              <fieldset className="bg-white dark:bg-black ring-1 ring-opacity-20 dark:ring-opacity-20 ring-black dark:ring-white w-full h-full min-w-0 text-center items-center flex flex-col justify-center">
                <legend className="w-auto mx-auto bg-white dark:bg-black max-w-[80%] truncate">
                  {child?.name}
                </legend>
                {editMode ? (
                  <div className="w-full h-full flex text-center text-5xl">
                    <div className="m-auto">It goeth here</div>
                  </div>
                ) : (
                  <div className="w-full h-full overflow-hidden">
                    <ItemViewFactory itemId={childId} />
                  </div>
                )}
              </fieldset>
            </div>
          );
        })}
      </Responsive> }
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
