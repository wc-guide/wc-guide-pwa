import Vue from 'vue';
import Vuex from 'vuex';
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
const mobileHeaderDefault = {
	title: false,
	color: 'brown',
	to: false,
	map: false
};

export const store = new Vuex.Store({
	state: {
		entries: [],
		entriesList: 'loading',
		map: false,
		page: {},
		mobileheader: mobileHeaderDefault,
		geolocation: false,
		directions: false,
		toiletfilter,
		online: navigator.onLine
	},
	actions: {
		loadEntries({commit}, data) {
			mapBounds = data.bounds;
			if (data.initial) {
				entriesDB.getAll().then(entries => {
					commit('SET_ENTRIES', entries);
				});
			}
			fetchEntries(mapBounds)
				.then(r => {
					entriesDB.getAll().then(entries => {
						commit('SET_ENTRIES', entries);
					})
				}).catch(error => {
				vueInstance.$snack.danger({
					text: vueInstance.$t('offline_entries_request'),
					button: 'OK'
				});
			});
		},
		loadEntriesList({commit}, bounds) {
			let newEntriesList = [];
			const b = {
				min: bounds.getSouthWest(),
				max: bounds.getNorthEast()
			};
			Object.keys(this.state.entries).forEach(id => {
				const entry = this.state.entries[id];
				if (
					(b.min.lat < entry.lat && entry.lat < b.max.lat) &&
					(b.min.lng < entry.lng && entry.lng < b.max.lng)
				) {
					let distance = false;
					let angle = false;
					if (this.state.geolocation) {
						const entryGeo = {
							lat: entry.lat,
							lng: entry.lng
						};
						distance = distanceBetweenCoordinates(this.state.geolocation, entryGeo);
						angle = angleBetweenCoordinates(this.state.geolocation, entryGeo);
					}
					const newEntry = entry;
					newEntry.type = toilet.getType(entry);
					newEntry.distance = distance;
					newEntry.distanceHumanized = (distance ? humanizeDistance(distance) : false);
					newEntry.angle = angle;
					newEntriesList.push(newEntry);
				}
			});
			if (this.state.geolocation) {
				newEntriesList = sortProperties(newEntriesList, 'distance', true);
			}
			commit('SET_ENTRIESLIST', newEntriesList);
		},
		setMap({commit}, map) {
			commit('SET_MAP', map);
		},
		loadPage({commit}, data) {

			const pageId = getPageId(data);
			if (!pageId) {
				commit('SET_PAGE', {
					title: '404 error',
					content: 'Page not found',
					loading: false
				});
				return;
			}

			commit('SET_PAGE', {
				loading: true
			});

			pagesDB.get(pageId).then(page => {
				if (page) {
					commit('SET_PAGE', {
						title: page.title,
						content: page.content,
						loading: false
					});
				}
			});

			fetchPage(pageId)
				.then(page => {
					if (page) {
						commit('SET_PAGE', {
							title: page.title,
							content: page.content,
							loading: false
						});
					}
				})
				.catch(error => {
					vueInstance.$snack.danger({
						text: vueInstance.$t('offline_page_request'),
						button: 'OK'
					});
				});
		},
		setMobileHeader({commit}, data) {
			commit('SET_MOBILEHEADER', data);
		},
		setGeoLocation({commit}, data) {
			if (!"geolocation" in navigator) {
				vueInstance.$snack.danger({
					text: i18n.t("geolocation_not_found"),
					button: 'OK'
				});
				commit('SET_GEOLOCATION', false);
				return;
			}

			mapLoaderShow('geolocation');
			geoWatchID = navigator.geolocation.watchPosition(
				position => {
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;
					commit('SET_GEOLOCATION', {lat, lng});
					mapLoaderHide('geolocation');
				},
				() => {
					vueInstance.$snack.danger({
						text: i18n.t("geolocation_not_permitted"),
						button: "OK"
					});
					commit('SET_GEOLOCATION', false);
					mapLoaderHide('geolocation');
				}
			);
		},
		removeGeoLocation({commit}) {
			commit('SET_GEOLOCATION', false);
		},
		setDirections({commit}, data) {
			const directions = {
				from: {
					lat: data.from.lat,
					lng: data.from.lng
				},
				to: {
					lat: data.to.lat,
					lng: data.to.lng
				}
			};
			commit('SET_DIRECTIONS', directions);
		},
		removeDirections({commit}) {
			commit('SET_DIRECTIONS', false);
		},
		setToiletFilter({commit}, filter) {
			entriesDB.getAll().then(entries => {
				const filtered = entries.filter((item) => {
					const itemType = toilet.getType(item);
					let returnValue = true;
					Object.keys(filter).forEach(type => {
						if (type === '3') {
							console.log(!filter[type] && toilet.types[type] === itemType);
							console.log(`!filter[type]: ${!filter[type]}`, `${toilet.types[type]} === ${itemType}`);
							console.log(toilet.types[type], itemType);
						}
						if (!filter[type] && toilet.types[type] === itemType) {
							returnValue = false;
						}

					});
					return returnValue;
				});

				commit('SET_ENTRIES', filtered);
				commit('SET_FILTER', filter);
			});
		},
		setOnline({commit}, online) {
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
		SET_ENTRIES(state, entries) {
			state.entries = entries;
		},
		SET_ENTRIESLIST(state, entries) {
			if (Object.keys(entries).length >= 50) {
				state.entriesList = false;
			} else {
				state.entriesList = entries;
			}
		},
		SET_MAP(state, map) {
			state.map = map;
		},
		SET_PAGE(state, page) {
			this.dispatch("setMobileHeader", {
				title: page.title,
				to: '/more',
				color: "brown"
			});
			state.page = page;
		},
		SET_MOBILEHEADER(state, data) {
			const newHeader = {};
			Object.keys(mobileHeaderDefault).forEach((key) => {
				if (key in data) {
					newHeader[key] = data[key];
				} else {
					newHeader[key] = mobileHeaderDefault[key];
				}
			});
			state.mobileheader = newHeader;
		},
		SET_GEOLOCATION(state, location) {
			state.geolocation = location;
		},
		SET_DIRECTIONS(state, data) {
			state.directions = data;
		},
		SET_FILTER(state, data) {
			state.toiletfilter = data;
		},
		SET_ONLINE(state, online) {
			state.online = online;
		}
	}
});

store.dispatch("setOnline", navigator.onLine);
window.addEventListener('online', () => store.dispatch("setOnline", navigator.onLine));
window.addEventListener('offline', () => store.dispatch("setOnline", navigator.onLine));