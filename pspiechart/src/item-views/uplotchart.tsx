import { DataSource, DataPoint } from "../contexts/io-context";
import { useContext, useEffect, useRef } from "react";
import { useDebounce } from "@react-hook/debounce";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";
import SizedDiv from "../controls/sized-div";
import { TimeConductorContext } from "../contexts/time-conductor-context";
import { DarkModeContext } from "../App";

interface UPlotChartProps {
  title?: string;
  pointsPerPixel?: number;

  dataSources: DataSource[];
  colors: string[];
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
  const yRefs = useRef<number[][]>([]);

  // Downsample buffers
  const timeDownsampleBuffer = useRef<
    {
      series: number;
      timestamp: number;
      value: number;
    }[]
  >([]);

  // container size
  const [containerSize, setSize] = useDebounce({ width: -1, height: -1 }, 0);
  const unscaledSize = {
    width: containerSize.width,
    height: containerSize.height - 60,
  };
  const size = {
    width: unscaledSize.width * window.devicePixelRatio,
    height: unscaledSize.height * window.devicePixelRatio,
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
      yRefs.current = yRefs.current.map((y) => y.slice(filteredIdx));
      // yRef.current = yRef.current.slice(filteredIdx);
    };

    const downsampleData = () => {
      if (size.width < 0) return;

      const desiredPoints = size.width * (props.pointsPerPixel ?? 1);
      const desiredDt = timespan / desiredPoints;

      // downsample time data
      const buffer = timeDownsampleBuffer.current;
      if (buffer.length <= 1) return;

      const bufStart = buffer[0].timestamp;
      const bufEnd = buffer.at(-1)!.timestamp;
      const bufDt = (bufEnd - bufStart) / buffer.length;
      const batchSize = Math.ceil(desiredDt / bufDt); // how many points are there in the buffer per downsampled point

      while (buffer.length > batchSize) {
        const section = buffer.splice(0, batchSize);

        // const downsampledTime =
        //   section.reduce((a, b) => a + b.timestamp, 0) / batchSize;
        // const downsampledValue =
        //   section.reduce((a, b) => a + b.value, 0) / batchSize;

        let timeCount = 0;
        let timeSum = 0;
        let valueCounts = yRefs.current.map(() => 0);
        let valueSums = yRefs.current.map(() => 0);

        for (const point of section) {
          timeSum += point.timestamp;
          timeCount++;

          valueSums[point.series] += point.value;
          valueCounts[point.series]++;
        }

        xRef.current.push(timeSum / timeCount);
        for (let i = 0; i < yRefs.current.length; i++) {
          if (valueCounts[i] <= 0) continue;
          yRefs.current[i].push(valueSums[i] / valueCounts[i]);
        }
        // yRef.current.push(downsampledValue);
      }
    };

    const pausedUpdate = () => {
      plotRef.current?.setData([xRef.current, ...yRefs.current]);
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

      plotRef.current?.setData([xRef.current, ...yRefs.current]);
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
      title: "",
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
        // {
        //   label: props.title,
        //   stroke: "#daaa00",
        //   width: 2,
        // },
        ...props.dataSources.map((source, index) => {
          return {
            label: source.identifier.name,
            // stroke: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            stroke: props.colors[index] ?? "#ff00ff",
            width: 2,
          };
        }),
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
  }, [props.dataSources, props.colors, props.title, timeConductor]);

  const fetchHistorical = async () => {
    let curWidth = size.width;
    if (curWidth < 0) curWidth = 1000;

    let start: Date, end: Date;

    xRef.current.length = 0;
    yRefs.current = props.dataSources.map(() => []);

    if (timeConductor.paused) {
      start = timeConductor.fixed.start;
      end = timeConductor.fixed.end;
    } else {
      end = new Date();
      start = new Date(end.getTime() - timespan * 1000);
    }
    const dt =
      (end.getTime() - start.getTime()) /
      (1000 * curWidth * (props.pointsPerPixel ?? 1));

    let allPoints: {
      series: number;
      timestamp: number;
      value: number;
    }[] = [];

    await Promise.all(
      props.dataSources.map((source, index) => {
        return source.historical(start, end, dt).then((hist) => {
          allPoints = allPoints.concat(
            hist.map((point: DataPoint) => ({
              series: index,
              timestamp: dateToSec(point.timestamp),
              value: point.value,
            }))
          );
        });
      })
    );

    allPoints.sort((a, b) => a.timestamp - b.timestamp);

    let lastTime = 0;
    for (const point of allPoints) {
      const time = point.timestamp;
      if (time !== lastTime) xRef.current.push(point.timestamp);
      lastTime = time;

      yRefs.current[point.series].push(point.value);
    }
  };

  useEffect(() => {
    let unsubscribeFuncs: (() => void)[] = [];

    fetchHistorical();
    if (timeConductor.paused) return () => {};

    timeDownsampleBuffer.current.length = 0;

    props.dataSources.forEach((source, index) => {
      const addTimeData = (point: DataPoint) => {
        timeDownsampleBuffer.current.push({
          series: index,
          timestamp: dateToSec(point.timestamp),
          value: point.value,
        });
      };

      const subId = source?.subscribe(addTimeData);
      unsubscribeFuncs.push(() => {
        source?.unsubscribe(subId);
      });
    });

    return () => {
      unsubscribeFuncs.forEach((func) => func());
    };

    // fetchHistorical();

    // if (timeConductor.paused) return () => {};

    // const addTimeData = (point: DataPoint) => {
    //   timeDownsampleBuffer.current.push(point);
    // };

    // const subId = source?.subscribe(addTimeData);
    // return () => {
    //   source?.unsubscribe(subId);
    // };
  }, [props.dataSources, timespan, props.pointsPerPixel, timeConductor]);

  useEffect(() => {
    plotRef.current?.setSize({
      width: unscaledSize.width,
      height: unscaledSize.height,
    });
  }, [unscaledSize]);

  return (
    <SizedDiv onResize={(width, height) => setSize({ width, height })}>
      <div
        ref={divRef}
        className="h-full flex items-center justify-center"
      ></div>
    </SizedDiv>
  );
}
