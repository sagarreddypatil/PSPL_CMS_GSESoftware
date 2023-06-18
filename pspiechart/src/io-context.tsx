import { createContext, useEffect, useRef, useState } from "react";

let nextSubId = 0;
export function genSubId() {
  return (nextSubId++).toString();
}

export interface Identifier {
  namespace: string;
  id: string;
  name: string;
}

export function filterObjectList<T extends { identifier: Identifier }>(
  objs: T[],
  filter: Identifier
) {
  return objs.filter(
    (obj) =>
      obj.identifier.id !== filter.id ||
      obj.identifier.namespace !== filter.namespace
  );
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

export interface IIOContext {
  dataSources: IDataSource[];
  addDataSource: (dataSource: IDataSource) => void;

  configOptions: IConfigOption<any>[];
  addConfigOption: (configOption: IConfigOption<any>) => void;

  remoteCalls: IRemoteCall[];
  addRemoteCall: (remoteCall: IRemoteCall) => void;
}

export const IOContext = createContext<IIOContext>({
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
  const [dataSources, setDataSources] = useState<IDataSource[]>([]);
  const addDataSource = (newSource: IDataSource) =>
    setDataSources((dataSources) => {
      const filtered = filterObjectList(dataSources, newSource.identifier);
      return [...filtered, newSource];
    });

  const [configOptions, setConfigOptions] = useState<IConfigOption<any>[]>([]);
  const addConfigOption = (configOption: IConfigOption<any>) =>
    setConfigOptions((configOptions) => {
      const filtered = filterObjectList(configOptions, configOption.identifier);
      return [...filtered, configOption];
    });

  const [remoteCalls, setRemoteCalls] = useState<IRemoteCall[]>([]);
  const addRemoteCall = (remoteCall: IRemoteCall) =>
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
