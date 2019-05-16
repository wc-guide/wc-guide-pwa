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
				if (mutation.type === "SET_GEOLOCATION") {
					if (!state.geolocation) {
						return;
					}
					this.setOrUpdatePosition(state.geolocation);
				}
			});
		},
		computed: mapState(["geolocation"]),
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
