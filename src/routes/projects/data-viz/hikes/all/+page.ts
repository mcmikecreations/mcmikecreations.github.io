import type { PageLoad } from './$types';
import { type Feature, type GeometryData, getMapFeatures } from '$lib/data/map-info';
import maps from '$lib/data/hikes.json';
import { error, type HttpError } from '@sveltejs/kit';
import { loadGeometry, loadProperties } from '../[slug]/build-geometry';

function hash(str : string) : number {
	let hash = 0, i, chr;
	if (str.length === 0) return hash;
	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const features : object[] = [];
		const result = {
			features: features,
			totalDistance: 0.0,
			totalTime: 0.0,
			totalHikes: 0,
			totalAscent: 0.0,
			totalDescent: 0.0,
		};

		for (const map of maps) {
			if (map.properties?.hidden === true) {
				continue;
			}

			const layer = getMapFeatures(map).find((x : Feature) => x.type === 'Geometry') as Feature;
			const geometryData = layer.data as GeometryData;
			const geometry = await loadGeometry(fetch, geometryData);

			const properties = loadProperties(map, geometry);

			if (map.properties?.draft !== true) {
				result.totalHikes += properties.dates.length;
				result.totalDistance += (properties.distance ?? 0) * properties.dates.length;
				result.totalTime += (properties.duration ?? 0) * properties.dates.length;
				result.totalAscent += (properties.ascent ?? 0) * properties.dates.length;
				result.totalDescent += (properties.descent ?? 0) * properties.dates.length;
			}

			geometry['properties']['id'] = hash(map.route);
			geometry['properties']['route'] = map.route;
			geometry['properties'] = Object.assign({}, geometry['properties'], properties);

			if (map.properties?.checkpoints) {
				geometry['geometry'] = {
					"type": "LineString",
					"coordinates": map.properties?.checkpoints,
				};

				delete geometry['properties']['extras'];
				delete geometry['properties']['segments'];
				delete geometry['properties']['way_points'];
			}

			features.push(geometry);
		}

		return result;
	} catch (ex) {
		if ((ex as HttpError) !== undefined) {
			throw ex;
		} else {
			console.log(ex);
			error(500);
		}
	}
};
