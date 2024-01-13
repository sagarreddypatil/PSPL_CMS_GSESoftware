import { useContext, useEffect, useMemo } from "react";
import { usePbRecord } from "../hooks/pocketbase";

import { ChildTreeItemProps, UserItemProps } from "./item-view-factory";
import { UserItemsContext } from "../contexts/user-items-context";
import { DataSource, IOContext } from "../contexts/io-context";

import UPlotChart from "../controls/uplotchart";
// import ChartJSPlot from "../controls/chartjsplot/chartjsplot";
// import TimeChartPlot from "../controls/timechart/timechart";

import { HexColorPicker } from "react-colorful";
import NotFound from "../not-found";
import { pb } from "../Login";

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

  const {
    loading,
    error,
    record: _colors,
  } = usePbRecord<ChartColorRecord>("chartColors", item.id);

  useEffect(() => {
    if (!loading && error) {
      pb.collection("chartColors").create({
        id: item.id,
        colors: {},
      });
    }
  }, [loading, error]);

  const [myDataSources, myColors] = useMemo(() => {
    const sources = item.childIds?.map((id) => userItems.get(id));
    if (!sources) return [[], []];

    const colors = _colors?.colors ?? {};
    let myDataSources: DataSource[] = [];
    let myColors: string[] = [];

    for (const source of sources) {
      if (!source) continue;

      const [namespace, id] = source.id.split(":");
      const dataSource = dataSources.find(
        (source) =>
          source.identifier.namespace === namespace &&
          source.identifier.id === id
      );

      if (!dataSource) continue;

      myDataSources.push(dataSource);
      myColors.push(colors[source.id]?.hex ?? defaultColor);
    }
    return [myDataSources, myColors];
  }, [item, _colors]);

  if (!item.childIds) {
    console.log("No child ids");
    return <NotFound />;
  }

  if (item.childIds.length <= 0) {
    return (
      <span className="text-2xl font-bold text-rush">No Sources Attached</span>
    );
  }

  return (
    <UPlotChart
      dataSources={myDataSources}
      pointsPerPixel={1}
      title={item.name}
      colors={myColors}
    />
    // <ChartJSPlot
    //   dataSources={myDataSources}
    //   pointsPerPixel={1}
    //   colors={myColors}
    //   title={item.name}
    // />
    // <TimeChartPlot
    //   dataSources={myDataSources}
    //   pointsPerPixel={1}
    //   colors={myColors}
    //   title={item.name}
    // />
  );
}

export function ChartChildTreeItem({ item, parent }: ChildTreeItemProps) {
  // const { colors, setColor } = useChartColors();
  const {
    loading,
    error,
    record: _colors,
    setRecord: setColors,
  } = usePbRecord<ChartColorRecord>("chartColors", parent.id);
  const colors = _colors?.colors ?? {};

  const myColor = colors[item.id]?.hex ?? defaultColor;

  return (
    <>
      <div
        className="group"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex flex-col justify-center">
          <button
            className="rounded-none border border-1 border-rush w-4 h-4"
            style={{
              backgroundColor: myColor,
            }}
          />
        </div>
        <div className="hidden group-focus-within:block absolute z-50 left-0 top-10">
          <div className="p-4 px-4 border border-rush bg-white dark:bg-black">
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
