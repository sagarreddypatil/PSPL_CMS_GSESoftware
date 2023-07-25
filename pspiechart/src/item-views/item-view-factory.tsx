import { useParams } from "react-router-dom";
import { useContext } from "react";
import { IdentifierType, IOContext } from "../contexts/io-context";
import UPlotChart from "./uplotchart";
import { Dashboard, DashboardTreeItem } from "./dashboard";
import { UserItemsContext } from "../contexts/user-items-context";
import { Folder } from "./folder";
import DataSourceView from "./datasource-view";

export enum ItemViewType {
  Folder = "Folder",

  Dashboard = "Dashboard",
  Chart = "Composite Chart",

  DataSource = "datasource",
  ConfigOption = "configoption",
  RPC = "rpc",
}

export type DefaultUserItem = {
  name: string;
  type: ItemViewType;
  childIds?: string[];
};

export type UserItem = {
  id: string;
  name: string;
  type: ItemViewType;
  noStore?: boolean;
  childIds?: string[];
};

export type UserItemProps = {
  item: UserItem;
};

export function RemoteViewRoute() {
  const params = useParams<IdentifierType>();

  return (
    <ItemViewFactory
      item={{
        id: `${params.namespace}:${params.id}`,
        name: params.id ?? "",
        type: ItemViewType.DataSource,
        childIds: [],
      }}
    />
  );
}

export function UserItemRoute() {
  const params = useParams<IdentifierType>();
  const { userItems } = useContext(UserItemsContext);

  const item = userItems.get(params.id ?? "");

  return <ItemViewFactory item={item} />;
}

type ItemViewFactoryProps = {
  item?: UserItem;
};
export function ItemViewFactory({ item }: ItemViewFactoryProps) {
  if (!item) {
    console.error("Item not found (this is normal during load)", item);
    return <h1>Not found</h1>;
  }

  switch (item.type) {
    case ItemViewType.DataSource:
      // const [namespace, id] = item.id.split(":");
      // const dataSource = dataSources.find(
      //   (source) =>
      //     source.identifier.namespace === namespace &&
      //     source.identifier.id === id
      // );

      // if (!dataSource) break;

      // return (
      //   <UPlotChart
      //     dataSource={dataSource}
      //     pointsPerPixel={2}
      //     title={dataSource.identifier.name}
      //   />
      // );
      return <DataSourceView item={item} />;
    case ItemViewType.Dashboard:
      return <Dashboard item={item} />;
    case ItemViewType.Folder:
      return <Folder item={item} />;
  }

  return <h1>Not found</h1>; // TODO: 404 page
}

export function TreeItemFactory({ item }: ItemViewFactoryProps) {
  if (!item) return <div className="bg-red-500 text-white">Not Found</div>;

  switch (item.type) {
    case ItemViewType.Dashboard:
      return <DashboardTreeItem item={item} />;
  }

  return <></>;
}
