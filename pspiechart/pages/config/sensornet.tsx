import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";
import Navbar, { NavTitle } from "@/components/Navbar";

export default function SensorNet() {
  const columns = [
    { key: "id", name: "ID", flex: 1 },
    { key: "title", name: "Title", flex: 1 },
  ];

  const rows = [
    {
      id: 0,
      title: "Telemetry",
    },
    {
      id: 1,
      title: "Tables",
    },
  ];

  return (
    <div className="bg-dark p-2 w-100 h-100">
      <Navbar>
        <NavTitle>
          <h3 className="mb-0 px-2">SensorNet Config</h3>
        </NavTitle>
      </Navbar>
      <DataGrid columns={columns} rows={rows} />
    </div>
  );

  //   return
}
