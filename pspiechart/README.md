# PSPieChart

Web-based mission control software for PSPL CMS.

Written in React and TypeScript.

## Development

Run `yarn install` to install dependencies.

Run `yarn dev` to start a live development server.

Run `yarn build` to run a test production build.

### SensorNet Server

Connection to SensorNet server implemented in `src/io-plugins/sensornet.tsx`

Server location temporarily hardcoded to `localhost:8080`, needs to be changed for Docker usage

## Deployment

Done through `docker`, see `Dockerfile`.
