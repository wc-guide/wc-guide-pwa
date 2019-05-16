<template>
	<router-link :tag="tag" :to="getUri()" :active-class="activeClass">
		<slot></slot>
	</router-link>
</template>

<script>

	export default {
		props: ["to", "tag", "activeClass"],

		methods: {
			getUri() {
				let locale = this.$route.params.locale;
				/*
				if (!langVars.all.includes(locale)) {
					locale = langVars.fallback;
				}
				*/

				if (this.to === "/") {
					return `/${locale}/`;
				}
				return `/${locale}/${this.to.replace(/^\/|\/$/g, "")}/`;
			}
		}
	};
</script>
