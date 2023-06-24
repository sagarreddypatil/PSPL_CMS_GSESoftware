import { useState } from "react";
import { Responsive, Layout } from "react-grid-layout";
import SizedDiv from "../controls/sized-div";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const COLS = 12;
const BASE_WIDTH = 3;
const ROW_HEIGHT = 33;

export interface DashboardData {
  layout: Layout[];
  //   items:
}

export default function Dashboard() {
  const [layout, setLayout] = useState<Layout[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
        <div key="1" className="border-2 border-pink-500 ">
          1
        </div>
        <div key="2" className="border-2 border-pink-500">
          2
        </div>
        <div key="3" className="border-2 border-pink-500">
          3
        </div>
      </Responsive>
    </SizedDiv>
  );
}
