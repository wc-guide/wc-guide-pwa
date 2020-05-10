<template>
	<div class="page">
		<div class="page__loading" v-if="page.loading"></div>
		<template v-else>
			<h1 class="page__title">{{page.title}}</h1>
			<div class="page__content page-content" v-html="page.content"></div>
		</template>
	</div>
</template>

<script>
	import {mapState} from "vuex";
	import {slideUp, slideDown} from "es6-slide-up-down";

	export default {
		data: function () {
			return {
				scriptsLoaded: []
			}
		},
		mounted: function () {
			this.$store.dispatch("page/load", this.$route.params.page);
			this.scriptsLoaded = [];
		},
		metaInfo: function () {
			return {
				title: this.page.title
			};
		},
		beforeRouteUpdate(to, from, next) {
			this.$store.dispatch("page/load", to.params.page);
			next();
		},
		computed: mapState({
			page: state => state.page.current
		}),
		watch: {
			page() {
				window.setTimeout(() => {
					const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
					const scripts = re.exec(this.page.content);
					scripts && scripts.forEach(script => {
						if (script) {
							const regexSrc = /src=\"(\S*)\"/gm;
							const src = regexSrc.exec(script);
							if (src && this.scriptsLoaded.indexOf(src[1]) === -1) {
								this.scriptsLoaded.push(src[1]);
								const script = document.createElement('script');
								script.src = src[1];
								document.head.appendChild(script);
							}
						}
					});
					this.$el
						.querySelectorAll(".toggle-trigger")
						.forEach($trigger => {
							const targetId = $trigger.getAttribute(
								"data-trigger-for"
							);
							const $target = this.$el.querySelector(`#${targetId}`);
							$trigger.onclick = e => {
								if ($target) {
									const shouldClose =
										$trigger.getAttribute(
											"data-trigger-open"
										) === "true";
									if (shouldClose) {
										$trigger.setAttribute(
											"data-trigger-open",
											"false"
										);
										slideUp($target, {duration: 200});
									} else {
										$trigger.setAttribute(
											"data-trigger-open",
											"true"
										);
										slideDown($target, {duration: 200});
									}
								}
							};
						});
				}, 10);
			}
		}
	};
</script>