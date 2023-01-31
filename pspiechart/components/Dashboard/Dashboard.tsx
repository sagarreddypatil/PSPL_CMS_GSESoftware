import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import Hero from "../Hero";
import Navbar, { NavTitle, NavSegment } from "@/components/Navbar";
import { setConstantValue } from "typescript";
import { FullscreenContext } from "../../contexts/FullscreenContext";
import { SizeMe } from "react-sizeme";

// const ResponsiveGridLayout = WidthProvider(Responsive);

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

  const { fullscreen, setFullscreen } = useContext(FullscreenContext);

  useEffect(() => {
    const handleKeypress = (e: KeyboardEvent) => {
      if (e.key == "Escape") {
        // setEditMode(false);
        setFullscreen(false);
      }

      if (e.key == "Enter") {
        setEditMode(false);
      }

      if (e.key == "e") {
        setEditMode(true);
      }

      if (e.key == "f") {
        setFullscreen(true);
      }
    };

    document.addEventListener("keydown", handleKeypress, false);
    return () => {
      document.removeEventListener("keydown", handleKeypress, false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    return <Hero title="Dashboard not found" text="Check your URL" />;
  if (!data) return <Hero title="Loading..." />;

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
            <Button type="submit" variant="outline-primary">
              <Icon.Plus /> Add Panel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <div className={`${styles["dashboard-container"]} flex-fill p-2`}>
        {fullscreen ? null : (
          <Navbar>
            <NavTitle>
              {/* {editMode ? (
              <Form.Control
                defaultValue={data.name}
                // @ts-ignore
                onChange={(e) => (nameTextRef.current = e.target.value)}
              />
            ) : ( */}
              <h3
                className="mb-0 px-2"
                spellCheck={false}
                contentEditable={editMode}
                suppressContentEditableWarning={true}
                onInput={(e) =>
                  //@ts-ignore
                  (nameTextRef.current = e.currentTarget.innerText)
                }
              >
                {data.name}
              </h3>
              {/* )} */}
            </NavTitle>
            <NavSegment>
              <Button variant="outline-danger" onClick={deleteDashboard}>
                <Icon.Trash /> Delete Dashboard
              </Button>
              <ToggleButton
                variant="outline-primary"
                type="checkbox"
                checked={editMode}
                value="1"
                onClick={(e) => setEditMode(!editMode)}
              >
                <Icon.PencilSquare />
                {"  "} Edit Mode
              </ToggleButton>
              <Button
                variant="outline-primary"
                disabled={!editMode}
                onClick={() => setShowAdd(true)}
              >
                <Icon.Plus /> Add Panel
              </Button>
            </NavSegment>
            <NavSegment>
              <ToggleButton
                variant="outline-primary"
                type="checkbox"
                checked={paused}
                value="1"
                onClick={(e) => setPaused(!paused)}
              >
                <Icon.PauseFill /> Pause Plots
              </ToggleButton>
              <Button
                variant="outline-primary"
                onClick={() => {
                  setFullscreen(!fullscreen);
                  setEditMode(true);
                  setEditMode(false);
                }}
              >
                <Icon.Fullscreen />
              </Button>
            </NavSegment>
          </Navbar>
        )}
        <div className={"flex-fill " + editMode ? " user-select-none" : ""}>
          <SizeMe>
            {({ size }) => {
              if (!size.width) return <Hero title="Loading..." />;
              else
                return (
                  <Responsive
                    isDraggable={editMode}
                    isResizable={editMode}
                    containerPadding={[0, 0]}
                    useCSSTransforms={false}
                    width={size.width ?? undefined}
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
                  </Responsive>
                );
            }}
          </SizeMe>
        </div>
      </div>
    </>
  );
}
