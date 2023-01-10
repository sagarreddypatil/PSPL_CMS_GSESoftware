import { TimeDataPoint } from "@/types/DataInterfaces";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";

const UPlotChart = dynamic(() => import("./UPlotChart"), {
  ssr: false,
});

interface TimePlotProps {
  paused: boolean;
  syncRef: React.MutableRefObject<uPlot.SyncPubSub>;
}

export default function TimePlot(props: TimePlotProps) {
  const addCallback = useRef((points: TimeDataPoint) => {});
  const lastRef = useRef(Date.now());

  useEffect(() => {
    const addData = () => {
      const time = Date.now();
      const dt = time - lastRef.current;

      let i = 1;
      while (i <= dt) {
        const actual = lastRef.current + i;

        addCallback.current({
          time: actual / 1000,
          value: Math.sin(actual / 100),
        });
        i++;
      }

      lastRef.current = time;
    };

    const interval = setInterval(addData, 1);
    return () => clearInterval(interval);
  }, []);

  return (
    // <div className="flex-fill d-flex">
    <UPlotChart
      timeWidth={10}
      paused={props.paused}
      registerTimeDataCallback={(callback) => (addCallback.current = callback)}
      syncRef={props.syncRef}
    />
    // </div>
  );
}
