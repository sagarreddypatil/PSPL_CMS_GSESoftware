import { DataSource } from "../contexts/io-context";
import { useContext, useEffect, useRef, useState } from "react";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";
import SizedDiv from "./sized-div";
import { TimeConductorContext } from "../contexts/time-conductor-context";
import { DarkModeContext } from "../App";

interface UPlotChartProps {
  title?: string;
  pointsPerPixel?: number;

  dataSources: DataSource[];
  colors: string[];
}

export default function UPlotChart(props: UPlotChartProps) {
  // chart references
  const darkMode = useContext(DarkModeContext);
  const timeConductor = useContext(TimeConductorContext);

  // state for the size of the chart, using SizedDiv
  const prevTc = useRef(timeConductor);
  const prevSize = useRef({ width: 0, height: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  // refs for creating and using the uplot stuff
  const divRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);

  // ref to data, directly plotted
  const plotTimeRef = useRef<number[]>([]);
  const plotDataRef = useRef<number[][]>([]);

  // stuff to downsample into the plot data
  const downsampleBacklog = useRef<Map<number, number[]>>(new Map()); // key is time, value is array indexed by local data source index

  // animation ref for plot updates
  const animationRef = useRef<number>(0);

  // one stop shop for getting time related stuff
  const timeStart = timeConductor.paused
    ? timeConductor.fixed.start
    : new Date(Date.now() - timeConductor.moving.timespan);
  const timeEnd = timeConductor.paused ? timeConductor.fixed.end : new Date();
  const dt =
    (timeEnd.getTime() - timeStart.getTime()) /
    (size.width * (props.pointsPerPixel ?? 1));

  useEffect(() => {
    // where the magic happens
    // downsample backlog into plot data
    // then update the plot

    // downsample backlog into plot data, runs every animation frame when not paused
    const updateData = () => {
      const backlog = downsampleBacklog.current;
      // const backlogTimes = Array.from(backlog.keys()).sort();

      // const backlogDt = backlogTimes[backlogTimes.length - 1] - backlogTimes[0];
      // const backlogPoints = backlogTimes.length;
      // const backlogDtPerPoint = backlogDt / backlogPoints;

      // const backlogPointsPerNewPoint = Math.ceil(dt / backlogDtPerPoint);

      for (const [timestamp, data] of backlog) {
        const time = timestamp / 1000; // uPlot uses seconds, unlike js which is ms

        // add time to plotTimeRef
        plotTimeRef.current.push(time);

        // add data to plotDataRef
        for (let i = 0; i < props.dataSources.length; i++) {
          const newVal = data[i] ?? null;
          if (!plotDataRef.current[i]) plotDataRef.current[i] = [];
          plotDataRef.current[i].push(newVal);
        }
      }

      backlog.clear();
    };

    const removeOldData = () => {
      // delete data points older than min
      const min = timeStart.getTime() / 1000;

      while (plotTimeRef.current[0] < min) {
        plotTimeRef.current.shift();
        for (const data of plotDataRef.current) {
          data.shift();
        }
      }
    };

    // plot data update, runs every animation frame
    const updatePlot = () => {
      updateData();
      if (!timeConductor.paused) removeOldData();

      plotRef.current?.setData([plotTimeRef.current, ...plotDataRef.current]);

      // timeStart and timeEnd only update every render
      const currentTimeEnd = Date.now();
      const currentTimeStart = currentTimeEnd - timeConductor.moving.timespan;

      if (timeConductor.paused) {
        plotRef.current?.setScale("x", {
          min: timeStart.getTime() / 1000,
          max: timeEnd.getTime() / 1000,
        });
      } else {
        plotRef.current?.setScale("x", {
          min: currentTimeStart / 1000,
          max: currentTimeEnd / 1000,
        });
      }

      animationRef.current = requestAnimationFrame(updatePlot);
    };

    updatePlot();

    return () => {
      window.cancelAnimationFrame(animationRef.current);
    };
  }, [timeConductor, props.pointsPerPixel, size]);

  useEffect(() => {
    // fetch historical data and subscribe to new data
    // historical data gets sent straight to plotTimeRef and plotDataRef

    // only refetch historical if size changes significantly (> 0.5 orders of magnitude)
    const sizeChange = Math.log10(size.width / prevSize.current.width);
    if (sizeChange > 0.5 || timeConductor != prevTc.current) {
      prevTc.current = timeConductor;
      prevSize.current = size;

      // map between time and array of data, which is indexed by data source
      const historicalData = new Map<number, number[]>(); // key is time, value is array indexed by local data source index
      const promises: Promise<void>[] = [];

      props.dataSources.forEach((source, index) => {
        const promise = source
          .historical(timeStart, timeEnd, dt / 1000) // historical wants dt in seconds
          .then((data) => {
            data.forEach((point) => {
              const timestamp = point.timestamp.getTime();

              const current = historicalData.get(timestamp) ?? [];
              current[index] = point.value;
              historicalData.set(timestamp, current);
            });
          });

        promises.push(promise);
      });

      Promise.all(promises).then(() => {
        plotTimeRef.current.length = 0;
        plotDataRef.current.length = 0;
        historicalData.forEach((data, timestamp) => {
          plotTimeRef.current.push(timestamp / 1000); // uplot uses seconds, not ms unlike js
          for (let i = 0; i < props.dataSources.length; i++) {
            const newVal = data[i] ?? NaN;
            if (!plotDataRef.current[i]) plotDataRef.current[i] = [];
            plotDataRef.current[i].push(newVal);
          }
        });
      });
    }

    const paused = timeConductor.paused;
    if (paused) return; // don't stream if paused

    // subscribe to the datasource to stream that sweet sweet data
    // data gets sent to downsampleBacklog
    let subIds: string[] = [];
    props.dataSources.forEach((source, index) => {
      // subscribe to new data from each source
      const subId = source.subscribe((data) => {
        const timestamp = data.timestamp.getTime();

        const current = downsampleBacklog.current.get(timestamp) ?? [];
        current[index] = data.value;
        downsampleBacklog.current.set(timestamp, current);
      });

      subIds.push(subId);
    });

    return () => {
      // unsubscribe from all sources
      props.dataSources.forEach((source, index) => {
        source.unsubscribe(subIds[index]);
      });
    };
  }, [props.dataSources, timeConductor, size]);

  const sourceToSeries = (source: DataSource, index: number) => {
    return {
      label: source.identifier.name,
      stroke: props.colors[index],
      width: 2,
    };
  };

  const genSeries = () => {
    return [
      {},
      ...props.dataSources.map((source, index) =>
        sourceToSeries(source, index)
      ),
    ];
  };

  useEffect(() => {
    const opts: Options = {
      title: "",
      width: size.width ?? 1,
      height: size.height - 60 ?? 1, // need to subtract 60 for some reason
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
      series: genSeries(),
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

    plotRef.current = new uPlot(opts, [[], []], divRef.current ?? undefined);

    return () => {
      plotRef.current?.destroy();
    };
  }, [props.dataSources, props.title, timeConductor]);

  useEffect(() => {
    if (!plotRef.current) return;

    // for some reason, need to subtract 60 for uPlot to actually fit
    plotRef.current.setSize({ width: size.width, height: size.height - 60 });
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
