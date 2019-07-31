<template>
	<portal>
		<div class="shadowbox" v-if="!pageSlug || page">
			<button class="shadowbox__close" @click="close"></button>
			<slot v-if="!pageSlug" class="shadowbox__content"></slot>
			<div v-else-if="page" class="shadowbox__content">
				<h2 class="shadowbox__title">{{page.title}}</h2>
				<div class="shadowbox__content page-content" v-html="page.content"></div>
			</div>
		</div>
		<div class="shadowbox-bkg" @click="close"></div>
	</portal>
</template>

<script>
	import {Portal} from '@linusborg/vue-simple-portal';
	import {mapState} from "vuex";

	export default {
		props: {
			pageSlug: {
				type: String | Boolean,
				default: false
			},
			close: {
				type: Function,
				required: true
			}
		},
		mounted() {
			this.$store.dispatch('page/load', this.pageSlug);
		},
		components: {
			Portal
		},
		computed: mapState({
			page: state => state.page.current
		})
	};
</script>
