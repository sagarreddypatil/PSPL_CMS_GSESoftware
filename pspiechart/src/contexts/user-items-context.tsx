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
    fromList([])
  );

  useEffect(() => {
    // load from local storage

    const storedItemsStr = localStorage.getItem("userItems") ?? "[]";

    const defaultRootItem: UserItem = {
      id: "root",
      name: "Root",
      type: ItemViewType.Folder,
      childIds: [],
    };

    let storedItems = JSON.parse(storedItemsStr) as UserItem[];

    if (storedItems.length === 0) {
      storedItems = [defaultRootItem];
    }

    console.log("loading", storedItems);

    setUserItems(fromList(storedItems));
  }, []);

  useEffect(() => {
    // save to local storage

    // filter out items with noStore
    const items = Array.from(userItems.values()).filter(
      (item) => !item.noStore
    );

    console.log("saving", items);
    localStorage.setItem("userItems", JSON.stringify(items));
  }, [userItems]);

  useEffect(() => {
    // garbage collection, delete items with no references
    // reference is when another item has this item as a child

    setUserItems((items) => {
      const newItems = new Map(items);
      const referenceCounts = new Map<string, number>();

      Array.from(newItems.keys()).forEach((key) => {
        if (key === "root") return;
        referenceCounts.set(key, 0);
      });

      // count references
      items.forEach((item) => {
        if (!item.childIds) return;

        item.childIds.forEach((childId) => {
          const count = referenceCounts.get(childId) ?? 0;
          referenceCounts.set(childId, count + 1);
        });
      });

      // delete items with no references
      referenceCounts.forEach((count, key) => {
        if (count === 0) {
          newItems.delete(key);
        }
      });

      return items;
    });
  }, [userItems]);

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
