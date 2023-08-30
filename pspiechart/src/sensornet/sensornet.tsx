import { IOContext, DataPoint, genSubId } from "../contexts/io-context";
import { useContext, useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";

const SENSORNET_SERVER = "localhost:8080";

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
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    `ws://${SENSORNET_SERVER}/data`
  );

  const listenersRef = useRef<any>({});

  useEffect(() => {
    fetch(`http://${SENSORNET_SERVER}/sources`)
      .then((res) => res.json())
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
            sendJsonMessage(subReq);

            if (!listenersRef.current[identifier.id]) {
              listenersRef.current[identifier.id] = {};
            }
            listenersRef.current[identifier.id][subId] = callback;
            return subId;
          };

          const unsubscribe = (subId: string) => {
            delete listenersRef.current[identifier.id][subId];
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
            subscribe,
            unsubscribe,
            historical,
          });
        });
      });
  }, []);

  useEffect(() => {
    if (!lastJsonMessage) return;

    const dataPoint = lastJsonMessage as any as IServerPoint;
    const listeners = listenersRef.current[dataPoint.id];
    if (!listeners) return;

    Object.values(listeners).forEach((listener: any) => {
      listener({
        timestamp: new Date(dataPoint.timestamp / 1000), // us to ms
        value: dataPoint.value,
      });
    });
  }, [lastJsonMessage]);

  return <></>;
}
