import { useEffect, useRef, useState } from "react";
import TimeChart from "timechart";

interface DataPoint {
  x: number;
  y: number;
}

interface DataProvider {
  addCallback(callback: (newData: DataPoint[]) => void): void;
}

// props interface:
interface TimeChartProps {
  // name: string;
  // dataProvider: DataProvider;
}

export default function TimeChartPlot(props: TimeChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window == "undefined") {
      return;
    }

    console.log(window);

    // const data = [];
    // for (let x = 0; x < 100; x++) {
    //   data.push({ x, y: Math.random() });
    // }
    // const chart = new TimeChart(chartRef.current!, {
    //   series: [{ name: "Random", data }],
    //   zoom: {
    //     x: { autoRange: true },
    //     y: { autoRange: true },
    //   },
    // });
    // return () => chart.dispose();
  }, [props]);

  return <div ref={chartRef} style={{ width: "100%", height: 500 }} />;
}
