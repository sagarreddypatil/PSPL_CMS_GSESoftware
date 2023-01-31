import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import styles from "@/styles/Dashboard.module.scss";
import ReactGridLayout from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  Form,
  Nav,
  ToggleButton,
  Button,
  FormText,
  Modal,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import Panel from "@/components/Panel/Panel";
import {
  DashboardStore,
  PanelStore,
  PanelType,
} from "@/types/DashboardInterfaces";
import { useRouter } from "next/router";
import Banner from "../Hero";
import { setConstantValue } from "typescript";

const ResponsiveGridLayout = WidthProvider(Responsive);

const COLS = 24;
const BASE_HEIGHT = 10;
const BASE_WIDTH = 6;
const ROW_HEIGHT = 40 - 6;

interface DashboardProps {
  id: number;
}

export default function Dashboard({ id }: DashboardProps) {
  const router = useRouter();

  const nameTextRef = useRef<string>(null);
  const [editMode, setEditMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [data, setData] = useState<DashboardStore>();
  const [layout, setLayout] = useState<ReactGridLayout.Layout[]>([]);
  const [panels, setPanels] = useState<PanelStore[]>([]);

  const [exists, setExists] = useState<boolean>(true);

  useEffect(() => {
    if (editMode) {
      // @ts-ignore
      nameTextRef.current = data?.name;
      setEditMode(false);
    } else if (data?.name == "New Dashboard" && layout.length == 0) {
      setEditMode(true);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // load data on id change

    if (!id) return;

    fetch(`/api/dashboard/${id}`)
      .then((res) => res.json())
      .then((data: DashboardStore) => {
        setData(data);
        setLayout(data.layout ?? []);
        setPanels(data.panels ?? []);
        setExists(true);
      })
      .catch(() => {
        setExists(false);
      });
  }, [id]);

  useEffect(() => {
    // save data once exit edit mode

    if (editMode == true || !data) {
      setShowAdd(false);
      return;
    }

    const newName = nameTextRef.current ?? data.name;
    const newData = { ...data, name: newName, layout: layout, panels: panels };

    setData(newData);

    fetch(`/api/dashboard/${id}`, {
      method: "POST",
      body: JSON.stringify(newData),
    });

    router.push(`/dashboard/${id}?edited`);
  }, [editMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const addLayoutPanel = () => {
    let widthSum = layout.reduce((acc, item) => acc + item.w, 0);
    const panelId = Math.random().toString(36).substring(2);

    let newPanel: ReactGridLayout.Layout = {
      i: panelId,
      x: widthSum % COLS,
      y: Infinity,
      h: BASE_HEIGHT,
      w: BASE_WIDTH,
    };

    let newLayout = [...layout, newPanel];

    setLayout(newLayout);

    return panelId;
  };

  const removePanel = (i: string) => {
    setPanels(panels.filter((item) => item.id !== i));
    setLayout(layout.filter((item) => item.i !== i));
  };

  const deleteDashboard = () => {
    fetch(`/api/dashboard/${id}`, {
      method: "DELETE",
    }).then(() => {
      router.push("/dashboard");
    });
  };

  const addPanelSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // @ts-ignore
    if (!e.target.name.value || !e.target.type.value) return;

    // @ts-ignore
    const name: string = e.target.name.value;
    // @ts-ignore
    const type: PanelType = e.target.type.value;

    const panelId = addLayoutPanel();

    const newPanel: PanelStore = {
      id: panelId,
      name: name,
      type: type,
    };

    setPanels([...panels, newPanel]);
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
    <>
      <Modal
        show={showAdd && editMode}
        contentClassName="bg-dark"
        onHide={() => setShowAdd(false)}
        centered
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Create new PSPanel</Modal.Title>
        </Modal.Header>
        <Form onSubmit={addPanelSubmit}>
          <Modal.Body>
            <Form.Control
              name="name"
              className="mb-3"
              placeholder="Panel Name"
              autoComplete="off"
              autoFocus
              required
            />
            <select name="type" className="form-select" required>
              <option value="">Panel Type</option>
              <option value={PanelType.Line}>Line Chart</option>
              <option value={PanelType.Button}>Button</option>
            </select>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              variant="outline-primary"
              className="p-1 px-2 m-1 ms-2"
            >
              <Icon.Plus /> Add Panel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <div className={`${styles["dashboard-container"]} flex-fill pt-2`}>
        <nav className="navbar navbar-expand-lg sticky-top mx-2 navbar-dark bg-black d-flex">
          <div className="d-flex justify-content-between align-items-center px-2 flex-fill">
            <div className="w-25">
              <div className="">
                {editMode ? (
                  <Form.Control
                    defaultValue={data.name}
                    // @ts-ignore
                    onChange={(e) => (nameTextRef.current = e.target.value)}
                  />
                ) : (
                  <h3 className="mb-0">{data.name}</h3>
                )}
              </div>
            </div>
            <div className="d-flex">
              <div className="">
                <Button
                  variant="outline-danger"
                  className="p-1 px-2 m-1 ms-2"
                  onClick={deleteDashboard}
                >
                  <Icon.Trash /> Delete Dashboard
                </Button>
              </div>
              <div className="">
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
              </div>
              <div className="">
                <Button
                  variant="outline-primary"
                  className="p-1 px-2 m-1 ms-2"
                  disabled={!editMode}
                  onClick={() => setShowAdd(true)}
                >
                  <Icon.Plus /> Add Panel
                </Button>
              </div>
            </div>
            <div className="d-flex">
              <div className="">
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
              </div>
              <div className="">
                <button className="btn btn-outline-primary p-1 px-2 m-1 ms-2">
                  <Icon.Fullscreen />
                </button>
              </div>
            </div>
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
                  panel={panels.find((p) => p.id === item.i)}
                  editMode={editMode}
                  removeCallback={() => removePanel(item.i)}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </div>
    </>
  );
}
