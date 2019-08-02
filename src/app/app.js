if (location.protocol !== 'https:') {
	location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

import 'whatwg-fetch'
import 'promise-polyfill/src/polyfill';

import Vue from 'vue';
import App from './App.vue';
import './vendor/a11y.js';
import VueI18n from 'vue-i18n';
import VueCookies from 'vue-cookies'
import VueMatomo from 'vue-matomo';
import VueSnackbar from 'vue-snack';
import {c, IsDev} from './vendor/settings';

import Icon from "./components/globals/Icon.vue";
import HelloIcon from "./components/globals/HelloIcon.vue";
import LocalizedLink from "./components/globals/LocalizedLink.vue";
import ShadowBox from "./components/globals/ShadowBox.vue";
import Logo from "./components/globals/Logo.vue";

Vue.component('icon', Icon);
Vue.component('hello-icon', HelloIcon);
Vue.component('localized-link', LocalizedLink);
Vue.component('shadow-box', ShadowBox);
Vue.component('logo', Logo);

Vue.use(VueI18n);
Vue.use(VueCookies);
Vue.use(VueSnackbar, {
	methods: [
		{
			name: 'danger',
			color: c('red')
		},
		{
			name: 'success',
			color: c('blue')
		}
	]
});

if (!IsDev) {
	Vue.use(VueMatomo, {
		host: 'https://matomo.sonnenschauer.net/',
		siteId: 20,
		router: router,
	});
}

import {store} from './store/store.js';
import {i18n} from './i18n';
import router from './router';

export const vueInstance = new Vue({
	i18n,
	el: '#app',
	router,
	store,
	render: h => h(App)
});

vueInstance.$cookies.config('30d');

document.body.classList.add('beta-feedback');
if (IsDev) {
	document.body.classList.add('dev');
}

/**
 * PWA install
 */

window.installEvent = false;
window.addEventListener("beforeinstallprompt", e => {
	e.preventDefault();
	window.installEvent = e;
	document.body.classList.add('can-install');
});

/**
 * ServiceWorker install
 */

window.serviceWorkerEvent = false;
if ("serviceWorker" in navigator && !IsDev) {
//if ("serviceWorker" in navigator) {
	navigator.serviceWorker
		.register("/service-worker.js")
		.then(reg => {
			window.serviceWorkerEvent = reg;
			reg.onupdatefound = function () {
				const installing = reg.installing;
				installing.onstatechange = function () {
					if (installing.state === 'installed' && !navigator.serviceWorker.controller) {
						vueInstance.$snack.success({
							text: vueInstance.$t("pwa_installed"),
							button: "OK"
						});
					}
				}
			};
		})
		.catch(registrationError => {
			console.log("SW registration failed: ", registrationError);
		});
}
