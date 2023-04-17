<template>
	<div class="home">
		<div v-if="!online" class="o-feedback o-feedback--error add__agreement">
			<p class="o-feedback__colored">
				<b>{{$t('offline')}}</b>
			</p>
			<p>{{$t('offline_form')}}</p>
		</div>
		<template v-else>
			<form class="home__search-form search-form" @submit.prevent="selectFirst">
				<input
					:placeholder="$t('form_search_for')"
					class="search-form__input"
					id="search-place"
					@keyup="searchLocations"
				/>
				<hello-icon class="search-form__icon" icon="search"></hello-icon>
				<div v-if="searchText" @click="clearSearch" class="clear-search">X</div>
			</form>
			<div class="home__search-list search-list">
				<button @click="setCenter(place.center)" v-for="(place, index) in results" :key="index" class="search-list__element">
					{{place.name}}
				</button>
			</div>
		</template>
		<Support class="home__support" v-if="(results === false)"></Support>
	</div>
</template>
<script>
	import Support from "./Support.vue";
	import axios from "axios";
	import {mapBoxSettings, isMobile} from "./../../vendor/settings";
	import {mapState} from "vuex";
	import mapboxgl from "mapbox-gl";

	const searchPlace = `https://api.mapbox.com/geocoding/v5/mapbox.places/{text}.json?access_token=${mapBoxSettings.token}&types=place,address,poi&proximity={lon}%2C{lat}&language={lang}`;
	let marker = false;

	export default {
		data() {
			return {
				results: false
			};
		},
		mounted: function () {
			this.$store.dispatch('page/loadMobileHeader', {
				title: this.$t("menu_search")
			});
		},
		methods: {
			searchLocations: function () {
				if (this.map) {
					const $field = this.$el.querySelector('#search-place');
					const center = this.map.getCenter();
					const url = searchPlace
						.replace('{text}', $field.value)
						.replace('{lon}', center.lng)
						.replace('{lat}', center.lat).replace('{lang}', this.$i18n.locale);
					axios.get(url).then(resp => {
						let places = [];
						resp.data.features.forEach(place => {
							let name = place.place_name;
							place.context.forEach(context => {
								if (context.id.indexOf('region.') === 0) {
									name = name.replace(`, ${context.text}`, '');
								}
								if (context.id.indexOf('postcode.') === 0) {
									name = name.replace(` ${context.text}`, '');
								}
							});
							places.push({
								name,
								center: place.center
							});
						});
						this.results = places;
					});
				}
			},
			selectFirst() {
				if (this.results[0]) {
					this.setCenter(this.results[0].center);
				}
			},
			clearSearch() {
		      this.searchText = "";
		      this.searchLocations();
		    },
			setCenter: function (center) {
				if (this.map) {
					let zoom = 14;
					if (this.map.getZoom() >= zoom) {
						zoom = this.map.getZoom();
					}
					if (isMobile()) {
						document
							.querySelector("#main-content")
							.classList.add("app__main--mobile-hidden");
						this.$router.push({
							path: `/${this.$i18n.locale}/`
						});
						const $button = document.querySelector('#mobile-navtoggler');
						const $element = document.querySelector(`#${$button.getAttribute("aria-controls")}`);
						$element.setAttribute("aria-hidden", "true");
						$button.setAttribute("aria-expanded", "false");
					}
					this.map.flyTo({
						center: {
							lng: center[0],
							lat: center[1]
						},
						zoom
					});
					if (!marker) {
						const el = document.createElement("div");
						el.className = "map-mysearch";
						marker = new mapboxgl.Marker(el)
							.setLngLat({
								lng: center[0],
								lat: center[1]
							})
							.addTo(this.map);
					} else {
						marker.setLngLat({
							lng: center[0],
							lat: center[1]
						});
					}
				}
			}
		},
		beforeDestroy() {
			if (marker && this.map) {
				marker.remove();
				marker = false;
			}
		},
		components: {
			Support
		},
		computed: mapState({
			online: state => state.client.online,
			map: state => state.map.map
		}),
	};
</script>
<style scoped>
	.search-form {
	  position: relative;
	}

	.clear-search {
	  position: absolute;
	  right: 10px;
	  top: 50%;
	  transform: translateY(-50%);
	  cursor: pointer;
	}
</style>