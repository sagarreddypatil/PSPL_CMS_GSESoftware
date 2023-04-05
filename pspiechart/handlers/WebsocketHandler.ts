const reviver = (key:any, value:any) => (key === "timestamp" || key === "counter" ? BigInt(value) : value);

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
            console.log(JSON.parse(event.data,reviver));
        };
    }

    public on(channel: string, callback: (data: Message) => void) {
        this.callbacks[channel] = callback;
    }
}
