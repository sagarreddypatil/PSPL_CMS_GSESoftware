# SensorNet Server

Data wiring for SensorNet, the telemetry data protocol for PSPL CMS.

## Development

- `yarn install` dependencies
- `yarn dev` to start a live server
- `python test.py` (optional) generate fake data

### Environment Variables

- SensorNet incoming hardcoded to UDP port 3746
- REST API and WebSocket hardcoded to port 8080
- `INFLUXDB_URL`: location of InfluxDB server, uses `http://localhost:8086` if unset
- `INFLUXDB_TOKEN`
- `INFLUXDB_ORG`: uses `psp-liquids` if unset
- `INFLUXDB_BUCKET`: uses `sensornet` if unset

## Deployment

Handled through Docker. See `Dockerfile` for details.
