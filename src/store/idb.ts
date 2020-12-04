import { openDB, DBSchema } from 'idb';

const dbName = 'wc-guide';

interface WCGuideDB extends DBSchema {
  settings: {
    key: string;
    value: any;
  };
}

const dbPromise = openDB<WCGuideDB>(dbName, 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore('settings');
    }
    if (oldVersion < 2) {
      //db.createObjectStore('settings');
    }
  },
});

export const settingsDB = {
  get: async (key: string) => (await dbPromise).get('settings', key),
  set: async (key: string, val: any) =>
    (await dbPromise).put('settings', val, key),
  delete: async (key: string) => (await dbPromise).delete('settings', key),
};
