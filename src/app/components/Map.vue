<template>
	<div class="map">
		<localized-link to="/" class="map__logo">
			<logo/>
		</localized-link>
		<div class="map__loader js-maps-loader"></div>
		<div class="map__map" id="map">
			<template v-if="map">
				<map-entries :map="map"/>
				<map-geo-location :map="map"/>
				<map-directions :map="map"/>
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
	import {mapBoxSettings, api, settings, isMobile} from "../vendor/settings";
	import {mapState} from "vuex";
	import {i18nSetMapLang} from "./../i18n";

	const MapEntries = () => import(/* webpackChunkName: "map" */'./MapEntries.vue');
	const MapGeoLocation = () => import(/* webpackChunkName: "map" */'./MapGeoLocation.vue');
	const MapDirections = () => import(/* webpackChunkName: "map" */'./MapDirections.vue');

	export default {
		props: ['mapStyle'],
		data() {
			return {
				mapBox: false
			};
		},
		mounted() {
			this.loadMap();
			this.$store.subscribe((mutation, state) => {
				if (mutation.type === 'map/setType') {
					if (this.mapBox && state.map.type in mapBoxSettings.styles) {
						this.mapBox.setStyle(mapBoxSettings.styles[state.map.type]);
					}
				}
			});
		},
		methods: {
			toggleDesktopMain() {
				const $main = document.querySelector("#main-content");
				$main.classList.toggle("app__main--desktop-hidden");
				window.setTimeout(() => {
					this.mapBox.resize();
				}, settings.easing_speed);
			},
			getCenter() {
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
			getZoom() {
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
					style: Object.values(mapBoxSettings.styles)[0],
					center,
					zoom,
					minZoom: 7
				});
				this.mapBox.dragRotate.disable();
				this.mapBox.touchZoomRotate.disableRotation();
				if (!isMobile()) {
					const zoomControl = new mapboxgl.NavigationControl();
					this.mapBox.addControl(zoomControl, 'bottom-left');
				}

				this.$store.dispatch('map/setMap', this.mapBox);
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
			map: state => state.map.map,
		})
	};
</script>