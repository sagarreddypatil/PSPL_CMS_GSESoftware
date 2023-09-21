import { sensorDb } from "./db";

interface Calibration {
  id: string; // SensorNet ID (on host device)
  name: string; // Sensor Name
  unit: string; // Unit of measurement

  // Calibration
  calibrationExpression: string; // Expression to convert raw data to calibrated data

  // PouchDB stuff
  _id?: string; // PouchDB ID, same as `id`
  _rev?: string;
}

export const getSensors = async (): Promise<Calibration[]> => {
  const res = await sensorDb.allDocs({ include_docs: true });
  return res.rows.map((row) => row.doc as Calibration);
};

export const bulkSensors = async (calibrations: Calibration[]) => {
  const docs = await sensorDb.allDocs({ include_docs: true });
  const oldCalibrations = docs.rows.map((row) => row.doc as Calibration);

  const newCalibrations = calibrations.map((calibration) => {
    const oldCalibration = oldCalibrations.find((c) => c.id === calibration.id);
    if (oldCalibration) {
      return {
        ...oldCalibration,
        ...calibration,
        _rev: oldCalibration._rev,
      };
    } else {
      return calibration;
    }
  });

  return await sensorDb.bulkDocs(newCalibrations);
};

export const getSensor = (id: string): Promise<Calibration> => {
  return sensorDb.get(id);
};

export const deleteSensor = async (id: string) => {
  const doc = await sensorDb.get(id);
  return (await sensorDb.remove(doc)).ok;
};

export const addSensor = async (calibration: Calibration) => {
  if (!("_id" in calibration)) calibration._id = calibration.id;
  return (await sensorDb.put(calibration)).ok;
};

export const updateSensor = async (id: string, calibration: Calibration) => {
  if (!("_id" in calibration)) calibration._id = calibration.id;

  const doc = await sensorDb.get(id);
  const newObj = { ...calibration, _rev: doc._rev };
  return (await sensorDb.put(newObj)).ok;
};
