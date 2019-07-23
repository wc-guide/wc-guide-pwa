<template>
	<div class="page">
		<div class="page__loading" v-if="page.loading"></div>
		<template v-else>
			<h2 class="page__title">{{page.title}}</h2>
			<div class="page__content page-content" v-html="page.content"></div>
		</template>
	</div>
</template>

<script>
	import {mapState} from "vuex";

	export default {
		mounted: function () {
			this.$store.dispatch('page/load', this.$route.params.page);
		},
		metaInfo: function () {
			return {
				title: this.page.title
			};
		},
		beforeRouteUpdate(to, from, next) {
			this.$store.dispatch('page/load', to.params.page);
			next();
		},
		computed: mapState({
			page: state => state.page.current
		})
	};
</script>