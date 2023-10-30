import { useContext, useEffect, useRef } from "react";
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
  // const [value, setValue] = useState(NaN);
  const valueRef = useRef(NaN);
  const divRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const { paused, fixed } = useContext(TimeConductorContext);

  useEffect(() => {
    if (!dataSource) return;

    if (!paused) {
      const onData = (point: DataPoint) => {
        // setValue(point.value);
        valueRef.current = point.value;
      };

      const subId = dataSource.subscribe(onData);
      return () => {
        dataSource.unsubscribe(subId);
      };
    }

    const dt = 0.5; // seconds
    const end = fixed.end;
    const start = new Date(end.getTime() - 2500);

    dataSource.historical(start, end, dt).then((points) => {
      const filtered = points.filter((point) => point);

      if (filtered.length === 0) {
        valueRef.current = NaN;
        return;
      }

      valueRef.current = filtered[filtered.length - 1].value;
    });
  }, [dataSource, paused, fixed]);

  useEffect(() => {
    const updateValue = () => {
      // divRef.current!.innerText = value.toString();
      divRef.current!.innerText =
        valueRef.current.toFixed(3) + " " + dataSource?.unit;

      animRef.current = setTimeout(updateValue, 1000 / 15); // 10 fps
    };
    updateValue();

    return () => {
      clearTimeout(animRef.current);
    };
  }, [dataSource]);

  return <div className="text-4xl" ref={divRef}></div>;
}
