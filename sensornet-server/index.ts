import dgram from "node:dgram";
import {
    App,
    DEDICATED_COMPRESSOR_128KB,
    SHARED_COMPRESSOR,
} from "uWebSockets.js";
import type { WebSocket } from "uWebSockets.js";
import { packetParser } from "./packets.js";
const server = dgram.createSocket("udp4");

const clients = new Set<WebSocket<unknown>>();

const replacer = (key: any, value: any) =>
    typeof value === "bigint" ? value.toString() : value;

App({})
    .ws("/data", {
        compression: DEDICATED_COMPRESSOR_128KB,
        open: (ws) => {
            clients.add(ws);
        },
        close: (ws) => {
            clients.delete(ws);
        },
    })
    .listen(5001, () => {
        console.log("Websocket listening on port 5001");
    });

server.on("message", (msg) => {
    const packet = packetParser.parse(msg);
    clients.forEach((client) => {
        client.send(JSON.stringify(packet, replacer));
    });
});

server.bind(5000, () => {
    console.log("UDP server listening on port 5000");
});
