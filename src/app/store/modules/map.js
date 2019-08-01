import axios from 'axios';
import {entriesDB} from "./../storeDB";
import {vueInstance} from "./../../app";
import {i18n} from '../../i18n';
import {mapLoaderShow, mapLoaderHide} from "./../../vendor/mapLoader";
import {toilet, distanceBetweenCoordinates, humanizeDistance, sortProperties, angleBetweenCoordinates} from "./../../vendor/funcs";
import {mapBoxSettings} from './../../vendor/settings';

let geoWatchID = false;

const state = {
	map: false,
	type: Object.keys(mapBoxSettings.styles)[0],
	geolocation: false,
	directions: false,
};

const getters = {};

const actions = {
	setMap({commit}, map) {
		commit('setMap', map);
	},
	setType({commit}, type) {
		commit('setType', type);
	},
	setGeoLocation({commit}, data) {
		if (!"geolocation" in navigator) {
			vueInstance.$snack.danger({
				text: i18n.t("geolocation_not_found"),
				button: 'OK'
			});
			commit('setGeoLocation', false);
			return;
		}

		mapLoaderShow('geolocation');
		geoWatchID = navigator.geolocation.watchPosition(
			position => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;
				commit('setGeoLocation', {lat, lng});
				mapLoaderHide('geolocation');
			},
			() => {
				vueInstance.$snack.danger({
					text: i18n.t("geolocation_not_permitted"),
					button: "OK"
				});
				commit('setGeoLocation', false);
				mapLoaderHide('geolocation');
			}
		);
	},
	removeGeoLocation({commit}) {
		commit('setGeoLocation', false);
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
};

const mutations = {
	setMap(state, map) {
		state.map = map;
	},
	setType(state, type) {
		state.type = type;
	},
	setGeoLocation(state, location) {
		state.geolocation = location;
	},
	setDirections(state, data) {
		state.directions = data;
	},
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}