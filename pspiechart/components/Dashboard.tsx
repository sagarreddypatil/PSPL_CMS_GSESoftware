import { useState } from "react";
import styles from "../styles/Dashboard.module.scss";
import ReactGridLayout from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Form, Nav, ToggleButton, Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import Panel from "./Panel";
import TimePlot from "./TimePlot";

const ResponsiveGridLayout = WidthProvider(Responsive);
let counter = 0;

const COLS = 25;
const BASE_WIDTH = 5;
const ROW_HEIGHT = 40 - 6;

export default function Grid() {
  const [editMode, setEditMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [layout, setLayout] = useState<ReactGridLayout.Layout[]>([]);

  const addPanel = () => {
    let widthSum = layout.reduce((acc, item) => acc + item.w, 0);

    let newPanel: ReactGridLayout.Layout = {
      i: counter.toString(),
      x: widthSum % COLS,
      y: Infinity,
      h: BASE_WIDTH,
      w: BASE_WIDTH,
    };

    let newLayout = [...layout, newPanel];
    counter++;

    setLayout(newLayout);
  };

  const removePanel = (i: string) => {
    setLayout(layout.filter((item) => item.i !== i));
  };

  const genSmallLayout = (layout: ReactGridLayout.Layout[]) => {
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
    xxs: genSmallLayout(layout),
  };

  return (
    <div className={`${styles["dashboard-container"]} flex-fill pt-2`}>
      <nav className="navbar navbar-expand-lg sticky-top mx-2 navbar-dark bg-black">
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className="nav-item">
              <ToggleButton
                variant="outline-primary"
                className="p-1 px-2 m-1 ms-2"
                type="checkbox"
                checked={editMode}
                value="1"
                onClick={(e) => setEditMode(!editMode)}
              >
                <Icon.PencilSquare />
                {"  "} Edit Mode
              </ToggleButton>
            </li>
            <li className="nav-item">
              <Button
                variant="outline-primary"
                className="p-1 px-2 m-1 ms-2"
                disabled={!editMode}
                onClick={addPanel}
              >
                <Icon.PlusLg /> Add Panel
              </Button>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <ToggleButton
                variant="outline-primary"
                className="p-1 px-2 m-1 ms-2"
                type="checkbox"
                checked={paused}
                value="1"
                onClick={(e) => setPaused(!paused)}
              >
                <Icon.PauseFill /> Pause Plots
              </ToggleButton>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-primary p-1 px-2 m-1 ms-2">
                <Icon.Fullscreen />
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <div className={"p-2" + (editMode ? " user-select-none" : "")}>
        <ResponsiveGridLayout
          isDraggable={editMode}
          isResizable={editMode}
          containerPadding={[0, 0]}
          useCSSTransforms={false}
          margin={[8, 8]}
          breakpoints={{ lg: 480, xxs: 0 }}
          cols={{ lg: COLS, xxs: BASE_WIDTH }}
          rowHeight={ROW_HEIGHT}
          layouts={layouts}
          onLayoutChange={(layout, layouts) => setLayout(layouts.lg)}
          resizeHandle={
            <Icon.ArrowDownRight
              className={`react-resizable-handle react-resizable-handle-se m-1 user-select-none`}
            />
          }
        >
          {layout.map((item) => (
            <div key={item.i}>
              <Panel
                title={item.i}
                editMode={editMode}
                removeCallback={() => removePanel(item.i)}
              >
                <TimePlot />
              </Panel>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
