import dynamic from "next/dynamic";
import { DataPoint } from "timechart/core/renderModel";
import { useEffect, useRef, useState } from "react";

const ReactTimeChart = dynamic(() => import("./ReactTimeChart"), {
  ssr: false,
});

export default function TimePlot() {
  const addCallback = useRef((points: DataPoint[]) => {});
  const resetCallback = useRef(() => {});

  useEffect(() => {
    const start = Date.now();

    const addData = () => {
      const time = Date.now() - start;
      addCallback.current([{ x: time, y: Math.sin(time) }]);
    };

    const interval = setInterval(addData, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-fill d-flex">
      <ReactTimeChart
        registerAddCallback={(callback) => (addCallback.current = callback)}
        registerResetCallback={(callback) => (resetCallback.current = callback)}
      />
    </div>
  );
}
