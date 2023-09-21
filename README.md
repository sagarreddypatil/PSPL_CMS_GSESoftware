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

## Runtime

### Dependencies

- Docker >= 24.0.5

### Setup

1. Clone this repository
1. Open a terminal in the cloned repo
1. Run `docker-compose build` to compile everything
1. Run `docker-compose up -d` to start all the processes in the background
1. You can now access PSPieChart on http://localhost:4173
