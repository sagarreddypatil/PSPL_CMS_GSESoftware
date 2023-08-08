# CMS GSE Software

## Components

- `cmdnet`: CommandNet Python library
- `cmdnet-server`: HTTP API for CommandNet, uses `cmdnet` library
- `commandnet-cli`: CLI for CommandNet, uses `cmdnet` library
- `sensornet-server`: Data wiring between SensorNet's UDP packets, InfluxDB, and WebSockets
- `pspiechart`: Web-based mission control software, contains plugins for SensorNet and CommandNet

## Development

### Dependencies

- Python >= 3.10
- InfluxDB (can be run through Docker)
- Node.js >= v20.5.0
- Yarn >= 1.22.19

### Setup

Currently, PSPieChart has not yet been integrated with CommandNet, only SensorNet.
Follow further development instructions in the respective READMEs.

## Deployment

### Dependencies

- Docker >= 24.0.5

### Setup

Use `docker-compose`
