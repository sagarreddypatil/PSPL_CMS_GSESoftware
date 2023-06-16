import { sensorDb } from "./db";

interface Calibration {
  id: string; // SensorNet ID (on host device)
  name: string; // Sensor Name
  unit: string; // Unit of measurement

  // Calibration
  offset: number;
  gain: number;

  // PouchDB stuff
  _id?: string; // PouchDB ID, same as `id`
  _rev?: string;
}

export const getSensors = async (): Promise<Calibration[]> => {
  const res = await sensorDb.allDocs({ include_docs: true });
  return res.rows.map((row) => row.doc as Calibration);
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

export const updateSensor = async (calibration: Calibration) => {
  if (!("_id" in calibration)) calibration._id = calibration.id;

  const doc = await sensorDb.get(calibration.id);
  const newObj = { ...calibration, _rev: doc._rev };
  return (await sensorDb.put(newObj)).ok;
};
