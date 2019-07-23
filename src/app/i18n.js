import Vue from 'vue'
import VueI18n from 'vue-i18n';
import de from './lang/de.json';
import axios from 'axios';
import router from './router';
import 'vue-cookies';
import {api} from "./vendor/settings";
import {store} from "./store/store";

Vue.use(VueI18n);

const fallback = 'de';
const loadedLanguages = [fallback];

export const i18nDefault = fallback;
export const i18n = new VueI18n({
	locale: fallback,
	fallbackLocale: fallback,
	messages: {de}
});

export const i18nGetLang = function () {

	const pathElements = window.location.pathname.split('/');
	if (pathElements.length >= 3) {
		return pathElements[1];
	}

	const cookieLang = ($cookies.isKey('lang') ? $cookies.get('lang') : false);
	if (cookieLang) {
		return cookieLang;
	}

	const userLang = navigator.language || navigator.userLanguage;
	if (userLang) {
		return userLang.split('-')[0];
	}

	return fallback;
};

export const i18nSetLang = function (lang = false) {
	if (!lang) {
		lang = i18nGetLang();
	}

	const load = new Promise((resolve, reject) => {
		if (i18n.locale !== lang) {
			if (loadedLanguages.indexOf(lang) === -1) {
				return axios
					.get(`${api.wp.base}wc-guide/v1/translations/${lang}/`)
					.then(response => {
						const msgs = response.data;
						i18n.setLocaleMessage(lang, msgs);
						loadedLanguages.push(lang);
						resolve(lang);
					}).catch(() => reject());
			}
			resolve(lang);
		}
		resolve(lang)
	});

	load.then(lang => {

		/**
		 * Set Lang
		 */
		i18n.locale = lang;
		axios.defaults.headers.common['Accept-Language'] = lang;
		document.querySelector('html').setAttribute('lang', lang);
		$cookies.set('lang', lang);

		/**
		 * Push
		 */
		let pushPath = false;
		const currentRoute = router.currentRoute;

		if (currentRoute.fullPath === '/') {
			pushPath = `${currentRoute.fullPath}${i18n.locale}/`;
		} else if (i18n.locale !== currentRoute.params.locale) {
			pushPath = currentRoute.fullPath.replace(`/${currentRoute.params.locale}/`, `/${i18n.locale}/`);
		}

		if (pushPath) {
			router.push(pushPath);
		}

		/**
		 * MapLanguage
		 */
		i18nSetMapLang(lang);

		/**
		 * Return
		 */
		return lang;
	}).catch(() => i18nSetLang(fallback));
};

export const i18nSetMapLang = function (lang = false) {
	if (!lang) {
		lang = i18nGetLang();
	}
	if (store.state.map.map) {
		const mapBoxLanguages = ['en', 'es', 'fr', 'de', 'ru', 'zh', 'pt', 'ar', 'ja'];
		let mapLang = lang;
		if (mapBoxLanguages.indexOf(mapLang) === -1) {
			mapLang = fallback;
		}
		store.state.map.map.setLayoutProperty('country-label', 'text-field', ['get', 'name_' + mapLang]);
	}
};
