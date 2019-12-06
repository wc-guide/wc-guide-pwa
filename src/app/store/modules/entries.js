import axios from 'axios';
import {entriesDB, settingsDB} from "./../storeDB";
import {xml2json} from 'xml-js';
import {vueInstance} from "./../../app";
import {i18n} from '../../i18n';
import {mapLoaderShow, mapLoaderHide} from "./../../vendor/mapLoader";
import {toilet, distanceBetweenCoordinates, humanizeDistance, sortProperties, angleBetweenCoordinates} from "./../../vendor/funcs";
import {api} from './../../vendor/settings';

const toiletfilter = {};
let isDoingDelete = false;
Object.keys(toilet.types).forEach(type => {
	toiletfilter[type] = true;
});

const state = {
	all: {},
	map: {},
	filter: toiletfilter,
};

const getters = {};

const actions = {
	loadEntries({commit, rootState}, data) {
		if (!rootState.map.map) {
			console.log('Map not yet loaded');
			return;
		}

		const mapBounds = rootState.map.map.getBounds();
		entriesDB.getAll().then(entries => {
			const e = {};
			entries.forEach(entry => {
				e[entry.id] = entry;
			});
			commit('setEntries', e);
			commit('setMap', mapBounds);
		});

		axios.post(api.wc.get, {
			bounds: [
				{
					lat: mapBounds.getSouthWest().lat,
					lng: mapBounds.getSouthWest().lng
				},
				{
					lat: mapBounds.getNorthEast().lat,
					lng: mapBounds.getNorthEast().lng
				}
			]
		}).then(resp => {
			const newToilets = {};
			Object.keys(resp.data.data).forEach((key) => {
				const entry = resp.data.data[key];
				const id = entry.id;
				entriesDB.set(id, entry);
				newToilets[id] = entry;
			});
			commit('setEntries', newToilets);
			commit('setMap', mapBounds);

			if (!isDoingDelete) {
				const deletedCheck = 'deletedcheck';

				settingsDB.get(deletedCheck).then(date => {
					let checkFrom = '2019-01-01';
					let doCheck = true;
					if (date) {
						checkFrom = date.toISOString().split('T')[0];
						let nextCheck = date;
						nextCheck.setHours(nextCheck.getHours() + 1);
						if (nextCheck >= new Date()) {
							doCheck = false;
						}
					}
					settingsDB.set(deletedCheck, new Date());
					if (doCheck) {
						isDoingDelete = true;
						axios.get(api.wc.deleted.replace('{date}', checkFrom)).then(r => {
							isDoingDelete = false;
							const resp = JSON.parse(xml2json(r.data, {compact: true}));
							const deleted = resp.plist.dict.array[0].string;
							const deletedIDs = [];
							if (typeof deleted === 'object') {
								deleted.forEach(e => deletedIDs.push(e['_text']));
							}
							if (deletedIDs.length) {
								entriesDB.keys().then(keys => {
									keys.forEach(key => {
										if (deletedIDs.includes(key)) {
											entriesDB.delete(key);
										}
									});
								});
								commit('deleteEntries', deletedIDs);
								commit('setMap', mapBounds)
							}
						});
					}
				});
			}
		});
	},
	updateFilter({commit, rootState}, filter) {
		commit('setFilter', filter);
		commit('setMap', rootState.map.map.getBounds());
	},
};

const mutations = {
	setEntries(state, entries) {
		state.all = Object.assign(state.all, entries);
	},
	deleteEntries(sate, ids) {
		const all = state.all;
		ids.forEach(id => delete all[id]);
		state.all = all;
	},
	setMap(state, mapBounds) {
		const b = {
			min: mapBounds.getSouthWest(),
			max: mapBounds.getNorthEast()
		};
		const mapToilets = {};
		Object.keys(state.all).forEach(id => {
			const entry = state.all[id];
			if (
				(b.min.lat < entry.lat && entry.lat < b.max.lat) &&
				(b.min.lng < entry.lng && entry.lng < b.max.lng)
			) {
				const itemType = toilet.getType(entry);
				Object.keys(state.filter).forEach(type => {
					if (state.filter[type] === true && toilet.types[type] === itemType) {
						mapToilets[id] = entry;
					}
				});
			}
		});

		state.map = mapToilets;
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