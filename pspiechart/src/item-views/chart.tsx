import { useContext } from "react";
import { UserItemProps } from "./item-view-factory";
import { UserItemsContext } from "../contexts/user-items-context";
import NotFound from "../not-found";
import { DataSource, IOContext } from "../contexts/io-context";
import UPlotChart from "./uplotchart";

export function Chart({ item }: UserItemProps) {
  const { userItems } = useContext(UserItemsContext);
  const { dataSources } = useContext(IOContext);

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

  return (
    <UPlotChart
      dataSources={myDataSources}
      pointsPerPixel={1}
      title={item.name}
    />
  );
}
