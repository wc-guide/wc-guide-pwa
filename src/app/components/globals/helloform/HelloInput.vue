<template>
	<div
		:class="`o-helloform__element o-helloform__element--type-${type} ${(disabled?'o-helloform__element--disabled':'')}`"
	>
		<template v-if="type === 'textarea' || type === 'select'">
            <textarea
	            v-if="type === 'textarea'"
	            :name="name"
	            :id="name"
	            v-on:change="isEmpty"
	            :value="value"
	            class="o-helloform__input"
	            :required="required"
	            :placeholder="placeholder"
	            :disabled="disabled"
            ></textarea>
			<select
				v-else
				:name="name"
				:id="name"
				v-on:change="isEmpty"
				:value="value"
				class="o-helloform__input"
				:required="required"
				:placeholder="placeholder"
				:disabled="disabled"
			>
				<template v-if="choices">
					<option
						v-for="(optiontitle, optionvalue) in choices"
						:key="optionvalue"
						:value="optionvalue"
					>{{optiontitle}}
					</option>
				</template>
			</select>
		</template>
		<input
			v-else
			:type="type"
			:name="name"
			:id="name"
			v-on:change="isEmpty"
			:value="value"
			class="o-helloform__input"
			:required="required"
			:placeholder="placeholder"
			:disabled="disabled"
		/>
		<label :for="name" class="o-helloform__label">
			<span v-html="title+(required?'*':'')"></span>
			<span v-if="hint" @click="hint" class="o-button--hint">
				<icon icon="fa/question"></icon>
			</span>
		</label>
	</div>
</template>
<script>
	export default {
		props: {
			name: {
				type: String,
				required: true
			},
			title: {
				type: String,
				default: ""
			},
			type: {
				type: String,
				default: "text"
			},
			placeholder: {
				type: String,
				default: ""
			},
			value: {
				type: String | Number,
				default: ""
			},
			required: {
				type: Boolean,
				default: false
			},
			checked: {
				type: Boolean,
				default: false
			},
			hellochange: {
				type: Boolean | Function,
				default: false
			},
			choices: {
				type: Boolean | Object,
				default: false
			},
			disabled: {
				type: Boolean,
				default: false
			},
			hint: {
				type: Function | Boolean,
				default: false
			}
		},
		methods: {
			isEmpty: function (evt) {
				const $e = evt.target;
				const value = $e.value;
				if (value === "") {
					$e.setAttribute("has-value", false);
				} else {
					$e.setAttribute("has-value", true);
				}
			}
		},
		mounted: function () {
			const $input = this.$el.querySelector(".o-helloform__input");
			if (this.type === "checkbox") {
				if (this.checked) {
					$input.setAttribute("checked", "checked");
				}
			}

			if (this.hellochange) {
				$input.onchange = () => {
					this.hellochange($input);
				};
			}
		}
	};
</script>
