<template>
	<span class="o-hello-icon">
		<icon :icon="icon" folder=""></icon>
	</span>
</template>
<script>
	export default {
		props: {
			icon: {
				type: String,
				required: true
			}
		},
	}
</script>