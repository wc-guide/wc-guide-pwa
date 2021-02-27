<template>
  <div class="list">
    <div v-if="entriesList === 'loading'" class="list__loading"></div>
    <template v-else-if="entriesList">
      <button v-for="(entry, id) in entriesList" @click="openInfobox(entry.id, entry.lat, entry.lng)" :key="id"
              class="list__element">
        <img class="list__image" :src="`/assets/img/marker/${entry.type}.svg`"/>
        <div class="list__inner">
          <template v-if="!entry.name && !entry.operator">
            <span class="list__place">
              {{ $t(`type_${entry.type}`) }}
            </span>
          </template>
          <template v-else>
            <b class="list__name">{{ entry.name }}</b>
            <span class="list__place">{{ entry.operator }}</span>
          </template>
        </div>
        <div class="list__meta" v-if="entry.distanceHumanized">
          <img class="list__meta-image" src="/assets/img/direction.svg"
               :style="`transform: rotate(${entry.angle}deg);`">
          <span class="list__meta-distance">{{ entry.distanceHumanized }}</span>
        </div>
      </button>
    </template>
    <div class="o-feedback o-feedback--error list__feedback" v-else>
      <p class="o-feedback__colored">{{ $t('zoom_closer') }}</p>
    </div>
  </div>
</template>
<script>
import {mapState} from "vuex";
import {isMobile} from "./../../vendor/settings";
import {getEntryDescription, openMapPopup} from "./../../vendor/funcs";
import {toilet} from "../../vendor/funcs";

export default {
  mounted: function () {
    this.$store.dispatch("page/loadMobileHeader", {
      title: this.$t("menu_list"),
      to: false,
      color: "brown",
      map: false
    });
  },
  metaInfo: function () {
    return {
      title: this.$t("menu_list")
    };
  },
  methods: {
    openInfobox: function (id, lat, lng) {
      if (isMobile()) {
        document
            .querySelector("#main-content")
            .classList.add("app__main--mobile-hidden");
        this.$router.push({
          path: `/${this.$i18n.locale}/`
        });
      }
      const markerIndex = window.markerIds[id];
      const marker = this.map.getSource("wcs-source")["_data"].features[
          markerIndex
          ];
      const coordinates = marker.geometry.coordinates.slice();
      const description = marker.properties.description;
      openMapPopup(description, coordinates, this.map);
    },
    getType: function (item) {
      let icon = item.type;
      if (item.details && item.details.indexOf("5") !== -1) {
        icon = `${icon}-nette-toilette`;
      }

      return icon;
    }
  },
  computed: mapState({
    map: state => state.map.map,
    entriesList: state => {
      console.log('entriesList', state.entries.map)
      return state.entries.map
    },
    geolocation: state => state.map.geolocation
  })
};
</script>