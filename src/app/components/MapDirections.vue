<template></template>
<script>
	import axios from "axios";
	import {store} from "../store/store.js";
	import {mapBoxSettings, c} from "../vendor/settings";
	import {humanizeDistance, humanizeDuration} from "../vendor/funcs";
	import {mapLoaderShow, mapLoaderHide} from "./../vendor/mapLoader";
	import mapboxgl from "mapbox-gl";

	const source = "wcdirections";

	export default {
		props: ["map"],
		data() {
			return {};
		},
		mounted() {
			const map = this.map;
			store.subscribe((mutation, state) => {
				if (mutation.type === "SET_DIRECTIONS") {
					if (!state.directions) {
						return;
					}
					const from = state.directions.from;
					const to = state.directions.to;
					const points = `${from.lng},${from.lat};${to.lng},${to.lat}`;
					const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${points}.json?steps=true&geometries=geojson&access_token=${
						mapBoxSettings.token
						}`;
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

							if (this.map.getSource(source)) {
								this.map.getSource(source).setData(geojson);
							} else {
								this.map.addLayer({
									id: source,
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

							const $way = document.querySelector(".js-toilet-way");
							$way.innerHTML = `<span>${humanizeDuration(
								resp.routes[0].duration
							)}</span><span>${humanizeDistance(
								resp.routes[0].distance
							)}</span>`;

							const bounds = coordinates.reduce(function (bounds,
																		coord) {
									return bounds.extend(coord);
								},
								new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

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
