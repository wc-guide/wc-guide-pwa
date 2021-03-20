const loading = {};

export const mapLoaderShow = function(key = "default") {
  loading[key] = "set";

  const $loader = document.querySelector(".js-maps-loader");
  $loader.setAttribute("aria-hidden", "false");
};

export const mapLoaderHide = function(key = "default", force = false) {
  delete loading[key];
  if (force) {
    Object.keys(loading).map(key => {
      delete loading[key];
    });
  }

  if (Object.keys(loading).length === 0) {
    const $loader = document.querySelector(".js-maps-loader");
    $loader.setAttribute("aria-hidden", "true");
  }
};

export const mapLoader = function(key = "default") {
  const $loader = document.querySelector(".js-maps-loader");
  if ($loader.getAttribute("aria-hidden") === "false") {
    mapLoaderShow(key);
  } else {
    mapLoaderHide(key);
  }
};
