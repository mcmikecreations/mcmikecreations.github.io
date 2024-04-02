/* eslint-disable @typescript-eslint/ban-ts-comment */
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { HttpError } from '@sveltejs/kit'
import maps from '$lib/data/maps.json';
import { providerFolder } from '$lib/data/map-providers';
import { geoMercator } from 'd3-geo';
// @ts-ignore
import { tile } from 'd3-tile';
import * as THREE from 'three';
import type { GeometryData, Map, OriginData } from '$lib/data/map-info';
import { buildGeometry } from './build-geometry';
import { buildTiles, getPixelsPerMeter } from './build-tiles';
import { buildStatistics } from './build-statistics';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		const meta : Map | undefined = maps.find((x) => x.route.endsWith(params.slug));

		if (!meta) {
			console.log(`Failed to fetch /maps/${params.slug} metadata.`);
			error(404, { message: `Failed to fetch "${params.slug}"` });
		}

		const statistics = meta.features.find((x) => x.type === 'Statistics');
		await (async () => {
			if (!statistics) {
				return undefined;
			}

			const layerData : GeometryData = statistics.data as GeometryData;

			if (layerData.path) {
				const jsonPathIndex = layerData.path.indexOf('#');
				const filePath = layerData.path.slice(0, jsonPathIndex);
				const file = await fetch(`/${providerFolder}/${layerData.provider}/${filePath}`);
				const text = await file.json();
				const jsonPath = layerData.path.slice(jsonPathIndex + 2) // We always have #/
					.split('/');
				return jsonPath.reduce((prev, curr) => prev[curr], text);
			} else if (layerData.feature) {
				return layerData.feature;
			} else {
				console.error('Wrong Geometry data:', layerData);
				return undefined;
			}
		})();

		const origin = meta.features.find((x) => x.type === 'Origin');

		if (!origin) {
			console.log(`Failed to find origin for /maps/${params.slug}.`);
			error(404, { message: `Failed to find origin for "${params.slug}"` });
		}

		const height = meta.height;
		const originData : OriginData = origin.data as OriginData;

		const projection = geoMercator()
			.center([originData.lon, originData.lat])
			.scale(Math.pow(2, 21) / (2 * Math.PI))
			.translate([height / 2, height / 2]);

		const tileFunc = tile()
			.size([height, height])
			.scale(projection.scale() * 2 * Math.PI)
			.translate(projection([0, 0]));
		const tiles = tileFunc();
		const pixelsPerMeter = getPixelsPerMeter(originData.lat, tiles.scale, tileFunc.scale()());

		const layers2d : Array<string> = [];
		const layers3d : Array<THREE.Object3D> = [];

		for (const layer of meta.features) {
			let data;
			if (layer.type === 'Tiles') {
				data = await buildTiles(fetch, layer, tiles, tileFunc);
			} else if (layer.type === 'Geometry') {
				data = await buildGeometry(fetch, layer, projection, pixelsPerMeter, tiles.scale);
			}

			if (data) {
				if (data.layers2d.length > 0) {
					layers2d.push(...data.layers2d);
				}
				if (data.layers3d.length > 0) {
					layers3d.push(...data.layers3d);
				}
			}
		}

		return {
			map: meta,
			origin: originData,
			statistics: statistics
				? ((await buildStatistics(fetch, statistics, projection, height))?.layers2d?.join(''))
				: undefined,
			projection: projection,
			tileScale: tiles.scale,
			pixelsPerMeter: pixelsPerMeter,
			data2d: layers2d.join(''),
			data3d: layers3d,
		};
	} catch (ex) {
		if ((ex as HttpError) !== undefined) {
			throw ex;
		} else {
			console.log(ex);
			error(500);
		}
	}
};