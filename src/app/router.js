import Vue from 'vue';
import Router from 'vue-router';
import Meta from 'vue-meta';

const List = () => import(/* webpackChunkName: "list" */'./components/main/List.vue');
const Add = () => import(/* webpackChunkName: "add" */'./components/main/Add.vue');
const Fehlermeldung = () => import(/* webpackChunkName: "fehlermeldung" */'./components/main/Fehlermeldung.vue');
const Search = () => import(/* webpackChunkName: "search" */'./components/main/Search.vue');
const More = () => import(/* webpackChunkName: "more" */'./components/main/More.vue');
const Page = () => import(/* webpackChunkName: "page" */'./components/main/Page.vue');

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
				if (typeof store.state.entries.map === 'object') {
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
				if (store.state.map.map && store.state.map.map.getZoom() <= 12) {
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