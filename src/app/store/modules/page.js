import {pagesDB} from "./../storeDB";
import axios from "axios/index";
import {i18nGetLang} from "../../i18n";

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
	async load({commit}, key) {

		commit('setPage', {
			loading: true
		});

		const lang = await i18nGetLang();
		const pageKey = `${key}-${lang}`;

		pagesDB.get(pageKey)
			.then(page => {
				if (page) {
					commit('setPage', {
						title: page.title,
						content: page.content,
						loading: false
					});
				}
			});

		axios.get(`/content/lang/${lang}/${pageKey}.html`)
			.then(response => {
				const regex = /<h1>(.+)<\/h1>/gm;
				let content = response.data;
				let title = '';
				let m = '';
				while ((m = regex.exec(content)) !== null) {
					if (m.index === regex.lastIndex) {
						regex.lastIndex++;
					}

					m.forEach((match, groupIndex) => {
						if (groupIndex === 0) {
							content = content.replace(match, '');
						} else if (groupIndex === 1) {
							title = match;
						}
					});
				}

				pagesDB.set(pageKey, {
					title,
					content
				});

				commit('setPage', {
					title,
					content,
					loading: false
				});
			})
			.catch(error => {
				commit('setPage', {
					title: '404 error',
					content: 'Page not found',
					loading: false
				});
			});

		/*
		axios.get(`${api.wp.base}wp/v2/${path}`)
			.then(r => {
				const page = {
					title: r.data.title.rendered,
					content: r.data.content.rendered
				};
				pagesDB.set(pageId, page);
				resolve(page);
			})
			.catch(error => {
				reject(error);
			});

		fetchPage(key)
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
				commit('setPage', {
					title: '404 error',
					content: 'Page not found',
					loading: false
				});
			});
			*/
	},
	loadMobileHeader({commit}, data) {
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