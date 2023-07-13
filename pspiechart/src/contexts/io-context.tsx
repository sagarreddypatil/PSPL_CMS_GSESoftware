import { createContext, useContext, useState } from "react";
import { UserItemsContext } from "./user-items-context";
import { ItemViewType } from "../item-views/item-view-factory";

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
  const { userItems, setUserItem } = useContext(UserItemsContext);

  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const addDataSource = (newSource: DataSource) => {
    setDataSources((dataSources) => {
      const filtered = filterObjectList(dataSources, newSource.identifier);
      return [...filtered, newSource];
    });

    setUserItem({
      id: `${newSource.identifier.namespace}:${newSource.identifier.id}`,
      name: newSource.identifier.name || newSource.identifier.id,
      type: ItemViewType.DataSource,
      childIds: [],
    });
  };

  const [configOptions, setConfigOptions] = useState<ConfigOption<any>[]>([]);
  const addConfigOption = (configOption: ConfigOption<any>) =>
    setConfigOptions((configOptions) => {
      const filtered = filterObjectList(configOptions, configOption.identifier);
      return [...filtered, configOption];
    });

  const [remoteCalls, setRemoteCalls] = useState<RemoteCall[]>([]);
  const addRemoteCall = (remoteCall: RemoteCall) =>
    setRemoteCalls((remoteCalls) => {
      const filtered = filterObjectList(remoteCalls, remoteCall.identifier);
      return [...filtered, remoteCall];
    });

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
