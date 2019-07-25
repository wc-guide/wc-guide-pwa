<template>
	<router-link v-if="localizedTo" :tag="tag" :to="localizedTo" :active-class="activeClass">
		<slot></slot>
	</router-link>
</template>

<script>
	import {i18nGetLang} from "./../../i18n";

	export default {

		props: ['to', 'tag', 'activeClass'],
		data: function () {
			return {
				localizedTo: this.getLocalizedLink(this.$route.params.locale)
			}
		},
		mounted: async function () {
			let locale = await i18nGetLang();
			this.localizedTo = this.getLocalizedLink(locale);
		},
		methods: {
			getLocalizedLink(locale) {
				if (locale) {
					return `/${locale}${this.to}`;
				}
				return false;
			}
		}
	};
</script>