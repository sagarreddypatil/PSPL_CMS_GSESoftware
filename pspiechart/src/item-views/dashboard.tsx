import { useContext, useEffect, useState } from "react";
import { Responsive, Layout } from "react-grid-layout";
import SizedDiv from "../controls/sized-div";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { UserItemProps } from "./item-view-factory";
import { UserItemsContext } from "../contexts/user-items-context";
import { ItemViewFactory } from "./item-view-factory";

const COLS = 12;
const BASE_WIDTH = 3;
const ROW_HEIGHT = 33;

export function Dashboard({ item }: UserItemProps) {
  const existingLayout = JSON.parse(
    localStorage.getItem(`layout:${item.id}`) ?? "[]"
  );

  const [layout, setLayout] = useState<Layout[]>(existingLayout);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    localStorage.setItem(`layout:${item.id}`, JSON.stringify(layout));
  }, [layout]);

  const { userItems } = useContext(UserItemsContext);

  const genSmallLayout = () => {
    if (layout.length === 0) return [];
    let y = -layout[0].h;

    return layout.map((item) => {
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
    xxs: genSmallLayout(),
  };

  return (
    <SizedDiv onResize={(width, height) => setSize({ width, height })}>
      <Responsive
        className="layout"
        layouts={layouts}
        isResizable={true}
        breakpoints={{ lg: 480, xxs: 0 }}
        cols={{ lg: COLS, xxs: BASE_WIDTH }}
        rowHeight={ROW_HEIGHT}
        onLayoutChange={(_, layouts) => setLayout(layouts.lg)}
        width={size.width}
      >
        {item.childIds?.map((childId) => {
          const child = userItems.find((item) => item.id === childId);
          return (
            <div key={childId} className="border-2 border-pink-500">
              <ItemViewFactory key={childId} item={child} />
            </div>
          );
        })}
      </Responsive>
    </SizedDiv>
  );
}
