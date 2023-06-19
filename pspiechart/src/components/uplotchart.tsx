import { IDataSource, IDataPoint } from "../io-context";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";

interface UPlotChartProps {
  title?: string;
  pointsPerPixel?: number;

  timespan: number; // seconds
  paused: boolean;

  dataSource?: IDataSource;
  size: { width: number; height: number };
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
  const timeDownsampleBuffer = useRef<IDataPoint[]>([]);

  // container size
  const size = props.size;
  const actualSize = {
    width: size.width * window.devicePixelRatio,
    height: size.height * window.devicePixelRatio,
  };

  useEffect(() => {
    const updatePlot = () => {
      const desiredPoints = actualSize.width * (props.pointsPerPixel ?? 1);
      const dt = props.timespan / desiredPoints;

      // downsample time data
      const buffer = timeDownsampleBuffer.current;
      if (buffer.length > 0) {
        const avgBufferDt =
          (buffer.at(-1)!.timestamp.getTime() - buffer[0].timestamp.getTime()) /
          buffer.length;
        const numPoints = Math.ceil(Math.max(dt / avgBufferDt, 1));
        while (buffer.length >= numPoints) {
          console.log(numPoints);
          const section = buffer.splice(0, numPoints);
          // const downsampledTime = section.at(-1)!.timestamp.getTime() / 1000;
          // const downsampledValue = section.at(-1)!.value;
          const downsampledTime =
            section.reduce((a, b) => a + b.timestamp.getTime() / 1000, 0) /
            numPoints;
          const downsampledValue =
            section.reduce((a, b) => a + b.value, 0) / numPoints;
          xRef.current.push(downsampledTime);
          yRef.current.push(downsampledValue);
        }
      }

      // // remove old data
      let filteredIdx = 0;
      const latest = xRef.current[xRef.current.length - 1];
      const startTime = latest - props.timespan;
      for (const x of xRef.current) {
        if (x >= startTime) break;
        filteredIdx++;
      }
      xRef.current = xRef.current.slice(filteredIdx);
      yRef.current = yRef.current.slice(filteredIdx);

      plotRef.current?.setData([xRef.current, yRef.current]);

      animationRef.current = window.requestAnimationFrame(updatePlot);
    };

    if (!props.paused) updatePlot();

    return () => {
      window.cancelAnimationFrame(animationRef.current);
    };
  });

  useEffect(() => {
    const opts: Options = {
      title: props.title ? props.title : "",
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
          // fill: "rgba(218,170,0,0.1)",
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
  }, [props.title]);

  const readyRef = useRef(false);
  useEffect(() => {
    readyRef.current = false;
    if (props.dataSource) {
      xRef.current.length = 0;
      yRef.current.length = 0;
      timeDownsampleBuffer.current.length = 0;

      const addTimeData = (point: IDataPoint) => {
        if (!readyRef.current) return;
        timeDownsampleBuffer.current.push(point);
      };

      xRef.current.length = 0;
      yRef.current.length = 0;
      let now = new Date();
      let start = new Date(now.getTime() - props.timespan * 1000);
      let dt =
        (now.getTime() - start.getTime()) /
        (1000 * actualSize.width * (props.pointsPerPixel ?? 1));
      props.dataSource
        .historical(start, now, dt)
        .then((hist) =>
          hist.forEach((point: IDataPoint) => {
            xRef.current.push(point.timestamp.getTime() / 1000);
            yRef.current.push(point.value);
          })
        )
        .then(() => {
          readyRef.current = true;
        });

      const subId = props.dataSource?.subscribe(addTimeData);
      return () => {
        props.dataSource?.unsubscribe(subId);
      };
    }
  }, [
    props.dataSource,
    props.timespan,
    size.width,
    props.pointsPerPixel,
    props.paused,
  ]);

  useEffect(() => {
    plotRef.current?.setSize({
      width: size.width,
      height: size.height - 30.6,
    });
  }, [size]);

  return (
    <div ref={containerRef} className="h-100 w-100 min-vw-0 min-vh-0 pt-1">
      <div ref={divRef}></div>
    </div>
  );
}
