import * as Icon from "react-bootstrap-icons";
import TimePlot from "./TimePlot";

interface WidgetProps {
  title: string;
  editMode: boolean;
  paused: boolean;
  removeCallback: () => void;
}

export default function Panel(props: WidgetProps) {
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
          <h5 className="card-title my-1 me-auto">{props.title}</h5>
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
        {props.editMode ? (
          <div className="bg-secondary h-100 w-100 align-items-center justify-content-center d-flex">
            <h6 className="my-0">Panel Goes Here</h6>
          </div>
        ) : (
          <TimePlot paused={props.paused} />
          // <button className="btn btn-danger flex-fill m-2">
          //   <h1 className="mb-0">Test</h1>
          // </button>
        )}
      </div>
    </div>
  );
}
