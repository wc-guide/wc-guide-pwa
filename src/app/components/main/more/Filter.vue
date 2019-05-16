<template>
	<hello-form
		formKey="filter"
		:formSubmit="updateFilter"
		:formError="false"
		:formLoading="false"
		:formSuccess="false"
		:submit="false"
	>
		<hello-input
			v-for="(checked, key) in toiletfilter"
			:key="key"
			:name="`toilet-type-${key}`"
			:value="key"
			:title="$t(`type_${toiletTypes[key]}`)+`<img src='/assets/img/marker/png-30/${toiletTypes[key]}.png' />`"
			:checked="checked"
			type="checkbox"
			:hellochange="updateFilter"
		></hello-input>
	</hello-form>
</template>
<script>
	import HelloForm from "./../../globals/helloform/HelloForm.vue";
	import HelloInput from "./../../globals/helloform/HelloInput.vue";
	import {toilet} from "./../../../vendor/funcs"

	import {mapState} from "vuex";
	import {mapLoaderShow} from "./../../../vendor/mapLoader";

	export default {
		data() {
			return {
				toiletTypes: toilet.types
			};
		},
		methods: {
			updateFilter: function () {
				mapLoaderShow("filterEntries");
				const filter = {};
				const $fields = this.$el.querySelectorAll("input[type=checkbox");
				$fields.forEach($item => {
					filter[$item.getAttribute("value")] = $item.checked;
				});
				this.$store.dispatch("setToiletFilter", filter);
			}
		},
		components: {
			HelloForm,
			HelloInput
		},
		computed: mapState(["toiletfilter"])
	};
</script>
