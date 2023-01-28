import { PanelStore, PanelType } from "@/types/DashboardInterfaces";
import * as Icon from "react-bootstrap-icons";
import Banner from "../Banner";
import Button from "./Button";
import TimePlot from "./TimePlot";

interface WidgetProps {
  panel?: PanelStore;
  editMode: boolean;
  paused: boolean;
  removeCallback: () => void;
}

function StubPanel({ text }: { text: string }) {
  return (
    <div className="bg-secondary h-100 w-100 align-items-center justify-content-center d-flex">
      <h6 className="my-0">{text}</h6>
    </div>
  );
}

export default function Panel(props: WidgetProps) {
  let panel = <StubPanel text="Invalid Panel"></StubPanel>;

  if (props.panel?.type == PanelType.Line) {
    panel = <TimePlot paused={props.paused} title={props.panel.name} />;
  } else if (props.panel?.type == PanelType.Button) {
    panel = <Button name={props.panel.name} onClick={() => {}} />;
  }

  // switch (props.panel?.type) {
  //   case PanelType.Line:
  //     console.log("bruhA");
  //     panel = <TimePlot paused={props.paused} title={props.panel.name} />;
  //     break;
  //   case PanelType.Button:
  //     console.log("bruhB");
  //     panel = (
  //       <button className="btn btn-danger flex-fill m-2">
  //         <h1 className="mb-0">Test</h1>
  //       </button>
  //     );
  //     break;
  // }

  return (
    <div
      className={`card bg-black align-items-stretch ${
        props.editMode ? "draggable" : ""
      }`}
      style={{ height: "100%" }}
    >
      {props.editMode ? (
        <div
          className="card-header d-flex align-items-center py-0 ps-2 pe-1"
          style={{ height: "40px" }}
        >
          <h5 className="card-title my-1 me-auto">
            {props.panel ? props.panel.name : "Invalid Panel"}
          </h5>
          <button
            className="btn btn-primary btn-icon p-1 mx-1 my-0"
            // onClick={}
          >
            <Icon.Wrench />
          </button>
          <button
            className="btn btn-danger btn-icon p-1 mx-1 my-0"
            onClick={props.removeCallback}
          >
            <Icon.XLg />
          </button>
        </div>
      ) : (
        <></>
      )}
      <div className="card-body p-0 overflow-hidden d-flex">
        {props.editMode ? <StubPanel text="Panel Goes Here" /> : panel}
      </div>
    </div>
  );
}
