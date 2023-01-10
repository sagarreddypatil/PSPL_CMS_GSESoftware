import { FrequencyDataPoint, TimeDataPoint } from "@/types/DataInterfaces";
import { match } from "assert";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";

interface UPlotChartProps {
  timeWidth: number; // seconds
  paused: boolean;
  registerTimeDataCallback?: (
    callback: (points: TimeDataPoint) => void
  ) => void;
  syncRef: React.MutableRefObject<uPlot.SyncPubSub>;
}

export default function UPlotChart(props: UPlotChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const widthRef = useRef(1); // points per pixel
  const animationRef = useRef(0);

  const xRef = useRef<number[]>([]);
  const yRef = useRef<number[]>([]);

  const addTimeData = (point: TimeDataPoint) => {
    const totalDt = point.time - xRef.current[0];
    const avgDt = totalDt / (xRef.current.length + 1);
    const insDt = point.time - xRef.current[xRef.current.length - 1];
    const avgFreq = 1 / avgDt;
    const insFreq = 1 / insDt;

    const desiredPts = Math.floor(widthRef.current);
    const ppx = (props.timeWidth * insFreq) / desiredPts;
    const desiredDt = insDt * ppx;

    if (insDt < desiredDt) {
      return;
    }

    xRef.current.push(point.time);
    yRef.current.push(point.value);

    if (totalDt > props.timeWidth) {
      const pts = Math.ceil(props.timeWidth / avgDt);
      xRef.current = xRef.current.slice(xRef.current.length - pts);
      yRef.current = yRef.current.slice(yRef.current.length - pts);
    }
  };
  props.registerTimeDataCallback?.(addTimeData);

  useEffect(() => {
    const updatePlot = () => {
      plotRef.current?.setData([xRef.current, yRef.current]);
      if (!props.paused) {
        animationRef.current = window.requestAnimationFrame(updatePlot);
      }
    };

    updatePlot();

    return () => {
      window.cancelAnimationFrame(animationRef.current);
    };
  });

  useEffect(() => {
    const width = containerRef.current!.clientWidth;
    const height = containerRef.current!.clientHeight;

    widthRef.current = width * window.devicePixelRatio;

    const matchSyncKeys = (own, ext) => own == ext;
    function upDownFilter(type) {
      return type != "mouseup" && type != "mousedown";
    }
    const opts: Options = {
      title: "",
      // width: width,
      // height: height - 30.6,
      pxAlign: false,
      cursor: {
        y: false,
        sync: {
          key: props.syncRef.current.key,
          setSeries: true,
          match: [matchSyncKeys, matchSyncKeys],
          filters: {
            pub: upDownFilter,
          },
        },
        lock: true,
      },
      scales: {
        y: {
          auto: true,
        },
      },
      axes: [
        {
          stroke: "#fff",
          grid: {
            stroke: "#ffffff50",
          },
          ticks: {
            show: true,
            stroke: "#ffffff50",
          },
        },
        {
          stroke: "#fff",
          grid: {
            stroke: "#ffffff50",
          },
          ticks: {
            show: true,
            stroke: "#ffffff50",
          },
        },
      ],
      series: [
        {},
        {
          label: "Value",
          stroke: "#daaa00",
          width: 2,
          fill: "rgba(218,170,0,0.1)",
        },
      ],
    };

    plotRef.current = new uPlot(
      opts,
      [[], []],
      divRef.current ? divRef.current : undefined
    );

    props.syncRef.current.sub(plotRef.current);

    return () => {
      props.syncRef.current.unsub(plotRef.current!);
      plotRef.current?.destroy();
    };
  }, []);

  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    function updateSize() {
      const newSize = {
        width: containerRef.current?.clientWidth ?? 0,
        height: containerRef.current?.clientHeight ?? 0,
      };

      console.log(newSize);

      setSize(newSize);
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    console.log(size);

    plotRef.current?.setSize({
      width: size.width,
      height: size.height - 30.6,
    });
  }, [size]);

  return (
    <div ref={containerRef} className="h-100 w-100 min-vw-0 min-vh-0">
      <div ref={divRef}></div>
    </div>
  );
}
