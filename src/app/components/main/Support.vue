<template>
	<div class="content__support content-support">
		<div v-if="page" v-html="page.content" class="page-content"></div>
		<nav class="content__footer content-footerlinks">
			<localized-link
				v-for="link in footerLinks"
				:key="link.title"
				:to="link.to"
				class="content-footerlinks__element"
			>{{link.title}}
			</localized-link>
		</nav>
	</div>
</template>
<script>

	import {supportPage} from './../../vendor/settings';
	import {fetchPage} from "./../../vendor/funcsPage";
	import {pagesDB} from "../../store/storeDB";

	export default {
		data() {
			return {
				page: false,
				footerLinks: {
					legal: {
						title: this.$t("submenu_legal"),
						to: "/more/legal/"
					},
					privacy: {
						title: this.$t("submenu_privacy"),
						to: "/more/privacy/"
					}
				}
			};
		},
		created() {
			const lang = this.$i18n.locale;
			const validLangs = Object.keys(supportPage);
			let pageId = supportPage[validLangs[0]];

			if (lang in supportPage) {
				pageId = supportPage[lang];
			}

			fetchPage(pageId)
				.then(page => {
					this.page = {
						title: page.title,
						content: page.content
					};
				})
				.catch(() => {
					pagesDB.get(pageId).then(page => {
						if (page) {
							this.page = {
								title: page.title,
								content: page.content
							};
						} else {
							this.page = {
								title: '404 error',
								content: 'Page not found'
							};
						}
					});
				});
		}
	};
</script>