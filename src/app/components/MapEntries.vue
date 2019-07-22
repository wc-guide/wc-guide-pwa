<template></template>
<script>
	import {store} from "./../store/store.js";
	import {vueInstance} from "./../app";
	import {mapLoaderShow, mapLoaderHide} from "./../vendor/mapLoader";
	import {toilet, getEntryDescription, openMapPopup, getZoomIconSize} from "./../vendor/funcs";

	const markerImages = [
		"eurokey",
		"eurokey-gray",
		"gelaender",
		"gelaender-gray",
		"iv",
		"iv-gray",
		"iv-nette-toilette",
		"iv-nette-toilette-gray",
		"kostenpflichtig",
		"kostenpflichtig-gray",
		"normal",
		"normal-gray",
		"normal-nette-toilette",
		"normal-nette-toilette-gray",
		"pissoir",
		"pissoir-gray",
		"treppe",
		"treppe-gray"
	];
	let loadParksTimer = "init";
	let parksSet = 0;
	let currentCenter = false;
	let currentZoom = false;
	window.markerIds = {};

	export default {
		props: ["map"],
		data() {
			return {};
		},
		mounted() {
			const map = this.map;
			this.mapImagesLoaded()
				.then(() => {
					map.on("load", () => {
						map.addSource("wcs", {
							type: "geojson",
							data: {
								type: "FeatureCollection",
								features: []
							}
						});

						map.addLayer({
							id: "wcs",
							interactive: true,
							source: "wcs",
							type: "symbol",
							layout: {
								"icon-image": "marker-{icon}",
								"icon-allow-overlap": true,
								"icon-size": getZoomIconSize(this.map.getZoom())
							}
						});

						map.on("click", "wcs", e => {
							if (window.addMarkerOnClick) {
								return;
							}
							const coordinates = e.features[0].geometry.coordinates.slice();
							const description =
								e.features[0].properties.description;
							while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
								coordinates[0] +=
									e.lngLat.lng > coordinates[0] ? 360 : -360;
							}

							openMapPopup(description, coordinates, map);
						});

						map.on("mouseenter", "wcs", () => {
							map.getCanvas().style.cursor = "pointer";
						});

						map.on("mouseleave", "wcs", () => {
							map.getCanvas().style.cursor = "";
						});

						map.on("moveend", () => {
							this.entriesMaybeReload();
							store.dispatch("entries/loadEntriesList", this.map.getBounds());
						});

						map.on("zoomend", () => {
							map.setLayoutProperty(
								"wcs",
								"icon-size",
								getZoomIconSize(this.map.getZoom())
							);
						});

						this.entriesLoad(true);

						store.subscribe((mutation, state) => {
							if (mutation.type === "entries/setEntries") {
								if (state.entries.entries.length === 0) {
									//return;
								}
								this.entriesSet(state.entries.entries);
							}
						});
					});
				})
				.catch(() => console.log("error"));
		},
		methods: {
			entriesMaybeReload: function () {
				let doLoad = true;
				if (
					this.map.getCenter() == currentCenter &&
					this.map.getZoom() == currentZoom
				) {
					doLoad = false;
				}

				if (currentZoom && currentZoom < this.map.getZoom()) {
					doLoad = false;
				}
				currentZoom = this.map.getZoom();
				currentCenter = this.map.getCenter();

				if (!doLoad) {
					return;
				}
				clearTimeout(loadParksTimer);
				if (loadParksTimer === "init") {
					// load on init
					this.entriesLoad();
					loadParksTimer = false;
				} else {
					// wait for 500ms on move
					loadParksTimer = setTimeout(() => {
						this.entriesLoad();
					}, 2000);
				}
			},
			entriesLoad: function (initial = false) {
				const mapBounds = this.map.getBounds();
				mapLoaderShow("loadEntries");
				let bounds = [
					{
						lat: mapBounds.getSouthWest().lat,
						lng: mapBounds.getSouthWest().lng
					},
					{
						lat: mapBounds.getNorthEast().lat,
						lng: mapBounds.getNorthEast().lng
					}
				];
				store.dispatch("entries/loadEntries", {bounds, initial});
			},
			entriesSet: function (entries) {

				if (parksSet == entries.length) {
					mapLoaderHide("loadEntries");
					mapLoaderHide("filterEntries");
					return;
				}
				if (parksSet == 0) {
					store.dispatch("entries/loadEntriesList", this.map.getBounds());
				}
				parksSet = entries.length;
				const geoElements = [];
				currentZoom = this.map.getZoom();
				currentCenter = this.map.getCenter();
				let index = 0;
				window.markerIds = {};
				Object.values(entries).forEach(item => {
					window.markerIds[item.id] = index;
					index++;
					let icon = toilet.getType(item);
					if (item.details && item.details.indexOf('5') !== -1) {
						icon = `${icon}-nette-toilette`;
					}
					geoElements.push({
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: [item.lng, item.lat]
						},
						properties: {
							icon,
							description: getEntryDescription(item)
						}
					});
				});

				if (this.map.getSource("wcs")) {
					this.map.getSource("wcs").setData({
						type: "FeatureCollection",
						features: geoElements
					});
				}

				/*
				if (this.$route.params.entryId) {
					this.openPopup(this.$route.params.entryId);
				}
				*/
				store.dispatch("entries/loadEntriesList", this.map.getBounds());
				mapLoaderHide("filterEntries");
				mapLoaderHide("loadEntries");
			},
			mapImagesLoaded: function () {
				return new Promise((resolve, reject) => {
					if (!this.map) {
						reject();
					}
					const loaded = [];
					markerImages.forEach(key => {
						this.map.loadImage(
							`/assets/img/marker/png-30/${key}.png`,
							(error, image) => {
								this.map.addImage(`marker-${key}`, image);
								loaded.push(key);
								if (loaded.length === markerImages.length) {
									resolve();
								}
							}
						);
					});
				});
			},
			openPopup: function (entryId) {
				const markerIndex = window.markerIds[entryId];
				const marker = this.map.getSource("wcs")["_data"].features[
					markerIndex
					];
				const coordinates = marker.geometry.coordinates.slice();
				const description = marker.properties.description;

				this.map.setCenter(coordinates);
				this.map.setZoom(12);
				openMapPopup(description, coordinates, this.map);
			}
		}
	};

	window.setDirectionTo = function (lat, lng) {
		if (document.body.classList.contains("is-offline")) {
			vueInstance.$snack.danger({
				text: vueInstance.$t("offline_function"),
				button: "OK"
			});
			return;
		}

		const myPosition = new Promise((resolve, reject) => {
			vueInstance.$store.dispatch("entries/setGeoLocation").then(() => {
				vueInstance.$store.subscribe((mutation, state) => {
					if (mutation.type === "entries/setGeoLocation") {
						if (state.geolocation) {
							resolve(vueInstance.$store.state.geolocation);
						}
					}
				});
			});
		});

		myPosition.then(location => {
			document.querySelector('.toilet').classList.add('toilet--route-active');
			vueInstance.$store.dispatch("entries/setDirections", {
				from: location,
				to: {
					lat,
					lng
				}
			});
		});
	};

	window.setFehlermeldung = function (id) {
		vueInstance.$router.push({
			path: `/${vueInstance.$i18n.locale}/fehlermeldung/${id}/`
		});
	};
</script>