import { useState } from "react";
import styles from "../styles/Dashboard.module.scss";
import ReactGridLayout from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Form, Nav, ToggleButton, Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Grid() {
  const [editMode, setEditMode] = useState(false);

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
        w: 5,
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
              <button className="btn btn-outline-primary p-1 px-2 m-1 ms-2">
                <Icon.Plus /> Add Panel
              </button>
            </li>
          </ul>
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
              <button className="btn btn-outline-primary p-1 px-2 m-1 ms-2">
                <Icon.Fullscreen />
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <div className="p-2">
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
    </div>
  );
}
