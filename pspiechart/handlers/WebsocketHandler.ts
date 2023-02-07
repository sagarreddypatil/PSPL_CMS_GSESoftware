import { encode, decodeMulti } from "@msgpack/msgpack";
import { Message } from "../common/Message";

export class WebsocketHandler {
    private ws: WebSocket | undefined;
    private callbacks: { [key: string]: (data: any) => void } = {};

    constructor(ws?: WebSocket | undefined) {
        if (ws) {
            this.connect(ws);
        }
    }

    public connect(ws: WebSocket) {
        this.ws = ws;
        this.ws.onmessage = (event) => {
            for (const msg of decodeMulti(event.data) as Iterable<Message>) {
                console.log(msg);
                if (this.callbacks[msg.channel]) {
                    this.callbacks[msg.channel](msg.data);
                }
            }
        };
    }

    public on(channel: string, callback: (data: Message) => void) {
        this.callbacks[channel] = callback;
    }
}
