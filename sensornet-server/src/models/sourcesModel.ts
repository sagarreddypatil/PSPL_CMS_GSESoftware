import { getSensors } from "./sensorModel";

export interface Source {
  id: string;
  name: string;
  unit: string;
}

export const getSources = () => {
  return getSensors().then((sensors) => {
    return sensors.map((sensor) => {
      return {
        id: sensor.id,
        name: sensor.name,
        unit: sensor.unit,
      } as Source;
    });
  });
};
