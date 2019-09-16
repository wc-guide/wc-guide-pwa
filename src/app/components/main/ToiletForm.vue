<template>
    <hello-form class="o-helloform--toilet" formKey="toilet" :formSubmit="submit" :formError="error" :formLoading="loading" :formSuccess="success" :disabled="disabled" :controlsLeft="back" :controlsLeftFunction="backFunc">
        <shadow-box page-slug="privacy" v-if="privacy" :close="function(){setPrivacy(false);}"></shadow-box>

        <template v-if="toAgree">
            <div class="o-feedback o-feedback--error list__feedback">
                <p class="o-feedback__colored">{{$t("form_preview")}}</p>
            </div>
            <hello-input :title="$t('form_agreement')" name="toilet-form-agreement" type="checkbox" class="o-helloform__element--black" :hint="function(){setPrivacy(true)}"></hello-input>
        </template>
        <template v-else>
            <slot></slot>
            <set-position :disabled="(disabled || inputdisabled)" :position="(defaultValues?{lat:defaultValues.lat,lng:defaultValues.lng}:false)"></set-position>
            <hello-input title="entry Lat" name="toilet-lat" type="hidden" :value="defaultValues.lat" :hellochange="lnglatUpdate"></hello-input>
            <hello-input title="entry Lng" name="toilet-lng" type="hidden" :value="defaultValues.lng" :hellochange="lnglatUpdate"></hello-input>
            <hello-input :title="$t('form_toilet_type')" type="select" name="toilet-toilet_type_id" :required="true" :choices="toilettypes" :value="defaultValues.toilet_type_id" :disabled="disabled || inputdisabled"></hello-input>
            <hello-input :title="$t('form_name')" name="toilet-name" :required="true" :value="defaultValues.name" :disabled="disabled || inputdisabled"></hello-input>
            <hello-input :title="$t('form_address') + ', ' + $t('form_place')" name="toilet-addressplace" :value="defaultValues.addressplace" :required="true" :disabled="disabled || inputdisabled"></hello-input>
            <hello-input title="entry Country" name="toilet-country" type="hidden" :value="defaultValues.country"></hello-input>
            <hello-input title="entry Country Code" name="toilet-country_code" type="hidden" :value="defaultValues.country_code"></hello-input>
            <hello-input :title="$t('form_address')" name="toilet-address" type="hidden" :value="defaultValues.address" :disabled="disabled || inputdisabled"></hello-input>
            <hello-input :title="$t('form_place')" name="toilet-place" type="hidden" :value="defaultValues.place" :disabled="disabled || inputdisabled"></hello-input>
            <div :class="'o-helloform__element '+((disabled||inputdisabled)?'o-helloform__element--disabled':'')">
                <p class="o-helloform__label">
                    <small>{{$t('form_properties')}}</small>
                </p>
            </div>
            <hello-input v-for="(prop, propId) in properties" :key="prop" :title="$t(`form_property_${prop}`) + `<img class='o-helloform__label-icon' src='/assets/img/marker/${prop}.svg'/>`" :name="`toilet-details-${prop}`" :value="propId" type="checkbox" class="o-helloform__element--black" :checked="defaultValues.details.indexOf(propId) !== -1" :disabled="disabled || inputdisabled"></hello-input>
            <hello-input :title="$t('form_comments')" name="toilet-comment" type="textarea" :value="defaultValues.comment" :disabled="disabled || inputdisabled"></hello-input>
        </template>
    </hello-form>
</template>
<script>
import HelloForm from "./../globals/helloform/HelloForm.vue";
import HelloInput from "./../globals/helloform/HelloInput.vue";
import SetPosition from "./../globals/helloform/SetPosition.vue";
import {
    toilet,
    openMapPopup,
    getEntryDescription
} from "./../../vendor/funcs";
import { mapBoxSettings, isMobile } from "./../../vendor/settings";
import { mapState } from "vuex";
import axios from "axios";

window.addMarkerOnClick = false;
const searchPlace = `https://api.mapbox.com/geocoding/v5/mapbox.places/{lng}%2C{lat}.json?access_token=${mapBoxSettings.token}&limit=1`;
export default {
    props: {
        default: {
            type: Boolean | Object,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        inputdisabled: {
            type: Boolean,
            default: false
        },
        submitToilet: {
            type: Function,
            required: true
        }
    },
    data() {
        const toilettypes = {
            0: this.$t("type_choose")
        };
        Object.keys(toilet.types).forEach(typeId => {
            if (typeId !== "5") {
                toilettypes[typeId] = this.$t(`type_${toilet.types[typeId]}`);
            }
        });
        return {
            error: false,
            loading: false,
            success: false,
            properties: toilet.properties,
            toilettypes,
            renderedDefault: this.default,
            toAgree: false,
            back: false,
            backFunc: false,
            formdata: false,
            privacy: false,
            mapZoom: 0
        };
    },
    mounted: function() {
        this.lnglatUpdate();
    },
    computed: Object.assign(
        {
            defaultValues: function() {
                const val = {
                    lat: 0,
                    lng: 0,
                    toilet_type_id: 0,
                    name: "",
                    address: "",
                    place: "",
                    details: [],
                    comment: ""
                };

                let newData = false;
                if (this.formdata) {
                    newData = this.formdata;
                } else if (this.default) {
                    newData = this.default;
                }

                if (newData) {
                    val.lat = newData.lat;
                    val.lng = newData.lng;
                    val.toilet_type_id = newData.toilet_type_id;
                    val.name = newData.name;
                    val.address = newData.address;
                    val.comment = newData.comment;
                    val.place = newData.place;
                    Object.keys(this.properties).forEach(propId => {
                        if (newData.details.indexOf(propId) !== -1) {
                            val.details.push(propId);
                        }
                    });
                }
                return val;
            }
        },
        mapState({
            map: state => state.map.map
        })
    ),
    methods: {
        submit: function(data) {
            if (data["toilet-lat"] === "0") {
                this.error = this.$t("form_error_location");
            } else if (!this.toAgree) {
                const entry = this.generateEntry();
                this.toAgree = data;
                document.querySelector(".main").classList.add("main--gap-big");
                this.back = this.$t("form_back");
                this.backFunc = this.goBack;
                if (this.map) {
                    const coordinates = {
                        lng: entry.lng,
                        lat: entry.lat
                    };

                    openMapPopup(
                        getEntryDescription(entry),
                        coordinates,
                        this.map
                    );
                    let zoom = 14;
                    if (this.map.getZoom() >= zoom) {
                        zoom = this.map.getZoom();
                    }
                    /*
						this.map.flyTo({
							center: {
								lng: entry.lng,
								lat: entry.lat
							},
							offset: [0, (isMobile() ? 0 : -350)],
							zoom
						});
						*/
                }
            } else {
                if (data["toilet-form-agreement"]) {
                    this.loading = true;
                    this.submitToilet(this.toAgree)
                        .then(success => {
                            this.loading = false;
                            this.success = success;
                        })
                        .catch(error => {
                            this.loading = false;
                            this.error =
                                this.$t("form_error") +
                                (error ? `: ${error}` : "");
                        });
                } else {
                    this.error = this.$t("form_error_agree");
                }
            }
        },
        goBack: function() {
            this.back = false;
            this.backFunc = false;
            this.toAgree = false;
            document.querySelector(".main").classList.remove("main--gap-big");
            window.setTimeout(() => {
                this.lnglatUpdate(); // little hack :(
            }, 200);
        },
        generateEntry: function() {
            const entry = {
                id: 0,
                lat: 0,
                lng: 0,
                toilet_type_id: 0,
                name: "",
                address: "",
                place: "",
                comment: "",
                details: []
            };
            const $fields = this.$el.querySelectorAll(
                "input, select, textarea"
            );

            $fields.forEach(function($field) {
                const name = $field.getAttribute("name");
                if (name.indexOf("toilet-") === 0) {
                    const key = name.replace("toilet-", "");
                    if (key.indexOf("details-") === 0 && $field.checked) {
                        entry.details.push($field.value);
                    } else if (key in entry) {
                        entry[key] = $field.value;
                    }
                }
            });

            if (entry.toilet_type_id !== "0") {
                entry["toilet_type_text"] = this.toilettypes[
                    entry.toilet_type_id
                ];
            }
            this.formdata = entry;
            return entry;
        },
        lnglatUpdate: function() {
            const $lng = this.$el.querySelector("[name=toilet-lng]");
            const $lat = this.$el.querySelector("[name=toilet-lat]");
            const lng = $lng.value;
            const lat = $lat.value;
            if (lng !== "0" && lat !== "0") {
                const url = searchPlace
                    .replace("{lat}", lat)
                    .replace("{lng}", lng);
                axios.get(url).then(resp => {
                    const place = resp.data.features[0];
                    let plz = "";
                    let ort = "";
                    let strasse = place.text ? place.text : "";
                    let nummer = place.address ? place.address : "";
                    let country = "";
                    let country_code = "";
                    Object.keys(place.context).forEach(index => {
                        const e = place.context[index];
                        if (e.id.indexOf("postcode.") === 0) {
                            plz = e.text;
                        } else if (e.id.indexOf("place.") === 0) {
                            ort = e.text;
                        } else if (e.id.indexOf("country.") === 0) {
                            country = e.text;
                            country_code = e.short_code;
                        }
                    });

                    this.$el.querySelector(
                        "[name=toilet-addressplace]"
                    ).value = `${strasse} ${nummer}, ${ort}`;
                    this.$el.querySelector(
                        "[name=toilet-address]"
                    ).value = `${strasse} ${nummer}`;
                    this.$el.querySelector(
                        "[name=toilet-place]"
                    ).value = `${ort}`;
                    this.$el.querySelector(
                        "[name=toilet-country]"
                    ).value = country;
                    this.$el.querySelector(
                        "[name=toilet-country_code]"
                    ).value = country_code;
                });
            }
        },
        setPrivacy: function(show) {
            this.privacy = show;
        }
    },
    components: {
        HelloForm,
        HelloInput,
        SetPosition
    },
    beforeDestroy: function() {
        document.querySelector(".main").classList.remove("main--gap-big");
    }
};
</script>