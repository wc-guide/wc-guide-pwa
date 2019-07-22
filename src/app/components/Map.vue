<template>
	<div class="map">
		<localized-link to="/" class="map__logo">
			<figure v-html="logo"></figure>
		</localized-link>
		<div class="map__loader js-maps-loader"></div>
		<div class="map__map" id="map">
			<template v-if="map">
				<map-entries :map="map"></map-entries>
				<map-geo-location :map="map"></map-geo-location>
				<map-directions :map="map"></map-directions>
			</template>
		</div>
		<button
			class="map__togglemain"
			aria-expanded="true"
			aria-controls="main-content"
			@click="toggleDesktopMain"
		>
			<hello-icon icon="angle-right" class="map__togglemain-icon"></hello-icon>
		</button>
	</div>
</template>
<script>
	import axios from "axios";
	import mapboxgl from "mapbox-gl";
	import {settingsDB} from "../store/storeDB";
	import {mapBoxSettings, api} from "../vendor/settings";
	import {mapState} from "vuex";
	import {i18nSetMapLang} from "./../i18n";
	import {settings} from "./../vendor/settings";

	import MapEntries from "./MapEntries.vue";
	import MapGeoLocation from "./MapGeoLocation.vue";
	import MapDirections from "./MapDirections.vue";
	import logo from "./../../img/wc-guide-logo.svg";

	export default {
		data() {
			return {
				logo,
				mapBox: false
			};
		},
		mounted() {
			this.loadMap();
		},
		methods: {
			toggleDesktopMain: function () {
				const $main = document.querySelector("#main-content");
				$main.classList.toggle("app__main--desktop-hidden");
				window.setTimeout(() => {
					this.mapBox.resize();
				}, settings.easing_speed);
			},
			getCenter: function () {
				return new Promise(resolve => {
					settingsDB.get("mapCenter").then(resp => {
						if (typeof resp !== "undefined") {
							resolve(resp);
						} else {
							axios
								.get(`${api.wp.base}wc-guide/v1/geolocation/`)
								.then(function (response) {
									const data = {
										lat: response.data.lat,
										lng: response.data.lon
									};
									settingsDB.set("mapCenter", data);
									resolve(data);
								});
						}
					});
				});
			},
			getZoom: function () {
				return new Promise(resolve => {
					settingsDB.get("mapZoom").then(resp => {
						if (typeof resp !== "undefined") {
							resolve(resp);
						} else {
							settingsDB.set("mapZoom", 9);
							resolve(9);
						}
					});
				});
			},
			loadMap: async function () {
				const zoom = await this.getZoom();
				const center = await this.getCenter();
				mapboxgl.accessToken = mapBoxSettings.token;
				this.mapBox = new mapboxgl.Map({
					container: "map",
					style: mapBoxSettings.style,
					center,
					zoom,
					minZoom: 7
				});
				this.mapBox.dragRotate.disable();
				this.mapBox.touchZoomRotate.disableRotation();

				this.$store.dispatch("entries/setMap", this.mapBox);
				this.mapBox.on('load', () => {
					i18nSetMapLang();
				});
				this.mapBox.on("moveend", () => {
					settingsDB.set("mapCenter", {
						lat: this.mapBox.getCenter().lat,
						lng: this.mapBox.getCenter().lng
					});
					settingsDB.set("mapZoom", this.mapBox.getZoom());
				});
			}
		},
		components: {
			MapEntries,
			MapGeoLocation,
			MapDirections
		},
		computed: mapState({
			map: state => state.entries.map
		})
	};
</script>