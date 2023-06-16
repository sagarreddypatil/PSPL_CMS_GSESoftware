import PouchDb from "pouchdb-node";
import fs from "node:fs";

export const dbPath = process.env.DB_PATH || "db";
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

// const dbPath =
//   process.env.COUCHDB_URL || "http://admin:password@localhost:5984";

export const sensorDb = new PouchDb(`${dbPath}/sensors`);
export const configDb = new PouchDb(`${dbPath}/config`);

export const closeAll = async () => {
  await sensorDb.close();
  await configDb.close();
};
