import { vueInstance } from '../app.js';
import mapboxgl from 'mapbox-gl';
import { i18nGetLang } from '../i18n';
import { pagesDB } from '../store/storeDB';
import axios from 'axios/index';
import { api } from './settings';

export const humanizeDistance = function(meters) {
  if (meters >= 1000) {
    const km = meters / 1000;
    return Math.floor(km * 10) / 10 + ' km';
  }
  return Math.floor(meters) + ' m';
};

export const humanizeDuration = function(seconds) {
  return Math.floor(seconds / 60) + ' min';
};

const toiletTypes = ['normal', 'iv', 'pissoir', 'eurokey'];

const toiletProperties = {
  2: 'wickeltisch',
  3: 'treppe',
  4: 'gelaender',
  1: 'kostenpflichtig',
  5: 'nettetoilette',
};

export const toilet = {
  types: toiletTypes,
  properties: toiletProperties,
  getProperty: function(index) {
    return toiletProperties[index];
  },
  getPropertyIndex: function(prop) {
    let i = false;
    Object.keys(toiletProperties).forEach(index => {
      if (toiletProperties[index] === prop) {
        i = index;
      }
    });
    return i;
  },
};

export const getEntryDescription = function(item) {
  let directionButton = '';
  if ('geolocation' in navigator) {
    directionButton = `<button onclick="setDirectionTo(${item.lat},${item.lon});" class="toilet__direction">
            <img src="/assets/img/route.svg" width="35px" height="35px" />
        </button>
        <div class="toilet__way js-toilet-way"></div>`;
  }

  const features = Object.entries(item.features)
    .map(([feature, active]) => {
      const title = vueInstance.$t(`form_property_${feature}`);
      return active
        ? `<img title="${title}" src="/assets/img/marker/${feature}.svg" />`
        : null;
    })
    .filter(f => !!f);
  let typeText = '';
  if (item.toilet_type_text) {
    let typeKey = snakecasify(item.toilet_type_text);
    if (typeKey === 'normale_toilette') {
      typeKey = 'normal';
    } else if (typeKey === 'normale_und_behinderten_toilette') {
      typeKey = 'iv';
    }

    typeText = `<p class="toilet__type">${vueInstance.$t(
      `type_${typeKey}`
    )}</p>`;
  }

  return `<div class="toilet">
		<div class="toilet__main">
			<p class="toilet__type">${vueInstance.$t(`type_${item.type}`)}</p>
			${item.name ? `<h2 class="toilet__title">${item.name}</h2>` : ''}
			${item.operator ? `<p class="toilet__operator">${item.operator}</p>` : ''}
			${
        item.description
          ? `<p class="toilet__description">${item.description}</p>`
          : ''
      }
			${
        item['opening_hours']
          ? `<p class="toilet__opening-hours">${item['opening_hours']}</p>`
          : ''
      }
			${
        features.length !== 0
          ? `<p class="toilet__features">${features.join('')}</p>`
          : ''
      }
			${
        item.access
          ? `<p class="toilet__access">${vueInstance.$t('has_access')}</p>`
          : ''
      }
						<p class="toilet__url">
			${
        Boolean(item.url)
          ? `<a class="toilet__url-osm" href="${item.url}" target="_blank">
            ${vueInstance.$t('open_in_osm')}
          </a>`
          : ''
      }
			${
        item.subType === 'eurokey'
          ? `<p>${vueInstance.$t(
              'eurokey_source'
            )}: <a class="toilet__url-osm" href="https://www.eurokey.ch/" target="_blank">
            eurokey.ch
          </a></p>`
          : ''
      }
			${
        false
          ? `<button class="toilet__url-failure"  onclick="setFehlermeldung(${
              item.id
            });">${vueInstance.$t('menu_fehlermeldung')}</button>`
          : ''
      }
</p>
		</div>
					${directionButton && `<div class="toilet__side">${directionButton}</div>`}
	</div>`;
};

let activeMapPopup = false;
export const openMapPopup = function(description, coordinates, map) {
  if (activeMapPopup) {
    activeMapPopup.remove();
  }
  activeMapPopup = new mapboxgl.Popup({
    anchor: 'bottom',
    offset: {
      bottom: [0, -10],
    },
  })
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map)
    .on('close', function(e) {
      vueInstance.$store.dispatch('map/toggleDirections', false);
    });

  if (map.getZoom() >= 12) {
    map.flyTo({
      center: coordinates,
    });
  }
};

export const closeMapPopup = function() {
  if (activeMapPopup) {
    activeMapPopup.remove();
  }
};

export const getZoomIconSize = function(mapZoom) {
  let size = 0.4;
  if (mapZoom >= 12) {
    size = 0.8;
  }
  return size;
};

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export const distanceBetweenCoordinates = function(start, end) {
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(end.lat - start.lat);
  const dLon = degreesToRadians(end.lng - start.lng);
  const lat1 = degreesToRadians(start.lat);
  const lat2 = degreesToRadians(end.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = earthRadiusKm * c;
  return km * 1000;
};

export const angleBetweenCoordinates = function(start, end) {
  const longDiff = end.lng - start.lng;
  const y = Math.sin(longDiff) * Math.cos(end.lat);
  const x =
    Math.cos(start.lat) * Math.sin(end.lat) -
    Math.sin(start.lat) * Math.cos(end.lat) * Math.cos(longDiff);
  const radian = Math.atan2(y, x);
  const degrees = radian * (180 / Math.PI);

  return 360 - ((degrees + 360) % 360);
};

export const sortProperties = function(
  sortable,
  sortedBy = 1,
  isNumericSort = false,
  reverse = false
) {
  const reversed = reverse ? -1 : 1;

  if (isNumericSort) {
    sortable.sort(function(a, b) {
      return reversed * (a[sortedBy] - b[sortedBy]);
    });
  } else {
    sortable.sort(function(a, b) {
      var x = a[sortedBy].toLowerCase(),
        y = b[sortedBy].toLowerCase();
      return x < y ? reversed * -1 : x > y ? reversed : 0;
    });
  }
  return sortable;
};

export const loadPage = async function(key, cb) {
  const lang = await i18nGetLang();
  const pageKey = `${key}-${lang}`;

  pagesDB.get(pageKey).then(page => {
    if (page) {
      cb({
        title: page.title,
        content: page.content,
        loading: false,
      });
    }
  });

  axios
    .get(`${api.page.lang}/${lang}/${pageKey}.html`)
    .then(response => {
      // Sorry for the ugly parsing
      const regex = /<h1>(.+)<\/h1>/gm;
      let content = response.data;
      let title = '';
      let m = '';
      while ((m = regex.exec(content)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
          if (groupIndex === 0) {
            content = content.replace(match, '');
          } else if (groupIndex === 1) {
            title = match;
          }
        });
      }

      pagesDB.set(pageKey, {
        title,
        content,
      });

      cb({
        title,
        content,
        loading: false,
      });
    })
    .catch(error => {
      cb({
        title: '404 error',
        content: 'Page not found',
        loading: false,
      });
    });
};

function snakecasify(str) {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => a + '_' + b.toLowerCase())
    .replace(/[^A-Za-z0-9]+|_+/g, '_')
    .toLowerCase();
}
