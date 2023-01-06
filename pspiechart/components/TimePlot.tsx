import dynamic from "next/dynamic";
import React from "react";

const ReactTimeChart = dynamic(() => import("./ReactTimeChart"), {
  ssr: false,
});

export default function TimePlot() {
  return (
    <div className="flex-fill d-flex">
      <ReactTimeChart />
    </div>
  );
}
