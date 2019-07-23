import Vue from 'vue';
import Vuex from 'vuex';

import page from './modules/page';
import map from './modules/map';
import entries from './modules/entries';
import client from './modules/client';

Vue.use(Vuex);

export const store = new Vuex.Store({
	modules: {
		page,
		map,
		entries,
		client
	}
});

store.dispatch('client/loadOnline', navigator.onLine);
window.addEventListener('online', () => store.dispatch('client/loadOnline', navigator.onLine));
window.addEventListener('offline', () => store.dispatch('client/loadOnline', navigator.onLine));