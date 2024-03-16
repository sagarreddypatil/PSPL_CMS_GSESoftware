import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { DataPoint, DataSource } from "../contexts/io-context";
import SizedDiv from "./sized-div";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";
import { TimeConductorContext } from "../contexts/time-conductor-context";
import { DarkModeContext } from "../App";

/*
 * The chart aligns the right side of the chart to the current time. However, if
 * there's a large descripancy between the latest point's timestamp and the
 * current time, then the latest data points wont be visible on the chart. To
 * account for this, we use the below variable. If the time difference between
 * the latest point's timestamp and the current time is larger than this value,
 * the chart will be aligned to the latest point's timestamp rather than the
 * current time.
 *
 * Try setting it to zero to see what happens. You should notice the chart being
 * more jittery as the incoming points are only accepted if the difference
 * between the previous point and the new point is large enough to fill a
 * horizontal pixel.
 */
const DISCREPANCY_FOR_LATEST_POINT_FOLLOWING = 1; // seconds

interface UPlotChartProps {
  title?: string;
  pointsPerPixel?: number;

  dataSources: DataSource[];
  colors: string[];
}

type ChartDataType = [
  xValues: number[],
  ...yValues: (number | null | undefined)[][]
];

export default function UPlotChart({
  // title,
  dataSources,
  colors,
}: UPlotChartProps) {
  const darkMode = useContext(DarkModeContext);
  const timeConductor = useContext(TimeConductorContext);
  const pausedRef = useRef<boolean>(false);
  useEffect(() => {
    pausedRef.current = timeConductor.paused;
  }, [timeConductor.paused]);

  // size and dt stuff
  const [size, setSize] = useState({ width: 1000, height: 0 }); // default is 1000 to avoid divide by zero and other wonkiness
  const chartSizeRef = useRef({ width: 1000, height: 0 });
  const chartSize = useMemo(
    () => ({
      width: size.width,
      height: size.height - 35, // to fit the legend at the bottom
    }),
    [size]
  );
  useEffect(() => {
    chartSizeRef.current = chartSize;
  }, [chartSize]);
  const pointDtRef = useRef<number>(0);
  const pointDt = useMemo(() => {
    let timeSpan = -1;
    if (timeConductor.paused) {
      timeSpan =
        timeConductor.fixed.end.getTime() - timeConductor.fixed.start.getTime();
    } else {
      timeSpan = timeConductor.moving.timespan;
    }
    // only accept every dt
    return timeSpan / 1000 / chartSize.width;
  }, [timeConductor, size.width]);
  useEffect(() => {
    pointDtRef.current = pointDt;
  }, [pointDt]);

  // chart-related refs
  const divRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot>();
  const dataRef = useRef<ChartDataType>([[]]);
  const animRef = useRef<number>(0);
  const acceptDataRef = useRef<boolean>(true);

  // Main useEffect, sets up graph and subscribes to data sources
  useEffect(() => {
    dataRef.current = [[], ...dataSources.map(() => [])]; // time + data
    const opts: Options = {
      width: chartSizeRef.current.width,
      height: chartSizeRef.current.height,
      pxAlign: false,
      scales: {
        x: {
          auto: false,
        },
        y: {
          auto: true,
        },
      },
      cursor: {
        y: false,
        lock: true,
      },
      axes: [
        {
          font: "12px IBM Plex Mono",
          labelFont: "bold 12px IBM Plex Mono",
          stroke: darkMode ? "#fff" : "#000",
          grid: {
            stroke: darkMode ? "#ffffff20" : "#00000010",
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
            stroke: darkMode ? "#ffffff20" : "#00000010",
          },
          ticks: {
            show: true,
            stroke: "#80808080",
          },
        },
      ],
      series: [
        {},
        ...dataSources.map((ds, idx) => ({
          label: ds.identifier.name + " (" + ds.unit + ")",
          stroke: colors[idx],
          width: 1.25,
        })),
      ],
      hooks: {
        init: [
          (u) => {
            u.over.ondblclick = () => {
              timeConductor.setPaused(true); // so you can refresh data by double clicking
              timeConductor.setPaused(false);
            };
          },
        ],
        setSelect: [
          (u) => {
            if (!pausedRef.current) return;
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

    plotRef.current = new uPlot(opts, dataRef.current, divRef.current!);

    const subIds: string[] = [];
    dataSources.forEach((ds, idx) => {
      const addDataPoint = (newPoint: DataPoint) => {
        if (!acceptDataRef.current) return;

        // add new point to the chart
        const pointTime = newPoint.timestamp.getTime() / 1000; // uPlot uses seconds
        const pointValue = newPoint.value;

        // if last time point is the same as this one, replace it
        const lastIndex = dataRef.current[0].length - 1;
        if (dataRef.current[0][lastIndex] === pointTime) {
          dataRef.current[idx + 1][lastIndex] = pointValue;
          return;
        }

        // if the new time is before the last one, skip it
        if (dataRef.current[0][lastIndex] > pointTime) {
          return;
        }

        // if new point is less than a dt away, replace it
        const lastTime = dataRef.current[0][lastIndex];
        if (pointTime - lastTime < pointDtRef.current) {
          dataRef.current[idx + 1][lastIndex] = pointValue;
          return;
        }

        // otherwise, push it to the end, push null on all other sources
        dataRef.current[0].push(pointTime);
        dataRef.current[idx + 1].push(pointValue);
        for (let i = 1; i < dataRef.current.length; i++) {
          if (i === idx + 1) continue;
          (dataRef.current[i] as (number | null | undefined)[]).push(null);
        }
      };
      const subId = ds.subscribe(addDataPoint);
      subIds.push(subId);
    });

    return () => {
      dataSources.forEach((source, idx) => {
        source.unsubscribe(subIds[idx]);
      });
      plotRef.current?.destroy();
    };
  }, [dataSources, darkMode]);

  // Fetch historical on time conductor change
  const oldWidthRef = useRef<number>(1000);
  useEffect(() => {
    if (size.width !== oldWidthRef.current) {
      if (Math.abs(1 - size.width / oldWidthRef.current) <= 0.2) {
        // if the width changed by more than 20%, fetch new data
        oldWidthRef.current = size.width;
        return;
      }
      oldWidthRef.current = size.width;
    }

    const endTime = timeConductor.paused ? timeConductor.fixed.end : new Date();
    const startTime = timeConductor.paused
      ? timeConductor.fixed.start
      : new Date(endTime.getTime() - timeConductor.moving.timespan);

    // const newData: ChartDataType = [[], ...dataSources.map(() => [])];
    const newDataRaw: DataPoint[][] = Array(dataSources.length).fill([]);

    const promises = dataSources.map((source, srcIdx) => {
      return source.historical(startTime, endTime, pointDt).then((data) => {
        // data.forEach((point, pointIdx) => {
        //   if(srcIdx === 0)
        //     newData[0][pointIdx] = point.timestamp.getTime() / 1000;
        //   newData[srcIdx + 1][pointIdx] = point.value;
        // });
        newDataRaw[srcIdx] = data;
      });
    });

    // swap out data after all promises resolve
    Promise.all(promises).then(() => {
      // acceptDataRef.current = false;

      const newData: ChartDataType = [[], ...dataSources.map(() => [])];
      let idx = 0;

      // while any of the sources still have data
      while(newDataRaw.some((data) => data.length > 0)) {
        let earliestTime = Number.MAX_VALUE;
        let earliestIdx = -1;

        newDataRaw.forEach((data, idx) => {
          if(data.length === 0) return;

          if(data[0].timestamp.getTime() < earliestTime) {
            earliestTime = data[0].timestamp.getTime();
            earliestIdx = idx;
          }
        });

        // insert the earliest point, unless last timestamp is the same
        if(newData[0].length === 0 || newData[0][newData[0].length - 1] !== earliestTime / 1000) {
          newData[0].push(earliestTime / 1000);
          for(let i = 0; i < dataSources.length; i++) {
            if(i === earliestIdx) {
              newData[i + 1].push(newDataRaw[earliestIdx][0].value);
            } else {
              // @ts-ignore
              newData[i + 1].push(undefined);
            }
          }
        }
        else {
          newData[earliestIdx + 1][newData[0].length - 1] = newDataRaw[earliestIdx][0].value;
        }

        // remove the earliest point from the source
        newDataRaw[earliestIdx].shift();
      }

      dataRef.current = newData;

      // only reaccept data if we're not paused
      if (!timeConductor.paused) acceptDataRef.current = true;
    });
  }, [dataSources, timeConductor, size.width]);

  // Update chart, animation loop
  useEffect(() => {
    const removeOldData = (before: number) => {
      // delete all data before (seconds)
      const firstIndex = dataRef.current[0].findIndex((x) => x > before);
      if (firstIndex === -1) return;

      for (let i = 0; i < dataRef.current.length; i++) {
        dataRef.current[i].splice(0, firstIndex);
      }
    };

    const pruneNulls = () => {
      // if null for all sources, remove
      const nullIndices: number[] = [];
      for (let i = 0; i < dataRef.current[0].length; i++) {
        let allNull = true;
        for (let j = 1; j < dataRef.current.length; j++) {
          if (dataRef.current[j][i] !== null) {
            allNull = false;
            break;
          }
        }
        if (allNull) nullIndices.push(i);
      }

      // reverse so we don't have to worry about indices changing
      nullIndices.reverse().forEach((idx) => {
        for (let i = 0; i < dataRef.current.length; i++) {
          dataRef.current[i].splice(idx, 1);
        }
      });
    };

    const updateChart = () => {
      const rightNow = Date.now() / 1000;
      let currentTimeEnd = dataRef.current[0][dataRef.current[0].length - 1]; // ensure latest point is visible
      if (
        Math.abs(currentTimeEnd - rightNow) <
        DISCREPANCY_FOR_LATEST_POINT_FOLLOWING
      ) {
        currentTimeEnd = rightNow;
      }
      const currentTimeStart =
        currentTimeEnd - timeConductor.moving.timespan / 1000;

      if (!timeConductor.paused) removeOldData(currentTimeStart);
      if (timeConductor.paused) pruneNulls(); // this is only an issue when paused
      plotRef.current?.setData(dataRef.current);

      if (timeConductor.paused) {
        plotRef.current?.setScale("x", {
          min: timeConductor.fixed.start.getTime() / 1000,
          max: timeConductor.fixed.end.getTime() / 1000,
        });
      } else {
        plotRef.current?.setScale("x", {
          min: currentTimeStart,
          max: currentTimeEnd,
        });
      }

      animRef.current = requestAnimationFrame(updateChart);
    };

    updateChart();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [timeConductor]);

  // Size update
  useEffect(() => {
    plotRef.current?.setSize(chartSize);
  }, [chartSize]);

  return (
    <SizedDiv onResize={(w, h) => setSize({ width: w, height: h })}>
      <div ref={divRef}></div>
    </SizedDiv>
  );
}
