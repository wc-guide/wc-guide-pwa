import axios from "axios";
import { entriesDB, settingsDB } from "./../storeDB";
import { xml2json } from "xml-js";
import { vueInstance } from "./../../app";
import { i18n } from "../../i18n";
import { mapLoaderShow, mapLoaderHide } from "./../../vendor/mapLoader";
import {
  toilet,
  distanceBetweenCoordinates,
  humanizeDistance,
  sortProperties,
  angleBetweenCoordinates
} from "./../../vendor/funcs";
import { api } from "./../../vendor/settings";

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

    axios
      .get(
        api.wc.get +
          `?bounds=${encodeURIComponent(
            JSON.stringify({
              s: mapBounds.getSouthWest().lat,
              w: mapBounds.getSouthWest().lng,
              n: mapBounds.getNorthEast().lat,
              e: mapBounds.getNorthEast().lng
            })
          )}`,
        {
          cancelToken: mapEntriesCancelTokenSource.token
        }
      )
      .then(resp => {
        mapEntriesCancelTokenSource = null;
        mapLoaderHide("loadEntries");

        const newToilets = {};

        resp.data.map(entry => {
          const id = entry.id;
          //entriesDB.set(id, entry);
          newToilets[id] = entry;
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

    const mapToilets = {};
    Object.values(state.all).map(entry => {
      if (
        b.min.lat < entry.lat &&
        entry.lat < b.max.lat &&
        b.min.lng < entry.lon &&
        entry.lon < b.max.lng &&
        activeFilters.indexOf(entry.type) !== -1
      ) {
        mapToilets[entry.id] = entry;
      }
    });

    state.map = mapToilets;
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
