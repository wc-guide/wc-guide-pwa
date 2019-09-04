<template>
    <router-link :tag="tag" :to="`/${locale}${to}`" :active-class="activeClass">
        <slot></slot>
    </router-link>
</template>

<script>
import { i18nGetLang } from "./../../i18n";

export default {
    props: ["to", "tag", "activeClass"],
    data: function() {
        return {
            locale: i18nGetLang()
        };
    },
    watch: {
        $route(to, from) {
            if (to.params.locale !== from.params.locale) {
                this.locale = to.params.locale;
            }
        }
    }
};
</script>