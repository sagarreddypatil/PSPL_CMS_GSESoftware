import { TimeDataPoint, TimeDataSource } from "@/types/DataInterfaces";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";

const UPlotChart = dynamic(() => import("./UPlotChart"), {
  ssr: false,
});

interface TimePlotProps {
  paused: boolean;
}

const getDataPoint = (time: number) => {
  return {
    time: time / 1000,
    value: Math.sin((2 * 3.14159 * time) / 1000),
  } as TimeDataPoint;
};

export default function TimePlot(props: TimePlotProps) {
  const callbackRef = useRef<(point: TimeDataPoint) => void>();
  const [dataSource, setDataSource] = useState<TimeDataSource>();
  const lastRef = useRef(0);

  const lastIntervalRef = useRef(0);

  useEffect(() => {
    const dataSource: TimeDataSource = {
      subscribe: (callback) => {
        callbackRef.current = callback;
      },
      unsubscribe: () => {
        callbackRef.current = undefined;
      },
      get: (a, b, dt) => {
        const points = [];
        for (let i = a; i < b; i += dt) {
          points.push(getDataPoint(i));
        }
        return points;
      },
    };

    lastRef.current = Date.now();
    const interval = setInterval(() => {
      if (callbackRef.current) {
        const now = Date.now();

        for (let i = lastRef.current + 1; i <= now; i++) {
          callbackRef.current(getDataPoint(i));
        }

        lastRef.current = now;
      }
    }, 10);

    setDataSource(dataSource);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <UPlotChart
      pointsPerPixel={1}
      timespan={5}
      paused={props.paused}
      timeDataSource={dataSource}
    />
  );
}
