import { DataSource } from "../../contexts/io-context";

interface UPlotChartProps {
  title?: string;
  pointsPerPixel?: number;

  dataSources: DataSource[];
  colors: string[];
}

export default function UPlotChart(props: UPlotChartProps) {}
