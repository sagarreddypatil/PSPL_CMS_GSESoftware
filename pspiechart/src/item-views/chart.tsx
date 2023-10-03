import { useContext } from "react";
import { ChildTreeItemProps, UserItemProps } from "./item-view-factory";
import { UserItemsContext } from "../contexts/user-items-context";
import NotFound from "../not-found";
import { DataSource, IOContext } from "../contexts/io-context";
import UPlotChart from "../controls/uplotchart";
import { HexColorPicker } from "react-colorful";
// import ChartJSPlot from "../controls/chartjsplot/chartjsplot";
import { usePbRecord } from "../hooks/pocketbase";
import TimeChartPlot from "../controls/timechart/timechart";

type Color = {
  hex: string;
};

type ChartColorRecord = {
  id: string;
  colors: {
    [key: string]: Color;
  };
};

const defaultColor = "#DAAA00";

export function Chart({ item }: UserItemProps) {
  const { userItems } = useContext(UserItemsContext);
  const { dataSources } = useContext(IOContext);

  const [_colors] = usePbRecord<ChartColorRecord>("chartColors", item.id);
  const colors = _colors?.colors ?? {};

  if (!item.childIds) {
    console.log("No child ids");
    return <NotFound />;
  }

  if (item.childIds.length <= 0) {
    return (
      <span className="text-2xl font-bold text-rush">No Sources Attached</span>
    );
  }

  const sources = item.childIds.map((id) => userItems.get(id));
  let myDataSources: DataSource[] = [];

  for (const source of sources) {
    if (!source) continue;

    const [namespace, id] = source.id.split(":");
    const dataSource = dataSources.find(
      (source) =>
        source.identifier.namespace === namespace && source.identifier.id === id
    );

    if (!dataSource) continue;

    myDataSources.push(dataSource);
  }

  const myColors = sources.map(
    (source) => colors[source?.id ?? ""]?.hex ?? defaultColor
  );

  return (
    // <UPlotChart
    //   dataSources={myDataSources}
    //   pointsPerPixel={1}
    //   title={item.name}
    //   colors={myColors}
    // />
    // <ChartJSPlot
    //   dataSources={myDataSources}
    //   pointsPerPixel={1}
    //   colors={myColors}
    //   title={item.name}
    // />
    <TimeChartPlot
      dataSources={myDataSources}
      pointsPerPixel={1}
      colors={myColors}
      title={item.name}
    />
  );
}

export function ChartChildTreeItem({ item, parent }: ChildTreeItemProps) {
  // const { colors, setColor } = useChartColors();
  const [_colors, setColors] = usePbRecord<ChartColorRecord>(
    "chartColors",
    parent.id
  );
  const colors = _colors?.colors ?? {};

  const myColor = colors[item.id]?.hex ?? defaultColor;

  return (
    <>
      <div
        className="flex group flex-col justify-center"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          className="rounded-none border border-1 border-rush w-4 h-4"
          style={{
            backgroundColor: myColor,
          }}
        />
        <div className="hidden group-focus-within:block overflow-visible absolute pl-8 z-50">
          <div className="p-4 px-8 border border-rush bg-white dark:bg-black">
            <HexColorPicker
              className="my-color-picker"
              color={myColor}
              onChange={(newColor) => {
                setColors({
                  id: parent.id,
                  colors: {
                    ...colors,
                    [item.id]: {
                      hex: newColor,
                    },
                  },
                });
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
