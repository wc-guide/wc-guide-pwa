<template>
	<div
		:class="'o-helloform__element add__position js-add-position '+(disabled?'o-helloform__element--disabled':'')"
	>
		<p class="add__position-desc">
			{{$t('form_add_position')}}
			<icon :class="'add__position-icon '+(mapZoom <= 12?'':'add__position-icon--red')" icon="marker"></icon>
		</p>
		<label for="toilet-position" class="o-helloform__label">{{$t('form_position')}}</label>
	</div>
</template>
<script>
	import {mapState} from "vuex";
	import {store} from "./../../../store/store.js";
	import mapboxgl from "mapbox-gl";
	import {isMobile} from "../../../vendor/settings";
	import {closeMapPopup} from "../../../vendor/funcs";

	window.addMarkerOnClick = false;
	let marker = false;

	export default {
		props: {
			disabled: {
				type: Boolean,
				default: false
			},
			position: {
				type: Boolean | Object,
				default: false
			}
		},
		data() {
			return {
				mapZoom: 0
			}
		},
		mounted() {
			if (this.map) {
				this.setOnlick();
				this.setMapMove();
			}
			store.subscribe((mutation, state) => {
				if (mutation.type === "SET_MAP" && state.map) {
					this.setOnlick();
					this.setMapMove();
				}
			});
		},
		methods: {
			setOnlick: function () {
				window.addMarkerOnClick = true;
				this.showWcLayer(false);
				closeMapPopup();
				if (this.position && this.position.lat && this.position.lng) {
					this.map.flyTo({
						center: this.position,
						offset: [0, (isMobile() ? -150 : 0)],
					});
					this.setNewMarker(this.position);
				}
				this.map.on("click", e => {
					this.mapClick(e);
				});
			},
			setMapMove: function () {
				this.mapZoom = this.map.getZoom();
				this.map.on("moveend", () => {
					this.mapZoom = this.map.getZoom();
				});
			},
			mapClick: function (e) {
				if (!window.addMarkerOnClick) {
					return;
				}

				if (this.mapZoom <= 12) {
					this.$snack.danger({
						text: this.$t('add_zoom_closer'),
						button: 'OK'
					});
					return;
				}

				this.setNewMarker({
					lat: e.lngLat.lat,
					lng: e.lngLat.lng
				});
			},
			setNewMarker: function (position) {

				const $position = document.querySelector(".js-add-position");
				const $lat = document.querySelector("[name=toilet-lat]");
				const $lng = document.querySelector("[name=toilet-lng]");
				if (marker) {
					marker.remove();
				}

				$lat.value = position.lat;
				$lng.value = position.lng;
				$lng.dispatchEvent(new Event('change'));
				$position.classList.add("add__position--set");

				const el = document.createElement("div");
				el.className = "add-marker";
				marker = new mapboxgl.Marker({
					element: el,
					anchor: "bottom"
				})
					.setLngLat(position)
					.addTo(this.map);
			},
			showWcLayer: function (show = true) {
				const style = (show ? 'visible' : 'none');
				const styleLoaded = new Promise(resolve => {
					if (this.map.isStyleLoaded()) {
						resolve();
					} else {
						this.map.on('style.load', () => resolve());
					}
				});
				const sourceSet = new Promise(resolve => {
					window.setInterval(() => {
						if (this.map.getSource("wcs")) {
							resolve();
						}
					}, 200);
				});
				styleLoaded.then(() => {
					sourceSet.then(() => {
						this.map.setLayoutProperty('wcs', 'visibility', style);
					});
				});
			}
		},
		computed: mapState(["map", "online"]),
		beforeDestroy() {
			window.addMarkerOnClick = false;
			this.showWcLayer(true);
			if (marker) {
				marker.remove();
			}
		}
	}
</script>