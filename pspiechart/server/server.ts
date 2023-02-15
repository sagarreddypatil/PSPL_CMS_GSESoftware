import { createServer } from "http";
import { createServer as createNetServer } from "net";
import { encode, decodeMulti } from "@msgpack/msgpack";
import next from "next";
import { parse } from "url";
import { WebSocketServer, WebSocket } from "ws";
import { Message } from "../common/Message";
import { TimeSpec } from "@msgpack/msgpack/dist/timestamp";

const port = parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.HOST || "localhost";
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

interface TelegrafMessage {
    name: string;
    time: TimeSpec;
    tags: {
        host: string;
        sensorID: number;
        sensorName: string;
    };
    fields: any;
}

app.prepare().then(() => {
    const server = createServer((req, res) =>
        handle(req, res, parse(req.url ?? "", true))
    );
    const wss = new WebSocketServer({ noServer: true });

    const ipcServer = createNetServer();

    ipcServer.on("connection", (socket) => {
        socket.on("data", (data) => {
            for (const msg of decodeMulti(data) as Iterable<TelegrafMessage>) {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        if (msg.name == "imu") {
                            client.send(
                                encode({
                                    channel: "imu",
                                    data: {
                                        ...msg.fields,
                                    },
                                } as Message)
                            );
                        } else {
                            client.send(
                                encode({
                                    channel: msg.name + "_" + msg.tags.sensorID,
                                    data: {
                                        ...msg.fields,
                                    },
                                    time: msg.time,
                                })
                            );
                        }
                    }
                });
            }
        });
    });

    ipcServer.listen("/tmp/pspiechart.sock", () => {
        console.log("IPC Server listening");
    });

    process.on("SIGINT", () => {
        ipcServer.close();
        server.close();
        process.exit();
    });

    wss.on("connection", async (ws) => {
        ws.onclose = () => {
            console.log("connection closed", wss.clients.size);
        };
    });

    server.on("upgrade", (req, socket, head) => {
        const { pathname } = parse(req.url ?? "", true);
        console.log("upgrade", pathname);
        if (pathname === "/data") {
            wss.handleUpgrade(req, socket, head, function done(ws) {
                wss.emit("connection", ws, req);
            });
        }
    });

    server.listen(port, hostname, () => {
        console.log(`Ready on http://${hostname}:${port}`);
    });
});
