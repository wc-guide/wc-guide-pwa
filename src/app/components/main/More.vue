<template>
	<div class="more">
		<nav class="more__nav morenav">
			<div class="morenav__category">
				<div class="morenav__element morenav__element--lang">
					<template v-for="lang in languages">
						<icon
							:key="lang"
							:icon="`flags/${lang}`"
							class="morenav__icon"
							v-if="lang === $i18n.locale"
						></icon>
					</template>
					<div
						class="morenav__content morenav__content--selectlang o-helloform__element o-helloform__element--type-select"
					>
						<select class="o-helloform__input" @change="setLanguage">
							<option
								v-for="lang in languages"
								:value="lang"
								v-bind:selected="($i18n.locale === lang)"
								:key="lang"
							>{{$t(`lang_${lang}`)}}
							</option>
						</select>
					</div>
				</div>
			</div>
			<div class="morenav__category">
				<localized-link :to="(showFilter?'/more':'/more/filter')" class="morenav__element morenav__element--filter">
					<icon icon="fa/filter" class="morenav__icon"></icon>
					<span :class="`morenav__content ${showFilter?'morenav__content--open':''}`">{{$t('filter')}}</span>
				</localized-link>
				<map-filter class="morenav__body" v-if="showFilter"></map-filter>
			</div>
			<div class="morenav__category" v-for="(category, index) in navigation" :key="index">
				<template v-for="(vals, element) in category">
					<localized-link
						:key="element"
						v-if="($i18n.locale in vals.page)"
						activeClass="morenav__element--active"
						:to="`/more/${element}/`"
						:class="`morenav__element morenav__element--${element}`"
					>
						<icon :icon="`fa/${vals.icon}`" class="morenav__icon"></icon>
						<span class="morenav__content">{{$t(`submenu_${element}`)}}</span>
					</localized-link>
				</template>
			</div>
			<div class="morenav__category morenav__category--a2h">
				<div class="morenav__element morenav__element--a2h">
					<icon icon="fa/download" class="morenav__icon"></icon>
					<button class="morenav__content" @click="installPrompt();">{{$t('pwa_a2h')}}</button>
				</div>
			</div>
		</nav>
		<update class="more__update"></update>
	</div>
</template>
<script>
	import {i18nSetLang, i18nDefault} from "../../i18n";
	import {subnavigation, api} from "./../../vendor/settings.js";
	import axios from 'axios';
	import Filter from './more/Filter.vue';
	import Update from './more/Update.vue';

	export default {
		data() {
			return {
				navigation: subnavigation,
				languages: [i18nDefault],
				installBanner: false,
				showFilter: false
			};
		},
		metaInfo: function () {
			return {
				title: this.$t("menu_more")
			};
		},
		components: {
			mapFilter: Filter,
			Update
		},
		created: function () {
			axios.get(`${api.wp.base}wc-guide/v1/translations`)
				.then(response => {
					this.languages = Object.keys(response.data);
				});
		},
		mounted: function () {
			this.setFilter();
			this.$store.dispatch("setMobileHeader", {
				title: this.$t("menu_more"),
				to: false,
				color: "brown",
				map: false
			});
		},
		watch: {
			'$route.path': 'setFilter'
		},
		methods: {
			setLanguage: function (event) {
				i18nSetLang(event.target.value);
			},
			installPrompt: function () {
				window.installEvent.prompt();
				window.installEvent.userChoice.then(choiceResult => {
					if (choiceResult.outcome === "accepted") {
						console.log("User accepted the A2HS prompt");
						document.body.classList.remove("can-install");
					} else {
						console.log("User dismissed the A2HS prompt");
					}
					window.installEvent = null;
				});
			},
			setFilter: function () {
				if (this.$route.path.indexOf('/filter') !== -1) {
					this.showFilter = true;
				} else {
					this.showFilter = false;
				}
			}
		}
	};
</script>
