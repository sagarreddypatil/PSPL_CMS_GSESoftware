import { Server } from "hyper-express";
import cors from "cors";
import dgram from "node:dgram";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { packetParser } from "./packets";
import { exit } from "node:process";
import { getSources } from "./models/sourcesModel";
import { closeAll } from "./models/db";
import dotenv from "dotenv";
import sensorsRouter from "./routes/sensors";

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
  console.error("Environment variable INFLUXDB_ORG not set, using pspl");
}

if (!process.env.INFLUXDB_BUCKET) {
  console.error(
    "Environment variable INFLUXDB_BUCKET not set, using sensornet"
  );
}

const influxWriter = influxClient.getWriteApi(
  process.env.INFLUXDB_ORG || "psp-liquids",
  process.env.INFLUXDB_BUCKET || "sensornet",
  "us"
  // {
  //   batchSize: 10000,
  //   flushInterval: 1000,
  //   retryJitter: 100,
  // }
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
}

webServer.get("/historical/:id", async (req, res) => {
  const options = req.query as unknown as HistoricalReq;
  if (!options.start || !options.end) {
    res.status(400).send("Invalid query parameters");
    return;
  }

  // rounding bounds because influxdb
  const start_us = Math.floor(options.start * 1000000);
  const end_us = Math.ceil(options.end * 1000000);

  const start_ns = BigInt(start_us) * 1000n;
  const end_ns = BigInt(end_us) * 1000n;

  // return at most 10000 points bruh
  const aggregateWindow_ms = ((options.end - options.start) * 1000) / 10000;
  const aggregateWindow_ns = // nanoseconds because InfluxDB is weird
    BigInt(Math.round(aggregateWindow_ms * 1000)) * 1000n;

  const query = `from(bucket: "sensornet")
                  |> range(start: time(v: ${start_ns}), stop: time(v: ${end_ns}))
                  |> filter(fn: (r) => r._measurement == "sensor" and r.id == "${req.params.id}")
                  |> aggregateWindow(every: duration(v: ${aggregateWindow_ns}), fn: mean)
                  |> map(fn: (r) => ({ id: r.id, value: r._value, time_us: (uint(v: r._time) / uint(v: 1000)) }))
  `;

  const rows = (await influxReader.collectRows(query))
    .map((a: any) => {
      return { id: a.id, value: a.value, timestamp: a.time_us };
    })
    .filter((a: any) => a.value !== null);
  return res.json(rows);
});

webServer.get("*", (req, res) => {
  res.status(404).send(`Route ${req.url} not found`);
});

webServer.use(cors({ origin: "*" }));

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

    // Writing to WebSocket, ratelimited
    const idStr = packet.id.toString();
    const timestamp_s = Number(packet.time_us) / 1000000;
    if (!lastPacketTimestamps[idStr]) lastPacketTimestamps[idStr] = 0;

    if (timestamp_s - lastPacketTimestamps[idStr] > 1 / outRate) {
      const wsPoint = {
        id: packet.id.toString(),
        timestamp: Number(packet.time_us),
        value: Number(packet.value),
      };
      webServer.publish(wsPoint.id, JSON.stringify(wsPoint));
      lastPacketTimestamps[idStr] = timestamp_s;
    }
  } catch (e) {
    console.error(e);
  }
});

udpSocket.bind(5001, () => {
  console.log("UDP Socket Listening on port 5001");
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
