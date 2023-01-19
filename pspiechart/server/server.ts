import { createServer } from "http";
import { createServer as createNetServer } from "net";
import { encode, decodeMulti } from "@msgpack/msgpack";
import next from "next";
import { networkInterfaces } from "os";
import { parse } from "url";
import { WebSocketServer, WebSocket } from "ws";

const port = parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.HOST || "localhost";
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) =>
        handle(req, res, parse(req.url ?? "", true))
    );
    const wss = new WebSocketServer({ noServer: true });

    const ipcServer = createNetServer();

    ipcServer.listen("/tmp/pspiechart.sock");
    ipcServer.on("connection", (socket) => {
        socket.on("data", (data) => {
            for (const msg of decodeMulti(data)) {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(encode(msg));
                    }
                });
            }
        });
    });

    wss.on("connection", async (ws) => {
        console.log("incoming connection", ws);
        ws.onclose = () => {
            console.log("connection closed", wss.clients.size);
        };
    });

    server.on("upgrade", (req, socket, head) => {
        const { pathname } = parse(req.url ?? "", true);
        if (pathname !== "/_next/webpack-hmr") {
            wss.handleUpgrade(req, socket, head, function done(ws) {
                wss.emit("connection", ws, req);
            });
        }
    });

    server.listen(port, hostname, () => {
        console.log(`Ready on http://${hostname}:${port}`);
    });
});
