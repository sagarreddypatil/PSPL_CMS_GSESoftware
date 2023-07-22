import { useParams } from "react-router-dom";
import { useContext } from "react";
import { IdentifierType, IOContext } from "../contexts/io-context";
import UPlotChart from "./uplotchart";
import { Dashboard, DashboardTreeItem } from "./dashboard";
import { UserItemsContext } from "../contexts/user-items-context";

export enum ItemViewType {
  Folder = "folder",

  Dashboard = "dashboard",
  CompositeChart = "compositechart",

  DataSource = "datasource",
  ConfigOption = "configoption",
  RPC = "rpc",
}

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
  const { dataSources } = useContext(IOContext);

  if (!item) {
    console.log("Item not found", item);
    return <h1>Not found</h1>;
  }

  switch (item.type) {
    case ItemViewType.DataSource:
      const [namespace, id] = item.id.split(":");
      const dataSource = dataSources.find(
        (source) =>
          source.identifier.namespace === namespace &&
          source.identifier.id === id
      );

      if (!dataSource) break;

      return (
        <UPlotChart
          dataSource={dataSource}
          pointsPerPixel={2}
          title={dataSource.identifier.name}
        />
      );
    case ItemViewType.Dashboard:
      return <Dashboard item={item} />;
  }

  return <h1>Not found</h1>; // TODO: 404 page
}

export function TreeItemFactory({ item }: ItemViewFactoryProps) {
  if (!item) return <div className="bg-red-500 text-white">Not Found</div>;

  return (
    <div className="flex flex-row w-full">
      {(() => {
        switch (item.type) {
          case ItemViewType.Dashboard:
            return <DashboardTreeItem item={item} />;
        }

        return (
          <>
            {item.name}
            <div className="flex-grow"></div>
          </>
        );
      })()}
    </div>
  );
}
