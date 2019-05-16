<template>
	<div :class="`o-helloform o-helloform--${formKey}`">
		<div class="o-helloform__feedback o-helloform__feedback--success o-feedback" v-if="formSuccess" v-html="formSuccess">
		</div>
		<template v-else>
			<div class="o-helloform__feedback o-helloform__feedback--error" v-if="formError">
				<p>{{formError}}</p>
			</div>
			<form :id="formKey" class="o-helloform__form" @submit.prevent="onSubmit">
				<slot></slot>
				<div
					v-if="submitButton"
					:class="'o-helloform__element o-helloform__element--controls '+(disabled?'o-helloform__element--disabled':'')"
				>
					<button
						v-if="(controlsLeft && controlsLeftFunction)"
						class="o-button o-button--gray o-helloform__control--back"
						@click="controlsLeftFunction"
					>
						{{controlsLeft}}
					</button>
					<button
						class="o-button o-helloform__control"
						type="submit"
						:disabled="formLoading"
					>{{submitButton}}
					</button>
				</div>
			</form>
		</template>
	</div>
</template>
<script>
	export default {
		props: {
			formKey: {
				type: String,
				required: true
			},
			formLoading: {
				type: Boolean,
				required: true
			},
			formError: {
				type: Boolean | String,
				required: true
			},
			formSuccess: {
				type: Boolean | String,
				required: false
			},
			formSubmit: {
				type: Function,
				required: true
			},
			submit: {
				type: Boolean | String,
				default: ""
			},
			disabled: {
				type: Boolean,
				required: false
			},
			controlsLeft: {
				type: String | Boolean,
				default: false
			},
			controlsLeftFunction: {
				type: Function | Boolean,
				default: false
			}
		},
		data() {
			let button = this.submit;
			if (button === "") {
				button = this.$t("form_send");
			}
			return {
				submitButton: button
			};
		},
		methods: {
			onSubmit: function ($form) {
				const $fields = $form.target.querySelectorAll(
					"input, select, textarea"
				);

				const data = {};
				$fields.forEach(function ($field) {
					if ($field.getAttribute("type") === 'checkbox') {
						data[$field.getAttribute("name")] = $field.checked;
					} else {
						data[$field.getAttribute("name")] = $field.value;
					}
				});

				this.formSubmit(data);
			}
		}
	};
</script>
