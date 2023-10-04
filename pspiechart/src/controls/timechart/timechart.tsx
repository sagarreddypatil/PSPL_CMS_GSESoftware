import { useContext, useEffect, useRef, useState } from "react";
import SizedDiv from "../sized-div";
import TimeChart from "timechart";
import { DataSource } from "../../contexts/io-context";
import { TimeConductorContext } from "../../contexts/time-conductor-context";

interface TimeChartProps {
  title?: string;
  pointsPerPixel?: number;

  dataSources: DataSource[];
  colors: string[];
}

type TCDataPoint = {
  x: number;
  y: number;
};

export default function TimeChartPlot({
  title,
  dataSources,
  pointsPerPixel,
  colors,
}: TimeChartProps) {
  const timeConductor = useContext(TimeConductorContext);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const divRef = useRef<HTMLDivElement>(null);

  const baseTimeRef = useRef<number>(0);
  const chartRef = useRef<TimeChart | null>(null);
  const chartDataRef = useRef<TCDataPoint[][]>([]);
  const animationRef = useRef<number>(0);
  const enabledRef = useRef<boolean>(false);

  useEffect(() => {
    // chartDataRef.current = dataSources.map(() => []);
    baseTimeRef.current = Date.now();

    const promises: Promise<void>[] = [];

    let minTime = Infinity;
    let maxTime = -Infinity;

    dataSources.forEach((source, index) => {
      const timeStart = timeConductor.paused
        ? timeConductor.fixed.start
        : new Date(Date.now() - timeConductor.moving.timespan);
      const timeEnd = timeConductor.paused
        ? timeConductor.fixed.end
        : new Date();
      const dt =
        (timeEnd.getTime() - timeStart.getTime()) /
        (size.width * (pointsPerPixel ?? 1));

      const promise = source
        .historical(timeStart, timeEnd, dt / 1000) // historical wants dt in seconds
        .then((data) => {
          chartDataRef.current[index] = [];

          data.forEach((point) => {
            const newPoint = {
              x: point.timestamp.getTime() - baseTimeRef.current,
              y: point.value,
            };
            minTime = Math.min(minTime, newPoint.x);
            maxTime = Math.max(maxTime, newPoint.x);
            chartDataRef.current[index].push(newPoint);
          });
        });

      promises.push(promise);
    });

    Promise.all(promises).then(() => {
      chartRef.current?.dispose();
      chartRef.current = new TimeChart(divRef.current!, {
        baseTime: baseTimeRef.current,
        series: dataSources.map((source, i) => ({
          name: source.identifier.name,
          data: chartDataRef.current[i],
          color: colors[i],
        })),
        xRange: {
          min: minTime,
          max: maxTime,
        },
        realTime: timeConductor.paused, // changed on hook, but this is the default
        zoom: {
          x: {
            autoRange: true,
            // minDomainExtent: 50, // not sure what this does
          },
          y: {
            autoRange: true,
            minDomainExtent: 1,
          },
        },
      });

      enabledRef.current = true;
    });

    const subIds: string[] = [];
    dataSources.forEach((source, i) => {
      if (timeConductor.paused) return;

      const subId = source.subscribe((data) => {
        if (!enabledRef.current) return;
        const newPoint = {
          x: data.timestamp.getTime() - baseTimeRef.current,
          y: data.value,
        };
        chartDataRef.current[i].push(newPoint);
      });
      subIds.push(subId);
    });

    return () => {
      enabledRef.current = false;
      dataSources.forEach((source, i) => {
        source.unsubscribe(subIds[i]);
      });
    };
  }, [title, dataSources, timeConductor]);

  useEffect(() => {
    const removeOldData = () => {
      const now = Date.now();
      const cutoff = now - timeConductor.moving.timespan;
    };

    const updatePlot = () => {
      if (!enabledRef.current) {
        animationRef.current = requestAnimationFrame(updatePlot);
        return;
      }
      removeOldData();
      chartRef.current!.options.xRange = {
        min: Date.now() - baseTimeRef.current - timeConductor.moving.timespan,
        max: Date.now() - baseTimeRef.current,
      };
      chartRef.current!.options.realTime = true;
      chartRef.current?.update();
      animationRef.current = requestAnimationFrame(updatePlot);
    };

    updatePlot();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [timeConductor]);

  return (
    <SizedDiv onResize={(width, height) => setSize({ width, height })}>
      <div ref={divRef} className="w-full h-full"></div>
    </SizedDiv>
  );
}
