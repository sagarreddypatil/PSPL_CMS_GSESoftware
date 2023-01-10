import * as Icon from "react-bootstrap-icons";

interface WidgetProps {
  title: string;
  children?: React.ReactNode;
  editMode: boolean;
  removeCallback: () => void;
}

export default function Panel(props: WidgetProps) {
  return (
    <div className="card bg-dark" style={{ height: "100%" }}>
      <div
        className="card-header d-flex align-items-center py-0 ps-2 pe-1"
        style={{ height: "40px" }}
      >
        <h5 className="card-title my-1 me-auto">{props.title}</h5>
        {props.editMode ? (
          <button
            className="btn btn-danger btn-icon p-1 me-0 ms-auto my-0"
            onClick={props.removeCallback}
          >
            <Icon.XLg />
          </button>
        ) : (
          <></>
        )}
      </div>
      <div className="card-body flex-column d-flex p-2 h-100">
        {props.editMode ? (
          <div className="flex-fill bg-secondary text-center d-flex align-items-center">
            <h3 className="flex-fill">Panel Goes Here</h3>
          </div>
        ) : (
          props.children
        )}
      </div>
    </div>
  );
}
