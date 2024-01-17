import { CellBase, Matrix, Selection, Spreadsheet } from "react-spreadsheet";
import { Button } from "../controls/button";
import { useContext, useEffect, useState } from "react";
import { DarkModeContext } from "../App";
// import { FiTrash2 } from "react-icons/fi";

type Sensor = {
  id: string; // SensorNet ID (on host device)
  name: string; // Sensor Name
  unit: string; // Unit of measurement

  // Calibration
  calibration: string;
};

const myURL = new URL(window.location.href);
myURL.port = "3180";
const SENSORNET_SERVER = myURL.host;

export default function SensorNetSettings() {
  const [data, setData] = useState<Sensor[]>([]);
  const [selected, setSelected] = useState<Selection>();
  const darkMode = useContext(DarkModeContext);

  const [testInput, setTestInput] = useState(0);
  const [updateFailed, setUpdateFailed] = useState(false);
  const [parseErrors, setParseErrors] = useState("");

  useEffect(() => {
    fetch(`http://${SENSORNET_SERVER}/sensors`)
      .then((res) => res.json())
      .then((sources: Sensor[]) =>
        sources.sort((a, b) =>
          a.id.localeCompare(b.id, "en", { numeric: true })
        )
      )
      .then((sources: Sensor[]) => {
        setData(sources);
      });
  }, []);

  const testOutput = (ipt: number, cal: string) => {
    // validate calibration
    try {
      const calibFunc = new Function("x", `return ${cal}`);
      const calibResult = calibFunc(ipt);
      return JSON.stringify(calibResult);
    } catch (e) {
      return <label className="text-red-500">Error</label>;
    }
  };

  const spreadsheetData: Matrix<CellBase> = data
    .map((sensor) => [
      { value: sensor.id },
      { value: sensor.name },
      { value: sensor.unit },
      { value: sensor.calibration },
      { value: testOutput(testInput, sensor.calibration) },
    ])
    .concat([[{ value: "" }, { value: "" }, { value: "" }, { value: "" }]]);

  const onSpreadsheetChange = (data: Matrix<CellBase>) => {
    const filteredData = data.filter((row) => {
      const [id, name, unit, calibration] = row;
      const empty =
        !id?.value && !name?.value && !unit?.value && !calibration?.value;
      return !empty;
    });

    const errors: string[] = [];
    const newData = filteredData.map((row) => {
      const [id, name, unit, calibration] = row;

      return {
        id: id!.value,
        name: name!.value,
        unit: unit!.value,
        calibration: calibration!.value,
      };
    });

    setParseErrors(errors.join("\n"));
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
      <label className="text-xl ">Misc</label>
      <Button
        name="Download All Data"
        className="w-56"
        onClick={() =>
          window.open("http://sensornet.localhost/download/", "_blank")
        }
      />
      <div className="h-2"></div>
      <label className="text-xl ">Configure Sensors</label>
      <div className="flex flex-row gap-2">
        <label>Test Input: </label>
        <input
          className="px-2 w-16 border border-rush dark:bg-black"
          value={testInput}
          onChange={(e) => setTestInput(Number(e.target.value))}
        />
      </div>

      <Spreadsheet
        columnLabels={["ID", "Name", "Unit", "Calibration", "Test Output"]}
        // hideRowIndicators={true}
        rowLabels={data.map((_) => "")}
        data={spreadsheetData}
        onChange={onSpreadsheetChange}
        selected={selected}
        onSelect={setSelected}
        darkMode={darkMode}
      />
      <label className="text-sm text-red-500">{parseErrors}</label>
      <Button className="w-24" name="Submit" onClick={submitSensors} />
      {updateFailed ? (
        <label className="text-red-500">Update failed</label>
      ) : (
        <></>
      )}
    </div>
  );
}
