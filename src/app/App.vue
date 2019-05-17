<template>
	<div class="app" id="app">
		<button :class="'app__location '+(geolocation?'app__location--active':'')" @click="setMyPosition()">
			<icon icon="position"></icon>
		</button>
		<Main class="app__main app__main--mobile-hidden"></Main>
		<Map class="app__map"></Map>
		<div class="navigation-mobile app__mobilenav">
			<button
				class="navtoggler navigation-mobile__navtoggler"
				aria-controls="mobile-nav"
				aria-expanded="false"
				@click="toggleMobileNav"
				id="mobile-navtoggler"
			>
                <span
	                v-for="line in 3"
	                :key="line"
	                :class="`navtoggler__line navtoggler__line--${line}`"
                ></span>
			</button>
			<nav
				class="navigation-mobile__navigation navigation"
				id="mobile-nav"
				aria-hidden="true"
			>
				<localized-link v-for="(icon, element) in navigation"
				                :key="element"
				                active-class="navigation-element--active"
				                :to="`/${element}/`"
				                :class="`navigation-element navigation-element--${element}`"
				>
					<icon :icon="icon" class="navigation-element__button"></icon>
					<span class="navigation-element__title">{{$t(`menu_${element}`)}}</span>
				</localized-link>
			</nav>
		</div>
		<button class="app__feedback feedback-button" @click="showFeedbackForm(true)">
			Beta<br>Feed<br>back
		</button>
		<feedback-form v-if="feedbackForm" :close="function(){showFeedbackForm(false);}"></feedback-form>
		<cookie-banner></cookie-banner>
	</div>
</template>
<script>
	import Map from "./components/Map.vue";
	import Main from "./components/Main.vue";
	import {i18nSetLang} from './i18n';
	import {settings, navigation, IsDev} from "./vendor/settings.js";
	import {mapState} from "vuex";
	import FeedbackForm from "./components/FeedbackForm.vue";
	import CookieBanner from "./components/CookieBanner.vue";

	export default {
		data() {
			return {
				navigation,
				feedbackForm: false
			};
		},
		metaInfo() {
			return {
				title: false,
				titleTemplate: title => {
					return title
						? `WC-Guide: ${title}`
						: `WC-Guide: ${this.$t('claim')}`;
				}
			};
		},
		components: {
			FeedbackForm,
			Map,
			Main,
			CookieBanner
		},
		methods: {
			toggleMobileNav: function (event) {
				const $button = event.target;
				const hide = $button.getAttribute("aria-expanded") === "true";
				const $element = document.querySelector(
					`#${$button.getAttribute("aria-controls")}`
				);
				$element.setAttribute("aria-hidden", hide ? "true" : "false");
				$button.setAttribute("aria-expanded", hide ? "false" : "true");
				this.$el.querySelector('.feedback-button').setAttribute("aria-hidden", hide ? "false" : "true");
			},
			setMyPosition: function () {
				const myPosition = new Promise((resolve, reject) => {
					this.$store.dispatch("setGeoLocation").then(() => {
						this.$store.subscribe((mutation, state) => {
							if (mutation.type === "SET_GEOLOCATION") {
								if (state.geolocation) {
									resolve(this.$store.state.geolocation);
								}
							}
						});
					});
				});
				myPosition.then(location => {
					if (this.map) {
						this.map.flyTo({
							center: location,
							zoom: 14
						});
					}
				});
			},
			showFeedbackForm: function (show) {
				this.feedbackForm = show;
			}
		},
		mounted: function () {
			i18nSetLang();
		},
		computed: mapState(["geolocation", "map"])
	}
	;
</script>