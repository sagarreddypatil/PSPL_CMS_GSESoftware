import { useEffect, useRef, useState } from "react";
import ReactGridLayout from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import AutoSizer from "react-virtualized-auto-sizer";
import { getSystemErrorMap } from "util";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Grid() {
  // create a state called layout
  function genericCell(name: string) {
    return { i: name, x: 0, y: 0, w: 5, h: 5 };
  }
  const [layout, setLayout] = useState([
    genericCell("a"),
    genericCell("b"),
    genericCell("c"),
    genericCell("d"),
    genericCell("e"),
  ]);

  const genSmallLayout = (layout: ReactGridLayout.Layout[]) => {
    if (layout.length === 0) return [];
    let y = -layout[0].h;

    return layout.map((item) => {
      return {
        ...item,
        x: 0,
        y: (y += item.h),
      };
    });
  };

  const layouts = {
    lg: layout,
    xss: genSmallLayout(layout),
  };

  console.log(layouts);

  return (
    <div
      className="flex-fill p-2"
      style={{ overflowY: "auto", overflowX: "hidden" }}
    >
      <ResponsiveGridLayout
        isDraggable={true}
        isResizable={true}
        containerPadding={[0, 0]}
        useCSSTransforms={false}
        margin={[8, 8]}
        breakpoints={{ lg: 480, xxs: 0 }}
        cols={{ lg: 25, xxs: 5 }}
        rowHeight={32}
        layouts={layouts}
        onLayoutChange={(layout, layouts) => setLayout(layouts.lg)}
      >
        {layout.map((item) => (
          <div className="card bg-dark" key={item.i}>
            {item.i}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
