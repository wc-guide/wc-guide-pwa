import { i18nGetLang } from "../../i18n";
import { loadPage } from './../../vendor/funcs';

const mobileHeaderDefault = {
	title: false,
	color: 'brown',
	to: false,
	map: false
};

const state = {
	current: {},
	mobileheader: mobileHeaderDefault,
};

const getters = {};

const actions = {
	load({ commit }, key) {

		commit('setPage', {
			loading: true
		});

		loadPage(key, function (resp) {
			commit('setPage', resp);
		});
	},
	loadMobileHeader({ commit }, data) {
		commit('setMobileheader', data);
	},
};

const mutations = {
	setPage(state, page) {
		this.dispatch('page/loadMobileHeader', {
			title: page.title,
			to: '/more',
			color: "brown"
		});
		state.current = page;
	},
	setMobileheader(state, data) {
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
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}