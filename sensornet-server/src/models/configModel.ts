import { configDb } from "./db";

interface Config {
  wsRate?: number;

  // PouchDB stuff
  _id?: string; // PouchDB ID, same as `id`
  _rev?: string;
}

const defaultConfig: Config = {
  wsRate: 1000,
};

export const getConfig = () => {
  return configDb
    .get("config")
    .then((doc) => ({ ...defaultConfig, ...doc } as Config))
    .catch((err) => {
      if (err.status === 404) return defaultConfig;
      else throw err;
    });
};

export const updateConfig = async (config: Config) => {
  const doc = await getConfig();
  const newObj = { ...config, _rev: doc._rev };
  return (await configDb.put(newObj)).ok;
};
