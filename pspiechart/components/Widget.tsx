interface WidgetProps {
  title: string;
  children?: React.ReactNode;
}

export default function Widget(props: WidgetProps) {
  return (
    <div className="card bg-dark" style={{ height: "100%" }}>
      <div
        className="card-header d-flex align-items-center justify-content-start"
        style={{ height: "32px" }}
      >
        <h5 className="card-title my-1">{props.title}</h5>
      </div>
      <div className="card-body flex-column h-100">{props.children}</div>
    </div>
  );
}
