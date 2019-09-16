<template>
	<div class="content__support content-support">
		<div v-if="page" v-html="page.content" class="page-content"></div>
	</div>
</template>
<script>

	import {mapState} from 'vuex';
	import {footernavigation} from './../../vendor/settings';
	import {loadPage} from '../../vendor/funcs';

	export default {
		data() {
			return {
				page: false
			};
		},
		mounted() {
			loadPage('home', (respPage => {
				this.page = respPage;
			}))
		},
		computed: mapState({})
	};
</script>