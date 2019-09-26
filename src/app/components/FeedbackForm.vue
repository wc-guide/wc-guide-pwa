<template>
    <shadow-box :close="closeBox" class="feedback">
        <h2 class="feedback__title">{{$t('feedback_form')}}</h2>
        <p v-if="!success" class="feedback__description">{{$t('feedback_description')}}</p>
        <div v-if="!online" class="o-feedback o-feedback--error add__agreement">
            <p class="o-feedback__colored">
                <b>{{$t('offline')}}</b>
            </p>
            <p>{{$t('offline_form')}}</p>
        </div>
        <hello-form v-else form-key="feedback-form" :form-loading="loading" :form-error="error" :form-success="success" :form-submit="submit">
            <hello-input name="feedback-comment" :title="$t('feedback_comment')" type="textarea" :required="true"></hello-input>
            <hello-input name="feedback-name" :title="$t('feedback_name')"></hello-input>
            <hello-input name="feedback-email" :title="$t('feedback_email')" type="email"></hello-input>
            <hello-input name="feedback-version" title="Version" type="hidden" :value="version"></hello-input>
            <hello-input name="feedback-link" title="Link" type="hidden" :value="$router.currentRoute.fullPath"></hello-input>
            <hello-input name="feedback-send-browserdata" :title="$t('feedback_browserdata')" type="checkbox"></hello-input>
            <hello-input name="feedback-browserdata" title="feedback-browserdata" type="hidden" :value="JSON.stringify(client)"></hello-input>
        </hello-form>
    </shadow-box>
</template>
<script>
import HelloForm from "./globals/helloform/HelloForm.vue";
import HelloInput from "./globals/helloform/HelloInput.vue";
import { mapState } from "vuex";
import pkg from "./../../../package";
import axios from "axios";
import { api } from "./../vendor/settings";
import ClientJS from "clientjs";
import qs from "qs";

const client = new ClientJS();
export default {
    props: {
        close: {
            type: Function,
            required: true
        }
    },
    data() {
        return {
            version: pkg.version,
            loading: false,
            error: false,
            success: false,
            client: {
                browser: client.getBrowser(),
                os: client.getOS(),
                device: client.getDevice()
            }
        };
    },
    components: {
        HelloForm,
        HelloInput
    },
    methods: {
        submit: function(data) {
            this.loading = true;
            if (!data["feedback-send-browserdata"]) {
                data["feedback-browserdata"] = "";
            }

            axios
                .post(`${api.wc.mail.feedback}`, qs.stringify(data))
                .then(resp => {
                    this.loading = false;
                    this.success = this.$t("feedback_success");
                })
                .catch(error => {
                    this.loading = false;
                    this.error = this.$t("form_error");
                });
        },
        closeBox: function() {
            this.close();
        }
    },
    computed: mapState({
        online: state => state.client.online
    })
};
</script>