<template>
	<component :is="svg" v-on="$listeners"/>
</template>

<script>
	export default {
		name: 'Icon',

		data() {
			return {
				svg: undefined
			}
		},

		props: {
			icon: {
				type: String,
				required: true
			},
			folder: {
				type: String,
				default: ''
			}
		},

		async created() {
			const loaded = await import(/* webpackMode: "eager" */ `@/icons/${this.folder + this.icon}.svg`);
				this.svg = loaded.default;
		}
	}
</script>