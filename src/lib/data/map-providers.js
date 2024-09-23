export const providerFolder = '_projects/data-viz';
export const providerFile = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z, /** @type {string} */ type, /** @type {string} */ format) => `${type}/${z}_${x}_${y}.${format}`;

export const providers = {
	osm: {
		format: 'png',
		name: 'OSM Mapnik',
		size: 256,
		tileset: 'osm-mapnik',
		source: 'https://www.openstreetmap.org/',
		origin: null,
		url: (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z) => `https://${"abc"[Math.abs(x + y) % 3]}.tile.osm.org/${z}/${x}/${y}.png`,
	},
	wikimedia: {
		format: 'png',
		name: 'Wikimedia Maps',
		source: 'https://maps.wikimedia.org/',
		origin: null,
		url: (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z) => `https://maps.wikimedia.org/osm-intl/${z}/${x}/${y}.png`,
	},
	mapboxSatellite: {
		format: 'png',
		name: 'Mapbox Satellite',
		size: 256,
		tileset: 'mapbox-satellite',
		comment: 'sku=...&access_token=',
		source: 'https://www.mapbox.com/',
		origin: 'https://docs.mapbox.com',
		url: (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z, /** @type {string} */ params) => `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.png?${params}`,
	},
	mapboxDEM: {
		format: 'png',
		name: 'Mapbox Terrain-DEM v1',
		size: 514,
		tileset: 'mapbox-terrain-dem-v1',
		comment: '1px buffer for interpolation; height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1); sku=...&access_token=',
		source: 'https://www.mapbox.com/',
		origin: 'https://docs.mapbox.com',
		url: (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z, /** @type {string} */ params) => `https://api.mapbox.com/raster/v1/mapbox.mapbox-terrain-dem-v1/${z}/${x}/${y}.png?${params}`,
	},
	nextzenTerrariumDEM: {
		format: 'png',
		name: 'Mapzen Terrarium Terrain v1',
		size: 512,
		tileset: 'nextzen-terrarium-v1',
		comment: 'height = (R * 256 + G + B / 256) - 32768; api_key=...',
		source: 'https://www.nextzen.org/',
		origin: null,
		url: (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ z, /** @type {string} */ params) => `https://tile.nextzen.org/tilezen/terrain/v1/512/terrarium/${z}/${x}/${y}.png?${params}`,
	}
};