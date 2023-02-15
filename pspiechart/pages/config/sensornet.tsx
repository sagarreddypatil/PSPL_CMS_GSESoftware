import "react-data-grid/lib/styles.css";
import DataGrid, {
  DataGridHandle,
  FillEvent,
  textEditor,
} from "react-data-grid";
import Navbar, { NavTitle } from "@/components/Navbar";
import { useRef } from "react";
import handle from "../api/dashboard/[id]";

const columnKeys = [
  "id",
  "name",
  "unit",
  "adcBitness",
  "adcGain",
  "offset",
  "gain",
];

const columnNames = [
  "ID",
  "Name",
  "Unit",
  "ADC Bitness",
  "ADC Gain",
  "Offset",
  "Gain",
];

interface Row {
  id: number;
  name: string;
  unit: string;
  adcBitness: number;
  adcGain: number;
  offset: number;
  gain: number;
}

export default function SensorNet() {
  const columns = columnKeys.map((column, index) => {
    return {
      key: column,
      name: columnNames[index],
      flex: 1,
      editor: textEditor,
    };
  });

  const rows = [...Array(30)].map((_, row) => {
    return {
      id: row,
      name: "PV-N2-" + row,
    };
  });

  function handleFill({
    columnKey,
    sourceRow,
    targetRow,
  }: FillEvent<Row>): Row {
    return { ...targetRow, [columnKey]: sourceRow[columnKey as keyof Row] };
  }

  return (
    <div className="bg-dark p-2 w-100 h-100 d-flex flex-column">
      <Navbar>
        <NavTitle>
          <h3 className="mb-0 px-2">SensorNet Config</h3>
        </NavTitle>
      </Navbar>
      <div className="flex-fill overflow-auto">
        <DataGrid
          columns={columns}
          rows={rows}
          onFill={handleFill}
          className="rdg-psp h-100"
        />
      </div>
    </div>
  );

  //   return
}
