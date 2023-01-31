import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";

export default function SensorNet() {
  const columns = [
    { key: "id", name: "ID", flex: 1 },
    { key: "title", name: "Title", flex: 1 },
  ];

  const rows = [
    {
      id: 0,
      name: "Telemetry",
    },
    {
      id: 1,
      name: "Tables",
    },
  ];

  return (
    <div className="bg-dark text-primary p-2 text-center w-100 h-100">
      <DataGrid columns={columns} rows={rows} />
    </div>
  );

  //   return
}
