import {
  FrequencyDataPoint,
  FrequencyDataSource,
  TimeDataPoint,
  TimeDataSource,
} from "@/types/DataInterfaces";
import { match } from "assert";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";

interface UPlotChartProps {
  pointsPerPixel?: number;

  timespan: number; // seconds
  paused: boolean;

  timeDataSource?: TimeDataSource;
  frequencyDataSource?: FrequencyDataSource;
}

export default function UPlotChart(props: UPlotChartProps) {
  // chart references
  const containerRef = useRef<HTMLDivElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const animationRef = useRef(0);

  // current chart data
  const xRef = useRef<number[]>([]);
  const yRef = useRef<number[]>([]);

  // container size
  const [size, setSize] = useState({ width: 0, height: 0 });

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
      width: 1,
      height: 1,
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

  useEffect(() => {
    const addTimeData = (point: TimeDataPoint, downsample = true) => {
      const currentTimespan = point.time - xRef.current[0];

      const avgDt = currentTimespan / (xRef.current.length + 1);
      const insDt = point.time - xRef.current[xRef.current.length - 1];

      const avgFreq = 1 / avgDt;
      const insFreq = 1 / insDt;

      const desiredPts = Math.floor(
        size.width * window.devicePixelRatio * (props.pointsPerPixel ?? 1)
      );

      const ppx = (props.timespan * insFreq) / desiredPts;
      const desiredDt = insDt * ppx;

      xRef.current.push(point.time);
      yRef.current.push(point.value);

      if (currentTimespan > props.timespan) {
        const pts = Math.ceil(props.timespan / avgDt);
        xRef.current = xRef.current.slice(xRef.current.length - pts);
        yRef.current = yRef.current.slice(yRef.current.length - pts);
      }
    };
    props.timeDataSource?.subscribe(addTimeData);

    if (props.timeDataSource) {
      xRef.current.length = 0;
      yRef.current.length = 0;

      let now = Date.now();
      let start = now - props.timespan * 1000;
      // let dt = (now - start) / size.width;
      let dt = 1;

      let historicalData = props.timeDataSource.get(start, now, dt);

      historicalData.forEach((point) => {
        addTimeData(point, false);
      });
    }

    return () => {
      props.timeDataSource?.unsubscribe(addTimeData);
    };
  }, [props.timeDataSource, props.timespan, size.width, props.pointsPerPixel]);

  useLayoutEffect(() => {
    function debounce(func: () => void, time = 100) {
      let timer: any;
      return function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, time);
      };
    }

    function updateSize() {
      const newSize = {
        width: containerRef.current?.clientWidth ?? 0,
        height: containerRef.current?.clientHeight ?? 0,
      };

      setSize(newSize);
    }

    window.addEventListener("resize", debounce(updateSize));
    updateSize();

    return () => window.removeEventListener("resize", debounce(updateSize));
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
