import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSensors } from '$lib/server/sensors';

export const POST = (async ({ request }) => {
    const json = await request.json();
    const split = json.payload.target.split('_');
    const sensors = getSensors();
    const sensor = sensors.find((sensor) => sensor.id === split[0]);
    if (sensor) {
        let value;
        switch (split[1]) {
            case 'slope':
                value = sensor.calibration.slope;
                break;
            case 'offset':
                value = sensor.calibration.offset;
                break;
            case 'units':
                value = sensor.units;
                break;
        }
        return new Response(
            JSON.stringify([
                {
                    __value: value
                }
            ])
        );
    } else {
        throw error(404, { message: 'Sensor Not Found' });
    }
}) satisfies RequestHandler;
