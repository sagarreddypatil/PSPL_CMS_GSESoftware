import { sensorDb } from "./db";

interface Calibration {
  id: string; // SensorNet ID (on host device)
  name: string; // Sensor Name
  unit: string; // Unit of measurement

  // Calibration
  calibration: string; // Expression to convert raw data to calibrated data

  // PouchDB stuff
  _id?: string; // PouchDB ID, same as `id`
  _rev?: string;
}

// populate on startup
export const sensors = new Map<string, Calibration>();
sensorDb.allDocs({ include_docs: true }).then((res) => {
  res.rows.forEach((row) => {
    const calibration = row.doc as Calibration;
    sensors.set(calibration.id, calibration);
  });
});

export const getSensors = async (): Promise<Calibration[]> => {
  const res = await sensorDb.allDocs({ include_docs: true });
  return res.rows.map((row) => row.doc as Calibration);
};

export const bulkSensors = async (calibrations: Calibration[]) => {
  const docs = await sensorDb.allDocs({ include_docs: true });
  const oldCalibrations = docs.rows.map((row) => row.doc as Calibration);

  console.log(calibrations);
  const newCalibrations = calibrations
    .map((calibration) => {
      sensors.set(calibration.id, calibration);

      const oldCalibration = oldCalibrations.find(
        (c) => c.id === calibration.id
      );
      if (oldCalibration) {
        return {
          ...oldCalibration,
          ...calibration,
          _rev: oldCalibration._rev,
        };
      } else {
        return calibration;
      }
    })
    .concat(
      oldCalibrations
        .filter((c) => !calibrations.find((c2) => c2.id === c.id))
        .map((c) => ({ ...c, _deleted: true }))
    );

  return await sensorDb.bulkDocs(newCalibrations);
};

export const getSensor = (id: string): Promise<Calibration> => {
  return sensorDb.get(id);
};

export const deleteSensor = async (id: string) => {
  const doc = await sensorDb.get(id);
  const resp = (await sensorDb.remove(doc)).ok;
  if (resp) {
    sensors.delete(id);
  }

  return resp;
};

export const addSensor = async (calibration: Calibration) => {
  if (!("_id" in calibration)) calibration._id = calibration.id;
  const resp = (await sensorDb.put(calibration)).ok;
  if (resp) {
    sensors.set(calibration.id, calibration);
  }
  return resp;
};

export const updateSensor = async (id: string, calibration: Calibration) => {
  if (!("_id" in calibration)) calibration._id = calibration.id;

  const doc = await sensorDb.get(id);
  const newObj = { ...calibration, _rev: doc._rev };
  const resp = (await sensorDb.put(newObj)).ok;

  if (resp) {
    sensors.set(calibration.id, calibration);
  }

  return resp;
};
