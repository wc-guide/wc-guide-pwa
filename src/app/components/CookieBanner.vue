<template>
	<div class="cookiebanner" v-if="show">
		<div class="cookiebanner__about">
			<p>{{$t('cookiebanner')}}
				<button @click="setPrivacy(true)" class="cookiebanner__privacy">{{$t('cookiebanner_privacy')}}</button>
			</p>
		</div>
		<div class="cookiebanner__controls">
			<button class="o-button" @click="hideBanner()">{{$t('cookiebanner_agree')}}</button>
		</div>
		<shadow-box page-slug="privacy" v-if="privacy" :close="function(){setPrivacy(false);}"></shadow-box>
	</div>
</template>
<script>
	export default {
		data() {
			return {
				show: !this.$cookies.get('cookieconsent'),
				privacy: false
			}
		},
		methods: {
			setPrivacy: function (show) {
				this.privacy = show;
			},
			hideBanner: function () {
				this.$cookies.set('cookieconsent', true);
				this.show = false;
			}
		},
	}
</script>