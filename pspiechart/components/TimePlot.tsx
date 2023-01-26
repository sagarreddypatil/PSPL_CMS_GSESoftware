import { TimeDataPoint, TimeDataSource } from "@/types/DataInterfaces";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { DistributeVertical } from "react-bootstrap-icons";
import uPlot from "uplot";

const UPlotChart = dynamic(() => import("./UPlotChart"), {
  ssr: false,
});

interface TimePlotProps {
  title: string;
  paused: boolean;
}

function psora(k: number, n: number) {
  var r = Math.PI * (k ^ n);
  return r - Math.floor(r);
}

function rng(x) {
  return psora(x, 10) * 2 - 1;
}

function noise(x: number) {
  const lo = Math.floor(x);
  const hi = lo + 1;
  const dist = x - lo;
  const loSlope = rng(lo);
  const hiSlope = rng(hi);
  const loPos = loSlope * dist;
  const hiPos = -hiSlope * (1 - dist);
  const u = dist * dist * (3.0 - 2.0 * dist); // cubic curve
  return loPos * (1 - u) + hiPos * u; // interpolate
}

function fractalNoise(x: number) {
  const octaves = 10;
  const persistence = 0.75;
  let total = 0;

  for (let i = 0; i < octaves; i++) {
    const frequency = Math.pow(2, i);
    const amplitude = Math.pow(persistence, i);
    total += noise(x * frequency) * amplitude;
  }

  return total;
}

export default function TimePlot(props: TimePlotProps) {
  const callbackRef = useRef<(point: TimeDataPoint) => void>();
  const [dataSource, setDataSource] = useState<TimeDataSource>();
  const lastRef = useRef(0);

  const lastIntervalRef = useRef(0);
  const accRef = useRef(0);

  const start = Date.now();
  const getDataPoint = (time: number) => {
    accRef.current += (Math.random() - 0.5) * 0.1;
    return {
      time: time / 1000,
      // value: Math.sin((2 * 3.14159 * time) / 1000),
      // value: accRef.current,
      value: fractalNoise(time / 1000),
      // value: psora(time, 10),
      // value: Math.random(),
    } as TimeDataPoint;
  };

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
      title={props.title}
      pointsPerPixel={1}
      timespan={10}
      paused={props.paused}
      timeDataSource={dataSource}
    />
  );
}
