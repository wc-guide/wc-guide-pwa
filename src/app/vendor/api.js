import axios from "axios";
import { api } from "./settings";

const getOsm = (queryParams, bbox) =>
  new Promise((resolve, reject) =>
    axios
      .get(`${api.wc.get}?${queryParams}`)
      .then(resp =>
        resp.data.results.features.length === 0
          ? getFallbackOsm(bbox)
          : resp.data.results.features
      )
      .then(features => resolve(features))
      .catch(e => reject(e))
  );

const getEurokey = queryParams =>
  new Promise((resolve, reject) =>
    axios
      .get(`${api.wc.getOthers}?${queryParams}`)
      .then(resp => resolve(resp.data.results.features))
      .catch(e => reject(e))
  );

const getFallbackOsm = bbox =>
  new Promise((resolve, reject) =>
    axios
      .get(`${api.wc.getOverpass}?in_bbox=${bbox}`)
      .then(resp => resolve(resp.data.features))
      .catch(e => reject(e))
  );

export const getToilets = bounds =>
  new Promise((resolve, reject) => {
    const round = value => Math.round(value * 1000000) / 1000000;

    const bbox = encodeURIComponent(
      [bounds.w, bounds.s, bounds.e, bounds.n]
        .map(value => round(value))
        .join(",")
    );

    const params = {
      format: "json",
      in_bbox: bbox
    };

    const queryParams = Object.entries(params)
      .reduce((acc, [key, value]) => [...acc, `${key}=${value}`], [])
      .join("&");

    Promise.all([getOsm(queryParams, bbox), getEurokey(queryParams)])
      .then(([osm, eurokey]) => resolve([...osm, ...eurokey]))
      .catch(e => reject(e));
  });
