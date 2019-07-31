<template>
	<div class="content__support content-support">
		<div v-if="page" v-html="page.content" class="page"></div>
		<nav class="content__footer content-footerlinks">
			<localized-link
				v-for="link in footerLinks"
				:key="link"
				:to="`more/${link}/`"
				class="content-footerlinks__element"
			>
				{{$t(`submenu_${link}`)}}
			</localized-link>
		</nav>
	</div>
</template>
<script>

	import {mapState} from "vuex";
	import {footernavigation} from './../../vendor/settings';

	export default {
		data() {
			return {
				footerLinks: footernavigation
			};
		},
		mounted() {
			this.$store.dispatch('page/load', 'support');
		},
		computed: mapState({
			page: state => state.page.current
		})
	};
</script>