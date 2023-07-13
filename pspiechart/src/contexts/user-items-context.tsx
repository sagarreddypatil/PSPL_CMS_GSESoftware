import { createContext, useState } from "react";
import { UserItem, ItemViewType } from "../item-views/item-view-factory";

export type UserItemsContextType = {
  userItems: UserItem[];
  setUserItem: (userItem: UserItem) => void;
  removeUserItem: (userItem: UserItem) => void;
};

export const UserItemsContext = createContext<UserItemsContextType>({
  userItems: [],
  setUserItem: () => {},
  removeUserItem: () => {},
});

type UserItemsContextProviderProps = {
  children: React.ReactNode;
};

export default function UserItemsContextProvider({
  children,
}: UserItemsContextProviderProps) {
  const [userItems, setUserItems] = useState<UserItem[]>([
    {
      id: "testdash",
      name: "Some Dashboard",
      type: ItemViewType.Dashboard,
      childIds: ["SensorNet:1", "SensorNet:2", "SensorNet:3", "SensorNet:4"],
    },
  ]);
  const setUserItem = (userItem: UserItem) =>
    setUserItems((userItems) => {
      const filtered = userItems.filter((item) => item.id !== userItem.id);
      return [...filtered, userItem];
    });
  const removeUserItem = (userItem: UserItem) =>
    setUserItems((userItems) => {
      const filtered = userItems.filter((item) => item.id !== userItem.id);
      return [...filtered];
    });

  return (
    <UserItemsContext.Provider
      value={{ userItems, setUserItem, removeUserItem }}
    >
      {children}
    </UserItemsContext.Provider>
  );
}
