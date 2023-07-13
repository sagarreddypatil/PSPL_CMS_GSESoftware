import { DataSource, DataPoint } from "../contexts/io-context";
import { useContext, useEffect, useRef } from "react";
import { useDebounce } from "@react-hook/debounce";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";
import SizedDiv from "./sized-div";
import { TimeConductorContext } from "../contexts/time-conductor-context";
import { DarkModeContext } from "../App";

interface UPlotChartProps {
  title?: string;
  pointsPerPixel?: number;

  dataSource?: DataSource;
}

function dateToSec(date: Date) {
  return date.getTime() / 1000;
}

export default function UPlotChart(props: UPlotChartProps) {
  // chart references
  const darkMode = useContext(DarkModeContext);

  const divRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const animationRef = useRef(0);
  const timeConductor = useContext(TimeConductorContext);

  const timespan =
    (timeConductor.paused
      ? timeConductor.fixed.end.getTime() - timeConductor.fixed.start.getTime()
      : timeConductor.moving.timespan) / 1000;

  // current chart data
  const xRef = useRef<number[]>([]);
  const yRef = useRef<number[]>([]);

  // Downsample buffers
  const timeDownsampleBuffer = useRef<DataPoint[]>([]);

  // container size
  const [containerSize, setSize] = useDebounce({ width: 800, height: 600 }, 0);
  const size = {
    width: containerSize.width,
    height: containerSize.height - 60,
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

      const bufStart = dateToSec(buffer[0].timestamp);
      const bufEnd = dateToSec(buffer.at(-1)!.timestamp);
      const bufDt = (bufEnd - bufStart) / buffer.length;
      const batchSize = Math.ceil(desiredDt / bufDt); // how many points are there in the buffer per downsampled point

      while (buffer.length > batchSize) {
        const section = buffer.splice(0, batchSize);
        const downsampledTime =
          section.reduce((a, b) => a + dateToSec(b.timestamp), 0) / batchSize;
        const downsampledValue =
          section.reduce((a, b) => a + b.value, 0) / batchSize;
        xRef.current.push(downsampledTime);
        yRef.current.push(downsampledValue);
      }
    };

    const pausedUpdate = () => {
      plotRef.current?.setData([xRef.current, yRef.current]);
      const timeStart = dateToSec(timeConductor.fixed.start);
      const timeEnd = dateToSec(timeConductor.fixed.end);
      plotRef.current?.setScale("x", {
        min: timeStart,
        max: timeEnd,
      });
    };

    const resumedUpdate = () => {
      downsampleData();
      removeOldData();

      plotRef.current?.setData([xRef.current, yRef.current]);
      const timeNow = Date.now() / 1000;
      const timeStart = timeNow - timespan;
      plotRef.current?.setScale("x", {
        min: timeStart,
        max: timeNow,
      });
    };

    const updatePlot = () => {
      if (timeConductor.paused) {
        pausedUpdate();
      } else {
        resumedUpdate();
      }
      animationRef.current = window.requestAnimationFrame(updatePlot);
    };

    updatePlot();

    return () => {
      window.cancelAnimationFrame(animationRef.current);
    };
  });

  useEffect(() => {
    const opts: Options = {
      title: props.title ? props.title : "",
      width: 1,
      height: 1,
      tzDate: (ts) => uPlot.tzDate(new Date(ts * 1e3), "UTC"),
      pxAlign: false,
      cursor: {
        y: false,
        lock: true,
      },
      scales: {
        x: {
          auto: false,
        },
        y: {
          auto: true,
        },
      },
      axes: [
        {
          font: "12px IBM Plex Mono",
          labelFont: "bold 12px IBM Plex Mono",
          stroke: darkMode ? "#fff" : "#000",
          grid: {
            stroke: "#80808080",
          },
          ticks: {
            show: true,
            stroke: "#80808080",
          },
        },
        {
          font: "12px IBM Plex Mono",
          labelFont: "bold 12px IBM Plex Mono",
          gap: 5,
          size: 65,
          stroke: darkMode ? "#fff" : "#000",
          grid: {
            stroke: "#80808080",
          },
          ticks: {
            show: true,
            stroke: "#80808080",
          },
        },
      ],
      series: [
        {},
        {
          label: props.title,
          stroke: "#daaa00",
          width: 2,
        },
      ],
      hooks: {
        init: [
          (u) => {
            u.over.ondblclick = () => {
              timeConductor.setPaused(false);
            };
          },
        ],
        setSelect: [
          (u) => {
            if (!timeConductor.paused) return;
            if (u.select.width <= 0) return;

            const min = u.posToVal(u.select.left, "x");
            const max = u.posToVal(u.select.left + u.select.width, "x");

            timeConductor.setFixed({
              start: new Date(min * 1e3),
              end: new Date(max * 1e3),
            });

            u.setSelect(
              {
                left: 0,
                width: 0,
                top: 0,
                height: 0,
              },
              false
            );
          },
        ],
      },
    };

    plotRef.current = new uPlot(
      opts,
      [[], []],
      divRef.current ? divRef.current : undefined
    );

    return () => {
      plotRef.current?.destroy();
    };
  }, [props.dataSource, props.title, timeConductor]);

  const fetchHistorical = async () => {
    let start: Date, end: Date;
    if (timeConductor.paused) {
      start = timeConductor.fixed.start;
      end = timeConductor.fixed.end;
    } else {
      end = new Date();
      start = new Date(end.getTime() - timespan * 1000);
    }
    const dt =
      (end.getTime() - start.getTime()) /
      (1000 * actualSize.width * (props.pointsPerPixel ?? 1));

    return props.dataSource?.historical(start, end, dt).then((hist) => {
      xRef.current = hist.map((point: DataPoint) => dateToSec(point.timestamp));
      yRef.current = hist.map((point: DataPoint) => point.value);
    });
  };

  useEffect(() => {
    if (props.dataSource) {
      fetchHistorical();

      if (timeConductor.paused) return () => {};

      const addTimeData = (point: DataPoint) => {
        timeDownsampleBuffer.current.push(point);
      };
      const subId = props.dataSource?.subscribe(addTimeData);
      return () => {
        props.dataSource?.unsubscribe(subId);
      };
    }
  }, [props.dataSource, timespan, props.pointsPerPixel, timeConductor]);

  useEffect(() => {
    plotRef.current?.setSize({
      width: size.width,
      height: size.height,
    });
  }, [size]);

  return (
    <SizedDiv onResize={(width, height) => setSize({ width, height })}>
      <div
        ref={divRef}
        className="h-full flex items-center justify-center"
      ></div>
    </SizedDiv>
  );
}
