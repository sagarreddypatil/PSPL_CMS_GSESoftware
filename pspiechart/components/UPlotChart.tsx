import { FrequencyDataPoint, TimeDataPoint } from "@/types/DataInterfaces";
import { useEffect, useRef } from "react";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";

interface UPlotChartProps {
  maxLen: number;
  paused: boolean;
  registerTimeDataCallback?: (
    callback: (points: TimeDataPoint[]) => void
  ) => void;
}

export default function UPlotChart(props: UPlotChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const ppx = useRef(1); // points per pixel
  const animationRef = useRef(0);

  const xRef = useRef<number[]>([]);
  const yRef = useRef<number[]>([]);

  const addTimeData = (points: TimeDataPoint[]) => {
    xRef.current = xRef.current.concat(points.map((point) => point.time));
    yRef.current = yRef.current.concat(points.map((point) => point.value));

    if (xRef.current.length > props.maxLen) {
      xRef.current = xRef.current.slice(-props.maxLen);
      yRef.current = yRef.current.slice(-props.maxLen);
    }
  };
  props.registerTimeDataCallback?.(addTimeData);

  useEffect(() => {
    const updatePlot = () => {
      plotRef.current?.setData([xRef.current, yRef.current]);
      if (!props.paused) {
        animationRef.current = window.requestAnimationFrame(updatePlot);
      }
    };

    updatePlot();

    return () => {
      window.cancelAnimationFrame(animationRef.current);
    };
  });

  useEffect(() => {
    const height = containerRef.current!.clientHeight;
    const width = containerRef.current!.clientWidth;

    const opts: Options = {
      title: "",
      width: width,
      height: height - 30.6,
      pxAlign: false,
      scales: {
        y: {
          auto: true,
          // range: [-6, 6],
        },
      },
      axes: [
        {
          stroke: "#fff",
          grid: {
            stroke: "#ffffff50",
          },
        },
        {
          stroke: "#fff",
          grid: {
            stroke: "#ffffff50",
          },
        },
      ],
      series: [
        {},
        {
          label: "Value",
          stroke: "#daaa00",
          width: 2,
          fill: "rgba(218,170,0,0.1)",
        },
      ],
    };

    plotRef.current = new uPlot(
      opts,
      [[], []],
      divRef.current ? divRef.current : undefined
    );

    return () => {
      plotRef.current?.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="flex-fill">
      <div ref={divRef}></div>
    </div>
  );
}
