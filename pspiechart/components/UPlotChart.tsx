import { FrequencyDataPoint, TimeDataPoint } from "@/types/DataInterfaces";
import { match } from "assert";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const animationRef = useRef(0);

  // Downsampling queues
  const dsValueQueueRef = useRef(new Array<number>());
  const dsTimeQueueRef = useRef(new Array<number>());

  // current chart data
  const xRef = useRef<number[]>([]);
  const yRef = useRef<number[]>([]);

  const addTimeData = (point: TimeDataPoint) => {
    const totalDt = point.time - xRef.current[0];
    const avgDt = totalDt / (xRef.current.length + 1);
    const insDt = point.time - xRef.current[xRef.current.length - 1];
    const avgFreq = 1 / avgDt;
    const insFreq = 1 / insDt;

    const desiredPts = Math.floor(size.width * window.devicePixelRatio);
    const ppx = (props.timeWidth * insFreq) / desiredPts;
    const desiredDt = insDt * ppx;

    dsTimeQueueRef.current.push(point.time);
    dsValueQueueRef.current.push(point.value);

    if (insDt < desiredDt) {
      return;
    }

    const timeAvg =
      dsTimeQueueRef.current.reduce((a, b) => a + b, 0) /
      dsTimeQueueRef.current.length;
    const valueAvg =
      dsValueQueueRef.current.reduce((a, b) => a + b, 0) /
      dsValueQueueRef.current.length;

    xRef.current.push(timeAvg);
    yRef.current.push(valueAvg);

    dsTimeQueueRef.current = new Array<number>();
    dsValueQueueRef.current = new Array<number>();

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
    const width = containerRef.current!.clientWidth;
    const height = containerRef.current!.clientHeight;

    const opts: Options = {
      title: "",
      // width: width,
      // height: height - 30.6,
      pxAlign: false,
      cursor: {
        y: false,
        lock: true,
      },
      scales: {
        y: {
          auto: true,
        },
      },
      axes: [
        {
          stroke: "#fff",
          grid: {
            stroke: "#ffffff50",
          },
          ticks: {
            show: true,
            stroke: "#ffffff50",
          },
        },
        {
          stroke: "#fff",
          grid: {
            stroke: "#ffffff50",
          },
          ticks: {
            show: true,
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

  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    function updateSize() {
      const newSize = {
        width: containerRef.current?.clientWidth ?? 0,
        height: containerRef.current?.clientHeight ?? 0,
      };

      setSize(newSize);
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    plotRef.current?.setSize({
      width: size.width,
      height: size.height - 30.6,
    });
  }, [size]);

  return (
    <div ref={containerRef} className="h-100 w-100 min-vw-0 min-vh-0">
      <div ref={divRef}></div>
    </div>
  );
}
