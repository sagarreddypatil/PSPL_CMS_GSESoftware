import { useEffect, useRef } from "react";
import TimeChart from "timechart/core";
import { lineChart } from "timechart/plugins/lineChart";
import { d3Axis } from "timechart/plugins/d3Axis";
import { crosshair } from "timechart/plugins/crosshair";
import { nearestPoint } from "timechart/plugins/nearestPoint";
import { TimeChartZoomPlugin } from "timechart/plugins/chartZoom";

const ReactTimeChart = () => {
  const chartDivRef = useRef<HTMLDivElement | null>(null);
  const dataRef = useRef([] as { x: number; y: number }[]);
  const chartRef = useRef<TimeChart | null>(null);

  const addData = () => {
    if (chartRef == null) return;

    dataRef.current.push({ x: dataRef.current.length, y: Math.random() });
    console.log(dataRef.current);

    chartRef.current.options.realTime = true;

    chartRef.current?.update();
  };

  useEffect(() => {
    chartRef.current = new TimeChart(chartDivRef.current!, {
      series: [{ name: "Random", data: dataRef.current }],
      xRange: { min: 0, max: 20 },
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
  }, []);

  return <div ref={chartDivRef} className="flex-fill"></div>;
};

export default ReactTimeChart;
