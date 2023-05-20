<template>
	<div class="cookiebanner" v-if="show">
		<div class="cookiebanner__about">
			<p>{{$t('cookiebanner')}}
				<button @click="setPrivacy(true)" class="cookiebanner__privacy">{{$t('cookiebanner_privacy')}}</button>
				<button @click="rejectCookies" class="cookiebanner__reject">{{$t('cookiebanner_reject')}}</button>
			</p>
		</div>
		<div class="cookiebanner__controls">
			<button class="o-button" @click="hideBanner()">{{$t('cookiebanner_agree')}}</button>
			<button class="reject-cookies-button" @click="rejectCookies">{{$t('cookiebanner_reject')}}</button>
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
			},

		    rejectCookies: function() {
		      // Hier kannst du den Code einfügen, um Cookies abzulehnen, z.B. für Matomo
		      // Du kannst hier Matomo-spezifischen Code verwenden, um Cookies abzulehnen
		      // Beispiel: Matomo.optOut();
		      _paq.push(['optUserOut']);
		      console.log('Cookies wurden abgelehnt');
		    }
		},
	}
</script>