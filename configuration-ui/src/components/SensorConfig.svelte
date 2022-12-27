<script lang="ts">
    import { slide } from 'svelte/transition';
    export let sensorID: string;
    export let sensorName: string;
    export let sensorUnit: string;

    export let calibrationSlope: number;
    export let calibrationOffset: number;

    export let adding: boolean;

    export let removeCallback = () => {
        return;
    };

    const prevState = {
        sensorID,
        sensorName,
        sensorUnit,
        calibrationSlope,
        calibrationOffset
    };

    let node: HTMLElement;
    let headerNode: HTMLElement;

    let showConfig = adding;

    const saveAction = () => {
        showConfig = false;

        const body = JSON.stringify({
            id: sensorID,
            name: sensorName,
            units: sensorUnit,
            calibration: {
                slope: calibrationSlope,
                offset: calibrationOffset
            }
        });
        const headers = {
            'Content-Type': 'application/json'
        };

        if (adding) {
            fetch('/sensors', {
                method: 'POST',
                headers,
                body
            });
            adding = false;
        } else {
            fetch(`/sensors/${prevState.sensorID}`, {
                method: 'PUT',
                headers,
                body
            });
        }
    };

    const cancelAction = () => {
        if (adding) {
            headerNode.style.margin = '0';
            node.style.height = '0px';
            node.style.opacity = '0';
            node.style.marginBottom = '0';

            setTimeout(() => {
                node.style.padding = '0';
            }, 100);

            setTimeout(() => {
                removeCallback();
            }, 500);
        } else {
            showConfig = false;
            sensorID = prevState.sensorID;
            sensorName = prevState.sensorName;
            sensorUnit = prevState.sensorUnit;
            calibrationSlope = prevState.calibrationSlope;
            calibrationOffset = prevState.calibrationOffset;
        }
    };
</script>

<div
    class="sensor-wrapper"
    style="border-color: {!showConfig ? '#999' : '#0398fc'}; height: {!showConfig ? '75px' : '256px'}"
    bind:this={node}
    transition:slide
>
    <div class="header">
        <h2 bind:this={headerNode}>{sensorName} ({sensorID})</h2>
        <button on:click={() => (showConfig = !showConfig)} style="transform: rotate({!showConfig ? 0 : 180}deg);">
            <img src="icons/expand_more.svg" alt="Expand menu" />
        </button>
    </div>
    <div class="sensor-config">
        <table>
            <tr>
                <td>Sensor Name</td>
                <td>
                    <input type="text" bind:value={sensorName} />
                </td>
            </tr>
            <tr>
                <td>Sensor ID</td>
                <td>
                    <input type="text" bind:value={sensorID} />
                </td>
            </tr>
            <tr>
                <td>Sensor Unit</td>
                <td>
                    <input type="text" bind:value={sensorUnit} />
                </td>
            </tr>
            <tr>
                <td>Calibration Slope</td>
                <td>
                    <input type="number" bind:value={calibrationSlope} />
                </td>
            </tr>
            <tr>
                <td>Calibration Offset</td>
                <td>
                    <input type="number" bind:value={calibrationOffset} />
                </td>
            </tr>
        </table>
        <button on:click={saveAction}>{adding ? 'Add' : 'Save'}</button>
        <button on:click={cancelAction}>Cancel</button>
    </div>
</div>

<style lang="scss">
    .sensor-wrapper {
        box-sizing: border-box;
        border: 1px solid;
        padding: 0.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        transition: all 0.3s ease-in-out;
        overflow: hidden;
        table {
            padding: 1rem 0;
            td {
                padding-right: 1rem;
            }
        }
        .header {
            display: flex;
            justify-content: space-between;
            button {
                background: none;
                border: none;
                padding: 0;
                margin: 0;
                cursor: pointer;
                transition: transform 0.3s ease-in-out;
            }
        }
    }
</style>
