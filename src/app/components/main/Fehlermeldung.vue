<template>
	<div>
		<template v-if="!online">
			<div class="o-feedback o-feedback--error add__agreement">
				<p class="o-feedback__colored">
					<b>{{$t('offline')}}</b>
				</p>
				<p>{{$t('offline_form')}}</p>
			</div>
		</template>
		<toilet-form
			v-else-if="element"
			:default="element"
			:inputdisabled="othersDisabled"
			class="o-helloform--label-red"
			:submitToilet="submitForm"
		>
			<hello-input
				:title="$t('form_toilet_notexist')"
				name="toilet-notexist"
				type="checkbox"
				class="o-helloform__element--red"
				:hellochange="disableOthers"
			></hello-input>
			<hello-input
				title="entry ID"
				name="toilet-toilet_id"
				type="hidden"
				:value="$route.params.entryId"
			></hello-input>
		</toilet-form>
	</div>
</template>
<script>
	import ToiletForm from "./ToiletForm.vue";
	import HelloInput from "./../globals/helloform/HelloInput.vue";
	import {mapState} from "vuex";
	import {entriesDB} from "./../../store/storeDB.js";
	import {api} from "./../../vendor/settings";
	import {toilet} from "./../../vendor/funcs";
	import axios from "axios";

	export default {
		data() {
			return {
				element: false,
				othersDisabled: false
			};
		},
		metaInfo: function () {
			return {
				title: this.$t("menu_fehlermeldung")
			};
		},
		mounted() {
			this.loadEntry();
			this.$store.dispatch("setMobileHeader", {
				title: this.$t("menu_fehlermeldung"),
				color: "red",
				map: true
			});
		},
		updated() {
			this.loadEntry();
		},
		methods: {
			loadEntry: async function () {
				new Promise(resolve => {
					entriesDB.get(this.$route.params.entryId).then(marker => {
						this.element = marker;
						resolve(marker);
					});
				});
			},
			disableOthers: function (e) {
				if (e) {
					this.othersDisabled = e.checked;
				}
			},
			submitForm: function (data) {
				return new Promise((resolve, reject) => {
					if (data['toilet-notexist']) {
						axios.post(`${api.wp.delete}`, data)
							.then(resp => {
								resolve(`<p class="o-feedback__colored">
									<b>${this.$t('form_failure_success_title')}</b>
								</p><p>
									${this.$t('form_failure_success_desc')}
								</p><p class="o-feedback__controls">
									<button onclick="routerBackHome();" class="o-button o-button--green">${this.$t('ok')}</button>
								</p>`);
							})
							.catch(error => {
								reject();
							});
					} else {
						const newData = {
							details: [],
						};
						Object.keys(data).forEach(key => {
							const newKey = key.replace('toilet-', '');
							if (newKey.indexOf('details-') === 0) {
								if (data[key] === true) {
									const prop = newKey.replace('details-', '');
									newData.details.push(toilet.getPropertyIndex(prop));
								}
							} else {
								newData[newKey] = data[key];
							}
						});

						console.log(newData);
						axios.post(api.wc.failure, newData)
							.then(resp => {
								console.log(resp);
								console.log(resp.data.code);
								if (resp.data.code >= 300) {
									reject(resp.data.message);
								} else {
									resolve(`<p class="o-feedback__colored">
										<b>${this.$t('form_failure_success_title')}</b>
									</p><p>
										${this.$t('form_failure_success_desc')}
									</p><p class="o-feedback__controls">
										<button onclick="routerBackHome();" class="o-button o-button--green">${this.$t('ok')}</button>
									</p>`);
								}
							})
							.catch(error => {
								reject();
							});
					}
				});
			}
		},
		components: {
			ToiletForm,
			HelloInput
		},
		computed: mapState(["map", "online"])
	};
</script>