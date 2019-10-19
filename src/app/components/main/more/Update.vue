<template>
    <p class="update">
        <span class="update__updating" v-if="updating">{{$t('update_updating')}}</span>
        <template v-else>
            <span class="update__version">{{$t('update_version',{ version })}}</span>
            <button class="update__button" v-if="update" @click="doUpdate">
                - <span class="update__now">{{$t('update_now')}}</span>
            </button>
        </template>
    </p>
</template>
<script>
import prev from "./../../../../version.json";
import axios from "axios";
import { mapState } from "vuex";
import { settingsDB } from "./../../../store/storeDB.js";

export default {
    data() {
        return {
            version: prev.version,
            newVersion: false,
            updating: false,
            update: false
        };
    },
    created() {
        if (this.online) {
            axios
                .get(`/version.json?timestamp=${new Date().getTime()}`)
                .then(resp => {
                    this.newVersion = resp.data.version;
                    if (this.newVersion !== this.version) {
                        this.update = true;
                    }
                });
        }
    },
    methods: {
        doUpdate: function() {
            if (!this.online) {
                return;
            }
            this.updating = true;
            if (window.serviceWorkerRegistration) {
                window.serviceWorkerRegistration.update().then(() => {
                    //console.log("dobe");
                    //window.location.reload(true);
                });
            } else {
                window.location.reload(true);
            }
        }
    },
    computed: mapState({
        online: state => state.client.online
    })
};
</script>