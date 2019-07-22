import Vue from 'vue';
import Vuex from 'vuex';

import page from './modules/page';
import entries from './modules/entries';
import client from './modules/client';

Vue.use(Vuex);

export const store = new Vuex.Store({
	modules: {
		page,
		entries,
		client
	}
});

store.dispatch('client/loadOnline', navigator.onLine);
window.addEventListener('online', () => store.dispatch('client/loadOnline', navigator.onLine));
window.addEventListener('offline', () => store.dispatch('client/loadOnline', navigator.onLine));

/*
import axios from 'axios';
import {entriesDB, pagesDB} from './storeDB';
import {i18n} from '../i18n';
import {subnavigation, api} from '../vendor/settings';
import {vueInstance} from "./../app";
import {mapLoaderShow, mapLoaderHide} from "./../vendor/mapLoader";
import {toilet, distanceBetweenCoordinates, humanizeDistance, sortProperties, angleBetweenCoordinates} from "./../vendor/funcs";
import {getPageId, fetchPage} from "../vendor/funcsPage";

Vue.use(Vuex);
let geoWatchID = false;

const fetchEntries = function (bounds) {
	return new Promise((resolve, reject) => {
		axios.post(api.wc.get, {
			bounds
		})
			.then(resp => {
				const r = {};
				Object.keys(resp.data.data).forEach((key) => {
					const entry = resp.data.data[key];
					const id = entry.id;
					entriesDB.set(id, entry);
					r[id] = entry;
				});
				resolve(r);
			})
			.catch(error => {
				reject(error);
			});
	});
};

const toiletfilter = {};
Object.keys(toilet.types).forEach(type => {
	toiletfilter[type] = true;
});

let mapBounds = false;

export const store = new Vuex.Store({
	state: {
		online: navigator.onLine
	},
	actions: {
		loadOnline({commit}, online) {
			if (online) {
				document.body.classList.add('is-online');
				document.body.classList.remove('is-offline');
			} else {
				document.body.classList.remove('is-online');
				document.body.classList.add('is-offline');
			}
			commit('SET_ONLINE', online)
		}
	},
	mutations: {


		SET_ONLINE(state, online) {
			state.online = online;
		}
	}
});

store.dispatch("loadOnline", navigator.onLine);
window.addEventListener('online', () => store.dispatch("loadOnline", navigator.onLine));
window.addEventListener('offline', () => store.dispatch("loadOnline", navigator.onLine));
*/