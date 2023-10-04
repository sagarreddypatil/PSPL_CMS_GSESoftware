import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { DataSource } from "../../contexts/io-context";
import SizedDiv from "../sized-div";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { TimeConductorContext } from "../../contexts/time-conductor-context";
import { Chart, ChartData } from "chart.js";
import { DarkModeContext } from "../../App";

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
  const pointDt = useMemo(
    () =>
      // only accept every dt
      timeConductor.moving.timespan / 1000 / chartSize.width,
    [timeConductor, size.width]
  );
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
    const opts = {
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
          label: ds.identifier.name,
          stroke: colors[idx],
          width: 1,
        })),
      ],
    };

    plotRef.current = new uPlot(opts, dataRef.current, divRef.current!);

    const subIds: string[] = [];
    dataSources.forEach((ds, idx) => {
      const subId = ds.subscribe((newPoint) => {
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
      });
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
  useEffect(() => {
    const endTime = timeConductor.paused ? timeConductor.fixed.end : new Date();
    const startTime = timeConductor.paused
      ? timeConductor.fixed.start
      : new Date(endTime.getTime() - timeConductor.moving.timespan);

    const newData: ChartDataType = [[], ...dataSources.map(() => [])];

    const promises = dataSources.map((source, srcIdx) => {
      return source.historical(startTime, endTime, pointDt).then((data) => {
        data.forEach((point, pointIdx) => {
          newData[0][pointIdx] = point.timestamp.getTime() / 1000;
          newData[srcIdx + 1][pointIdx] = point.value;
        });
      });
    });

    // swap out data after all promises resolve
    Promise.all(promises).then(() => {
      acceptDataRef.current = false;
      dataRef.current = newData;
      // only reaccept data if we're not paused
      if (!timeConductor.paused) acceptDataRef.current = true;
    });
  }, [dataSources, timeConductor]);

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

    const updateChart = () => {
      const currentTimeEnd = dataRef.current[0][dataRef.current[0].length - 1]; // ensure latest point is visible
      const currentTimeStart =
        currentTimeEnd - timeConductor.moving.timespan / 1000;

      if (!timeConductor.paused) removeOldData(currentTimeStart);
      plotRef.current?.setData(dataRef.current, false);

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
