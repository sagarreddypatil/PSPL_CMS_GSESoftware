import { useContext, useEffect } from "react";
import { UserItemProps } from "./item-view-factory";
import { DataPoint, IOContext } from "../contexts/io-context";
import { useDebounce } from "@react-hook/debounce";
import { TimeConductorContext } from "../contexts/time-conductor-context";

const UPDATE_RATE = 100;

export default function DataSourceView({ item }: UserItemProps) {
  const { dataSources } = useContext(IOContext);

  const [namespace, id] = item.id.split(":");
  const dataSource = dataSources.find(
    (source) =>
      source.identifier.namespace === namespace && source.identifier.id === id
  );

  const [value, setValue] = useDebounce<number>(NaN, 1000 / UPDATE_RATE);
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

    dataSource
      .historical(new Date(fixed.end.getTime() - 1000), fixed.end, 0)
      .then((points) => {
        console.log(points);
        if (points.length === 0) {
          setValue(NaN);
          return;
        }
        setValue(points[points.length - 1].value);
      });
  }, [dataSource, paused, fixed]);

  return <div className="text-4xl">{value}</div>;
}
