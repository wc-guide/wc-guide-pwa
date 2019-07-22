import axios from 'axios';
import {entriesDB} from "./../storeDB";
import {vueInstance} from "./../../app";
import {i18n} from '../../i18n';
import {mapLoaderShow, mapLoaderHide} from "./../../vendor/mapLoader";
import {toilet, distanceBetweenCoordinates, humanizeDistance, sortProperties, angleBetweenCoordinates} from "./../../vendor/funcs";

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

const state = {
	entries: [],
	entriesList: 'loading',
	map: false,
	geolocation: false,
	directions: false,
	toiletfilter,
};

const getters = {};

const actions = {
	loadEntries({commit}, data) {
		mapBounds = data.bounds;
		if (data.initial) {
			entriesDB.getAll().then(entries => {
				commit('setEntries', entries);
			});
		}
		fetchEntries(mapBounds)
			.then(r => {
				entriesDB.getAll().then(entries => {
					commit('setEntries', entries);
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
		commit('setEntriesList', newEntriesList);
	},
	setMap({commit}, map) {
		commit('setMap', map);
	},
	setGeoLocation({commit}, data) {
		if (!"geolocation" in navigator) {
			vueInstance.$snack.danger({
				text: i18n.t("geolocation_not_found"),
				button: 'OK'
			});
			commit('setGeolocation', false);
			return;
		}

		mapLoaderShow('geolocation');
		geoWatchID = navigator.geolocation.watchPosition(
			position => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;
				commit('setGeolocation', {lat, lng});
				mapLoaderHide('geolocation');
			},
			() => {
				vueInstance.$snack.danger({
					text: i18n.t("geolocation_not_permitted"),
					button: "OK"
				});
				commit('setGeolocation', false);
				mapLoaderHide('geolocation');
			}
		);
	},
	removeGeoLocation({commit}) {
		commit('setGeolocation', false);
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
		commit('setDirections', directions);
	},
	removeDirections({commit}) {
		commit('setDirections', false);
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

			commit('setEntries', filtered);
			commit('setFilter', filter);
		});
	},
};

const mutations = {
	setEntries(state, entries) {
		state.entries = entries;
	},
	setEntriesList(state, entries) {
		if (Object.keys(entries).length >= 50) {
			state.entriesList = false;
		} else {
			state.entriesList = entries;
		}
	},
	setMap(state, map) {
		state.map = map;
	},
	setGeolocation(state, location) {
		state.geolocation = location;
	},
	setDirections(state, data) {
		state.directions = data;
	},
	setFilter(state, data) {
		state.toiletfilter = data;
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}