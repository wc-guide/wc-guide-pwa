import axios from "axios";
import { entriesDB, settingsDB } from "./../storeDB";
import { xml2json } from "xml-js";
import { vueInstance } from "../../app";
import { i18n } from "../../i18n";
import { mapLoaderShow, mapLoaderHide } from "../../vendor/mapLoader";
import {
  toilet,
  distanceBetweenCoordinates,
  humanizeDistance,
  sortProperties,
  angleBetweenCoordinates
} from "../../vendor/funcs";
import { getToilets } from "../../vendor/api";

const CancelToken = axios.CancelToken;
let mapEntriesCancelTokenSource;

const toiletfilter = {};
let isDoingDelete = false;
toilet.types.map(type => {
  toiletfilter[type] = true;
});

const state = {
  all: {},
  map: {},
  filter: toiletfilter
};

const getters = {};

const actions = {
  loadEntries({ commit, rootState }, data) {
    if (!rootState.map.map) {
      console.log("Map not yet loaded");
      return;
    }
    mapLoaderShow("loadEntries");

    const mapBounds = rootState.map.map.getBounds();
    /*
    entriesDB.getAll().then(entries => {
      const e = {};
      entries.forEach(entry => {
        e[entry.id] = entry;
      });
      commit("setEntries", e);
      commit("setMap", mapBounds);
    });*/

    if (mapEntriesCancelTokenSource) {
      mapEntriesCancelTokenSource.cancel();
    }
    mapEntriesCancelTokenSource = CancelToken.source();

    const bounds = {
      s: mapBounds.getSouthWest().lat,
      w: mapBounds.getSouthWest().lng,
      n: mapBounds.getNorthEast().lat,
      e: mapBounds.getNorthEast().lng
    };

    const newToilets = {};

    const getTranslatedText = text => {
      if (typeof text === "object") {
        if (i18n.locale in text) {
          return text[i18n.locale];
        }
        return Object.values(text)[0];
      }
      return text;
    };

    getToilets(bounds)
      .then(features => {
        mapLoaderHide("loadEntries");

        features.map(entry => {
          const id = `${entry.geometry.coordinates[0]}x${entry.geometry.coordinates[1]}`;
          //entriesDB.set(id, entry);
          newToilets[id] = {
            id,
            lat: entry.geometry.coordinates[1],
            lon: entry.geometry.coordinates[0],
            type: entry.properties.type,
            features: entry.properties.features,
            name: entry.properties.name,
            operator: entry.properties.operator,
            description: getTranslatedText(entry.properties.description),
            url: entry.properties.id
              ? `https://www.openstreetmap.org/${entry.properties.id}`
              : null
          };
        });

        commit("setEntries", newToilets);
        commit("setMap", mapBounds);
      })
      .catch(e => {
        e.response &&
          e.response.status === 400 &&
          vueInstance.$snack.danger({
            text: i18n.t("error_loading_entries"),
            button: "RELOAD",
            action: () => location.reload(true)
          });
        if (axios.isCancel(e)) {
          mapEntriesCancelTokenSource = null;
        }
      });
  },
  updateFilter({ commit, rootState }, filter) {
    commit("setFilter", filter);
    commit("setMap", rootState.map.map.getBounds());
  }
};

const mutations = {
  setEntries(state, entries) {
    state.all = Object.assign(state.all, entries);
  },
  deleteEntries(sate, ids) {
    const all = state.all;
    ids.forEach(id => delete all[id]);
    state.all = all;
  },
  setMap(state, mapBounds) {
    const b = {
      min: mapBounds.getSouthWest(),
      max: mapBounds.getNorthEast()
    };

    const activeFilters = Object.entries(state.filter)
      .map(([type, active]) => (!active ? null : type))
      .filter(f => !!f);

    state.map = Object.values(state.all).filter(
      entry =>
        b.min.lat < entry.lat &&
        entry.lat < b.max.lat &&
        b.min.lng < entry.lon &&
        entry.lon < b.max.lng &&
        activeFilters.indexOf(entry.type) !== -1
    );
  },
  setFilter(state, data) {
    state.filter = data;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
