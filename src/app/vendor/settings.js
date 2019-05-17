import * as s from '../../settings.json';
import verge from 'verge';

export const color = (mycolor, tone = 'base') => {
	return s.theme_colors[mycolor][tone];
};

export const c = (mycolor, tone = 'base') => {
	return color(mycolor, tone);
};

export const settings = s;

/**
 * IsDev
 */

export const IsDev = window.location.href.indexOf('.hello') !== -1;

/**
 * IsMobile
 */

export const isMobile = function () {
	return (verge.viewportW() < s['theme_breakpoints']['tablet_landscape']);
};

/**
 * API
 */
let WcBase = 'https://www.wc-guide.com/';

export const api = {
	wc: {
		base: WcBase,
		get: `${WcBase}ajax/deu/toilets/get`,
		add: `${WcBase}ajax/toilets/add`,
		failure: `${WcBase}ajax/deu/toilets/failure`
	},
	wp: {
		base: 'https://wc-guide.sayhello.dev/wp-json/',
		delete: 'https://wc-guide.sayhello.dev/wp-json/wc-guide/v1/delete-toilet/',
		edit: 'https://wc-guide.sayhello.dev/wp-json/wc-guide/v1/edit-toilet/',
		add: 'https://wc-guide.sayhello.dev/wp-json/wc-guide/v1/add-toilet/',
		feedback: 'https://wc-guide.sayhello.dev/wp-json/wc-guide/v1/feedback/'
	}
};

/**
 * MapBox
 */

export const mapBoxSettings = {
	token: "pk.eyJ1Ijoic29ubmVuc2NoYXVlciIsImEiOiJjampsanZuNGo2YXlmM3FyNWV1cmR4MHNqIn0.ZXpoHnrWGfIdsGSUBpYO7Q",
	style: "mapbox://styles/sonnenschauer/cjjlk7zfb02lh2spjs8bzbs2k"
};

/**
 * Navigations
 */

export const navigation = {
	search: "search",
	list: "list",
	add: "plus",
	fehlermeldung: "plus",
	more: "more"
};

export const subnavigation = [
	{
		faq: {
			icon: "question",
			page: {
				de: 2,
				en: 19,
				fr: 67,
				it: 70
			}
		},
		media: {
			icon: "volume-up",
			page: {
				de: 9,
				en: 21,
				fr: 149,
				it: 151
			}
		},
		support: {
			icon: "heart",
			page: {
				de: 11,
				en: 23,
				fr: 95,
				it: 101
			}
		},
		contact: {
			icon: "envelope",
			page: {
				de: 13,
				en: 25,
				fr: 133,
				it: 135
			}
		}
	}, {
		legal: {
			icon: "balance",
			page: {
				de: 15,
				en: 27,
				fr: 113,
				it: 115
			}
		},
		privacy: {
			icon: "lock",
			page: {
				de: 17,
				en: 29,
				fr: 107,
				it: 109
			}
		}
	}
];

export const supportPage = {
	de: 142,
	en: 137,
	fr: 144,
	it: 146
};