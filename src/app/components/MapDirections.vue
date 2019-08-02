<template></template>
<script>
	import axios from "axios";
	import {store} from "../store/store.js";
	import {mapBoxSettings, c} from "../vendor/settings";
	import {humanizeDistance, humanizeDuration} from "../vendor/funcs";
	import {mapLoaderShow, mapLoaderHide} from "./../vendor/mapLoader";
	import mapboxgl from "mapbox-gl";

	const layerID = 'wcdirections';

	export default {
		props: ["map"],
		data() {
			return {};
		},
		mounted() {
			const map = this.map;
			store.subscribe((mutation, state) => {
				if (mutation.type === 'map/setDirections') {
					if (!state.map.directions) {
						if (this.map.getSource(layerID)) {
							this.map.getSource(layerID).setData({
								type: "Feature",
								properties: {},
								geometry: {
									type: "LineString",
									coordinates: []
								}
							});
						}
						const $way = document.querySelector('.js-toilet-way');
						const $toilet = document.querySelector('.toilet');
						if ($way) $way.innerHTML = '';
						if ($toilet) $toilet.classList.remove('toilet--route-active');
						mapLoaderHide("directions");
						return;
					}

					const from = state.map.directions.from;
					const to = state.map.directions.to;
					const points = `${from.lng},${from.lat};${to.lng},${to.lat}`;
					const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${points}.json?steps=true&geometries=geojson&access_token=${mapBoxSettings.token}`;
					mapLoaderShow("directions");
					axios
						.get(url)
						.then(r => r.data)
						.then(resp => {
							const coordinates = resp.routes[0].geometry.coordinates;
							const geojson = {
								type: "Feature",
								properties: {},
								geometry: {
									type: "LineString",
									coordinates
								}
							};

							if (this.map.getSource(layerID)) {
								this.map.getSource(layerID).setData(geojson);
							} else {
								this.map.addLayer({
									id: layerID,
									type: "line",
									source: {
										type: "geojson",
										data: geojson
									},
									layout: {
										"line-join": "round",
										"line-cap": "round"
									},
									paint: {
										"line-color": c("blue"),
										"line-width": 4,
										"line-opacity": 0.75
									}
								});
							}

							document.querySelector('.toilet').classList.add('toilet--route-active');
							const $way = document.querySelector('.js-toilet-way');
							$way.innerHTML = `<span>${humanizeDuration(resp.routes[0].duration)}</span><span>${humanizeDistance(resp.routes[0].distance)}</span>`;

							const bounds = coordinates.reduce(function (bounds, coord) {
									return bounds.extend(coord);
								},
								new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
							);

							this.map.fitBounds(bounds, {
								padding: 40
							});
							mapLoaderHide("directions");
						});
				}
			});
		}
	};
</script>
