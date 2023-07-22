import { useContext } from "react";
import { UserItemProps } from "./item-view-factory";
import { UserItemsContext } from "../contexts/user-items-context";
import { FiPieChart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function GridItem({ item }: UserItemProps) {
  const navigate = useNavigate();

  return (
    <button
      className="rounded-none w-full sm:w-48 h-48 bg-white dark:bg-black text-rush outline outline-2 outline-rush hover:text-black dark:hover:text-black hover:bg-rush dark:hover:bg-rush p-4 m-2 text-center flex flex-col"
      onClick={() => {
        navigate(`/item/${item.id}`);
      }}
    >
      <span className="text-8xl text-center m-auto mb-2">
        <FiPieChart />
      </span>
      <span className="text-lg">{item.name}</span>
    </button>
  );
}

export function Folder({ item }: UserItemProps) {
  const { userItems } = useContext(UserItemsContext);

  return (
    <div className="flex flex-wrap p-2">
      {item.childIds?.map((childId) => {
        const child = userItems.get(childId);
        if (!child) return <></>;
        return <GridItem key={childId} item={child} />;
      })}
    </div>
  );
}
