import {
  FrequencyDataPoint,
  FrequencyDataSource,
  TimeDataPoint,
  TimeDataSource,
} from "@/types/DataInterfaces";
import { match } from "assert";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import sizeMe from "react-sizeme";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";

interface UPlotChartProps {
  title?: string;
  pointsPerPixel?: number;

  timespan: number; // seconds
  paused: boolean;

  timeDataSource?: TimeDataSource;
  frequencyDataSource?: FrequencyDataSource;

  size: { width: number; height: number };
}

function UPlotChart(props: UPlotChartProps) {
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
  const size = props.size;

  useEffect(() => {
    const updatePlot = () => {
      const desiredPoints =
        size.width * window.devicePixelRatio * (props.pointsPerPixel ?? 1);
      const dt = props.timespan / desiredPoints;

      // downsample time data
      const buffer = timeDownsampleBuffer.current;
      if (buffer.length > 0) {
        const avgBufferDt =
          (buffer.at(-1)!.time - buffer[0].time) / buffer.length;
        const numPoints = Math.ceil(Math.max(dt / avgBufferDt, 1));
        while (buffer.length >= numPoints) {
          const section = buffer.splice(0, numPoints);

          // const downsampledTime = section.at(-1)!.time;
          // const downsampledValue = section.at(-1)!.value;

          const downsampledTime =
            section.reduce((a, b) => a + b.time, 0) / numPoints;
          const downsampledValue =
            section.reduce((a, b) => a + b.value, 0) / numPoints;

          xRef.current.push(downsampledTime);
          yRef.current.push(downsampledValue);
        }
      }

      // remove old data
      const currentTimespan =
        xRef.current[xRef.current.length - 1] - xRef.current[0];
      const avgDt = currentTimespan / (xRef.current.length + 1);
      const cutoff = Math.ceil(props.timespan / avgDt);

      xRef.current = xRef.current.slice(-cutoff);
      yRef.current = yRef.current.slice(-cutoff);

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
          // stroke: "#ff0",
          // stroke: "#0ff",
          // stroke: "#f00",
          // stroke: "#0f0",
          // stroke: "#00f",
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

  useEffect(() => {
    if (props.timeDataSource) {
      xRef.current.length = 0;
      yRef.current.length = 0;
      timeDownsampleBuffer.current.length = 0;

      const addTimeData = (point: TimeDataPoint) => {
        timeDownsampleBuffer.current.push(point);
      };

      xRef.current.length = 0;
      yRef.current.length = 0;
      let now = Date.now();
      let start = now - props.timespan * 1000;
      let dt =
        (now - start) /
        (size.width * window.devicePixelRatio * (props.pointsPerPixel ?? 1));
      let historicalData = props.timeDataSource.get(start, now, dt);
      historicalData.forEach((point) => {
        xRef.current.push(point.time);
        yRef.current.push(point.value);
      });

      props.timeDataSource?.subscribe(addTimeData);
      return () => {
        props.timeDataSource?.unsubscribe(addTimeData);
      };
    }
  }, [
    props.timeDataSource,
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

export default sizeMe({ monitorHeight: true })(UPlotChart);