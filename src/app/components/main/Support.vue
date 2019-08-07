<template>
	<div class="content__support content-support">
		<div v-if="page" v-html="page.content" class="page-content"></div>
		<nav class="content__footer content-footerlinks">
			<localized-link v-for="link in footerLinks" :key="link" :to="`more/${link}/`" class="content-footerlinks__element">
				{{$t(`submenu_${link}`)}}
			</localized-link>
		</nav>
	</div>
</template>
<script>

	import {mapState} from 'vuex';
	import {footernavigation} from './../../vendor/settings';
	import {loadPage} from '../../vendor/funcs';

	export default {
		data() {
			return {
				footerLinks: footernavigation,
				page: false
			};
		},
		mounted() {
			loadPage('home', (respPage => {
				console.log(respPage);
				this.page = respPage;
			}))
		},
		computed: mapState({})
	};
</script>