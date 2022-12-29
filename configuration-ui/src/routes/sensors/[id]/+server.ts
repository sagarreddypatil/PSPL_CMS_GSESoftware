import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as sensors from '$lib/server/sensors';

export const GET = (async ({ params }) => {
    return new Response(JSON.stringify(sensors.getSensors().find((sensor) => sensor.id === params.id)));
}) satisfies RequestHandler;

export const DELETE = (async ({ params }) => {
    if (sensors.deleteSensor(params.id)) return new Response(JSON.stringify(sensors.getSensors()));
    else throw error(404, { message: 'Sensor Not Found' });
}) satisfies RequestHandler;

export const PUT = (async ({ request, params }) => {
    const data = await request.json();
    const success = sensors.updateSensor(params.id, {
        id: data.id,
        name: data.name,
        units: data.units,
        calibration: {
            slope: data.calibration.slope,
            offset: data.calibration.offset
        }
    });
    if (success) return new Response(JSON.stringify(sensors.getSensors()));
    else throw error(404, { message: 'Sensor Not Found' });
}) satisfies RequestHandler;

export const PATCH = (async ({ request, params }) => {
    const data = await request.json();
    const sensor = sensors.getSensors().find((sensor) => sensor.id === params.id);
    if (sensor) {
        sensor.calibration.slope = data?.calibration.slope || sensor.calibration.slope;
        sensor.calibration.offset = data?.calibration.offset || sensor.calibration.offset;
        sensor.id = data.id || sensor.id;
        sensor.name = data.name || sensor.name;
        sensor.units = data.units || sensor.units;

        sensors.updateSensor(params.id, sensor);
        return new Response(JSON.stringify(sensors.getSensors()));
    } else {
        throw error(404, { message: 'Sensor Not Found' });
    }
}) satisfies RequestHandler;
