import Vue from 'vue';
import Router from 'vue-router';
import Meta from 'vue-meta';
import List from './components/main/List.vue';
import Add from './components/main/Add.vue';
import Fehlermeldung from './components/main/Fehlermeldung.vue';
import Search from './components/main/Search.vue';
import More from './components/main/More.vue';
import Page from './components/main/Page.vue';

Vue.use(Router);
Vue.use(Meta);

import {store} from './store/store';
import {vueInstance} from './app';

export default new Router({
	mode: 'history',
	routes: [
		{
			path: '/:locale/',
			component: Search,
		}, {
			path: '/:locale/list/',
			component: List,
			beforeEnter: (to, from, next) => {
				if (typeof store.state.entriesList === 'object') {
					next();
				} else {
					vueInstance.$snack.danger({
						text: vueInstance.$t('zoom_closer'),
						button: 'OK'
					});
				}
			}
		}, {
			path: '/:locale/search/',
			component: Search,
		}, {
			path: '/:locale/add/',
			component: Add,
			beforeEnter: (to, from, next) => {
				if (store.state.map && store.state.map.getZoom() <= 12) {
					vueInstance.$snack.danger({
						text: vueInstance.$t('add_zoom_closer'),
						button: 'OK'
					});
				} else {
					next();
				}
			},
		}, {
			path: '/:locale/fehlermeldung/',
			component: Fehlermeldung,
		}, {
			path: '/:locale/fehlermeldung/:entryId/',
			component: Fehlermeldung,
		}, {
			path: '/:locale/more/filter',
			component: More,
		}, {
			path: '/:locale/more/:page',
			component: Page,
		}, {
			path: '/:locale/more/',
			component: More,
		},
	],
});

window.routerBackHome = function () {
	vueInstance.$router.push({
		path: `/${vueInstance.$i18n.locale}/`
	});
};