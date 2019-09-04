<template>
    <div class="more">
        <nav class="more__nav morenav">
            <div class="morenav__category morenav__category--map">
                <hello-icon icon="map" />
                <button :class="`o-button ${(currentType === type ? '':'o-button--gray')}`" v-for="type in mapStyles" :key="type" @click="setMap(type)">
                    {{$t(`mapbox_${type}`)}}
                </button>
            </div>
            <div class="morenav__category">
                <div class="morenav__element morenav__element--lang">
                    <template v-for="(lang, langKey) in languages">
                        <hello-icon :key="langKey" :icon="`flags/${langKey}`" class="morenav__icon" v-if="langKey === $i18n.locale" />
                    </template>
                    <div class="morenav__content morenav__content--selectlang o-helloform__element o-helloform__element--type-select">
                        <select class="o-helloform__input o-helloform__input--transparent" @change="setLanguage">
                            <option v-for="(lang, langKey) in languages" :value="langKey" v-bind:selected="($i18n.locale === langKey)" :key="langKey">
                                {{lang}}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="morenav__category">
                <localized-link :to="(showFilter?'/more':'/more/filter')" class="morenav__element morenav__element--filter">
                    <hello-icon icon="fa/filter" class="morenav__icon" />
                    <span :class="`morenav__content ${showFilter?'morenav__content--open':''}`">
                        {{$t('filter')}}
                    </span>
                </localized-link>
                <map-filter class="morenav__body" v-if="showFilter" />
            </div>
            <div class="morenav__category" v-for="(category, index) in navigation" :key="index">
                <template v-for="(icon, element) in category">
                    <localized-link :key="element" activeClass="morenav__element--active" :to="`/more/${element}/`" :class="`morenav__element morenav__element--${element}`">
                        <hello-icon :icon="`fa/${icon}`" class="morenav__icon" />
                        <span class="morenav__content">
                            {{$t(`submenu_${element}`)}}
                        </span>
                    </localized-link>
                </template>
            </div>
            <div class="morenav__category morenav__category--a2h">
                <div class="morenav__element morenav__element--a2h">
                    <hello-icon icon="fa/download" class="morenav__icon" />
                    <button class="morenav__content" @click="installPrompt();">{{$t('pwa_a2h')}}</button>
                </div>
            </div>
        </nav>
        <update class="more__update" />
    </div>
</template>
<script>
import { i18nSetLang } from "../../i18n";
import {
    subnavigation,
    api,
    mapBoxSettings,
    isMobile
} from "./../../vendor/settings.js";
import axios from "axios";
import Filter from "./more/Filter.vue";
import Update from "./more/Update.vue";
import { mapState } from "vuex";

export default {
    data() {
        return {
            navigation: subnavigation,
            languages: {
                de: "Deutsch"
            },
            installBanner: false,
            showFilter: false,
            mapStyles: Object.keys(mapBoxSettings.styles)
        };
    },
    metaInfo: function() {
        return {
            title: this.$t("menu_more")
        };
    },
    components: {
        mapFilter: Filter,
        Update
    },
    created: function() {
        axios.get("/content/languages.json").then(response => {
            this.languages = response.data;
        });
    },
    mounted: function() {
        this.setFilter();
        this.$store.dispatch("page/loadMobileHeader", {
            title: this.$t("menu_more"),
            to: false,
            color: "brown",
            map: false
        });
    },
    watch: {
        "$route.path": "setFilter"
    },
    methods: {
        setMap(type) {
            this.$store.dispatch("map/setType", type);
            if (isMobile()) {
                document
                    .querySelector("#main-content")
                    .classList.add("app__main--mobile-hidden");
                this.$router.push({
                    path: `/${this.$i18n.locale}/`
                });
                const $button = document.querySelector("#mobile-navtoggler");
                const $element = document.querySelector(
                    `#${$button.getAttribute("aria-controls")}`
                );
                $element.setAttribute("aria-hidden", "true");
                $button.setAttribute("aria-expanded", "false");
                document
                    .querySelector(".feedback-button")
                    .setAttribute("aria-hidden", "false");
            }
        },
        setLanguage: function(event) {
            i18nSetLang(event.target.value);
        },
        installPrompt: function() {
            window.installEvent.prompt();
            window.installEvent.userChoice.then(choiceResult => {
                if (choiceResult.outcome === "accepted") {
                    console.log("User accepted the A2HS prompt");
                    document.body.classList.remove("can-install");
                } else {
                    console.log("User dismissed the A2HS prompt");
                }
                window.installEvent = null;
            });
        },
        setFilter: function() {
            if (this.$route.path.indexOf("/filter") !== -1) {
                this.showFilter = true;
            } else {
                this.showFilter = false;
            }
        }
    },
    computed: mapState({
        currentType: state => state.map.type
    })
};
</script>
