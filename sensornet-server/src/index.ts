import { exit } from "node:process";
import dgram from "node:dgram";
import { App, DEDICATED_COMPRESSOR_128KB } from "uWebSockets.js";
import * as dotenv from "dotenv";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import type { WebSocket } from "uWebSockets.js";

import {
    getConfig,
    postConfig,
    putConfig,
    deleteConfig,
    uploadConfig,
} from "./configHandler.js";
import { packetParser } from "./packets.js";
import { Parser } from "binary-parser";
dotenv.config();
const server = dgram.createSocket("udp4");

const influx = new InfluxDB({
    token: process.env.INFLUXDB_TOKEN,
    url: process.env.INFLUXDB_URL || "http://localhost:8086",
});

if (!process.env.INFLUXDB_ORG) {
    console.error("InfluxDB organization not in environment!");
    exit(1);
}

if (!process.env.INFLUXDB_BUCKET) {
    console.error("InfluxDB bucket not in environment!");
    exit(1);
}

const writer = influx.getWriteApi(
    process.env.INFLUXDB_ORG,
    process.env.INFLUXDB_BUCKET,
    "us",
    {
        batchSize: 10000,
        flushInterval: 1000,
        retryJitter: 100,
    }
);

const replacer = (key: any, value: any) =>
    typeof value === "bigint" ? value.toString() : value;

const webServer = App()
    .get("/", (res) => {
        res.end(`<html>
            <form action="upload" method="post" enctype="multipart/form-data">
                <input type="file" id="myFile" name="upload">
                <input type="submit">
            </form>
            </html>`);
    })
    .get("/config", getConfig)
    .post("/config", postConfig)
    .put("/config", putConfig)
    .del("/config", deleteConfig)
    .post("/upload", uploadConfig)
    .ws("/data", {
        compression: DEDICATED_COMPRESSOR_128KB,
        open: (ws) => {
            ws.subscribe("data");
        },
    })
    .listen(5000, () => {
        console.log("Websocket listening on port 5000");
    });

let count = 0;
setInterval(() => {
    console.log(Intl.NumberFormat('en-US').format(count) + " packets per second");
    count = 0;
}, 1000);

const arrayParser = new Parser().array("packets", {
    type: packetParser,
    length: 10,
});

server.on("message", (msg) => {
    try {
        const packets = arrayParser.parse(msg).packets;

        Promise.all(
            packets.map(async (packet: any) => {
                webServer.numSubscribers("data") &&
                    webServer.publish("data", JSON.stringify(packet, replacer));
                const point = new Point("sensor")
                    .tag("id", packet.id)
                    .intField("data", packet.data)
                    .timestamp(packet.timestamp);
                writer.writePoint(point);
                count++;
            })
        );
    } catch (e) {
        console.error(e);
    }
});

server.bind(5001, () => {
    console.log("UDP server listening on port 5001");
});
