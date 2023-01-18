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

  // Downsample buffers
  const timeDownsampleBuffer = useRef<TimeDataPoint[]>([]);

  // container size
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updatePlot = () => {
      // remove old data
      const currentTimespan =
        xRef.current[xRef.current.length - 1] - xRef.current[0];
      const avgDt = currentTimespan / (xRef.current.length + 1);
      const cutoff = Math.ceil(props.timespan / avgDt);

      xRef.current = xRef.current.slice(-cutoff);
      yRef.current = yRef.current.slice(-cutoff);

      // print num data points vs num pixels
      console.log("data points: ", xRef.current.length, "pixels: ", size.width);

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
    const addTimeData = (point: TimeDataPoint) => {
      const desiredPoints =
        size.width * window.devicePixelRatio * (props.pointsPerPixel ?? 1);
      const dt = props.timespan / desiredPoints;

      const tLast = xRef.current[xRef.current.length - 1] ?? 0;

      if (point.time >= tLast + dt) {
        xRef.current.push(point.time);
        yRef.current.push(point.value);
      }

      // timeDownsampleBuffer.current.push(point);
      // const buffer = timeDownsampleBuffer.current;
      // const lastInsertedTime = xRef.current[xRef.current.length - 1] ?? 0;
      // const lastBufferTime = buffer[buffer.length - 1].time;
      // // const margin = 0.999999;
      // const margin = 0.9999999999999999;
      // if (lastBufferTime - lastInsertedTime - dt > 0) {
      //   // const downsampledTime =
      //   //   buffer.reduce((a, b) => a + b.time, 0) / buffer.length;
      //   // const downsampledValue =
      //   //   buffer.reduce((a, b) => a + b.value, 0) / buffer.length;
      //   const downsampledTime = buffer[buffer.length - 1].time;
      //   const downsampledValue = buffer[buffer.length - 1].value;
      //   xRef.current.push(downsampledTime);
      //   yRef.current.push(downsampledValue);
      //   timeDownsampleBuffer.current.length = 0;
      // }
    };

    if (props.timeDataSource) {
      xRef.current.length = 0;
      yRef.current.length = 0;

      let now = Date.now();
      let start = now - props.timespan * 1000;
      let dt =
        (now - start) /
        (size.width * window.devicePixelRatio * (props.pointsPerPixel ?? 1));

      let historicalData = props.timeDataSource.get(start, now, dt);

      historicalData.forEach((point) => {
        addTimeData(point);
      });
    }

    props.timeDataSource?.subscribe(addTimeData);
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
