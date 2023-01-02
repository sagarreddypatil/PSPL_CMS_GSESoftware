import { createServer, IncomingMessage, Server } from 'http';
import next from 'next';
import { parse } from 'url';
import { WebSocketServer } from 'ws';

const port = parseInt(process.env.PORT || '8080', 10);
const hostname = process.env.HOST || 'localhost';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => handle(req, res, parse(req.url ?? '', true)))
    const wss = new WebSocketServer({ noServer: true })

    wss.on("connection", async (ws) => {
      console.log('incoming connection', ws);
      ws.onclose = () => {
        console.log('connection closed', wss.clients.size);
      };
    });

    server.on('upgrade', (req, socket, head)  => {
        const { pathname } = parse(req.url ?? '', true);
        if (pathname !== '/_next/webpack-hmr') {
            wss.handleUpgrade(req, socket, head, function done(ws) {
                wss.emit('connection', ws, req);
            });
        }
    });

    server.listen(port, hostname, () => {
        console.log(`Ready on http://${hostname}:${port}`);
    });
})