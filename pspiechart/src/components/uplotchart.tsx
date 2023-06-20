import { IDataSource, IDataPoint } from "../contexts/io-context";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDebounce } from "@react-hook/debounce";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";
import SizedDiv from "../controls/sized-div";
import { TimeConductorContext } from "../contexts/time-conductor";

interface UPlotChartProps {
  title?: string;
  pointsPerPixel?: number;

  dataSource?: IDataSource;
}

export default function UPlotChart(props: UPlotChartProps) {
  // chart references
  const divRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const animationRef = useRef(0);
  const timeConductor = useContext(TimeConductorContext);

  const timespan =
    (timeConductor.paused
      ? timeConductor.fixed.start.getTime() - timeConductor.fixed.end.getTime()
      : timeConductor.moving.timespan) / 1000;

  // current chart data
  const xRef = useRef<number[]>([]);
  const yRef = useRef<number[]>([]);

  // Downsample buffers
  const timeDownsampleBuffer = useRef<IDataPoint[]>([]);

  // container size
  const [containerSize, setSize] = useDebounce({ width: 0, height: 0 }, 0);
  const size = {
    width: containerSize.width,
    height: containerSize.height - 27,
  };
  const actualSize = {
    width: size.width * window.devicePixelRatio,
    height: size.height * window.devicePixelRatio,
  };

  useEffect(() => {
    const removeOldData = () => {
      // remove old data
      let filteredIdx = 0;
      const latest = xRef.current[xRef.current.length - 1];
      const startTime = latest - timespan;
      for (const x of xRef.current) {
        if (x >= startTime) break;
        filteredIdx++;
      }
      xRef.current = xRef.current.slice(filteredIdx);
      yRef.current = yRef.current.slice(filteredIdx);
    };

    const downsampleData = () => {
      const desiredPoints = actualSize.width * (props.pointsPerPixel ?? 1);
      const desiredDt = timespan / desiredPoints;

      // downsample time data
      const buffer = timeDownsampleBuffer.current;
      if (buffer.length <= 1) return;

      const bufStart = buffer[0].timestamp.getTime() / 1000;
      const bufEnd = buffer.at(-1)!.timestamp.getTime() / 1000;
      const bufDt = (bufEnd - bufStart) / buffer.length;
      const batchSize = Math.ceil(desiredDt / bufDt); // how many points are there in the buffer per downsampled point

      while (buffer.length > batchSize) {
        const section = buffer.splice(0, batchSize);
        const downsampledTime =
          section.reduce((a, b) => a + b.timestamp.getTime() / 1000, 0) /
          batchSize;
        const downsampledValue =
          section.reduce((a, b) => a + b.value, 0) / batchSize;
        xRef.current.push(downsampledTime);
        yRef.current.push(downsampledValue);
      }
    };

    const updatePlot = () => {
      downsampleData();
      removeOldData();

      plotRef.current?.setData([xRef.current, yRef.current]);
      const timeNow = Date.now() / 1000;
      const timeStart = timeNow - timespan;
      plotRef.current?.setScale("x", {
        min: timeStart,
        max: timeNow,
      });
      animationRef.current = window.requestAnimationFrame(updatePlot);
    };

    if (!timeConductor.paused) updatePlot();

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
        x: {
          auto: false,
        },
      },
      axes: [
        {
          stroke: "#000",
          grid: {
            stroke: "#80808050",
          },
          ticks: {
            show: true,
            stroke: "#80808050",
          },
        },
        {
          stroke: "#000",
          grid: {
            stroke: "#80808050",
          },
          ticks: {
            show: true,
            stroke: "#80808050",
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
      let start = new Date(now.getTime() - timespan * 1000);
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
  }, [props.dataSource, timespan, props.pointsPerPixel, timeConductor.paused]);

  useEffect(() => {
    plotRef.current?.setSize({
      width: size.width,
      height: size.height - 30.6,
    });
  }, [size]);

  return (
    <SizedDiv onResize={(width, height) => setSize({ width, height })}>
      <div ref={divRef}></div>
    </SizedDiv>
  );
}
