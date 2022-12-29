<script lang="ts">
    import SensorConfig from '../components/SensorConfig.svelte';
    import type { Sensor } from '$lib/server/sensors';
    import type { PageData } from './$types';
    import { writable } from 'svelte/store';
    import type { Writable } from 'svelte/store';
    export let data: PageData;

    // search for the sensor with the given id
    let search = '';
    $: filteredSensors = data.sensors.filter(
        (sensor) => sensor.id.includes(search) || sensor.name.includes(search) || sensor.units.includes(search)
    );

    let newSensors: Writable<Sensor[]> = writable([]);
    const addSensorUI = (i: number) => {
        console.log('Adding sensor');
        $newSensors = [
            ...$newSensors,
            {
                id: `sensor.new${i}`,
                name: `New Sensor ${i}`,
                units: '',
                calibration: {
                    slope: 1,
                    offset: 0
                }
            }
        ];
    };
</script>

<nav>
    <h1>Sensor Configuration</h1>
    <div class="right">
        <button on:click={addSensorUI}>
            <img src="icons/add_circle.svg" alt="Add Sensor" />
        </button>
        <input type="text" placeholder="Search for a sensor" bind:value={search} />
    </div>
</nav>

<div class="content">
    {#each filteredSensors as sensor}
        <SensorConfig
            sensorID={sensor.id}
            sensorName={sensor.name}
            sensorUnit={sensor.units}
            calibrationSlope={sensor.calibration.slope}
            calibrationOffset={sensor.calibration.offset}
            adding={false}
        />
    {/each}
    {#each $newSensors as sensor, i}
        <SensorConfig
            sensorID={sensor.id + (i + 1)}
            sensorName={sensor.name + ' ' + (i + 1)}
            sensorUnit={sensor.units}
            calibrationSlope={sensor.calibration.slope}
            calibrationOffset={sensor.calibration.offset}
            adding={true}
            removeCallback={() => {
                newSensors.update((sensors) => {
                    sensors.splice(i, 1);
                    return sensors;
                });
            }}
        />
    {/each}
</div>

<style lang="scss">
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #000;
        margin-bottom: 1rem;
        .right {
            display: flex;
            align-items: center;
            button {
                background: none;
                border: none;
                padding: 0;
                margin-right: 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                img {
                    width: 3em;
                    height: 3em;
                }
            }
        }
        h1 {
            margin: 0;
            font-size: x-large;
        }
        input {
            padding: 0.5rem;
            width: 200px;
        }
    }
    .content {
        padding: 0 1rem;
    }
</style>
