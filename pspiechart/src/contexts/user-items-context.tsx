import { createContext, useEffect, useState } from "react";
import { UserItem, ItemViewType } from "../item-views/item-view-factory";

export type UserItemsContextType = {
  userItems: Map<string, UserItem>;
  setUserItems: React.Dispatch<React.SetStateAction<Map<string, UserItem>>>;
};

export const UserItemsContext = createContext<UserItemsContextType>({
  userItems: new Map(),
  setUserItems: () => {},
});

type UserItemsContextProviderProps = {
  children: React.ReactNode;
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

  const [userItems, setUserItems] = useState<Map<string, UserItem>>(
    fromList([
      {
        id: "root",
        name: "Root",
        type: ItemViewType.Folder,
        childIds: ["testdash"],
      },
      {
        id: "testdash",
        name: "Some Dashboard",
        type: ItemViewType.Dashboard,
        childIds: ["SensorNet:1", "SensorNet:2", "SensorNet:3", "SensorNet:4"],
      },
    ])
  );

  useEffect(() => {}, [userItems]);

  return (
    <UserItemsContext.Provider
      value={{
        userItems,
        setUserItems,
      }}
    >
      {children}
    </UserItemsContext.Provider>
  );
}
