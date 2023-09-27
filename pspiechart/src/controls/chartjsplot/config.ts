import { ChartConfiguration, ChartDataset } from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

export function makeDatasetColor(color: string) {
  return {
    borderColor: color,
    // backgroundColor: `color${20}`, // assuming hex color, adding 10% opacity
  };
}

export function makeDataset(label: string, color: string) {
  return {
    label,
    ...makeDatasetColor(color),
    fill: false,
    data: [],
    type: "line",
    borderWidth: 1,
  } as ChartDataset;
}

export const defaultConfig: ChartConfiguration = {
  type: "line",
  data: {
    datasets: [],
  },
  options: {
    layout: {
      padding: {
        left: 0,
        right: 0,
      },
    },
    animation: false,
    maintainAspectRatio: false,
    parsing: false,
    normalized: true,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "millisecond",
        },
        adapters: {
          date: {
            locale: enUS,
          },
        },
        stacked: false,
        ticks: {
          source: "auto",
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 75,
          sampleSize: 1,
        },
      },
      y: {
        type: "linear",
        stacked: false,
      },
    },
  },
};
