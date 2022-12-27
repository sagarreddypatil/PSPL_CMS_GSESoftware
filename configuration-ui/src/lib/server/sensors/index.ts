import fs from 'fs';
import path from 'path';

export interface Sensor {
    id: string;
    name: string;
    units: string;
    calibration: {
        slope: number;
        offset: number;
    };
}

let sensors: Sensor[];

try {
    sensors = JSON.parse(fs.readFileSync(path.resolve('data/sensors.json'), 'utf8'));
} catch (e) {
    sensors = [];
    fs.mkdir(path.resolve('data'), { recursive: true }, (err) => {
        if (err) throw err;
    });
}

export const getSensors = () => {
    return sensors;
};

export const addSensor = (sensor: Sensor) => {
    sensors.push(sensor);
    fs.writeFile(path.resolve('data/sensors.json'), JSON.stringify(sensors), (err) => {
        if (err) throw err;
        console.log('Sensor added');
    });
};

export const deleteSensor = (id: string) => {
    const index = sensors.findIndex((sensor) => sensor.id === id);
    if (index !== -1) {
        sensors.splice(index, 1);
        fs.writeFile(path.resolve('data/sensors.json'), JSON.stringify(sensors), () => {
            console.log('Sensor deleted');
        });
        return true;
    }
    return false;
};

export const updateSensor = (id: string, sensor: Sensor) => {
    const index = sensors.findIndex((sensor) => sensor.id === id);
    if (index !== -1) {
        sensors[index] = sensor;
        fs.writeFile(path.resolve('data/sensors.json'), JSON.stringify(sensors), () => {
            console.log('Sensor updated');
        });
        return true;
    }
    return false;
};
