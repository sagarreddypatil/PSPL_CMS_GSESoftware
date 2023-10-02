import { CellBase, Matrix, Spreadsheet } from "react-spreadsheet";
import { Button } from "../controls/button";
import { useEffect, useState } from "react";

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

  const [updateFailed, setUpdateFailed] = useState(false);

  useEffect(() => {
    fetch(`http://${SENSORNET_SERVER}/sensors`)
      .then((res) => res.json())
      .then((sources: Sensor[]) => {
        setData(sources);
      });
  }, []);

  const spreadsheetData = data.map((sensor) => [
    { value: sensor.id },
    { value: sensor.name },
    { value: sensor.unit },
    { value: sensor.calibration },
  ]);

  const onSpreadsheetChange = (data: Matrix<CellBase>) => {
    const newData = data.map((row) => {
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
    }).then((res) => {
      if (res.status === 201) {
        // refresh the page
        window.location.reload();
      } else {
        setUpdateFailed(true);
        console.log(res);
      }
    });
  };

  return (
    <div className="flex flex-col p-4">
      <label className="text-2xl">SensorNet Settings</label>
      <hr className="mt-2 mb-4" />

      <label className="text-xl mb-2">Configure Sensors</label>
      <Spreadsheet
        columnLabels={["ID", "Name", "Unit", "Calibration"]}
        hideRowIndicators={true}
        data={spreadsheetData}
        onChange={onSpreadsheetChange}
      />
      <Button name="Submit" className="my-2" onClick={submitSensors} />
      {updateFailed ? (
        <label className="text-red-500">Update failed</label>
      ) : (
        <></>
      )}
    </div>
  );
}
