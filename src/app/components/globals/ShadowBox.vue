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
	import {getPageId, fetchPage} from "../../vendor/funcsPage";
	import {pagesDB} from "../../store/storeDB";
	import {Portal} from '@linusborg/vue-simple-portal'

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
		data() {
			return {
				page: false
			}
		},
		created() {
			if (this.pageSlug) {
				const pageId = getPageId(this.pageSlug);
				if (!pageId) {
					this.page = {
						title: '404 error',
						content: 'Page not found'
					};
				} else {
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
			}
		},
		components: {
			Portal
		}
	};
</script>
