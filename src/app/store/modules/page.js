import {pagesDB} from "./../storeDB";
import {vueInstance} from "./../../app";
import {getPageId, fetchPage} from "../../vendor/funcsPage";

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
	load({commit}, data) {
		const pageId = getPageId(data);
		if (!pageId) {
			commit('setPage', {
				title: '404 error',
				content: 'Page not found',
				loading: false
			});
			return;
		}

		commit('setPage', {
			loading: true
		});

		pagesDB.get(pageId).then(page => {
			if (page) {
				commit('setPage', {
					title: page.title,
					content: page.content,
					loading: false
				});
			}
		});

		fetchPage(pageId)
			.then(page => {
				if (page) {
					commit('setPage', {
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
	loadMobileHeader({commit}, data) {
		commit('setMobileheader', data);
	},
};

const mutations = {
	setPage(state, page) {
		this.dispatch("page/loadMobileHeader", {
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