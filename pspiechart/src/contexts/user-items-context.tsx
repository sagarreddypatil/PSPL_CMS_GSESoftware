import { createContext, useState } from "react";

interface UserItem {
  id: string;
  name: string;
  children?: string[]; // ids of children
}

type UserItems = Record<string, UserItem>;
interface IUserItemsContext {
  userItems: UserItems;
  addUserItem: (item: UserItem) => void;
  removeUserItem: (id: string) => void;
}

export const UserItemsContext = createContext<IUserItemsContext>({
  userItems: {},
  addUserItem: () => {},
  removeUserItem: () => {},
});

export default function UserItemsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userItems, setUserItems] = useState<UserItems>({});
  const addUserItem = (item: UserItem) => {
    setUserItems({ ...userItems, [item.id]: item });
  };
  const removeUserItem = (id: string) => {
    const { [id]: _, ...rest } = userItems;
    setUserItems(rest);
  };

  return (
    <> </>
    // <UserItemsContext.Provider value={{ userItems,  }}>
    //   {children}
    // </UserItemsContext.Provider>
  );
}
