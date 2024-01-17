import { IOContext, DataPoint, genSubId } from "../contexts/io-context";
import { useContext, useEffect, useRef } from "react";

// const SENSORNET_SERVER = import.meta.env.VITE_SENSORNET_SERVER as string;
const myURL = new URL(window.location.href);
myURL.port = "3180";
const SENSORNET_SERVER = myURL.host;


interface IServerSource {
  id: string;
  name: string;
  unit: string;
}

interface IServerPoint {
  id: string;
  timestamp: number;
  value: number;
}

export default function SensorNetPlugin() {
  const { addDataSource } = useContext(IOContext);
  // const { sendJsonMessage, lastJsonMessage } = useWebSocket(
  //   `ws://${SENSORNET_SERVER}/data`
  // );
  const wsRef = useRef<WebSocket>();

  const listenersRef = useRef<any>({});

  useEffect(() => {
    wsRef.current = new WebSocket(`ws://${SENSORNET_SERVER}/data`);
    wsRef.current.onmessage = (event) => {
      const dataPoint = JSON.parse(event.data) as IServerPoint;
      const listeners = listenersRef.current[dataPoint.id];
      if (!listeners) return;

      Object.values(listeners).forEach((listener: any) => {
        listener({
          timestamp: new Date(dataPoint.timestamp / 1000), // us to ms
          value: dataPoint.value,
        });
      });
    };

    fetch(`http://${SENSORNET_SERVER}/sources`)
      .then((res) => res.json())
      .then((sources: IServerSource[]) =>
        sources.sort((a, b) =>
          a.id.localeCompare(b.id, "en", { numeric: true })
        )
      )
      .then((sources: IServerSource[]) => {
        sources.forEach((source) => {
          const identifier = {
            namespace: "SensorNet",
            id: source.id,
            name: source.name,
          };

          const subscribe = (callback: (data: DataPoint) => void) => {
            const subId = genSubId();

            const subReq = {
              type: "subscribe",
              id: source.id,
            };
            // sendJsonMessage(subReq);
            wsRef.current!.send(JSON.stringify(subReq));

            if (!listenersRef.current[identifier.id]) {
              listenersRef.current[identifier.id] = {};
            }
            listenersRef.current[identifier.id][subId] = callback;
            return subId;
          };

          const unsubscribe = (subId: string) => {
            delete listenersRef.current[identifier.id][subId];
            if (listenersRef.current[identifier.id].length === 0) {
              // send unsubscribe
              const unsubReq = {
                type: "unsubscribe",
                id: source.id,
              };
              wsRef.current!.send(JSON.stringify(unsubReq));
            }
          };

          const historical = (from: Date, to: Date, dt: number) => {
            const fromSeconds = from.getTime() / 1000;
            const toSeconds = to.getTime() / 1000;

            const queryString = `?start=${fromSeconds}&end=${toSeconds}&dt=${dt}`;
            return fetch(
              `http://${SENSORNET_SERVER}/historical/${source.id}${queryString}`
            )
              .then((res) => res.json())
              .then((data) =>
                data.map(
                  (d: any): DataPoint => ({
                    timestamp: new Date(d.timestamp / 1000), // us to ms
                    value: d.value,
                  })
                )
              );
          };

          addDataSource({
            identifier,
            unit: source.unit,
            subscribe,
            unsubscribe,
            historical,
          });
        });
      });
  }, []);

  // useEffect(() => {
  //   if (!lastJsonMessage) return;

  //   const dataPoint = lastJsonMessage as any as IServerPoint;
  //   const listeners = listenersRef.current[dataPoint.id];
  //   if (!listeners) return;

  //   Object.values(listeners).forEach((listener: any) => {
  //     listener({
  //       timestamp: new Date(dataPoint.timestamp / 1000), // us to ms
  //       value: dataPoint.value,
  //     });
  //   });
  // }, [lastJsonMessage]);

  return <></>;
}
