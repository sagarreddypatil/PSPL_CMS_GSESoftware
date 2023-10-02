import { createContext, useEffect, useState } from "react";
import { UserItem, ItemViewType } from "../item-views/item-view-factory";
import { usePbRecord, usePbRecords } from "../hooks/pocketbase";
import { set } from "date-fns";

export type UserItemsContextType = {
  userItems: Map<string, UserItem>;
  // setUserItems: React.Dispatch<React.SetStateAction<Map<string, UserItem>>>;
  createStoredItem: (item: UserItem) => Promise<UserItem | void>;
  updateStoredItem: (item: UserItem) => Promise<UserItem | void>;
  deleteStoredItem: (id: string) => Promise<boolean | void>;
  setStaticUserItems: React.Dispatch<
    React.SetStateAction<Map<string, UserItem>>
  >;
  setRootItem: (item: RootItem) => Promise<RootItem | void>;
};

function EmptyPromise<T>() {
  return new Promise<T>((_, reject) => {
    reject();
  });
}

export const UserItemsContext = createContext<UserItemsContextType>({
  userItems: new Map(),
  // setUserItems: () => {},
  createStoredItem: () => {
    return EmptyPromise();
  },
  updateStoredItem: () => {
    return EmptyPromise();
  },
  deleteStoredItem: () => {
    return EmptyPromise();
  },
  setStaticUserItems: () => {},
  setRootItem: () => {
    return EmptyPromise();
  },
});

type UserItemsContextProviderProps = {
  children: React.ReactNode;
};

type RootItem = {
  id: string;
  childIds: string[];
};

export default function UserItemsContextProvider({
  children,
}: UserItemsContextProviderProps) {
  const fromList = (items: UserItem[]) => {
    const map = new Map<string, UserItem>();
    items.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  };

  const [storedRootItem, setStoredRootItem] = usePbRecord<RootItem>(
    "projects",
    "edvfpfakwyydd9i"
  ); // hardcoded project id, TODO: make it dynamic
  const [storedItems, createStoredItem, updateStoredItem, deleteStoredItem] =
    usePbRecords<UserItem>("userItems");
  const [staticUserItems, setStaticUserItems] = useState<Map<string, UserItem>>(
    fromList([
      {
        id: "root",
        name: "Root",
        type: ItemViewType.Folder,
        childIds: [],
      },
    ])
  );

  // const [userItems, setUserItems] = useState<Map<string, UserItem>>(
  //   fromList([])
  // );

  // static items + stored items
  const rootItem = {
    id: "root",
    name: "Root",
    type: ItemViewType.Folder,
    childIds: [
      ...(staticUserItems.get("root")?.childIds ?? []),
      ...(storedRootItem?.childIds ?? []),
    ],
  };

  const setRootItem = async (item: RootItem) => {
    // filter out items in staticUserItems
    const newRootItem = {
      id: storedRootItem!.id,
      childIds: item.childIds.filter((id) => !staticUserItems.has(id)),
    };
    return setStoredRootItem(newRootItem);
  };

  const userItems = new Map([
    ...staticUserItems,
    ...fromList(storedItems),
    ...fromList([rootItem]),
  ]);

  return (
    <UserItemsContext.Provider
      value={{
        userItems,
        createStoredItem,
        updateStoredItem,
        deleteStoredItem,
        setStaticUserItems,
        setRootItem,
        // setUserItems,
      }}
    >
      {children}
    </UserItemsContext.Provider>
  );
}
