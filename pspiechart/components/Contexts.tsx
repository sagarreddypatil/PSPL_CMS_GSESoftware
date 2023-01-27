import { createContext } from "react";

interface IDashboardContext {
  id?: number;
  setId?: (id?: number) => void;
}
export const DashboardContext = createContext<IDashboardContext>({});
