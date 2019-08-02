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
		failure: `${WcBase}ajax/deu/toilets/failure`,
		deleted: `${WcBase}api/getUpdates?Datetime={date}&locale=deu&token=50a226e9-7638-481c-a3a3-71cbc0a80145`,
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
	styles: {
		custom: 'mapbox://styles/sonnenschauer/cjjlk7zfb02lh2spjs8bzbs2k',
		satelite: 'mapbox://styles/mapbox/satellite-v9'
	}
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
		faq: "question",
		media: "volume-up",
		support: "heart",
		contact: "envelope",
	}, {
		legal: "balance",
		privacy: "lock",
	}
];

export const footernavigation = ['legal', 'privacy'];