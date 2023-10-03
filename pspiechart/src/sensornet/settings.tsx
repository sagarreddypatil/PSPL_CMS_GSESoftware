import {
  CellBase,
  Matrix,
  RowIndicatorProps,
  Selection,
  Spreadsheet,
} from "react-spreadsheet";
import { Button } from "../controls/button";
import { useEffect, useState } from "react";
// import { FiTrash2 } from "react-icons/fi";

type Sensor = {
  id: string; // SensorNet ID (on host device)
  name: string; // Sensor Name
  unit: string; // Unit of measurement

  // Calibration
  calibration: string;
};

const SENSORNET_SERVER = import.meta.env.VITE_SENSORNET_SERVER as string;

export default function SensorNetSettings() {
  const [data, setData] = useState<Sensor[]>([]);
  const [selected, setSelected] = useState<Selection>();

  const [updateFailed, setUpdateFailed] = useState(false);

  useEffect(() => {
    fetch(`http://${SENSORNET_SERVER}/sensors`)
      .then((res) => res.json())
      .then((sources: Sensor[]) => {
        setData(sources);
      });
  }, []);

  const spreadsheetData: Matrix<CellBase> = data
    .map((sensor) => [
      { value: sensor.id },
      { value: sensor.name },
      { value: sensor.unit },
      { value: sensor.calibration },
    ])
    .concat([[{ value: "" }, { value: "" }, { value: "" }, { value: "" }]]);

  const onSpreadsheetChange = (data: Matrix<CellBase>) => {
    const filteredData = data.filter((row) => {
      const [id, name, unit, calibration] = row;
      const empty =
        !id?.value && !name?.value && !unit?.value && !calibration?.value;
      return !empty;
    });

    const newData = filteredData.map((row) => {
      const [id, name, unit, calibration] = row;

      return {
        id: id!.value,
        name: name!.value,
        unit: unit!.value,
        calibration: calibration!.value,
      };
    });

    setData(newData);
  };

  const submitSensors = () => {
    fetch(`http://${SENSORNET_SERVER}/sensors/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (res.status === 201) {
          // refresh the page
          window.location.reload();
        } else {
          setUpdateFailed(true);
          console.log(res);
        }
      })
      .catch((err) => {
        setUpdateFailed(true);
        console.log(err);
      });
  };

  return (
    <div className="flex flex-col p-4 gap-2">
      <label className="text-2xl">SensorNet Settings</label>
      <hr />
      <label className="text-xl">Configure Sensors</label>
      <Spreadsheet
        columnLabels={["ID", "Name", "Unit", "Calibration"]}
        // hideRowIndicators={true}
        rowLabels={data.map((_) => "")}
        data={spreadsheetData}
        onChange={onSpreadsheetChange}
        selected={selected}
        onSelect={setSelected}
      />
      <Button name="Submit" onClick={submitSensors} />
      {updateFailed ? (
        <label className="text-red-500">Update failed</label>
      ) : (
        <></>
      )}
    </div>
  );
}
