import { openDB } from "idb";

const dbName = "wcguide-osm";
const dbVersion = 1;
const dbStores = ["settings", "pages", "entries"];

const idbPromise = openDB(dbName, dbVersion, {
  upgrade(db, oldVersion, dbVersion, transaction) {
    dbStores.forEach(store => {
      db.createObjectStore(store);
    });
  }
});

const exp = {};
dbStores.forEach(store => {
  exp[store] = {
    async get(key) {
      return (await idbPromise).get(store, key);
    },
    async set(key, val) {
      return (await idbPromise).put(store, val, key);
    },
    async delete(key) {
      return (await idbPromise).delete(store, key);
    },
    async clear() {
      return (await idbPromise).clear(store);
    },
    async getAll() {
      return (await idbPromise).getAll(store);
    },
    async keys() {
      return (await idbPromise).getAllKeys(store);
    }
  };
});

export const settingsDB = exp["settings"];
export const pagesDB = exp["pages"];
export const entriesDB = exp["entries"];
