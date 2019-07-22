const state = {
	online: navigator.onLine
};

const getters = {};

const actions = {
	loadOnline({commit}, online) {
		if (online) {
			document.body.classList.add('is-online');
			document.body.classList.remove('is-offline');
		} else {
			document.body.classList.remove('is-online');
			document.body.classList.add('is-offline');
		}
		commit('setOnline', online)
	}
};

const mutations = {
	setOnline(state, online) {
		state.online = online;
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}