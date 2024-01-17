import { Server } from "hyper-express";
// import cors from "cors";
import useCORS from "./myCORS";
import dgram from "node:dgram";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { packetParser } from "./packets";
import { exit } from "node:process";
import { getSources } from "./models/sourcesModel";
import { closeAll } from "./models/db";
import dotenv from "dotenv";
import sensorsRouter from "./routes/sensors";
import { sensors } from "./models/sensorModel";
import { spawn } from "node:child_process";

dotenv.config();

// --- Setup InfluxDB ---
if (!process.env.INFLUXDB_URL) {
  console.error("INFLUXDB_URL not set, using http://localhost:8086");
}

if (!process.env.INFLUXDB_TOKEN) {
  console.error("Environment variable INFLUXDB_TOKEN not set");
  exit(1);
}

const influxClient = new InfluxDB({
  url: process.env.INFLUXDB_URL || "http://localhost:8086",
  token: process.env.INFLUXDB_TOKEN,
});

if (!process.env.INFLUXDB_ORG) {
  console.error("Environment variable INFLUXDB_ORG not set, using psp-liquids");
}

if (!process.env.INFLUXDB_BUCKET) {
  console.error(
    "Environment variable INFLUXDB_BUCKET not set, using sensornet"
  );
}

const influxWriter = influxClient.getWriteApi(
  process.env.INFLUXDB_ORG || "psp-liquids",
  process.env.INFLUXDB_BUCKET || "sensornet",
  "us",
  {
    // batchSize: 10000,
    flushInterval: 1000,
    // retryJitter: 100,
  }
);
const influxReader = influxClient.getQueryApi(
  process.env.INFLUXDB_ORG || "psp-liquids"
);
// --- End InfluxDB setup ---

const webServer = new Server();

webServer.get("/", (req, res) => {
  res.send("SensorNet API");
});

webServer.use("/sensors", sensorsRouter);

webServer.get("/sources", (req, res) => {
  return getSources()
    .then((sources) => res.json(sources))
    .catch((err) => res.status(err.status).send(err.message));
});

interface WSReq {
  type: "subscribe" | "unsubscribe";
  id: string;
}

webServer.ws("/data", (ws) => {
  ws.on("message", (message) => {
    const req = JSON.parse(message) as WSReq;

    if (req.type === "subscribe") ws.subscribe(req.id);
    if (req.type === "unsubscribe") ws.unsubscribe(req.id);
  });
});

interface HistoricalReq {
  start: number; // seconds
  end: number; // seconds
  dt: number; // seconds
}

const sensorCalibrations = new Map<string, Function>(); // TODO: make this an LRU cache
function getOrCreateCalibration(sensorId?: string) {
  const defaultCalibration = "x"; // default expression if one doesn't exist

  const calibString = sensorId
    ? sensors.get(sensorId)?.calibration ?? defaultCalibration
    : defaultCalibration; // default to x

  if (!sensorCalibrations.has(calibString)) {
    const calibFunc = new Function("x", `return ${calibString}`);
    sensorCalibrations.set(calibString, calibFunc);
    return calibFunc;
  }

  const outFunc = sensorCalibrations.get(calibString);
  if (!outFunc) return (x: number) => x;
  return outFunc;
}

webServer.get("/historical/:id", async (req, res) => {
  const options = req.query as unknown as HistoricalReq;
  if (!options.start || !options.end || !options.dt) {
    res.status(400).send("Invalid query parameters");
    return;
  }

  if (!sensors.has(req.params.id)) {
    res.status(404).send(`Sensor ${req.params.id} not found`);
    return;
  }

  const calibFunc = getOrCreateCalibration(req.params.id);

  // rounding bounds because influxdb
  const start_us = Math.floor(options.start * 1000000);
  const end_us = Math.ceil(options.end * 1000000);

  const start_ns = BigInt(start_us) * 1000n;
  const end_ns = BigInt(end_us) * 1000n;

  let aggregateWindow_ns: bigint;

  try {
    const aggregateWindow_ms = options.dt * 1000;
    aggregateWindow_ns = BigInt(Math.round(aggregateWindow_ms * 1000)) * 1000n; // nanoseconds because InfluxDB is weird
  } catch (err) {
    res.status(400).send("Invalid query parameters");
    return;
  }

  const query = `from(bucket: "sensornet")
                  |> range(start: time(v: ${start_ns}), stop: time(v: ${end_ns}))
                  |> filter(fn: (r) => r._measurement == "sensor" and r.id == "${
                    req.params.id
                  }")
                  ${
                    aggregateWindow_ns > 0
                      ? `|> aggregateWindow(every: duration(v: ${aggregateWindow_ns}), fn: mean)`
                      : ""
                  }
                  |> map(fn: (r) => ({ id: r.id, value: r._value, time_us: (uint(v: r._time) / uint(v: 1000)) }))
  `;

  const rows = (await influxReader.collectRows(query))
    .map((a: any) => {
      return { id: a.id, value: a.value, timestamp: a.time_us };
    })
    // .filter((a) => a.value !== null)
    .map((a) => {
      if (!a.value) return a;
      return { ...a, value: calibFunc(a.value) };
    });
  return res.json(rows);
});

webServer.get("/download/", async (req, res) => {
  const query = `from(bucket:"sensornet")
                  |> range(start:time(v: 0), stop: now())
                  |> map(fn: (r) => ({id: r.id, time: r._time, value: r._value}))
  `;

  const cmd = "influx";
  const args = [
    "query",
    "--host",
    process.env.INFLUXDB_URL!,
    "--org",
    process.env.INFLUXDB_ORG!,
    "--token",
    process.env.INFLUXDB_TOKEN!,
    query,
    "--raw",
  ];

  // set the correct headers
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=data.csv");

  // spawn child process
  const child = spawn(cmd, args);
  child.stdout.pipe(res);

  child.on("error", (error) => {
    console.error(`Error executing command: ${error.message}`);
    res.status(500).send("Internal Server Error");
  });
});

webServer.get("*", (req, res) => {
  res.status(404).send(`Route ${req.url} not found`);
});

// webServer.options(
// "*",
//   useCORS({
//     origin: "*",
//     credentials: true,
//     optionsRoute: true
//   })
// );


webServer.options(
  "/*",
  (req, res) => {
      res.send("");
  }
);

webServer.use(useCORS({ origin: "*", credentials: true }));


webServer
  .listen(8080, "0.0.0.0")
  .then((socket) => {
    console.log("Web Server listening on port 8080");
  })
  .catch((err) => {
    console.error(err);
  });

// const arrayParser = new Parser().array("packets", {
//   type: packetParser,
//   length: 10,
// });

const udpSocket = dgram.createSocket("udp4"); // UDP socket for receiving data
let lastPacketTimestamps: { [key: string]: number } = {};
const outRate = 100; // Hz

udpSocket.on("message", async (msg) => {
  try {
    const packet = packetParser.parse(msg);
    // Writing to InfluxDB
    const influxPoint = new Point("sensor")
      .tag("id", packet.id.toString())
      .intField("data", packet.value)
      .timestamp(Number(packet.time_us));
    influxWriter.writePoint(influxPoint);

    if (!sensors.has(packet.id.toString())) {
      return; // don't write to WebSocket if sensor doesn't exist
    }

    // Writing to WebSocket, ratelimited
    const idStr = packet.id.toString();
    const timestamp_s = Number(packet.time_us) / 1000000;
    if (!lastPacketTimestamps[idStr]) lastPacketTimestamps[idStr] = 0;

    if (timestamp_s - lastPacketTimestamps[idStr] > 1 / outRate) {
      // get the calibration function

      const calibratedValue = getOrCreateCalibration(idStr)(
        Number(packet.value)
      );

      const wsPoint = {
        id: packet.id.toString(),
        timestamp: Number(packet.time_us),
        // value: Number(packet.value),
        value: calibratedValue,
      };
      webServer.publish(wsPoint.id, JSON.stringify(wsPoint));
      lastPacketTimestamps[idStr] = timestamp_s;
    }
  } catch (e) {
    console.error(e);
  }
});

udpSocket.bind(3746, () => {
  console.log("UDP Socket Listening on port 3746");
});

async function terminator() {
  await udpSocket.close();
  await influxWriter.close();
  await webServer.close();
  await closeAll();
}

[
  "SIGHUP",
  "SIGINT",
  "SIGQUIT",
  "SIGILL",
  "SIGTRAP",
  "SIGABRT",
  "SIGBUS",
  "SIGFPE",
  "SIGUSR1",
  "SIGSEGV",
  "SIGUSR2",
  "SIGTERM",
].forEach(function (sig) {
  process.on(sig, async function () {
    console.log("Caught " + sig + ", terminating");
    await terminator();
    process.exit();
  });
});

process.on("exit", () => {
  console.log("Exiting...");
});
