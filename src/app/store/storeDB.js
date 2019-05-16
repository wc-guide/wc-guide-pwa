import idb from 'idb';

const db = 'wc-guide';
const dbVersion = 1;
const stores = [
	'settings',
	'pages',
	'entries',
];

const Store = idb.open(db, dbVersion, upgradeDB => {
	stores.forEach((store) => {
		upgradeDB.createObjectStore(store);
	});
});

const exp = {};
stores.forEach((store) => {
	exp[store] = {
		set: function (key, val) {
			return Store.then(db => {
				const tx = db.transaction(store, 'readwrite');
				tx.objectStore(store).put(val, key);
				return tx.complete;
			});
		},
		get: function (key) {
			return Store.then(db => {
				return db.transaction(store)
					.objectStore(store).get(key);
			});
		},
		delete: function (key) {
			return Store.then(db => {
				const tx = db.transaction(store, 'readwrite');
				tx.objectStore(store).delete(key);
				return tx.complete;
			});
		},
		getAll: function () {
			return Store.then(db => {
				return db.transaction(store)
					.objectStore(store).getAll();
			});
		},
		keys: function () {
			return Store.then(db => {
				const tx = db.transaction(store);
				const keys = [];
				const oStore = tx.objectStore(store);
				(oStore.iterateKeyCursor || oStore.iterateCursor).call(oStore, cursor => {
					if (!cursor) return;
					keys.push(cursor.key);
					cursor.continue();
				});

				return tx.complete.then(() => keys);
			});
		}
	};
});

export const settingsDB = exp['settings'];
export const pagesDB = exp['pages'];
export const entriesDB = exp['entries'];