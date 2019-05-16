<template>
	<i class="o-hello-icon" v-html="i"></i>
</template>

<script>
	export default {
		props: ["icon"],
		data() {
			return {
				i: require(`../../../icons/${this.icon}.svg`)
			};
		}
	};
</script>