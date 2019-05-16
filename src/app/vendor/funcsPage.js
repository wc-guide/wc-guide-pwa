import {subnavigation, api} from '../vendor/settings';
import {i18n} from "../i18n";
import {pagesDB} from "../store/storeDB";
import axios from "axios/index";

export const getPageId = (slug) => {
	let pageId = false;
	const lang = i18n.locale;
	subnavigation.forEach(nav => {
		if (slug in nav) {
			if (lang in nav[slug].page) {
				pageId = nav[slug].page[lang];
			}
		}
	});
	return pageId;
};

export const fetchPage = function (pageId) {
	return new Promise((resolve, reject) => {
		const path = `pages/${pageId}/`;
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
	});
};
