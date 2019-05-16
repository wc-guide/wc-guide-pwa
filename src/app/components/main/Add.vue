<template>
	<div class="add" v-if="map">
		<div v-if="!online" class="o-feedback o-feedback--error add__agreement">
			<p class="o-feedback__colored">
				<b>{{$t('offline')}}</b>
			</p>
			<p>{{$t('offline_form')}}</p>
		</div>
		<div v-if="note" class="o-feedback o-feedback--error add__agreement">
			<p class="o-feedback__colored">
				<b>{{$t('add_note_title')}}</b>
			</p>
			<p v-html="$t('add_note_desc')"></p>
			<p class="o-feedback__controls">
				<button
					class="o-button o-button--green"
					@click="noteAgree();"
				>{{$t('add_note_button')}}
				</button>
			</p>
		</div>
		<toilet-form class="add__form" :disabled="note" :submitToilet="submitForm"></toilet-form>
	</div>
</template>
<script>
	import ToiletForm from "./ToiletForm.vue";
	import {mapState} from "vuex";
	import {api} from "./../../vendor/settings";
	import {toilet, closeMapPopup} from "./../../vendor/funcs";
	import axios from "axios";

	export default {
		data() {
			return {
				note: true
			};
		},
		metaInfo: function () {
			return {
				title: this.$t("menu_add")
			};
		},
		mounted: function () {
			closeMapPopup();
			if (this.$cookies.get('add-note') === 'true') {
				this.note = false;
			}

			this.$store.dispatch("setMobileHeader", {
				title: this.$t("menu_add"),
				map: true
			});
		},
		methods: {
			noteAgree: function () {
				this.note = false;
				this.$cookies.set('add-note', true);
				window.addMarkerOnClick = true;
			},
			submitForm: function (data) {
				return new Promise((resolve, reject) => {
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

					axios.post(api.wc.add, newData)
						.then(resp => {
							if (resp.data.code >= 300) {
								reject(resp.data.message);
							} else {
								resolve(`<p class="o-feedback__colored">
									<b>${this.$t('form_add_success_title')}</b>
								</p><p>
									${this.$t('form_add_success_desc')}
								</p><p class="o-feedback__controls">
									<button onclick="routerBackHome();" class="o-button o-button--green">${this.$t('ok')}</button>
								</p>`);
							}
						})
						.catch(error => {
							reject();
						});
				});
			}
		},
		components: {
			ToiletForm
		},
		computed: mapState(["online", "map"]),
		beforeDestroy: function () {
			window.addMarkerOnClick = false;
		}
	};
</script>