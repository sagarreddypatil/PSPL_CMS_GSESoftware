import { getSensors } from '$lib/server/sensors';
import type { PageServerLoad } from './$types';
import { generateDashboard } from '$lib/server/grafana';

export const load = (async () => {
    console.log(await generateDashboard());
    return {
        sensors: getSensors()
    };
}) satisfies PageServerLoad;
