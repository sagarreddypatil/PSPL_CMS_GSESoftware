import { createContext, useState } from "react";

let nextSubId = 0;
export function genSubId() {
  return (nextSubId++).toString();
}

export interface Identifier {
  namespace: string;
  id: string;
  name: string;
}

export interface IDataPoint {
  timestamp: Date;
  value: number;
}

export interface IDataSource {
  identifier: Identifier;
  subscribe: (callback: (data: IDataPoint) => void) => string; // returns subscription id
  unsubscribe: (subId: string) => void;
  historical: (from: Date, to: Date) => Promise<IDataPoint[]>;
}

interface IConfigOption<T> {
  identifier: Identifier;
  getValue: () => Promise<T>;
  setValue: (value: T) => Promise<boolean>; // returns success
}

interface IRemoteCall {
  identifier: Identifier;
  call: () => Promise<boolean>; // returns success
}

export interface IGlobalContext {
  dataSources: IDataSource[];
  addDataSource: (dataSource: IDataSource) => void;
  removeDataSource: (identifier: Identifier) => void;

  configOptions: IConfigOption<any>[];
  addConfigOption: (configOption: IConfigOption<any>) => void;
  removeConfigOption: (identifier: Identifier) => void;

  remoteCalls: IRemoteCall[];
  addRemoteCall: (remoteCall: IRemoteCall) => void;
  removeRemoteCall: (identifier: Identifier) => void;
}

export const GlobalContext = createContext<IGlobalContext>({
  dataSources: [],
  addDataSource: () => {},
  removeDataSource: () => {},
  configOptions: [],
  addConfigOption: () => {},
  removeConfigOption: () => {},
  remoteCalls: [],
  addRemoteCall: () => {},
  removeRemoteCall: () => {},
});

interface GlobalContextProviderProps {
  children: React.ReactNode;
}

export default function GlobalContextProvider({
  children,
}: GlobalContextProviderProps) {
  const [dataSources, setDataSources] = useState<IDataSource[]>([]);
  const addDataSource = (dataSource: IDataSource) =>
    setDataSources([...dataSources, dataSource]);
  const removeDataSource = (identifier: Identifier) =>
    setDataSources(dataSources.filter((ds) => ds.identifier !== identifier));

  const [configOptions, setConfigOptions] = useState<IConfigOption<any>[]>([]);
  const addConfigOption = (configOption: IConfigOption<any>) =>
    setConfigOptions([...configOptions, configOption]);
  const removeConfigOption = (identifier: Identifier) =>
    setConfigOptions(
      configOptions.filter((co) => co.identifier !== identifier)
    );

  const [remoteCalls, setRemoteCalls] = useState<IRemoteCall[]>([]);
  const addRemoteCall = (remoteCall: IRemoteCall) =>
    setRemoteCalls([...remoteCalls, remoteCall]);
  const removeRemoteCall = (identifier: Identifier) =>
    setRemoteCalls(remoteCalls.filter((rc) => rc.identifier !== identifier));

  return (
    <GlobalContext.Provider
      value={{
        dataSources,
        addDataSource,
        removeDataSource,
        configOptions,
        addConfigOption,
        removeConfigOption,
        remoteCalls,
        addRemoteCall,
        removeRemoteCall,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
