"use client";

import { useState } from "react";
import { Responsive, Layout, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { FiArrowDownRight } from "react-icons/fi";

const ResponsiveGridLayout = WidthProvider(Responsive);

const COLS = 12;
const BASE_WIDTH = 3;
const ROW_HEIGHT = 34;

export default function GridLayout() {
  const [layout, setLayout] = useState<Layout[]>([]);

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
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      isResizable={true}
      breakpoints={{ lg: 480, xxs: 0 }}
      cols={{ lg: COLS, xxs: BASE_WIDTH }}
      rowHeight={ROW_HEIGHT}
      onLayoutChange={(layout, layouts) => setLayout(layouts.lg)}
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
    </ResponsiveGridLayout>
  );
}
