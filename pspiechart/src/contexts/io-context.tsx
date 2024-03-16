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
  unit: string;
  subscribe: (callback: (data: DataPoint) => void) => string; // returns subscription id
  unsubscribe: (subId: string) => void;
  historical: (from: Date, to: Date, dt: number) => Promise<DataPoint[]>;
};

export type IOContextType = {
  dataSources: DataSource[];
  addDataSource: (dataSource: DataSource) => void;
};

export const IOContext = createContext<IOContextType>({
  dataSources: [],
  addDataSource: () => {},
});

interface IOContextProviderProps {
  children: React.ReactNode;
}

export default function IOContextProvider({
  children,
}: IOContextProviderProps) {
  const { setStaticUserItems } = useContext(UserItemsContext);
  const setUserItems = setStaticUserItems;

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
          noStore: true,
        };

        let root = final.find((userItem) => userItem.id === "root");
        if (!root) {
          // panic
          console.error("Root not found");
          return userItems;
        }

        const rootFiltered = final.filter((userItem) => userItem.id !== "root");

        if (!root.childIds?.includes(namespaceItem.id))
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

  return (
    <IOContext.Provider
      value={{
        dataSources,
        addDataSource,
      }}
    >
      {children}
    </IOContext.Provider>
  );
}
