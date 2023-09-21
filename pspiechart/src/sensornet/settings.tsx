import { CellBase, Matrix, Spreadsheet } from "react-spreadsheet";
import { Button } from "../controls/button";
import { useEffect, useState } from "react";

type Sensor = {
  id: string; // SensorNet ID (on host device)
  name: string; // Sensor Name
  unit: string; // Unit of measurement

  // Calibration
  offset: number;
  gain: number;
};

const SENSORNET_SERVER = "localhost:8080";

export default function SensorNetSettings() {
  const [data, setData] = useState<Sensor[]>([]);

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
    { value: sensor.offset },
    { value: sensor.gain },
  ]);

  const onSpreadsheetChange = (data: Matrix<CellBase>) => {
    const newData = data.map((row) => {
      const [id, name, unit, offset, gain] = row;
      return {
        id: id!.value,
        name: name!.value,
        unit: unit!.value,
        offset: offset!.value,
        gain: gain!.value,
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
    });
  };

  return (
    <div className="flex flex-col p-4">
      <label className="text-2xl">SensorNet Settings</label>
      <hr className="mt-2 mb-4" />

      <label className="text-xl mb-2">Configure Sensors</label>
      <Spreadsheet
        columnLabels={["ID", "Name", "Unit", "Offset", "Gain"]}
        hideRowIndicators={true}
        data={spreadsheetData}
        onChange={onSpreadsheetChange}
      />
      <Button name="Submit" className="my-2" onClick={submitSensors} />
    </div>
  );
}
