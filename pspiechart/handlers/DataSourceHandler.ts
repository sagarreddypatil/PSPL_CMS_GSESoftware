import { WebsocketHandler } from "./WebsocketHandler";
import { TimeDataSource, TimeDataPoint } from "@/types/DataInterfaces";

export class WebsocketDataSource implements TimeDataSource {
    private channel: string;
    private callbacks: ((data: TimeDataPoint) => void)[] = [];

    constructor(channel: string, handler: WebsocketHandler) {
        this.channel = channel;
        handler.on(channel, (data) => {
            this.callbacks.forEach((cb) => {
                const point = {
                    time: data.data.time,
                }
            });
        });
    }

    public subscribe(callback: (data: TimeDataPoint) => void) {
        this.callbacks.push(callback);
    }
    unsubscribe(callback: (data: TimeDataPoint) => void) {
        this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };

    get(t1: number, t2: number, dt: number) { 
        // TODO: Fetch data from InfluxDB
        return [];
    }
}