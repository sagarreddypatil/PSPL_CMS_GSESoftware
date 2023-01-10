import { useEffect, useRef } from "react";
import TimeChart from "timechart/core";
import { lineChart } from "timechart/plugins/lineChart";
import { d3Axis } from "timechart/plugins/d3Axis";
import { crosshair } from "timechart/plugins/crosshair";
import { nearestPoint } from "timechart/plugins/nearestPoint";
import { TimeChartZoomPlugin } from "timechart/plugins/chartZoom";
import { DataPointsBuffer } from "timechart/core/dataPointsBuffer";
import { DataPoint } from "timechart/core/renderModel";
import { propTypes } from "react-bootstrap/esm/Image";

interface ReactTimeChartProps {
  registerAddCallback(callback: (points: DataPoint[]) => void): void;
  registerResetCallback(callback: () => void): void;
}

const ReactTimeChart = (props: ReactTimeChartProps) => {
  const chartDivRef = useRef<HTMLDivElement | null>(null);
  const dataRef = useRef(new DataPointsBuffer({ x: 0, y: 0 }));
  const chartRef = useRef<TimeChart | null>(null);

  const addData = (points: DataPoint[]) => {
    if (chartRef == null) return;

    dataRef.current.push(...points);

    if (chartRef.current) chartRef.current.options.realTime = true;

    chartRef.current?.update();
  };

  props.registerAddCallback(addData);

  const reset = () => {
    dataRef.current = new DataPointsBuffer();
    chartRef.current?.update();
  };

  props.registerResetCallback(reset);

  useEffect(() => {
    chartRef.current = new TimeChart(chartDivRef.current!, {
      series: [{ name: "Random", data: dataRef.current }],
      xRange: { min: 0, max: 50000 },
      realTime: true,
      plugins: {
        lineChart,
        d3Axis,
        crosshair,
        nearestPoint,
        zoom: new TimeChartZoomPlugin({
          x: {
            autoRange: true,
            minDomainExtent: 1,
          },
          y: {
            autoRange: true,
            minDomainExtent: 1,
          },
        }),
      },
    });

    return () => chartRef.current?.dispose();
  }, []);

  return <div ref={chartDivRef} className="flex-fill"></div>;
};

export default ReactTimeChart;
