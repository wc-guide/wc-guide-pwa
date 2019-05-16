let loading = {};

export const mapLoaderShow = function (key = 'default') {
	loading[key] = 'set';
	const $loader = document.querySelector(".js-maps-loader");
	$loader.setAttribute("aria-hidden", "false");

	/*
	let show = true;
	if (force && force === "hide") {
		show = false;
	}
	if (!force && $loader.getAttribute("aria-hidden") == "false") {
		show = false;
	}
	if (show) {
		$loader.setAttribute("aria-hidden", "false");
	} else {
		$loader.setAttribute("aria-hidden", "true");
	}
	*/
};

export const mapLoaderHide = function (key = 'default', force = false) {
	delete loading[key];
	if (force) {
		loading = {};
	}
	if (!loading.length) {
		const $loader = document.querySelector(".js-maps-loader");
		$loader.setAttribute("aria-hidden", "true");
	} else {
		console.log('still loading..', loading);
	}
};

export const mapLoader = function (key = 'default') {
	const $loader = document.querySelector(".js-maps-loader");
	if ($loader.getAttribute("aria-hidden") === "false") {
		mapLoaderShow(key);
	} else {
		mapLoaderHide(key);
	}
};