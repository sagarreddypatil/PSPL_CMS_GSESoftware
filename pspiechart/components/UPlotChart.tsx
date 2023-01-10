import { FrequencyDataPoint, TimeDataPoint } from "@/types/DataInterfaces";
import { useEffect, useRef } from "react";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";

interface UPlotChartProps {
  timeWidth: number; // seconds
  paused: boolean;
  registerTimeDataCallback?: (
    callback: (points: TimeDataPoint) => void
  ) => void;
}

export default function UPlotChart(props: UPlotChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const widthRef = useRef(1); // points per pixel
  const animationRef = useRef(0);

  const xRef = useRef<number[]>([]);
  const yRef = useRef<number[]>([]);

  const addTimeData = (point: TimeDataPoint) => {
    const totalDt = point.time - xRef.current[0];
    const avgDt = totalDt / (xRef.current.length + 1);
    const insDt = point.time - xRef.current[xRef.current.length - 1];
    const avgFreq = 1 / avgDt;
    const insFreq = 1 / insDt;

    const desiredPts = Math.floor(widthRef.current);
    console.log(desiredPts - xRef.current.length);
    const ppx = (props.timeWidth * insFreq) / desiredPts;
    const desiredDt = insDt * ppx;

    if (insDt < desiredDt) {
      return;
    }

    xRef.current.push(point.time);
    yRef.current.push(point.value);

    if (totalDt > props.timeWidth) {
      const pts = Math.ceil(props.timeWidth / avgDt);
      xRef.current = xRef.current.slice(xRef.current.length - pts);
      yRef.current = yRef.current.slice(yRef.current.length - pts);
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

    widthRef.current = width * window.devicePixelRatio;

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
