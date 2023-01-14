import {
  FrequencyDataPoint,
  FrequencyDataSource,
  TimeDataPoint,
  TimeDataSource,
} from "@/types/DataInterfaces";
import { match } from "assert";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import uPlot, { Options } from "uplot";
import "uplot/dist/uPlot.min.css";

interface UPlotChartProps {
  timeWidth: number; // seconds
  paused: boolean;

  timeDataSource?: TimeDataSource;
  frequencyDataSource?: FrequencyDataSource;
}

export default function UPlotChart(props: UPlotChartProps) {
  // chart references
  const containerRef = useRef<HTMLDivElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const animationRef = useRef(0);

  // Downsampling queues
  const dsValueQueueRef = useRef(new Array<number>());
  const dsTimeQueueRef = useRef(new Array<number>());

  // current chart data
  const xRef = useRef<number[]>([]);
  const yRef = useRef<number[]>([]);

  // container size
  const [size, setSize] = useState({ width: 0, height: 0 });

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

    const opts: Options = {
      title: "",
      width: 1,
      height: 1,
      pxAlign: false,
      cursor: {
        y: false,
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

    return () => {
      plotRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const addTimeData = (point: TimeDataPoint, downsample = true) => {
      const totalDt = point.time - xRef.current[0];
      const avgDt = totalDt / (xRef.current.length + 1);
      const insDt = point.time - xRef.current[xRef.current.length - 1];
      const avgFreq = 1 / avgDt;
      const insFreq = 1 / insDt;

      const desiredPts = Math.floor(size.width * window.devicePixelRatio);
      const ppx = (props.timeWidth * insFreq) / desiredPts;
      const desiredDt = insDt * ppx;

      if (!downsample) {
        xRef.current.push(point.time);
        yRef.current.push(point.value);
        return;
      }

      dsTimeQueueRef.current.push(point.time);
      dsValueQueueRef.current.push(point.value);

      if (insDt < desiredDt) {
        return;
      }

      // avg downsample
      const timeAvg =
        dsTimeQueueRef.current.reduce((a, b) => a + b, 0) /
        dsTimeQueueRef.current.length;
      const valueAvg =
        dsValueQueueRef.current.reduce((a, b) => a + b, 0) /
        dsValueQueueRef.current.length;

      // last value downsample
      // const timeAvg = dsTimeQueueRef.current[dsTimeQueueRef.current.length - 1];
      // const valueAvg =
      //   dsValueQueueRef.current[dsValueQueueRef.current.length - 1];

      let lastTime = xRef.current[xRef.current.length - 1];
      if (timeAvg - 0.01 <= lastTime) {
        return;
      }

      xRef.current.push(timeAvg);
      yRef.current.push(timeAvg - lastTime);

      dsTimeQueueRef.current.length = 0;
      dsValueQueueRef.current.length = 0;

      if (totalDt > props.timeWidth) {
        const pts = Math.ceil(props.timeWidth / avgDt);
        xRef.current = xRef.current.slice(xRef.current.length - pts);
        yRef.current = yRef.current.slice(yRef.current.length - pts);
      }
    };
    props.timeDataSource?.subscribe(addTimeData);

    if (props.timeDataSource) {
      xRef.current.length = 0;
      yRef.current.length = 0;

      let now = Date.now();
      let start = now - props.timeWidth * 1000;
      let dt = props.timeWidth * 1000;
      let dtAvg = dt / size.width;

      let historicalData = props.timeDataSource.get(start, now, dtAvg);

      historicalData.forEach((point) => {
        addTimeData(point, false);
      });
    }

    return () => {
      props.timeDataSource?.unsubscribe(addTimeData);
    };
  }, [props.timeDataSource, props.timeWidth, size.width]);

  useLayoutEffect(() => {
    function debounce(func: () => void, time = 100) {
      let timer: any;
      return function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, time);
      };
    }

    function updateSize() {
      const newSize = {
        width: containerRef.current?.clientWidth ?? 0,
        height: containerRef.current?.clientHeight ?? 0,
      };

      setSize(newSize);
    }

    window.addEventListener("resize", debounce(updateSize));
    updateSize();

    return () => window.removeEventListener("resize", debounce(updateSize));
  }, []);

  useEffect(() => {
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
