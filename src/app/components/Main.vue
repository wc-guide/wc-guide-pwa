<template>
	<main class="main" id="main-content">
		<div :class="`main__header main__header--${mobileheader.color} ${mobileheader.map?'main__header--map':''}`">
			<h1 class="main__pagetitle">{{(mobileheader.title ? mobileheader.title : '&nbsp;')}}</h1>
			<localized-link
				:to="mobileheader.to"
				class="main__close main__close--back"
				v-if="mobileheader.to"
			>&lt;
			</localized-link>
			<localized-link to="/" class="main__close" v-else>x</localized-link>
		</div>
		<div class="main__content content">
			<localized-link class="content__logo" to="/">
				<logo/>
			</localized-link>
			<nav class="content__navigation navigation">
				<localized-link
					v-for="(icon, element) in navigation"
					:key="element"
					activeClass="navigation-element--active"
					:to="(element==='fehlermeldung'?'/':`/${element}/`)"
					:class="`navigation-element navigation-element--${element}`"
				>
					<hello-icon :icon="icon" class="navigation-element__button"/>
					<span class="navigation-element__title">{{$t(`menu_${element}`)}}</span>
				</localized-link>
			</nav>
			<router-view class="content__content"/>
		</div>
	</main>
</template>
<script>
	import {navigation} from "./../vendor/settings.js";
	import {mapState} from "vuex";

	export default {
		data() {
			this.updateFehlermeldungBodyClass(this.$route);
			return {
				navigation
			};
		},
		mounted: function () {
			this.maybeToggleMobileMain(this.$route);
		},
		methods: {
			updateFehlermeldungBodyClass: function (route) {
				const $body = document.querySelector("body");
				if (route.fullPath.indexOf("/fehlermeldung/") === -1) {
					$body.classList.remove("fehlermeldung");
				} else {
					$body.classList.add("fehlermeldung");
				}
			},
			maybeToggleMobileMain: function (route) {
				const $main = document.querySelector("#main-content");
				const sidebarParam = route.path
					.replace(`/${route.params.locale}/`, "")
					.replace(/\//g, "");

				if (sidebarParam) {
					$main.classList.remove("app__main--mobile-hidden");
					document.body.classList.add('main-open');
				} else {
					$main.classList.add("app__main--mobile-hidden");
					document.body.classList.remove('main-open');
				}
			}
		},
		watch: {
			$route(to, from) {
				this.updateFehlermeldungBodyClass(to);
				this.maybeToggleMobileMain(to);
			}
		},
		computed: mapState({
			mobileheader: state => state.page.mobileheader,
			map: state => state.map.map
		})
	};
</script>
