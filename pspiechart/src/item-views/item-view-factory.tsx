import { useParams } from "react-router-dom";
import { useContext } from "react";
import { IdentifierType } from "../contexts/io-context";
import { Dashboard, DashboardTreeItem } from "./dashboard";
import { UserItemsContext } from "../contexts/user-items-context";
import { Folder } from "./folder";
import DataSourceView from "./datasource-view";
import NotFound from "../not-found";

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

export function UserItemRoute() {
  const params = useParams<IdentifierType>();

  return <ItemViewFactory itemId={params.id ?? ""} />;
}

type ItemViewFactoryProps = {
  itemId: string;
};

export function ItemViewFactory({ itemId }: ItemViewFactoryProps) {
  const item = useContext(UserItemsContext).userItems.get(itemId);

  if (!item) {
    console.error("Item not found (this is normal during load)", itemId);
    return <NotFound />;
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

  return <NotFound />;
}

export function TreeItemFactory({ itemId }: ItemViewFactoryProps) {
  const item = useContext(UserItemsContext).userItems.get(itemId);

  if (!item) {
    console.error("Item not found (this is normal during load)", itemId);
    return <>Item Not Found</>;
  }

  switch (item.type) {
    case ItemViewType.Dashboard:
      return <DashboardTreeItem item={item} />;
  }

  return <></>;
}
