import styles from "../styles/Dashboard.module.scss";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useEffect, useRef, useState } from "react";
import ReactGridLayout from "react-grid-layout";
import AutoSizer from "react-virtualized-auto-sizer";

export default function Grid() {
  function genericCell(name) {
    return { i: name, x: 0, y: 0, w: 5, h: 5 };
  }

  const layout = [
    genericCell("a"),
    genericCell("b"),
    genericCell("c"),
    genericCell("d"),
    genericCell("e"),
  ];

  console.log(layout);

  return (
    <div
      className="flex-fill p-2"
      style={{ overflowY: "auto", overflowX: "hidden" }}
    >
      <AutoSizer disableHeight>
        {({ width }) => {
          return (
            <div style={{ width: `${width}px`, height: "100%" }}>
              <ReactGridLayout
                width={width}
                isDraggable={true}
                isResizable={true}
                containerPadding={[0, 0]}
                useCSSTransforms={false}
                margin={[8, 8]}
                cols={32}
                rowHeight={32}
                layout={layout}
              >
                {layout.map((item) => (
                  <div className="card bg-dark" key={item.i}>
                    {item.i}
                  </div>
                ))}
              </ReactGridLayout>
            </div>
          );
        }}
      </AutoSizer>
    </div>
  );
}
