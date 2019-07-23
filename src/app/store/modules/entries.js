import axios from 'axios';
import {entriesDB} from "./../storeDB";
import {vueInstance} from "./../../app";
import {i18n} from '../../i18n';
import {mapLoaderShow, mapLoaderHide} from "./../../vendor/mapLoader";
import {toilet, distanceBetweenCoordinates, humanizeDistance, sortProperties, angleBetweenCoordinates} from "./../../vendor/funcs";
import {api} from './../../vendor/settings';

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
	toilets: [],
	list: 'loading',
	filter: toiletfilter,
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
			})
			.catch(error => {
				vueInstance.$snack.danger({
					text: vueInstance.$t('offline_entries_request'),
					button: 'OK'
				});
			});
	},
	loadList({commit}, bounds) {
		let newEntriesList = [];
		const b = {
			min: bounds.getSouthWest(),
			max: bounds.getNorthEast()
		};
		Object.keys(this.state.entries.toilets).forEach(id => {
			const entry = this.state.entries.toilets[id];
			if (
				(b.min.lat < entry.lat && entry.lat < b.max.lat) &&
				(b.min.lng < entry.lng && entry.lng < b.max.lng)
			) {
				let distance = false;
				let angle = false;
				if (this.state.map.geolocation) {
					const entryGeo = {
						lat: entry.lat,
						lng: entry.lng
					};
					distance = distanceBetweenCoordinates(this.state.map.geolocation, entryGeo);
					angle = angleBetweenCoordinates(this.state.map.geolocation, entryGeo);
				}
				const newEntry = entry;
				newEntry.type = toilet.getType(entry);
				newEntry.distance = distance;
				newEntry.distanceHumanized = (distance ? humanizeDistance(distance) : false);
				newEntry.angle = angle;
				newEntriesList.push(newEntry);
			}
		});
		if (this.state.map.geolocation) {
			newEntriesList = sortProperties(newEntriesList, 'distance', true);
		}
		commit('setList', newEntriesList);
	},
	loadFilter({commit}, filter) {
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
		state.toilets = entries;
	},
	setList(state, entries) {
		if (Object.keys(entries).length >= 50) {
			state.list = false;
		} else {
			state.list = entries;
		}
	},
	setFilter(state, data) {
		state.filter = data;
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}