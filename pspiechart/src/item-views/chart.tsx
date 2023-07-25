import { useContext } from "react";
import { UserItemProps } from "./item-view-factory";
import { UserItemsContext } from "../contexts/user-items-context";
import NotFound from "../not-found";
import { IOContext } from "../contexts/io-context";
import UPlotChart from "./uplotchart";

export function Chart({ item }: UserItemProps) {
  const { userItems } = useContext(UserItemsContext);
  const { dataSources } = useContext(IOContext);

  if (!item.childIds) return <NotFound />;
  if (item.childIds.length <= 0) {
    return (
      <span className="text-2xl font-bold text-rush">No Sources Attached</span>
    );
  }

  const sourceId = item.childIds[0];
  const source = userItems.get(sourceId ?? "");

  if (!source) {
    return <NotFound />;
  }

  const [namespace, id] = source.id.split(":");
  const dataSource = dataSources.find(
    (source) =>
      source.identifier.namespace === namespace && source.identifier.id === id
  );

  if (!dataSource) {
    return <NotFound />;
  }

  return (
    <UPlotChart
      dataSource={dataSource}
      pointsPerPixel={2}
      title={dataSource.identifier.name}
    />
  );
}
