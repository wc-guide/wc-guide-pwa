import Vue from 'vue'
import VueI18n from 'vue-i18n';
import de from './../content/lang/de/strings.json';
import axios from 'axios';
import router from './router';
import Cookies from 'js-cookie';

import { store } from "./store/store";
import { settingsDB } from "./store/storeDB";

Vue.use(VueI18n);

const fallback = 'de';
export const i18nDefault = fallback;
export const i18n = new VueI18n({
	locale: fallback,
	fallbackLocale: fallback,
	messages: { de }
});

settingsDB.set(fallback, de);

export const i18nGetLang = function () {

	const pathElements = window.location.pathname.split('/');
	if (pathElements.length >= 3) {
		return pathElements[1];
	}

	let newLang = fallback;
	const browserLang = navigator.language || navigator.userLanguage;
	if (browserLang) {
		newLang = browserLang.split('-')[0];
	}
	const cookieLang = Cookies.get('lang');
	if (cookieLang) {
		newLang = cookieLang;
	}

	return newLang;
};

export const i18nGetLanguages = async function (callback) {
	settingsDB.get('languages', langs => callback(langs));
	axios.get('/content/languages.json')
		.then(response => {
			const langs = response.data;
			settingsDB.set('languages', langs);
			callback(langs);
		});
};

export const i18nSetLang = function (lang = false) {
	if (!lang) {
		lang = i18nGetLang();
	}

	let apiSet = false;

	axios.get(`/content/lang/${lang}/strings.json`)
		.then(response => {
			const msgs = response.data;
			settingsDB.set(lang, msgs);
			apiSet = true;
			setLang(lang, msgs);
		});

	settingsDB.get(lang)
		.then(msgs => {
			if (!apiSet) {
				setLang(lang, msgs);
			}
		});
};

function setLang(lang, msgs) {
	i18n.setLocaleMessage(lang, msgs);

	/**
	 * Set Lang
	 */

	i18n.locale = lang;
	axios.defaults.headers.common['Accept-Language'] = lang;
	document.querySelector('html').setAttribute('lang', lang);
	Cookies.set('lang', lang, { expires: 365, path: '/' });

	/**
	 * Push
	 */

	const currentRoute = router.currentRoute;
	if (currentRoute.fullPath === '/') {
		return lang;
	}

	let pushPath = false;
	if (i18n.locale !== currentRoute.params.locale) {
		pushPath = currentRoute.fullPath.replace(`/${currentRoute.params.locale}/`, `/${i18n.locale}/`);
	}

	if (pushPath) {
		router.push(pushPath);
	}

	/**
	 * MapLanguage
	 */

	i18nSetMapLang(lang);

	return lang;
}

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
		if (store.state.map.type === 'custom') {
			store.state.map.map.setLayoutProperty('country-label', 'text-field', ['get', 'name_' + mapLang]);
		}
	}
};
