import { useContext, useEffect, useState } from "react";
import { UserItemProps } from "./item-view-factory";
import { DataPoint, IOContext } from "../contexts/io-context";
// import { useDebounce } from "@react-hook/debounce";
import { TimeConductorContext } from "../contexts/time-conductor-context";

// const UPDATE_RATE = 100;

export default function DataSourceView({ item }: UserItemProps) {
  const { dataSources } = useContext(IOContext);

  const [namespace, id] = item.id.split(":");
  const dataSource = dataSources.find(
    (source) =>
      source.identifier.namespace === namespace && source.identifier.id === id
  );

  // const [value, setValue] = useDebounce<number>(NaN, 1000 / UPDATE_RATE);
  const [value, setValue] = useState(NaN);
  const { paused, fixed } = useContext(TimeConductorContext);

  useEffect(() => {
    if (!dataSource) return;

    if (!paused) {
      const onData = (point: DataPoint) => {
        setValue(point.value);
      };

      const subId = dataSource.subscribe(onData);
      return () => {
        dataSource.unsubscribe(subId);
      };
    }

    const dt = 0.001;
    const start = new Date(fixed.end.getTime() - dt * 1000);
    const end = fixed.end;

    dataSource.historical(start, end, dt).then((points) => {
      if (points.length === 0) {
        setValue(NaN);
        return;
      }
      setValue(points[points.length - 1].value);
    });
  }, [dataSource, paused, fixed]);

  return <div className="text-4xl">{value.toString()}</div>;
}
