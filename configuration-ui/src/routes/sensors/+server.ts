import type { RequestHandler } from './$types';
import * as sensors from '$lib/server/sensors';

export const GET = (() => {
    return new Response(JSON.stringify(sensors.getSensors()));
}) satisfies RequestHandler;

export const POST = (async ({ request }) => {
    const data = await request.json();
    sensors.addSensor({
        id: data.id,
        name: data.name,
        units: data.units,
        calibration: {
            slope: data.calibration.slope,
            offset: data.calibration.offset
        }
    });
    return new Response(JSON.stringify(sensors.getSensors()));
}) satisfies RequestHandler;
