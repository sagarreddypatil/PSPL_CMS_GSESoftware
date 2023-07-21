import { createContext, useContext, useState } from "react";
import { UserItemsContext } from "./user-items-context";
import { ItemViewType, UserItem } from "../item-views/item-view-factory";

let nextSubId = 0;
export function genSubId() {
  return (nextSubId++).toString();
}

export type IdentifierType = {
  namespace: string;
  id: string;
  name?: string;
};

export function filterObjectList<T extends { identifier: IdentifierType }>(
  objs: T[],
  filter: IdentifierType
) {
  return objs.filter(
    (obj) =>
      obj.identifier.id !== filter.id ||
      obj.identifier.namespace !== filter.namespace
  );
}

export type DataPoint = {
  timestamp: Date;
  value: number;
};

export type DataSource = {
  identifier: IdentifierType;
  subscribe: (callback: (data: DataPoint) => void) => string; // returns subscription id
  unsubscribe: (subId: string) => void;
  historical: (from: Date, to: Date, dt: number) => Promise<DataPoint[]>;
};

export type ConfigOption<T> = {
  identifier: IdentifierType;
  getValue: () => Promise<T>;
  setValue: (value: T) => Promise<boolean>; // returns success
};

export type RemoteCall = {
  identifier: IdentifierType;
  call: () => Promise<boolean>; // returns success
};

export type IOContextType = {
  dataSources: DataSource[];
  addDataSource: (dataSource: DataSource) => void;

  configOptions: ConfigOption<any>[];
  addConfigOption: (configOption: ConfigOption<any>) => void;

  remoteCalls: RemoteCall[];
  addRemoteCall: (remoteCall: RemoteCall) => void;
};

export const IOContext = createContext<IOContextType>({
  dataSources: [],
  addDataSource: () => {},
  configOptions: [],
  addConfigOption: () => {},
  remoteCalls: [],
  addRemoteCall: () => {},
});

interface IOContextProviderProps {
  children: React.ReactNode;
}

export default function IOContextProvider({
  children,
}: IOContextProviderProps) {
  const { setUserItems } = useContext(UserItemsContext);

  const addNamespacedItem = (namespace: string, item: UserItem) => {
    setUserItems((userItems) => {
      const filtered = Array.from(userItems.values()).filter(
        (userItem) => userItem.id !== item.id
      ) as UserItem[];
      let namespaceItem = filtered.find(
        (userItem) => userItem.id === namespace
      );
      const moreFiltered = filtered.filter(
        (userItem) => userItem.id !== namespace
      );

      let final = [...moreFiltered, item];

      if (!namespaceItem) {
        namespaceItem = {
          id: namespace,
          name: namespace,
          type: ItemViewType.Folder,
          childIds: [],
        };

        let root = final.find((userItem) => userItem.id === "root");
        if (!root) {
          // panic
          console.error("Root not found");
          return userItems;
        }

        const rootFiltered = final.filter((userItem) => userItem.id !== "root");

        root.childIds?.push(namespaceItem.id);
        final = [...rootFiltered, root];
      }

      namespaceItem.childIds = [...(namespaceItem.childIds ?? []), item.id];

      // convert to map
      let finalMap = new Map<string, UserItem>();
      [...final, namespaceItem].forEach((userItem) => {
        finalMap.set(userItem.id, userItem);
      });

      return finalMap;
    });
  };

  // TODO: Refactor all this
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const addDataSource = (newSource: DataSource) => {
    setDataSources((dataSources) => {
      const filtered = filterObjectList(dataSources, newSource.identifier);
      return [...filtered, newSource];
    });

    const newItemId = `${newSource.identifier.namespace}:${newSource.identifier.id}`;

    addNamespacedItem(newSource.identifier.namespace, {
      id: newItemId,
      name: newSource.identifier.name || newSource.identifier.id,
      type: ItemViewType.DataSource,
      noStore: true,
    });
  };

  const [configOptions, setConfigOptions] = useState<ConfigOption<any>[]>([]);
  const addConfigOption = (configOption: ConfigOption<any>) => {
    setConfigOptions((configOptions) => {
      const filtered = filterObjectList(configOptions, configOption.identifier);
      return [...filtered, configOption];
    });

    const newItemId = `${configOption.identifier.namespace}:${configOption.identifier.id}`;

    addNamespacedItem(configOption.identifier.namespace, {
      id: newItemId,
      name: configOption.identifier.name || configOption.identifier.id,
      type: ItemViewType.ConfigOption,
      noStore: true,
    });
  };

  const [remoteCalls, setRemoteCalls] = useState<RemoteCall[]>([]);
  const addRemoteCall = (remoteCall: RemoteCall) => {
    setRemoteCalls((remoteCalls) => {
      const filtered = filterObjectList(remoteCalls, remoteCall.identifier);
      return [...filtered, remoteCall];
    });

    const newItemId = `${remoteCall.identifier.namespace}:${remoteCall.identifier.id}`;

    addNamespacedItem(remoteCall.identifier.namespace, {
      id: newItemId,
      name: remoteCall.identifier.name || remoteCall.identifier.id,
      type: ItemViewType.RPC,
      noStore: true,
    });
  };

  return (
    <IOContext.Provider
      value={{
        dataSources,
        addDataSource,
        configOptions,
        addConfigOption,
        remoteCalls,
        addRemoteCall,
      }}
    >
      {children}
    </IOContext.Provider>
  );
}
