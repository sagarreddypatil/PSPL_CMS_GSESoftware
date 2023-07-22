import { useContext, useEffect } from "react";
import { UserItemProps } from "./item-view-factory";
import { DataPoint, IOContext } from "../contexts/io-context";
import { useDebounce } from "@react-hook/debounce";

const UPDATE_RATE = 100;

export default function DataSourceView({ item }: UserItemProps) {
  const { dataSources } = useContext(IOContext);

  const [namespace, id] = item.id.split(":");
  const dataSource = dataSources.find(
    (source) =>
      source.identifier.namespace === namespace && source.identifier.id === id
  );

  const [value, setValue] = useDebounce<number>(NaN, 1000 / UPDATE_RATE);

  useEffect(() => {
    if (!dataSource) return;

    const onData = (point: DataPoint) => {
      setValue(point.value);
    };

    const subId = dataSource.subscribe(onData);
    return () => {
      dataSource.unsubscribe(subId);
    };
  }, [dataSource]);

  return <div className="text-4xl">{value}</div>;
}
