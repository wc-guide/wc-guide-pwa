<template></template>
<script>
import { store } from "./../store/store.js";
import { vueInstance } from "./../app";
import { mapLoaderShow, mapLoaderHide } from "./../vendor/mapLoader";
import {
    toilet,
    getEntryDescription,
    openMapPopup,
    getZoomIconSize
} from "./../vendor/funcs";
import { mapState } from "vuex";

const markerImages = [
    "eurokey",
    "eurokey-gray",
    "gelaender",
    "gelaender-gray",
    "iv",
    "iv-gray",
    "iv-nette-toilette",
    "iv-nette-toilette-gray",
    "kostenpflichtig",
    "kostenpflichtig-gray",
    "normal",
    "normal-gray",
    "normal-nette-toilette",
    "normal-nette-toilette-gray",
    "pissoir",
    "pissoir-gray",
    "treppe",
    "treppe-gray"
];
let loadParksTimer = "init";
let parksSet = 0;
let currentCenter = false;
let currentZoom = false;
window.markerIds = {};

export default {
    props: ["map"],
    data() {
        return {};
    },
    mounted() {
        mapLoaderShow("loadMap");
        this.map.on("load", () => {
            store.dispatch("entries/loadEntries");
            mapLoaderHide("loadMap");
            this.setLayer("test");
            this.map.on("style.load", () => this.setLayer());
        });
    },
    methods: {
        setLayer(layerKey) {
            this.mapImagesLoaded().then(() => {
                this.map.addSource("wcs-source", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: []
                    }
                });

                this.map.addLayer({
                    id: "wcs-layer",
                    interactive: true,
                    source: "wcs-source",
                    type: "symbol",
                    layout: {
                        "icon-image": `marker-{icon}`,
                        "icon-allow-overlap": true,
                        "icon-size": getZoomIconSize(this.map.getZoom())
                    }
                });

                this.map.on("click", "wcs-layer", e => {
                    if (window.addMarkerOnClick) {
                        return;
                    }
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const description = e.features[0].properties.description;
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] +=
                            e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    openMapPopup(description, coordinates, this.map);
                });

                this.map.on("mouseenter", "wcs-layer", () => {
                    this.map.getCanvas().style.cursor = "pointer";
                });

                this.map.on("mouseleave", "wcs-layer", () => {
                    this.map.getCanvas().style.cursor = "";
                });

                this.map.on("moveend", () => {
                    store.dispatch("entries/loadEntries");
                });

                this.map.on("zoomend", () => {
                    this.map.setLayoutProperty(
                        "wcs-layer",
                        "icon-size",
                        getZoomIconSize(this.map.getZoom())
                    );
                });

                store.dispatch("entries/loadEntries");

                store.subscribe((mutation, state) => {
                    if (mutation.type === "entries/setMap") {
                        if (state.entries.map.length === 0) {
                            return;
                        }
                        this.entriesSet(state.entries.map);
                    }
                });
            });
        },
        entriesSet: function(entries) {
            const geoElements = [];
            let index = 0;
            window.markerIds = {};
            Object.values(entries).forEach(item => {
                window.markerIds[item.id] = index;
                index++;
                let icon = toilet.getType(item);
                if (item.details && item.details.indexOf("5") !== -1) {
                    icon = `${icon}-nette-toilette`;
                }
                geoElements.push({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [item.lng, item.lat]
                    },
                    properties: {
                        icon,
                        description: getEntryDescription(item)
                    }
                });
            });

            if (this.map.getSource("wcs-source")) {
                this.map.getSource("wcs-source").setData({
                    type: "FeatureCollection",
                    features: geoElements
                });
            }
        },
        mapImagesLoaded: function() {
            return new Promise((resolve, reject) => {
                if (!this.map) {
                    reject();
                }
                const loaded = [];
                markerImages.forEach(key => {
                    this.map.loadImage(
                        `/assets/img/marker/png-30/${key}.png`,
                        (error, image) => {
                            this.map.addImage(`marker-${key}`, image);
                            loaded.push(key);
                            if (loaded.length === markerImages.length) {
                                resolve();
                            }
                        }
                    );
                });
            });
        },
        openPopup: function(entryId) {
            const markerIndex = window.markerIds[entryId];
            const marker = this.map.getSource(`wcs-${this.mapStyle}`)["_data"]
                .features[markerIndex];
            const coordinates = marker.geometry.coordinates.slice();
            const description = marker.properties.description;

            this.map.setCenter(coordinates);
            this.map.setZoom(12);
            openMapPopup(description, coordinates, this.map);
        }
    },
    computed: mapState({
        mapStyle: state => state.map.type
    })
};

window.setDirectionTo = function(lat, lng) {
    if (document.body.classList.contains("is-offline")) {
        vueInstance.$snack.danger({
            text: vueInstance.$t("offline_function"),
            button: "OK"
        });
        return;
    }

    const myPosition = new Promise((resolve, reject) => {
        vueInstance.$store.dispatch("map/setGeoLocation").then(() => {
            const interval = window.setInterval(function() {
                if (vueInstance.$store.state.map.geolocation) {
                    clearInterval(interval);
                    resolve(vueInstance.$store.state.map.geolocation);
                }
            }, 200);
        });
    });

    myPosition.then(location => {
        vueInstance.$store.dispatch("map/toggleDirections", {
            from: location,
            to: {
                lat,
                lng
            }
        });
    });
};

window.setFehlermeldung = function(id) {
    vueInstance.$router.push({
        path: `/${vueInstance.$i18n.locale}/fehlermeldung/${id}/`
    });
};
</script>