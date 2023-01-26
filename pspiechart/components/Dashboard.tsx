import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/Dashboard.module.scss";
import ReactGridLayout from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Form, Nav, ToggleButton, Button, FormText } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import Panel from "./Panel";
import { DashboardStore } from "@/lib/dashboard-store";
import { useRouter } from "next/router";
import Banner from "./Banner";

const ResponsiveGridLayout = WidthProvider(Responsive);
let counter = 0;

const COLS = 24;
const BASE_HEIGHT = 10;
const BASE_WIDTH = 6;
const ROW_HEIGHT = 40 - 6;

interface DashboardProps {
  id: number;
  editEnd: () => void;
}

export default function Dashboard({ id, editEnd }: DashboardProps) {
  const router = useRouter();

  const nameText = useRef<string>(null);
  const [editMode, setEditMode] = useState(false);
  const [paused, setPaused] = useState(false);

  const [data, setData] = useState<DashboardStore>();
  const [layout, setLayout] = useState<ReactGridLayout.Layout[]>([]);

  const [exists, setExists] = useState<boolean>(true);

  useEffect(() => {
    if (editMode) {
      setEditMode(false);
    } else if (data?.name == "New Dashboard" && layout.length == 0) {
      setEditMode(true);
    }
  }, [data]);

  useEffect(() => {
    // load data on id change

    if (!id) return;

    fetch(`/api/dashboard/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLayout(data.layout ?? []);
        setExists(true);
      })
      .catch(() => {
        setExists(false);
      });
  }, [id]);

  useEffect(() => {
    // save data once exit edit mode

    if (editMode == true || !data) {
      return;
    }

    const newName = nameText.current ?? data.name;
    const newData = { ...data, name: newName, layout: layout };

    setData(newData);
    editEnd();

    fetch(`/api/dashboard/${id}`, {
      method: "POST",
      body: JSON.stringify(newData),
    });
  }, [editMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const addPanel = () => {
    let widthSum = layout.reduce((acc, item) => acc + item.w, 0);

    let newPanel: ReactGridLayout.Layout = {
      i: counter.toString(),
      x: widthSum % COLS,
      y: Infinity,
      h: BASE_HEIGHT,
      w: BASE_WIDTH,
    };

    let newLayout = [...layout, newPanel];
    counter++;

    setLayout(newLayout);
  };

  const removePanel = (i: string) => {
    setLayout(layout.filter((item) => item.i !== i));
  };

  const deleteDashboard = () => {
    fetch(`/api/dashboard/${id}`, {
      method: "DELETE",
    }).then(() => {
      router.push("/dashboard");
    });
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

  if (!exists)
    return <Banner title="Dashboard not found" text="Check your URL" />;
  if (!data) return <Banner title="Loading" />;

  return (
    <div className={`${styles["dashboard-container"]} flex-fill pt-2`}>
      <nav className="navbar navbar-expand-lg sticky-top mx-2 navbar-dark bg-black">
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className="nav-item">
              {editMode ? (
                <Form.Control
                  defaultValue={data.name}
                  // @ts-ignore
                  onChange={(e) => (nameText.current = e.target.value)}
                />
              ) : (
                <h3 className="mb-0">{data.name}</h3>
              )}
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Button
                variant="outline-danger"
                className="p-1 px-2 m-1 ms-2"
                onClick={deleteDashboard}
              >
                <Icon.Trash /> Delete Dashboard
              </Button>
            </li>
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
            {/* <li className="nav-item">
              <Button variant="outline-primary" className="p-1 px-2 m-1 ms-2">
                <Icon.ArrowClockwise /> Reload Layout
              </Button>
            </li> */}
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
                paused={paused}
                title={item.i}
                editMode={editMode}
                removeCallback={() => removePanel(item.i)}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
