<template></template>
<script>
	import {mapState} from "vuex";
	import {store} from "../store/store.js";
	import mapboxgl from "mapbox-gl";

	let marker = false;

	export default {
		props: ["map"],
		data() {
			return {};
		},
		mounted() {
			store.subscribe((mutation, state) => {
				if (mutation.type === 'map/setGeoLocation') {
					if (!state.map.geolocation) {
						return;
					}
					this.setOrUpdatePosition(state.map.geolocation);
				}
			});
		},
		computed: mapState({
			mobileheader: state => state.page.mobileheader,
			geolocation: state => state.map.geolocation
		}),
		methods: {
			setOrUpdatePosition: function (geolocation) {
				if (!marker) {
					const el = document.createElement("div");
					el.className = "map-myposition";

					marker = new mapboxgl.Marker(el)
						.setLngLat(geolocation)
						.addTo(this.map);
				} else {
					marker.setLngLat(geolocation);
				}
			}
		}
	};
</script>
