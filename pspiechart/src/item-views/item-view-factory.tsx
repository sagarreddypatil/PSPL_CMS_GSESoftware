import { useParams } from "react-router-dom";
import { useContext } from "react";
import { IdentifierType } from "../contexts/io-context";
import { Dashboard, DashboardTreeItem } from "./dashboard";
import { UserItemsContext } from "../contexts/user-items-context";
import { Folder } from "./folder";
import DataSourceView from "./datasource-view";
import NotFound from "../not-found";
import { Chart, ChartChildTreeItem } from "./chart";

export enum ItemViewType {
  Folder = "Folder",

  Dashboard = "Dashboard",
  Chart = "Chart",

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
  parentId?: string;
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
    case ItemViewType.Chart:
      return <Chart item={item} />;
    case ItemViewType.Dashboard:
      return <Dashboard item={item} />;
    case ItemViewType.Folder:
      return <Folder item={item} />;
  }

  return <NotFound />;
}

function BaseTreeItemFactory({ item }: UserItemProps) {
  switch (item.type) {
    case ItemViewType.Dashboard:
      return <DashboardTreeItem item={item} />;
  }

  return <></>;
}

export type ChildTreeItemProps = {
  item: UserItem;
  parent: UserItem;
};

function ChildTreeItemFactory({
  parent,
  item,
}: {
  parent: UserItem;
  item: UserItem;
}) {
  switch (parent.type) {
    case ItemViewType.Chart:
      return <ChartChildTreeItem item={item} parent={parent} />;
  }

  return <></>;
}

export function TreeItemFactory({ itemId, parentId }: ItemViewFactoryProps) {
  const item = useContext(UserItemsContext).userItems.get(itemId);
  const parent = useContext(UserItemsContext).userItems.get(parentId ?? "");

  if (!item) {
    console.error("Item not found (this is normal during load)", itemId);
    return <>Item Not Found</>;
  }

  return (
    <>
      {parent && <ChildTreeItemFactory parent={parent} item={item} />}
      <BaseTreeItemFactory item={item} />
    </>
  );
}
