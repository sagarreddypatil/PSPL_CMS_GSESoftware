import { Jsonnet } from '@hanazuki/node-jsonnet';
import * as env from '$env/static/private';
import { getSensors } from '../sensors/';
const jsonnet = new Jsonnet();



export const getDatasources = () =>
    fetch(`${env.GRAFANA_URL}/api/datasources`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.GRAFANA_TOKEN}`
        }
    }).then((response) => response.json());

export const getDashboard = () => fetch

export const generateDashboard = async () => {
    const datasources = await getDatasources();
    const json_datasource_uid = datasources.find((datasource: any) => datasource.type === 'simpod-json-datasource').uid;
    const influxdb_datasource_uid = datasources.find((datasource: any) => datasource.type === 'influxdb').uid;
    return jsonnet
    .extCode('sensors', JSON.stringify(getSensors()))
    .extCode('json_datasource_uid', `"${json_datasource_uid}"`)
    .extCode('influxdb_datasource_uid', `"${influxdb_datasource_uid}"`)
    .evaluateFile('grafana/dashboard.jsonnet')
    
}
