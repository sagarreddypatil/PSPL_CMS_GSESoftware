import { TimeConductorContext } from "../../contexts/time-conductor-context";
import SizedDiv from "../sized-div";

import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { Chart, ChartItem } from "chart.js/auto";
import { defaultConfig, makeDataset, makeDatasetColor } from "./config";
import { DataPoint, DataSource } from "../../contexts/io-context";

type ChartJSPoint = {
  x: number;
  y: number;
};

interface ChartJSPlotProps {
  title?: string;
  pointsPerPixel?: number;

  dataSources: DataSource[];
  colors: string[];
}

export default function ChartJSPlot(props: ChartJSPlotProps) {
  const timeConductor = useContext(TimeConductorContext);
  const [containerSize, setContainerSize] = useState({
    width: 1000,
    height: 0,
  });

  // memorize start and end times for later use
  const startTime = useMemo(() => {
    return timeConductor.paused
      ? timeConductor.fixed.start
      : new Date(Date.now() - timeConductor.moving.timespan);
  }, [timeConductor]);
  const endTime = useMemo(() => {
    return timeConductor.paused ? timeConductor.fixed.end : new Date();
  }, [timeConductor]);

  // compute chart dt
  const dt = useMemo(() => {
    return (
      (endTime.getTime() - startTime.getTime()) /
      (containerSize.width * (props.pointsPerPixel ?? 1))
    );
  }, [props.pointsPerPixel, endTime, startTime, containerSize.width]);

  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const backlogRef = useRef<DataPoint[][]>([]);
  const chartDataRef = useRef<ChartJSPoint[][]>([]);

  const animationRef = useRef<number>(0);

  useEffect(() => {
    backlogRef.current = props.dataSources.map((source) => []);
    chartDataRef.current = props.dataSources.map((source) => []);

    const context = canvasRef.current?.getContext("2d");
    let config = defaultConfig;

    config.data.datasets = props.dataSources.map((source, i) => {
      return makeDataset(
        source.identifier.name ?? "<Name not found>",
        props.colors[i]
      );
    });

    chartRef.current = new Chart(context as ChartItem, config);

    return () => {
      chartRef.current?.destroy();
    };
  }, [props.dataSources]);

  useEffect(() => {
    chartRef.current?.data.datasets?.forEach((dataset, i) => {
      const newColor = makeDatasetColor(props.colors[i]);

      dataset.borderColor = newColor.borderColor;
      dataset.backgroundColor = newColor.backgroundColor;
    });
  }, [props.colors]);

  useEffect(() => {
    // fetch historical data and add directly to chart
    props.dataSources.forEach((source, i) => {
      source
        .historical(startTime, endTime, dt / 1000) // dt is in ms, but historical wants seconds
        .then((data) => {
          chartDataRef.current[i] = [];
          data.forEach((point) => {
            chartDataRef.current[i].push({
              x: point.timestamp.getTime(),
              y: point.value,
            });
          });
        });
    });

    // if not paused, subscribe to new data
    if (!timeConductor.paused) {
      let subIds: string[] = [];
      props.dataSources.forEach((source, i) => {
        const subId = source.subscribe((data) => {
          // backlogRef.current[i].push(data);
        });

        subIds.push(subId);
      });

      return () => {
        props.dataSources.forEach((source, i) => {
          source.unsubscribe(subIds[i]);
        });

        backlogRef.current = props.dataSources.map((source) => []);
      };
    }

    return () => {
      backlogRef.current = props.dataSources.map((source) => []);
    };
  }, [props.dataSources, timeConductor]);

  useEffect(() => {
    const updatePlot = () => {
      // set data in chartDataRef to the actual chart
      chartRef.current?.data.datasets?.forEach((dataset, i) => {
        dataset.data = chartDataRef.current[i];
      });

      if (!timeConductor.paused) {
        chartRef.current!.scales.x.min =
          Date.now() - timeConductor.moving.timespan;
        chartRef.current!.scales.x.max = Date.now();
      }

      chartRef.current?.update();

      animationRef.current = requestAnimationFrame(updatePlot);
    };

    updatePlot();
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [timeConductor]);

  return (
    <SizedDiv onResize={(width, height) => setContainerSize({ width, height })}>
      <canvas ref={canvasRef}></canvas>
    </SizedDiv>
  );
}
